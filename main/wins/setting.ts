import { IPC_EVENTS, WINDOW_NAMES } from '@common/constants';
import { ipcMain } from 'electron';
import { windowManager } from '../service/WindowService';

export function setupSetttingWindow() {
  ipcMain.on(`${IPC_EVENTS.OPEN_WINDOW}:${WINDOW_NAMES.SETTING}`, () => {
    const settingWindow = windowManager.get(WINDOW_NAMES.SETTING);
    if (settingWindow && !settingWindow.isDestroyed())
      return windowManager.focus(settingWindow);

    windowManager.create(WINDOW_NAMES.SETTING, {
      width: 800,
      height: 600,
      minHeight: 600,
      minWidth: 800,
    });
  })
}

export default setupSetttingWindow;
