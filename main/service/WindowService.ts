import type { WindowNames } from '@common/types';

import { CONFIG_KEYS, IPC_EVENTS, WINDOW_NAMES } from '@common/constants';
import { BrowserWindow, BrowserWindowConstructorOptions, ipcMain, IpcMainInvokeEvent, WebContentsView, app, type IpcMainEvent } from 'electron';
import { debounce } from '@common/utils';
import { createLogo } from '../utils';

import shortcutManager from './ShortcutService';
import configManager from './ConfigService';
import themeManager from './ThemeService';
import logManager from './LogService';
import path from 'node:path';

interface WindowState {
  instance: BrowserWindow | void;
  isHidden: boolean;
  onCreate: ((window: BrowserWindow) => void)[];
  onClosed: ((window: BrowserWindow) => void)[];
}
interface SizeOptions {
  width: number; // 窗口宽度
  height: number; // 窗口高度
  maxWidth?: number; // 窗口最大宽度，可选
  maxHeight?: number; // 窗口最大高度，可选
  minWidth?: number; // 窗口最小宽度，可选
  minHeight?: number; // 窗口最小高度，可选
}

const SHARED_WINDOW_OPTIONS = {
  titleBarStyle: 'hidden',
  show: false,
  title: 'Diona',
  darkTheme: themeManager.isDark,
  backgroundColor: themeManager.isDark ? '#2C2C2C' : '#FFFFFF',
  webPreferences: {
    nodeIntegration: false, // 禁用 Node.js 集成，提高安全性
    contextIsolation: true, // 启用上下文隔离，防止渲染进程访问主进程 API
    sandbox: true, // 启用沙箱模式，进一步增强安全性
    backgroundThrottling: false,
    preload: path.join(__dirname, 'preload.js'),
  },
} as BrowserWindowConstructorOptions;

class WindowService {
  private static _instance: WindowService;
  private _logo = createLogo();

  private _winStates: Record<WindowNames | string, WindowState> = {
    main: { instance: void 0, isHidden: false, onCreate: [], onClosed: [] },
    setting: { instance: void 0, isHidden: false, onCreate: [], onClosed: [] },
    dialog: { instance: void 0, isHidden: false, onCreate: [], onClosed: [] },
  }

  private constructor() {
    this._setupIpcEvents();
    logManager.info('WindowService initialized successfully.');
  }

  private _isReallyClose(windowName: WindowNames | void) {
    if (windowName === WINDOW_NAMES.MAIN) return configManager.get(CONFIG_KEYS.MINIMIZE_TO_TRAY) === false;
    if (windowName === WINDOW_NAMES.SETTING) return false;

    return true;
  }

  private _setupIpcEvents() {
    const handleCloseWindow = (e: IpcMainEvent) => {
      const target = BrowserWindow.fromWebContents(e.sender);
      const winName = this.getName(target);

      this.close(target, this._isReallyClose(winName));
    }
    const handleMinimizeWindow = (e: IpcMainEvent) => {
      BrowserWindow.fromWebContents(e.sender)?.minimize();
    }
    const handleMaximizeWindow = (e: IpcMainEvent) => {
      this.toggleMax(BrowserWindow.fromWebContents(e.sender));
    }
    const handleIsWindowMaximized = (e: IpcMainInvokeEvent) => {
      return BrowserWindow.fromWebContents(e.sender)?.isMaximized() ?? false;
    }

    ipcMain.on(IPC_EVENTS.CLOSE_WINDOW, handleCloseWindow);
    ipcMain.on(IPC_EVENTS.MINIMIZE_WINDOW, handleMinimizeWindow);
    ipcMain.on(IPC_EVENTS.MAXIMIZE_WINDOW, handleMaximizeWindow);
    ipcMain.handle(IPC_EVENTS.IS_WINDOW_MAXIMIZED, handleIsWindowMaximized);
  }

  public static getInstance(): WindowService {
    if (!this._instance) {
      this._instance = new WindowService();
    }
    return this._instance;
  }

