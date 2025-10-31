import { setupMainWindow } from './main';
import { setupDialogWindow } from './dialog';

export function setupWindows() {
  setupMainWindow();
  setupDialogWindow();
}
