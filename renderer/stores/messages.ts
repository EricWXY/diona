import type { Message, MessageStatus } from '@common/types';
import { cloneDeep, uniqueByKey } from '@common/utils';
import { defineStore } from 'pinia';

import { dataBase } from '../dataBase';

import { useConversationsStore } from './conversations';


export const useMessagesStore = defineStore('messages', () => {
  const conversationsStore = useConversationsStore();

  // States
  const messages = ref<Message[]>([]);

  // Getters
  const allMessages = computed(() => messages.value);
  const messagesByConversationId = computed(() => (conversationId: number) => messages.value.filter(message => message.conversationId === conversationId).sort((a, b) => a.createdAt - b.createdAt));

  // Actions
  async function initialize(conversationId: number) {
    if (!conversationId) return;

    const isConversationLoaded = messages.value.some(message => message.conversationId === conversationId);

    if (isConversationLoaded) return;

    const saved = await dataBase.messages.where({ conversationId }).toArray();
    messages.value = uniqueByKey([...messages.value, ...saved], 'id');
  }

  const _updateConversation = async (conversationId: number) => {
    const conversation = await dataBase.conversations.get(conversationId);
    conversation && conversationsStore.updateConversation(conversation);
  }

  async function addMessage(message: Omit<Message, 'id' | 'createdAt'>) {
    const newMessage = {
      ...message,
      createdAt: Date.now(),
    };
    const id = await dataBase.messages.add(newMessage);
    _updateConversation(newMessage.conversationId);
    messages.value.push({ ...newMessage, id });
    return id
  }

  async function sendMessage(message: Omit<Message, 'id' | 'createdAt'>) {
    await addMessage(message);

    // const loadingMsgId = await addMessage({
    //   conversationId: message.conversationId,
    //   type: 'answer',
    //   content: '',
    //   status: 'loading',
    // });
    // TODO: 调用 大模型
  }

  async function updateMessage(id: number, updates: Partial<Message>) {
    let currentMsg = cloneDeep(messages.value.find(message => message.id === id));
    await dataBase.messages.update(id, { ...currentMsg, ...updates });
    messages.value = messages.value.map(message => message.id === id ? { ...message, ...updates } : message);
  }

  async function deleteMessage(id: number) {
    let currentMsg = cloneDeep(messages.value.find(item => item.id === id));
    //TODO: stopMessage(id, false);
    await dataBase.messages.delete(id);
    currentMsg && _updateConversation(currentMsg.conversationId);
    // 从响应式数组中移除
    messages.value = messages.value.filter(message => message.id !== id);
    currentMsg = void 0;
  }

  return {
    messages,
    allMessages,
    messagesByConversationId,
    initialize,
    addMessage,
    sendMessage,
    updateMessage,
    deleteMessage,
  }
});
