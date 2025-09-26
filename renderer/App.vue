<script setup lang="ts">
import { NConfigProvider } from 'naive-ui';

</script>
<template>
  <n-config-provider class="h-[100vh] w-[100vw] flex">
    <aside class=" h-full flex flex-shrink-0 flex-col bg-amber-600">
      Aside
    </aside>
    <div class="flex-auto">
      Main 
    </div>
  </n-config-provider>
</template>
