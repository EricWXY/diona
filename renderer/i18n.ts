import { createI18n, type I18nOptions } from 'vue-i18n'

async function createI18nInstance() {
  const options: I18nOptions = {
    locale: 'zh',
    fallbackLocale: 'zh',
    messages: {
      zh: await import('@locales/zh.json').then(m => m.default),
      en: await import('@locales/en.json').then(m => m.default),
    }
  }

  const i18n = createI18n(options)
  return i18n
}

export const i18n = createI18nInstance();

export default i18n;
