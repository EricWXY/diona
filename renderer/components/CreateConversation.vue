<script setup lang="ts">
import { useConversationsStore } from '@renderer/stores/conversations'

defineOptions({ name: 'CreateConversation' });
const props = defineProps<{
  providerId: string;
  selectedModel: string;
}>();
const { t } = useI18n();
const conversationsStore = useConversationsStore();

async function createConversation(title?: string) {
  if (!props.providerId || !props.selectedModel) return;
  const conversationId = conversationsStore.addConversation({
    title: title ?? t('main.conversation.newConversation'),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    providerId: Number(props.providerId),
    selectedModel: props.selectedModel,
    pinned: false,
  })
  return conversationId;
}
</script>

<template>
  <slot :create="createConversation">
    <!-- renderless -->
  </slot>
</template>
