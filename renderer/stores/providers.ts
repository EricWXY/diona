import type { Provider } from '@common/types';
import { dataBase } from '../dataBase';

export const useProvidersStore = defineStore('providers', () => {
  const providers = ref<Provider[]>([]);

  const allProviders = computed(() => providers.value);

  async function initialize() {
    providers.value = await dataBase.providers.toArray();
  }

  return {
    // state
    providers,
    // getters
    allProviders,
    // actions
    initialize,
  }
})
