// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';
import { IPC_EVENTS, WINDOW_NAMES } from '@common/constants';

const api: WindowApi = {

  openWindow: (name: WindowNames) => ipcRenderer.send(`${IPC_EVENTS.OPEN_WINDOW}:${name}`),
  closeWindow: () => ipcRenderer.send(IPC_EVENTS.CLOSE_WINDOW),
  minimizeWindow: () => ipcRenderer.send(IPC_EVENTS.MINIMIZE_WINDOW),
  maximizeWindow: () => ipcRenderer.send(IPC_EVENTS.MAXIMIZE_WINDOW),
  onWindowMaximized: (callback: (isMaximized: boolean) => void) => ipcRenderer.on(IPC_EVENTS.MAXIMIZE_WINDOW + 'back', (_, isMaximized) => callback(isMaximized)),
  isWindowMaximized: () => ipcRenderer.invoke(IPC_EVENTS.IS_WINDOW_MAXIMIZED),

  setThemeMode: (mode: ThemeMode) => ipcRenderer.invoke(IPC_EVENTS.SET_THEME_MODE, mode),
  getThemeMode: () => ipcRenderer.invoke(IPC_EVENTS.GET_THEME_MODE),
  isDarkTheme: () => ipcRenderer.invoke(IPC_EVENTS.IS_DARK_THEME),
  onSystemThemeChange: (callback: (isDark: boolean) => void) => ipcRenderer.on(IPC_EVENTS.THEME_MODE_UPDATED, (_, isDark) => callback(isDark)),

  showContextMenu: (menuId: string, dynamicOptions?: string) => ipcRenderer.invoke(IPC_EVENTS.SHOW_CONTEXT_MENU, menuId, dynamicOptions),
  contextMenuItemClick: (menuId: string, cb: (id: string) => void) => ipcRenderer.on(`${IPC_EVENTS.SHOW_CONTEXT_MENU}:${menuId}`, (_, id) => cb(id)),
  removeContextMenuListener: (menuId: string) => ipcRenderer.removeAllListeners(`${IPC_EVENTS.SHOW_CONTEXT_MENU}:${menuId}`),

  viewIsReady: () => ipcRenderer.send(IPC_EVENTS.RENDERER_IS_READY),

  getConfig: (key: string) => ipcRenderer.invoke(IPC_EVENTS.GET_CONFIG, key),
  setConfig: (key: string, value: any) => ipcRenderer.send(IPC_EVENTS.SET_CONFIG, key, value),
  updateConfig: (value: any) => ipcRenderer.send(IPC_EVENTS.UPDATE_CONFIG, value),

  onConfigChange: (callback: (config: any) => void) => {
    ipcRenderer.on(IPC_EVENTS.CONFIG_UPDATED, (_, config) => callback(config));
    return () => ipcRenderer.removeListener(IPC_EVENTS.CONFIG_UPDATED, callback);
  },

  removeConfigChangeListener: (cb: (config: any) => void) => ipcRenderer.removeListener(IPC_EVENTS.CONFIG_UPDATED, cb),


  createDialog: (params: CreateDialogProps) => new Promise(async (resolve) => {
    const feedback = await ipcRenderer.invoke(`${IPC_EVENTS.OPEN_WINDOW}:${WINDOW_NAMES.DIALOG}`, {
      title: params.title ?? '',
      content: params.content,
      confirmText: params.confirmText,
      cancelText: params.cancelText,
    });

    if (feedback === 'confirm') params?.onConfirm?.();
    if (feedback === 'cancel') params?.onCancel?.();

    resolve(feedback);
  }),
  _dialogFeedback: (val: 'cancel' | 'confirm', winId: number) => ipcRenderer.send(WINDOW_NAMES.DIALOG + val, winId),
  _dialogGetParams: () => ipcRenderer.invoke(WINDOW_NAMES.DIALOG + 'get-params') as Promise<CreateDialogProps>,

  startADialogue: (params: CreateDialogueProps) => ipcRenderer.send(IPC_EVENTS.START_A_DIALOGUE, params),

  onDialogueBack: (cb: (data: DialogueBackStream) => void, messageId: number) => {

    const callback = (_event: Electron.IpcRendererEvent, data: DialogueBackStream) => cb(data);

    ipcRenderer.on(IPC_EVENTS.START_A_DIALOGUE + 'back' + messageId, callback);

    return () => ipcRenderer.removeListener(IPC_EVENTS.START_A_DIALOGUE + 'back' + messageId, callback)
  },

  onShortcutCalled: (key: string, cb: () => void) => {
    ipcRenderer.on(IPC_EVENTS.SHORTCUT_CALLED + key, (_event) => cb());
    return () => ipcRenderer.removeListener(IPC_EVENTS.SHORTCUT_CALLED + key, cb);
  },

  logger: {
    debug: (message: string, ...meta: any[]) => ipcRenderer.send(IPC_EVENTS.LOG_DEBUG, message, ...meta),
    info: (message: string, ...meta: any[]) => ipcRenderer.send(IPC_EVENTS.LOG_INFO, message, ...meta),
    warn: (message: string, ...meta: any[]) => ipcRenderer.send(IPC_EVENTS.LOG_WARN, message, ...meta),
    error: (message: string, ...meta: any[]) => ipcRenderer.send(IPC_EVENTS.LOG_ERROR, message, ...meta),
  }
}

contextBridge.exposeInMainWorld('api', api);
