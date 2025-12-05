<script setup lang="ts">
import { NConfigProvider, NMessageProvider } from 'naive-ui';

const { t } = useI18n();

function onWindowClose(){

}
</script>

<template>
  <n-config-provider class="bg-main text-tx-primary h-screen flex flex-col">
    <n-message-provider>
      <title-bar :is-maximizable="false"  @close="onWindowClose">
        <drag-region class="p-2 text-[16px]">{{ t('settings.title') }}</drag-region>
      </title-bar>
      <div class="h-full p-4">
        settting window
      </div>
    </n-message-provider>
  </n-config-provider>
</template>
