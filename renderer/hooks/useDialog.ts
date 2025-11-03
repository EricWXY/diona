export function useDialog() {
  const isDarkMode = usePreferredDark();

  const createDialog = (opts: CreateDialogProps) => {
    const overlay = document.createElement('div');
    const isModal = opts.isModal !== false;

    overlay.classList.add('dialog-overlay');
    watchEffect(() => overlay.style.backgroundColor = isDarkMode.value
      ? 'rgba(0, 0, 0, 0.6)'
      : 'rgba(255, 255, 255, 0.6)'
    );

    return new Promise<string>((resolve) => {
      window.api.createDialog(opts).then(res => {
        resolve(res);
        if (!isModal) return;
        document.body.removeChild(overlay);
        overlay?.classList?.remove('show');
      });
      if (!isModal) return;
      document.body.appendChild(overlay);
      setTimeout(() => overlay.classList.add('show'), 10);
    });
  }
  return { createDialog }
}

export default useDialog;
