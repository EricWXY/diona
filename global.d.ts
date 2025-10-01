
interface WindowApi {
  closeWindow: () => void;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  onWindowMaximized: (callback: (isMaximized: boolean) => void) => void;
  isWindowMaximized: () => Promise<boolean>;

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
