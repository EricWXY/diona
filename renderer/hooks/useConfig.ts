import type { Reactive } from 'vue';
import type { IConfig } from '@common/types';
import { CONFIG_KEYS } from '@common/constants';

import { setLanguage, getLanguage } from '@renderer/i18n';


const config: Reactive<IConfig> = reactive({
  [CONFIG_KEYS.THEME_MODE]: 'system',
  [CONFIG_KEYS.PRIMARY_COLOR]: '#BB5BE7',
  [CONFIG_KEYS.LANGUAGE]: 'zh',
  [CONFIG_KEYS.FONT_SIZE]: 14,
  [CONFIG_KEYS.MINIMIZE_TO_TRAY]: false,
  [CONFIG_KEYS.PROVIDER]: '',
  [CONFIG_KEYS.DEFAULT_MODEL]: null,
});

const conifgKeys = [
  CONFIG_KEYS.THEME_MODE,
  CONFIG_KEYS.PRIMARY_COLOR,
  CONFIG_KEYS.LANGUAGE,
  CONFIG_KEYS.FONT_SIZE,
  CONFIG_KEYS.MINIMIZE_TO_TRAY,
  CONFIG_KEYS.PROVIDER,
  CONFIG_KEYS.DEFAULT_MODEL
];

const setReactiveConf = (key: CONFIG_KEYS, value: IConfig[typeof key]) => config[key] = value as never;

conifgKeys.forEach(key => window.api.getConfig(key).then(val => setReactiveConf(key, val)));

export function useConfig() {
  const removeListener = window.api.onConfigChange((_config: IConfig) => {
    conifgKeys.forEach(key => {
      if (key === CONFIG_KEYS.LANGUAGE) {
        const lang = getLanguage();
        (lang !== config[key]) && setLanguage(config[key])
      }
      if (_config[key] === config[key]) return;
      setReactiveConf(key, _config[key]);
    });
  });

  const onReactiveChange = () => {
    conifgKeys.forEach(async (key) => {
      if (config[key] === await window.api.getConfig(key)) return;
      window.api.setConfig(key, config[key]);
    })
  }

  watch(() => config, () => onReactiveChange(), { deep: true })

  onUnmounted(() => removeListener());

  return config;
}

export default useConfig;
