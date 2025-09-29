import { WINDOW_NAMES, MAIN_WIN_SIZE } from '@common/constants';
import { windowManager } from '../service/WindowService';

export function setupMainWindow() {
  windowManager.create(WINDOW_NAMES.MAIN, MAIN_WIN_SIZE);
}
