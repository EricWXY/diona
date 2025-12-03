import { CONFIG_KEYS } from '@common/constants';
import logManager from '../service/LogService';
import configManager from '../service/ConfigService';
import path from 'node:path';


import en from '@locales/en.json';
import zh from '@locales/zh.json';

type MessageSchema = typeof zh;
const messages: Record<string, MessageSchema> = { en, zh }

export function createTranslator() {
  return (key?: string) => {
    if (!key) return void 0;
    try {
      const keys = key?.split('.');
      let result: any = messages[configManager.get(CONFIG_KEYS.LANGUAGE)];
      for (const _key of keys) {
        result = result[_key];
      }
      return result as string;
    } catch (e) {
      logManager.error('failed to translate key:', key, e);
      return key
    }
  }
}

let logo: string | void = void 0;
export function createLogo() {
  if (logo != null) {
    return logo;
  }
  logo = path.join(__dirname, 'logo.ico');
  return logo;
}