  public create(name: WindowNames, size: SizeOptions, moreOpts?: BrowserWindowConstructorOptions) {
    if (this.get(name)) return;
    const isHiddenWin = this._isHiddenWin(name);
    let window = this._createWinInstance(name, { ...size, ...moreOpts });

    !isHiddenWin && this
      ._setupWinLifecycle(window, name)
      ._loadWindowTemplate(window, name)

    this._listenWinReady({
      win: window,
      isHiddenWin,
      size
    })

    this._handleWindowShortcuts(window);


    if (!isHiddenWin) {
      this._winStates[name].instance = window;
      this._winStates[name].onCreate.forEach(callback => callback(window));
    }

    if (isHiddenWin) {
      this._winStates[name].isHidden = false;
      logManager.info(`Hidden window show: ${name}`)
    }

    return window;
  }

  private _handleWindowShortcuts(win: BrowserWindow) {
    const isPackaged = app.isPackaged;

    const proxyCloseEvent = () => {
      this.close(win, this._isReallyClose(this.getName(win)));
      return true;
    }

    shortcutManager.registerForWindow(win, (input) => {
      if ((input.key === 'F4' && input.alt) && (process.platform !== 'darwin'))
        return proxyCloseEvent();
      if (input.code === 'KeyW' && input.modifiers.includes('control'))
        return proxyCloseEvent();
      if (!isPackaged) return;
      // 禁用 开发者工具
      if (
        input.type === 'keyDown' &&
        input.code === 'KeyI' &&
        input.modifiers.includes('control') &&
        input.modifiers.includes('shift')
      ) return true;
    })
  }
  private _setupWinLifecycle(window: BrowserWindow, name: WindowNames) {
    const updateWinStatus = debounce(() => !window?.isDestroyed()
      && window?.webContents?.send(IPC_EVENTS.MAXIMIZE_WINDOW + 'back', window?.isMaximized()), 80);
    window.once('closed', () => {
      this._winStates[name].onClosed.forEach(callback => callback(window));
      window?.destroy();
      window?.removeListener('resize', updateWinStatus);
      this._winStates[name].instance = void 0;
      this._winStates[name].isHidden = false;
      logManager.info(`Window closed: ${name}`);
    });
    window.on('resize', updateWinStatus)
    return this;
  }

  private _listenWinReady(pararms: {
    win: BrowserWindow,
    isHiddenWin: boolean,
    size: SizeOptions,
  }) {
    const onReady = () => {
      pararms.win?.once('show', () => setTimeout(() => this._applySizeConstraints(pararms.win, pararms.size), 2));

      pararms.win?.show();
    }

    if (!pararms.isHiddenWin) {
      const loadingHandler = this._addLoadingView(pararms.win, pararms.size);
      loadingHandler?.(onReady)
    } else {
      onReady();
    }
  }

  private _addLoadingView(window: BrowserWindow, size: SizeOptions) {
    let loadingView: WebContentsView | void = new WebContentsView();
    let rendererIsReady = false;

    window.contentView?.addChildView(loadingView);
    loadingView.setBounds({
      x: 0,
      y: 0,
      width: size.width,
      height: size.height,
    });
    loadingView.webContents.loadFile(path.join(__dirname, 'loading.html'));

    const onRendererIsReady = (e: IpcMainEvent) => {
      if ((e.sender !== window?.webContents) || rendererIsReady) return;
      rendererIsReady = true;
      window.contentView.removeChildView(loadingView as WebContentsView);
      ipcMain.removeListener(IPC_EVENTS.RENDERER_IS_READY, onRendererIsReady);
      loadingView = void 0;
    }
    ipcMain.on(IPC_EVENTS.RENDERER_IS_READY, onRendererIsReady);

    return (cb: () => void) => loadingView?.webContents.once('dom-ready', () => {
      loadingView?.webContents.insertCSS(`body {
          background-color: ${themeManager.isDark ? '#2C2C2C' : '#FFFFFF'} !important; 
          --stop-color-start: ${themeManager.isDark ? '#A0A0A0' : '#7F7F7F'} !important;
          --stop-color-end: ${themeManager.isDark ? '#A0A0A0' : '#7F7F7F'} !important;
      }`);
      cb();
    })

  }

