<script setup lang="ts">
import type { SelectValue } from '@renderer/types';
import { MAIN_WIN_SIZE } from '@common/constants';
import { throttle } from '@common/utils';
import { useMessagesStore } from '@renderer/stores/messages';

// import { messages } from '@renderer/testData';
import ResizeDivider from '@renderer/components/ResizeDivider.vue';
import MessageInput from '@renderer/components/MessageInput.vue';
import MessageList from '@renderer/components/MessageList.vue';
import CreateConversation from '@renderer/components/CreateConversation.vue';
import { useConversationsStore } from '@renderer/stores/conversations';
import { useProvidersStore } from '@renderer/stores/providers';

const listHeight = ref(0);
const listScale = ref(0.7);
const maxListHeight = ref(window.innerHeight * 0.7);
const isStoping = ref(false);
const message = ref('');
const provider = ref<SelectValue>();
const msgInputRef = useTemplateRef<{ selectedProvider: SelectValue }>('msgInputRef');

const route = useRoute();
const router = useRouter();

const messagesStore = useMessagesStore();
const conversationsStore = useConversationsStore();
// const providersStore = useProvidersStore();

const providerId = computed(() => ((provider.value as string)?.split(':')[0] ?? ''));
const selectedModel = computed(() => ((provider.value as string)?.split(':')[1] ?? ''));
const conversationId = computed(() => Number(route.params.id) as number | undefined);

const messageInputStatus = computed(() => {
  if (isStoping.value) return 'loading';
  const messages = messagesStore.messagesByConversationId(conversationId.value as number);
  const last = messages[messages.length - 1];
  if (last?.status === 'streaming' && last?.content?.length === 0) return 'loading';
  if (last?.status === 'loading' || last?.status === 'streaming') return last?.status;
  return 'normal';
})

async function handleCreateConversation(create: (title: string) => Promise<number | void>, _message: string) {
  const id = await create(_message);
  if (!id) return;
  afterCreateConversation(id, _message);
}

function afterCreateConversation(id: number, firstMsg: string) {
  if (!id) return;
  router.push(`/conversation/${id}`);
  messagesStore.sendMessage({
    type: 'question',
    content: firstMsg,
    conversationId: id,
  })
  message.value = '';
  messagesStore.setMessageInputValue(id, '');
}

async function handleSendMessage() {
  if (!conversationId.value) return;
  const _conversationId = conversationId.value;
  const content = messagesStore.messageInputValueById(_conversationId);
  if (!content?.trim()?.length) return;
  messagesStore.sendMessage({
    type: 'question',
    content,
    conversationId: _conversationId,
  })
  messagesStore.setMessageInputValue(_conversationId, '');
}

const canUpdateConversationTime = ref(true);
function handleProviderSelect() {
  const current = conversationsStore.getConversationById(conversationId.value as number);
  if (!conversationId.value || !current) return;
  conversationsStore.updateConversation({
    ...current,
    providerId: Number(providerId.value),
    selectedModel: selectedModel.value,
  }, canUpdateConversationTime.value)
}

async function handleStopMessage() {
  isStoping.value = true;
  const msgIds = messagesStore.loadingMsgIdsByConversationId(conversationId.value as number ?? -1);
  for (const id of msgIds) {
    messagesStore.stopMessage(id);
  }
  isStoping.value = false;
}

window.onresize = throttle(async () => {
  if (window.innerHeight < MAIN_WIN_SIZE.minHeight) return;
  listHeight.value = window.innerHeight * listScale.value;
  await nextTick();
  maxListHeight.value = window.innerHeight * 0.7;
  if (listHeight.value > maxListHeight.value) listHeight.value = maxListHeight.value;
}, 40);

onMounted(async () => {
  await nextTick();
  listHeight.value = window.innerHeight * listScale.value;
});

onBeforeRouteUpdate(async (to, from, next) => {
  if (to.params.id === from.params.id) return next();
  await messagesStore.initialize(Number(to.params.id));
  next();
});

watch(() => listHeight.value, () => listScale.value = listHeight.value / window.innerHeight);

watch([() => conversationId.value, () => msgInputRef.value], async ([id, msgInput]) => {
  if (!msgInput || !id) {
    // TODO: 默认模型
    return;
  }

  const current = conversationsStore.getConversationById(id);
  if (!current) return;

  canUpdateConversationTime.value = false;
  msgInput.selectedProvider = `${current.providerId}:${current.selectedModel}`;
  await nextTick();
  canUpdateConversationTime.value = true;

  message.value = '';
});

</script>
<template>
  <div class="h-full " v-if="!conversationId">
    <div class="h-full pt-[45vh] px-5">
      <div class="text-3xl font-bold text-primary-subtle text-center">
        {{ $t('main.welcome.helloMessage') }}
      </div>

      <div class="bg-bubble-others mt-6 max-w-[800px] h-[200px] mx-auto rounded-md">
        <create-conversation :providerId="providerId" :selectedModel="selectedModel" v-slot="{ create }">
          <message-input v-model:message="message" v-model:provider="provider"
            :placeholder="$t('main.conversation.placeholder')" @send="handleCreateConversation(create, message)" />
        </create-conversation>
      </div>
    </div>
  </div>
  <div class="h-full flex flex-col" v-else>
    <div class="w-full min-h-0" :style="{ height: `${listHeight}px` }">
      <message-list :messages="messagesStore.messagesByConversationId(conversationId)" />
    </div>
    <div class="input-container bg-bubble-others flex-auto w-full">
      <resize-divider direction="horizontal" v-model:size="listHeight" :max-size="maxListHeight" :min-size="100" />
      <message-input class="p-2 pt-0" ref="msgInputRef"
        :message="messagesStore.messageInputValueById(conversationId ?? -1)" v-model:provider="provider"
        :placeholder="$t('main.conversation.placeholder')" :status="messageInputStatus"
        @update:message="messagesStore.setMessageInputValue(conversationId ?? -1, $event)" @send="handleSendMessage"
        @select="handleProviderSelect" @stop="handleStopMessage" />
    </div>
  </div>
</template>

<style scoped>
.input-container {
  box-shadow: 5px 1px 20px 0px rgba(101, 101, 101, 0.2);
}
</style>
