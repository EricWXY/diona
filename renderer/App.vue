<script setup lang="ts">
import { NConfigProvider } from 'naive-ui';
import TitleBar from '@renderer/components/TitleBar.vue';
import DragRegion from '@renderer/components/DragRegion.vue';
import NavBar from '@renderer/components/NavBar.vue';
import ResizeDivider from '@renderer/components/ResizeDivider.vue';

const sidebarWidth = ref(320);

onMounted(() => {
  console.log('App mounted');
});
</script>
<template>
  <n-config-provider class="h-full w-[100vw] flex text-tx-primary">
    <aside class="sidebar h-full flex flex-shrink-0 flex-col" :style="{ width: sidebarWidth + 'px' }">
      <div class="flex-auto flex">
        <nav-bar />
        <div class="flex-auto">
          conversation-list
        </div>
      </div>
    </aside>
    <resize-divider direction="vertical" v-model:size="sidebarWidth" :max-size="800" :min-size="320" />
    <div class="flex-auto">
      <title-bar>
        <drag-region class="w-full" />
      </title-bar>
      Main
    </div>
  </n-config-provider>
</template>

<style scoped>
.sidebar {
  background-color: var(--bg-color);
  box-shadow: -3px -2px 10px rgba(101, 101, 101, 0.2);
}
</style>
