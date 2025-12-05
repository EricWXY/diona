import { setupMainWindow } from './main';
import { setupDialogWindow } from './dialog';
import { setupSetttingWindow } from './setting';

export function setupWindows() {
  setupMainWindow();
  setupSetttingWindow();
  setupDialogWindow();
}