  private _applySizeConstraints(win: BrowserWindow, size: SizeOptions) {
    if (size.maxHeight && size.maxWidth) {
      win.setMaximumSize(size.maxWidth, size.maxHeight);
    }
    if (size.minHeight && size.minWidth) {
      win.setMinimumSize(size.minWidth, size.minHeight);
    }
  }

  private _loadWindowTemplate(window: BrowserWindow, name: WindowNames) {
    // 检查是否存在开发服务器 URL，若存在则表示处于开发环境
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      return window.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}${'/html/' + (name === 'main' ? '' : name)}`);
    }
    window.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/html/${name === 'main' ? 'index' : name}.html`));
  }


  private _handleCloseWindowState(target: BrowserWindow, really: boolean) {
    const name = this.getName(target) as WindowNames;

    if (name) {
      if (!really) this._winStates[name].isHidden = true;
      else this._winStates[name].instance = void 0;
    }

    setTimeout(() => {
      target[really ? 'close' : 'hide']?.();
      this._checkAndCloseAllWinodws();
    }, 210)
  }

  private _checkAndCloseAllWinodws() {
    if (!this._winStates[WINDOW_NAMES.MAIN].instance || this._winStates[WINDOW_NAMES.MAIN].instance?.isDestroyed())
      return Object.values(this._winStates).forEach(win => win?.instance?.close());

    const minimizeToTray = configManager.get(CONFIG_KEYS.MINIMIZE_TO_TRAY);
    if (!minimizeToTray && !this.get(WINDOW_NAMES.MAIN)?.isVisible())
      return Object.values(this._winStates).forEach(win => !win?.instance?.isVisible() && win?.instance?.close());
  }

  private _isHiddenWin(name: WindowNames) {
    return this._winStates[name] && this._winStates[name].isHidden;
  }

  private _createWinInstance(name: WindowNames, opts?: BrowserWindowConstructorOptions) {
    return this._isHiddenWin(name)
      ? this._winStates[name].instance as BrowserWindow
      : new BrowserWindow({
        ...SHARED_WINDOW_OPTIONS,
        icon: this._logo,
        ...opts,
      });
  }

  public focus(target: BrowserWindow | void | null) {
    if (!target) return;
    const name = this.getName(target);
    if (target?.isMinimized()) {
      target?.restore();
      logManager.debug(`Window ${name} restored and focused`);
    } else {
      logManager.debug(`Window ${name} focused`);
    }

    target?.focus();
  }

  public close(target: BrowserWindow | void | null, really: boolean = true) {
    if (!target) return;

    const name = this.getName(target);
    logManager.info(`Close window: ${name}, really: ${really}`);
    this._handleCloseWindowState(target, really);
  }

  public toggleMax(target: BrowserWindow | void | null) {
    if (!target) return;
    target.isMaximized() ? target.unmaximize() : target.maximize();
  }

  public getName(target: BrowserWindow | null | void): WindowNames | void {
    if (!target) return;
    for (const [name, win] of Object.entries(this._winStates) as [WindowNames, { instance: BrowserWindow | void } | void][]) {
      if (win?.instance === target) return name;
    }
  }

  public get(name: WindowNames) {
    if (this._winStates[name].isHidden) return void 0;
    return this._winStates[name].instance;
  }

  public onWindowCreate(name: WindowNames, callback: (window: BrowserWindow) => void) {
    this._winStates[name].onCreate.push(callback);
  }

  public onWindowClosed(name: WindowNames, callback: (window: BrowserWindow) => void) {
    this._winStates[name].onClosed.push(callback);
  }

}

export const windowManager = WindowService.getInstance();

export default windowManager;
