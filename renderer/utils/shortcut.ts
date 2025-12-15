
export function listenShortcut(shortcut: string, callback: () => void) {
  return window?.api?.onShortcutCalled(shortcut, callback)
}
