<script setup lang="ts">
defineOptions({ name: 'MessageRender' });
defineProps<{
  msgId: number;
  content: string;
  isStreaming: boolean;
}>();
</script>
<template>
  <span>
    {{ content }}
  </span>
</template>
