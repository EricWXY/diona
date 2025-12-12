import type { Provider } from '@common/types';
import { CONFIG_KEYS } from '@common/constants';
import { parseOpenAISetting, deepMerge } from '@common/utils';
import { encode } from 'js-base64';
import { dataBase } from '../dataBase';
import { useConfig } from '../hooks/useConfig';


export const useProvidersStore = defineStore('providers', () => {
  // states
  const providers = ref<Provider[]>([]);
  const config = useConfig();

  // getters
  const allProviders = computed(() => providers.value.map(item => ({ ...item, openAISetting: parseOpenAISetting(item.openAISetting ?? '') })));

  // actions
  async function initialize() {
    providers.value = await dataBase.providers.toArray();
  }

  async function updateProvider(id: number, provider: Partial<Provider>) {
    await dataBase.providers.update(id, { ...provider });
    providers.value = providers.value.map(item => item.id === id ? { ...deepMerge(item, provider) as Provider } : item);
    config[CONFIG_KEYS.PROVIDER] = encode(JSON.stringify(providers.value));
  }

  watch(() => config[CONFIG_KEYS.PROVIDER], () => initialize());

  return {
    // state
    providers,
    // getters
    allProviders,
    // actions
    initialize,
    updateProvider,
  }
})
