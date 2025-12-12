<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NForm, NFormItem, NSelect, NColorPicker, NSwitch, NTabs, NTabPane, NScrollbar } from 'naive-ui';

import { useNaiveTheme } from '@renderer/hooks/useNaiveTheme';
import { useNaiveLocale } from '@renderer/hooks/useNaiveLocale';
import { useFontSize } from '@renderer/hooks/useFontSize';
import { useConfig } from '@renderer/hooks/useConfig';

import ProvidersConfig from './providers.vue';

useFontSize();
const { theme, themeOverrides } = useNaiveTheme();
const { locale, dateLocale } = useNaiveLocale();

const { t } = useI18n();
const activeTab = ref('basic');

const formModel = useConfig();
// const formRef = useTemplateRef<FormInst>('formRef');

const languageOptions = [
  { label: '中文', value: 'zh' },
  { label: 'English', value: 'en' },
];

const themeModeOptions = computed(() => [
  { label: t('settings.theme.dark'), value: 'dark' },
  { label: t('settings.theme.light'), value: 'light' },
  { label: t('settings.theme.system'), value: 'system' },
]);

const fontSizeOptions = computed(() => [
  { label: t('settings.appearance.fontSizeOptions.10'), value: 10 },
  { label: t('settings.appearance.fontSizeOptions.12'), value: 12 },
  { label: t('settings.appearance.fontSizeOptions.14'), value: 14 },
  { label: t('settings.appearance.fontSizeOptions.16'), value: 16 },
  { label: t('settings.appearance.fontSizeOptions.18'), value: 18 },
  { label: t('settings.appearance.fontSizeOptions.20'), value: 20 },
  { label: t('settings.appearance.fontSizeOptions.24'), value: 24 },
]);

function onWindowClose() {
  setTimeout(() => activeTab.value = 'basic', 300);
}
</script>

<template>
  <n-config-provider class="bg-main text-tx-primary h-screen flex flex-col" :locale="locale" :date-locale="dateLocale"
    :theme="theme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <title-bar :is-maximizable="false" @close="onWindowClose">
        <drag-region class="p-2 text-[16px]">{{ t('settings.title') }}</drag-region>
      </title-bar>
      <n-scrollbar class="h-full p-4">
        <n-tabs class="h-full" size="large" animated default-value="basic" v-model:value="activeTab">
          <n-tab-pane name="basic" :tab="t('settings.base')">
            <n-form :model="formModel">
              <n-form-item :label="t('settings.theme.label')" path="themeMode">
                <n-select v-model:value="formModel.themeMode" :options="themeModeOptions" />
              </n-form-item>
              <n-form-item :label="`${t('settings.theme.primaryColor')}-${formModel.primaryColor}`">
                <n-color-picker v-model:value="formModel.primaryColor" :show-alpha="false" />
              </n-form-item>
              <n-form-item :label="t('settings.language.label')" path="language">
                <n-select v-model:value="formModel.language" :options="languageOptions" />
              </n-form-item>
              <n-form-item :label="t('settings.appearance.fontSize')">
                <n-select v-model:value="formModel.fontSize" :options="fontSizeOptions" />
              </n-form-item>
              <n-form-item :label="t('settings.behavior.minimizeToTray')" path="minimizeToTray">
                <n-switch v-model:value="formModel.minimizeToTray" />
              </n-form-item>
            </n-form>
          </n-tab-pane>
          <n-tab-pane name="provider" :tab="t('settings.provider.modelConfig')">
            <providers-config />
          </n-tab-pane>
        </n-tabs>
      </n-scrollbar>
    </n-message-provider>
  </n-config-provider>
</template>
