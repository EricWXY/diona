<script setup lang="ts">
import type { Conversation } from '@common/types';
import { CONVERSATION_ITEM_MENU_IDS, MENU_IDS } from '@common/constants';
import { CTX_KEY } from './constants';
import { createContextMenu } from '@renderer/utils/contextMenu';
import { useFilter } from './useFilter';
import { useContextMenu } from './useContextMenu';
import { useDialog } from '@renderer/hooks/useDialog';
import { useConversationsStore } from '@renderer/stores/conversations';

import SearchBar from './SearchBar.vue';
import ListItem from './ListItem.vue';
import OperationsBar from './OperationsBar.vue';


defineOptions({ name: 'ConversationList' });

const props = defineProps<{ width: number }>();
const editId = ref<number | void>();
const checkedIds = ref<number[]>([]);

const router = useRouter();
const route = useRoute();
const conversationsStore = useConversationsStore();

const { conversations } = useFilter();
const { createDialog } = useDialog();
const { handle: handleListContextMenu, isBatchOperate } = useContextMenu();

const currentId = computed(() => Number(route.params.id));

const conversationItemActionPolicy = new Map([
  [CONVERSATION_ITEM_MENU_IDS.DEL, async (item: Conversation) => {
    const res = await createDialog({
      title: 'main.conversation.dialog.title',
      content: 'main.conversation.dialog.content',
    })
    if (res === 'confirm') {
      conversationsStore.delConversation(item.id);
      item.id === currentId.value && router.push('/conversation');
    }
  }],
  [CONVERSATION_ITEM_MENU_IDS.RENAME, async (item: Conversation) => {
    editId.value = item.id;
  }],
  [CONVERSATION_ITEM_MENU_IDS.PIN, async (item: Conversation) => {
    if (item.pinned) {
      await conversationsStore.unpinConversation(item.id);
      return;
    }
    await conversationsStore.pinConversation(item.id);
  }],
]);
const batchActionPolicy = new Map([
  [CONVERSATION_ITEM_MENU_IDS.DEL, async () => {
    const res = await createDialog({
      title: 'main.conversation.dialog.title',
      content: 'main.conversation.dialog.content_1',
    })
    if (res !== 'confirm') return

    if (checkedIds.value.includes(currentId.value)) {
      router.push('/conversation');
    }
    checkedIds.value.forEach(id => conversationsStore.delConversation(id));
    isBatchOperate.value = false;
  }],
  [CONVERSATION_ITEM_MENU_IDS.PIN, async () => {
    checkedIds.value.forEach(id => {
      if (conversationsStore.allConversations.find(item => item.id === id)?.pinned) {
        conversationsStore.unpinConversation(id);
        return
      }
      conversationsStore.pinConversation(id);
    })
    isBatchOperate.value = false;
  }]
])

function handleBatchOperate(opId: CONVERSATION_ITEM_MENU_IDS) {
  const action = batchActionPolicy.get(opId);
  action && action();
}

async function handleItemContextMenu(item: Conversation) {
  const clickItem = await createContextMenu(MENU_IDS.CONVERSATION_ITEM, void 0) as CONVERSATION_ITEM_MENU_IDS;
  const action = conversationItemActionPolicy.get(clickItem);
  action && await action?.(item);
}

function updateTitle(id: number, title: string) {
  const target = conversationsStore.conversations.find(item => item.id === id);
  if (!target) return
  conversationsStore.updateConversation({
    ...target,
    title
  });
  editId.value = void 0;
}

function handleAllSelectChange(checked: boolean) {
  checkedIds.value = checked ? conversations.value.map(item => item.id) : [];
}

provide(CTX_KEY, {
  width: computed(() => props.width),
  editId: computed(() => editId.value),
  checkedIds: checkedIds,
});
</script>

<template>
  <div class="conversation-list px-2 pt-3 h-[100vh] flex flex-col" :style="{ width: 'calc(100% - 57px)' }"
    @contextmenu.prevent.stop="handleListContextMenu">
    <search-bar class="mt-3" />
    <ul class="flex-auto overflow-auto">
      <template v-for="item in conversations" :key="item.id">
        <li v-if="item.type !== 'divider'"
          class="cursor-pointer p-2 mt-2 rounded-md hover:bg-input flex flex-col items-start gap-2"
          @contextmenu.prevent.stop="handleItemContextMenu(item)">
          <list-item v-bind="item" @update-title="updateTitle" />
        </li>
        <li v-else class="divider my-2 h-px bg-input"></li>
      </template>
    </ul>
    <operations-bar v-show="isBatchOperate" @select-all="handleAllSelectChange" @cancel="isBatchOperate = false"
      @op="handleBatchOperate" />
  </div>
</template>
