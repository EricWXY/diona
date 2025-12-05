<script setup lang="ts">
import type { SelectValue } from '@renderer/types'
import { WINDOW_NAMES } from '@common/constants';
import { NSelect, NButton } from 'naive-ui';
import { openWindow } from '@renderer/utils/system';
import { useProvidersStore } from '@renderer/stores/providers';

defineOptions({ name: 'ProviderSelect' });

const { t } = useI18n()

const providersStore = useProvidersStore();
const selectedProvider = defineModel<SelectValue>('modelValue')


const providerOptions = computed(() => providersStore.allProviders.map(item => ({
  label: item.title || item.name,
  type: 'group',
  key: item.id,
  children: item.models.map(model => ({
    label: model,
    value: `${item.id}:${model}`,
  }))
})))

function openSettingWindow() {
  openWindow(WINDOW_NAMES.SETTING);
}
</script>

<template>
  <n-select size="small" v-model:value="selectedProvider" :options="providerOptions"
    :placeholder="t('main.conversation.selectModel')">
    <template #empty>
      <span class="text-tx-primary text-[0.7rem]">
        {{ t('main.conversation.goSettings') }}
        <n-button class="go-settings-btn" size="tiny" @click="openSettingWindow" text>{{ t('main.conversation.settings')
        }}</n-button>{{
            t('main.conversation.addModel') }}
      </span>
    </template>
  </n-select>
</template>

<style scoped>
.go-settings-btn {
  padding: 0 0.5rem;
  font-weight: bold;
}
</style>
