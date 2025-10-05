
type ThemeMode = 'dark' | 'light' | 'system';

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
