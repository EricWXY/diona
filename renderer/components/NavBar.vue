<script setup lang="ts">
import { Icon as IconifyIcon } from '@iconify/vue';
import DragRegion from './DragRegion.vue';
import ThemeSwitcher from './ThemeSwitcher.vue';

defineOptions({ name: 'NavBar' });
</script>

<template>
  <drag-region>
    <nav
      class="h-[calc(100%-1.4rem)] flex flex-col px-4 py-2 mt-[.7rem] mb-[.7rem] border-r border-r-input text-tx-secondary">
      <ul class="flex-auto">
        <li class="sidebar-item no-drag cursor-pointer hover:text-primary-hover text-tx-primary">
          <iconify-icon icon="material-symbols:chat-outline" width="24" height="24" />
        </li>
      </ul>
      <ul>
        <li class="sidebar-item no-drag cursor-pointer hover:text-primary-subtle">
          <theme-switcher />
        </li>
        <li class="sidebar-item no-drag cursor-pointer hover:text-primary-subtle">
          <iconify-icon icon="material-symbols:settings-outline" width="24" height="24" />
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
