import { Tray, Menu, ipcMain, app } from 'electron';
import { createTranslator, createLogo } from '../utils';
import { CONFIG_KEYS, IPC_EVENTS, WINDOW_NAMES, MAIN_WIN_SIZE } from '@common/constants';

import logManager from './LogService';
// TODO: shortcutManager
import windowManager from './WindowService';
import configManager from './ConfigService';

let t: ReturnType<typeof createTranslator> = createTranslator();

class TrayService {
  private static _instance: TrayService;
  private _tray: Tray | null = null;
  private _removeLanguageListener?: () => void;

  private _setupLanguageChangeListener() {
    this._removeLanguageListener = configManager.onConfigChange((config) => {
      if (!config[CONFIG_KEYS.LANGUAGE]) return;

      // 切换语言后，重新创建翻译器
      t = createTranslator();


      if (this._tray) {
        this._updateTray();
      }
    })
  }

  private _updateTray() {
    if (!this._tray) {
      this._tray = new Tray(createLogo());
    }

    const showWindow = () => {
      const mainWindow = windowManager.get(WINDOW_NAMES.MAIN);
      if (mainWindow && !mainWindow?.isDestroyed() && mainWindow?.isVisible() && !mainWindow?.isFocused()) {
        return mainWindow.focus();
      }
      if (mainWindow?.isMinimized()) {
        return mainWindow?.restore();
      }
      if (mainWindow?.isVisible() && mainWindow?.isFocused()) return;

      windowManager.create(WINDOW_NAMES.MAIN, MAIN_WIN_SIZE);
    }

    this._tray.setToolTip(t('tray.tooltip') ?? 'Diona Application');

    // TODO: 依赖快捷键Service 

    this._tray.setContextMenu(Menu.buildFromTemplate([
      { label: t('tray.showWindow'), accelerator: 'CmdOrCtrl+N', click: showWindow },
      { type: 'separator' },
      { label: t('settings.title'), click: () => ipcMain.emit(`${IPC_EVENTS.OPEN_WINDOW}:${WINDOW_NAMES.SETTING}`) },
      { role: 'quit', label: t('tray.exit') }
    ]));

    this._tray.removeAllListeners('click');
    this._tray.on('click', showWindow);
  }

  private constructor() {
    this._setupLanguageChangeListener();
    logManager.info('TrayService initialized successfully.');
  }

  public static getInstance() {
    if (!this._instance) {
      this._instance = new TrayService();
    }
    return this._instance;
  }

  public create() {
    if (this._tray) return;
    this._updateTray();
    app.on('quit', () => {
      this.destroy();
      //TODO: 移除快捷键
    })
  }
  public destroy() {
    this._tray?.destroy();
    this._tray = null;
    //TODO: 移除快捷键
    if (this._removeLanguageListener) {
      this._removeLanguageListener();
      this._removeLanguageListener = void 0;
    }
  }
}

export const trayManager = TrayService.getInstance();
export default trayManager;

