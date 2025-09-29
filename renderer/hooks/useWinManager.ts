export function useWinManager() {
  const isMaximized = ref(false)

  function closeWindow() {
    window.api.closeWindow();
  }

  function minimizeWindow() {
    window.api.minimizeWindow();
  }

  function maximizeWindow() {
    window.api.maximizeWindow();
  }

  onMounted(async () => {
    await nextTick();
    isMaximized.value = await window.api.isWindowMaximized();
    window.api.onWindowMaximized((_isMaximized: boolean) => isMaximized.value = _isMaximized);
  })

  return {
    isMaximized,
    closeWindow,
    minimizeWindow,
    maximizeWindow
  }
};

export default useWinManager;
