<script setup lang="ts">
import { WINDOW_NAMES } from '@common/constants';
import { Icon as IconifyIcon } from '@iconify/vue';
import { openWindow } from '@renderer/utils/system';
import DragRegion from './DragRegion.vue';
import ThemeSwitcher from './ThemeSwitcher.vue';
import NativeTooltip from './NativeTooltip.vue';

defineOptions({ name: 'NavBar' });

const { t } = useI18n();

function openSettingWindow() {
  openWindow(WINDOW_NAMES.SETTING);
}
</script>

<template>
  <drag-region>
    <nav
      class="h-[calc(100%-1.4rem)] flex flex-col px-4 py-2 mt-[.7rem] mb-[.7rem] border-r border-r-input text-tx-secondary">
      <ul class="flex-auto">
        <li class="sidebar-item no-drag cursor-pointer hover:text-primary-hover text-tx-primary">
          <native-tooltip :content="t('main.sidebar.conversations')">
            <iconify-icon icon="material-symbols:chat-outline" width="24" height="24" />
          </native-tooltip>
        </li>
      </ul>
      <ul>
        <li class="sidebar-item no-drag cursor-pointer hover:text-primary-subtle">
          <theme-switcher />
        </li>
        <li class="sidebar-item no-drag cursor-pointer hover:text-primary-subtle" @click="openSettingWindow">
          <native-tooltip :content="t('main.sidebar.settings')">
            <iconify-icon icon="material-symbols:settings-outline" width="24" height="24" />
          </native-tooltip>
        </li>
      </ul>

    </nav>
  </drag-region>
</template>

<style scoped>
li {
  margin-top: 10px;
}
</style>
