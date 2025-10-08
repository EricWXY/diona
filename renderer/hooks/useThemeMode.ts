
const iconMap = new Map([
  ['system', 'material-symbols:auto-awesome-outline'],
  ['light', 'material-symbols:light-mode-outline'],
  ['dark', 'material-symbols:dark-mode-outline'],
])
const tooltipMap = new Map([
  ['system', 'settings.theme.system'],
  ['light', 'settings.theme.light'],
  ['dark', 'settings.theme.dark'],
])
export function useThemeMode() {
  const themeMode = ref<ThemeMode>('dark');
  const isDark = ref<boolean>(false);

  const {t} = useI18n();

  const themeIcon = computed(() => iconMap.get(themeMode.value) || 'material-symbols:auto-awesome-outline');
  const themeTooltip = computed(() => t(tooltipMap.get(themeMode.value) || 'settings.theme.system'));

  const themeChangeCallbacks: Array<(mode: ThemeMode) => void> = [];

  function setThemeMode(mode: ThemeMode) {
    themeMode.value = mode;
    window.api.setThemeMode(mode);
  }
  function getThemeMode() {
    return themeMode.value;
  }

  function onThemeChange(callback: (mode: ThemeMode) => void) {
    themeChangeCallbacks.push(callback);
  }

  onMounted(async () => {
    window.api.onSystemThemeChange((_isDark) => window.api.getThemeMode().then(res => {
      isDark.value = _isDark;
      if (res !== themeMode.value) themeMode.value = res;
      themeChangeCallbacks.forEach(cb => cb(res));
    }));
    isDark.value = await window.api.isDarkTheme();
    themeMode.value = await window.api.getThemeMode();
  });

  return {
    themeMode,
    themeIcon,
    themeTooltip,
    isDark,
    setThemeMode,
    getThemeMode,
    onThemeChange,
  }
}

export default useThemeMode;
