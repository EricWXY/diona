import type { Provider } from "@common/types";
import { OpenAIProvider } from "./OpenAIProvider";
import { parseOpenAISetting } from '@common/utils';
import { decode } from 'js-base64';
import { configManager } from '../service/ConfigService';
import { logManager } from '../service/LogService';
import { CONFIG_KEYS } from "@common/constants";

interface _Provider extends Omit<Provider, 'openAISetting'> {
  openAISetting?: {
    apiKey: string,
    baseURL: string,
  };
}

const _parseProvider = () => {
  let result: Provider[] = [];
  let isBase64Parsed = false;
  const providerConfig = configManager.get(CONFIG_KEYS.PROVIDER);

  const mapCallback = (provider: Provider) => ({
    ...provider,
    openAISetting: typeof provider.openAISetting === 'string'
      ? parseOpenAISetting(provider.openAISetting ?? '')
      : provider.openAISetting,
  })

  try {
    result = JSON.parse(decode(providerConfig)) as Provider[];
    isBase64Parsed = true;
  } catch (error) {
    logManager.error(`parse base64 provider failed: ${error}`);
  }

  if (!isBase64Parsed) try {
    result = JSON.parse(providerConfig) as Provider[]
  } catch (error) {
    logManager.error(`parse provider failed: ${error}`);
  }

  if (!result.length) return;

  return result.map(mapCallback) as _Provider[]
}

const getProviderConfig = () => {
  try {
    return _parseProvider();
  } catch (error) {
    logManager.error(`get provider config failed: ${error}`);
    return null;
  }
}

export function createProvider(name: string) {
  const providers = getProviderConfig();

  if (!providers) {
    throw new Error('provider config not found');
  }

  for (const provider of providers) {
    if (provider.name === name) {
      if (!provider.openAISetting?.apiKey || !provider.openAISetting?.baseURL) {
        throw new Error('apiKey or baseURL not found');
      }
      if (!provider.visible) {
        throw new Error(`provider ${provider.name} is disabled`);
      }

      return new OpenAIProvider(provider.openAISetting.apiKey, provider.openAISetting.baseURL);
    }
  }
}
