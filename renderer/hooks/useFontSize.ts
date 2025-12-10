import { CONFIG_KEYS } from '@common/constants';
import { useConfig } from './useConfig';

export function useFontSize() {
  const fontSize = ref(14);
  const config = useConfig();

  const setFontSize = (size: number) => {
    document.body.style.fontSize = `${size}px`;
    if (size !== config[CONFIG_KEYS.FONT_SIZE])
      config[CONFIG_KEYS.FONT_SIZE] = size;
    if (size !== fontSize.value)
      fontSize.value = size;
  }

  watch(() => config[CONFIG_KEYS.FONT_SIZE], size => setFontSize(size), { immediate: true });

  return {
    fontSize,
    setFontSize,
  }
}

export default useFontSize;
