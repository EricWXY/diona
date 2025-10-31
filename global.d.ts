
type ThemeMode = 'dark' | 'light' | 'system';

interface CreateDialogProps {
  winId?: string;
  title?: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  isModal?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface WindowApi {
  closeWindow: () => void;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  onWindowMaximized: (callback: (isMaximized: boolean) => void) => void;
  isWindowMaximized: () => Promise<boolean>;

  setThemeMode: (mode: ThemeMode) => Promise<boolean>;
  getThemeMode: () => Promise<ThemeMode>;
  isDarkTheme: () => Promise<boolean>;
  onSystemThemeChange: (callback: (isDark: boolean) => void) => void;

  showContextMenu: (menuId: string, dynamicOptions?: string) => Promise<any>;
  contextMenuItemClick: (menuId: string, cb: (id: string) => void) => void;
  removeContextMenuListener: (menuId: string) => void;

  viewIsReady: () => void;

  createDialog: (params: CreateDialogProps) => Promise<string>;
  _dialogFeedback: (val: 'cancel' | 'confirm', winId: number) => void;
  _dialogGetParams: () => Promise<CreateDialogProps>;

  logger: {
    debug: (message: string, ...meta?: any[]) => void;
    info: (message: string, ...meta?: any[]) => void;
    warn: (message: string, ...meta?: any[]) => void;
    error: (message: string, ...meta?: any[]) => void;
  }
}

declare interface Window {
  api: WindowApi;
}
