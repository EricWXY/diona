<script setup lang="ts">
import { NConfigProvider } from 'naive-ui';
import TitleBar from '@renderer/components/TitleBar.vue';
import DragRegion from '@renderer/components/DragRegion.vue';


onMounted(() => {
  console.log('App mounted');
});
</script>
<template>
  <n-config-provider class="h-[100vh] w-[100vw] flex">
    <aside class=" h-full flex flex-shrink-0 flex-col bg-amber-600 w-[200px]">
      Aside
    </aside>
    <div class="flex-auto">
      <title-bar>
        <drag-region class="w-full" />
      </title-bar>
      Main
    </div>
  </n-config-provider>
</template>
