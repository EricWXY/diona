import { zhCN, enUS, dateZhCN, dateEnUS } from 'naive-ui';
import i18n from '../i18n';

export function useNaiveLocale() {
  const locale = computed(() => i18n.global.locale === 'zh' ? zhCN : enUS);
  const dateLocale = computed(() => i18n.global.locale === 'zh' ? dateZhCN : dateEnUS);

  return {
    locale,
    dateLocale,
  }
}

export default useNaiveLocale;
