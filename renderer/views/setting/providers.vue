<script setup lang="ts">
import type { Provider } from '@common/types';
import { NCollapse, NCollapseItem, NSwitch, NInput, NInputGroup, NInputGroupLabel, NDynamicTags, NDivider, NSelect } from 'naive-ui';
import { stringifyOpenAISetting } from '@common/utils';
import { useProvidersStore } from '@renderer/stores/providers';
import { useConfig } from '@renderer/hooks/useConfig';
import { CONFIG_KEYS } from '@common/constants';

const providersStore = useProvidersStore();
const config = useConfig();

const defaultModel = computed({
  get() {
    const vals: string[] = []
    providersStore.allProviders.forEach(provider => {
      if (!provider.visible) return;
      provider.models.forEach(model => {
        vals.push(`${provider.id}:${model}`)
      })
    })

    if (!vals.includes(config[CONFIG_KEYS.DEFAULT_MODEL] ?? '')) return null

    return config[CONFIG_KEYS.DEFAULT_MODEL] || null;
  },
  set(val) {
    config[CONFIG_KEYS.DEFAULT_MODEL] = val;
  }
});

const providerOptions = computed(() => providersStore.allProviders.map(item => ({
  label: item.title || item.name,
  type: 'group',
  key: item.id,
  children: item.models.map(model => ({
    label: model,
    value: `${item.id}:${model}`,
    disabled: !item.visible,
  }))
})));

function handleApiKeyUpdate(id: number, apiKey: string) {
  const baseURL = providersStore.allProviders.find(item => item.id === id)?.openAISetting?.baseURL ?? '';
  const update: Partial<Provider> = { openAISetting: stringifyOpenAISetting({ baseURL, apiKey }) };
  if (!baseURL || !apiKey) update.visible = false;
  providersStore.updateProvider(id, { ...update });
}

function handleBaseURLUpdate(id: number, baseURL: string) {
  const apiKey = providersStore.allProviders.find(item => item.id === id)?.openAISetting?.apiKey ?? '';
  const update: Partial<Provider> = { openAISetting: stringifyOpenAISetting({ baseURL, apiKey }) };
  if (!baseURL || !apiKey) update.visible = false;
  providersStore.updateProvider(id, { ...update });
}

onMounted(() => providersStore.initialize());
</script>

<template>
  <div class="flex items-center py-4">
    <div class="w-[100px]">
      {{ $t('settings.providers.defaultModel') }}：
    </div>
    <n-select v-model:value="defaultModel" :options="providerOptions" clearable />
  </div>
  <n-divider />
  <n-collapse>
    <n-collapse-item v-for="(provider, index) in providersStore.allProviders" :key="provider.name"
      :title="provider.title ?? provider.name">
      <template #header-extra>
        <n-switch :value="providersStore.allProviders[index].visible"
          :disabled="!providersStore.allProviders[index].openAISetting.apiKey || !providersStore.allProviders[index].openAISetting.baseURL"
          @update:value="(v) => providersStore.updateProvider(provider.id, { visible: v })" @click.stop />
      </template>
      <n-input-group class="my-2">
        <n-input-group-label>{{ $t('settings.providers.apiKey') }}</n-input-group-label>
        <n-input type="password" :value="providersStore.allProviders[index].openAISetting?.apiKey ?? ''"
          @update:value="(v) => handleApiKeyUpdate(provider.id, v)" />
      </n-input-group>
      <n-input-group class="my-2">
        <n-input-group-label>{{ $t('settings.providers.apiUrl') }}</n-input-group-label>
        <n-input :value="providersStore.allProviders[index].openAISetting?.baseURL ?? ''"
          @update:value="(v) => handleBaseURLUpdate(provider.id, v)" />
      </n-input-group>
      <n-dynamic-tags :value="providersStore.allProviders[index].models ?? []"
        @update:value="(v: any) => providersStore.updateProvider(provider.id, { models: v })" />
    </n-collapse-item>
  </n-collapse>
</template>
