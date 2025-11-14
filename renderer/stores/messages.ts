import type { Message, MessageStatus } from '@common/types';
import { cloneDeep, uniqueByKey } from '@common/utils';
import { listenDialogueBack } from '../utils/dialogue';
import { defineStore } from 'pinia';

import { dataBase } from '../dataBase';

import { useConversationsStore } from './conversations';
import { useProvidersStore } from './providers';

const msgContentMap = new Map<number, string>();
export const stopMethods = new Map<number, () => void>();


export const useMessagesStore = defineStore('messages', () => {
  const conversationsStore = useConversationsStore();
  const providersStore = useProvidersStore();

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

    const loadingMsgId = await addMessage({
      conversationId: message.conversationId,
      type: 'answer',
      content: '',
      status: 'loading',
    });

    const conversation = conversationsStore.getConversationById(message.conversationId);

    if (!conversation) return loadingMsgId;

    const provider = providersStore.allProviders.find(item => item.id === conversation.providerId);

    if (!provider) return loadingMsgId;

    msgContentMap.set(loadingMsgId, '');

    let streamCallback: ((stream: DialogueBackStream) => Promise<void>) | void = async (stream) => {
      const { data, messageId } = stream;
      const getStatus = (data: DialogueBackStream['data']): MessageStatus => {
        if (data.isError) return 'error';
        if (data.isEnd) return 'success';
        return 'streaming';
      }
      msgContentMap.set(messageId, msgContentMap.get(messageId) + data.result);

      const _update = {
        content: msgContentMap.get(messageId) || '',
        status: getStatus(data),
        updatedAt: Date.now(),
      } as Message

      await nextTick();
      updateMessage(messageId, _update);
      if (data.isEnd) {
        msgContentMap.delete(messageId);
        streamCallback = void 0;
      }
    }
    stopMethods.set(loadingMsgId, listenDialogueBack(streamCallback, loadingMsgId));
    const messages = messagesByConversationId.value(message.conversationId).filter(item => item.status !== 'loading').map(item => ({
      role: item.type === 'question' ? 'user' : 'assistant' as DialogueMessageRole,
      content: item.content,
    }));

    await window.api.startADialogue({
      messageId: loadingMsgId,
      providerName: provider.name,
      selectedModel: conversation.selectedModel,
      conversationId: message.conversationId,
      messages,
    });

    return loadingMsgId;
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
