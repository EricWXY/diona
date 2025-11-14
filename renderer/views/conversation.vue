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
// const isStoping = ref(false);
const message = ref('');
const provider = ref<SelectValue>();
const msgInputRef = useTemplateRef<{ selectedProvider: SelectValue }>('msgInputRef');

const route = useRoute();
const router = useRouter();

const messagesStore = useMessagesStore();
const conversationsStore = useConversationsStore();
const providersStore = useProvidersStore();

const providerId = computed(() => ((provider.value as string)?.split(':')[0] ?? ''));
const selectedModel = computed(() => ((provider.value as string)?.split(':')[1] ?? ''));
const conversationId = computed(() => Number(route.params.id) as number | undefined);

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
  // conversationsStore
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
    <div class="input-container bg-bubble-others flex-auto w-[calc(100% + 10px)] ml-[-5px] ">
      <resize-divider direction="horizontal" v-model:size="listHeight" :max-size="maxListHeight" :min-size="100" />
      <message-input v-model:provider="provider" :placeholder="$t('main.conversation.placeholder')" />
    </div>
  </div>
</template>

<style scoped>
.input-container {
  box-shadow: 5px 1px 20px 0px rgba(101, 101, 101, 0.2);
}
</style>
