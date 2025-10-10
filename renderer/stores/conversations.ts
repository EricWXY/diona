import type { Conversation } from '@common/types';
import { conversations as testConversations } from '../testData';

export const useConversationsStore = defineStore('conversations', () => {
  const conversations = ref<Conversation[]>(testConversations);

  const allConversations = computed(() => conversations.value)
  return {
    conversations,
    allConversations,
  }
})
