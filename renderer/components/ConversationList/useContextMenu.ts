import { MENU_IDS, CONVERSATION_LIST_MENU_IDS } from '@common/constants';
import { createContextMenu } from '@renderer/utils/contextMenu';
import { useConversationsStore } from '@renderer/stores/conversations';

const SortByIdMap = new Map([
  ['createAt', CONVERSATION_LIST_MENU_IDS.SORT_BY_CREATE_TIME],
  ['updatedAt', CONVERSATION_LIST_MENU_IDS.SORT_BY_UPDATE_TIME],
  ['name', CONVERSATION_LIST_MENU_IDS.SORT_BY_NAME],
  ['model', CONVERSATION_LIST_MENU_IDS.SORT_BY_MODEL],
])
const SortOrderIdMap = new Map([
  ['desc', CONVERSATION_LIST_MENU_IDS.SORT_DESCENDING],
  ['asc', CONVERSATION_LIST_MENU_IDS.SORT_ASCENDING],
])

export function useContextMenu() {
  const router = useRouter();
  const route = useRoute();
  const conversationsStore = useConversationsStore();

  const actionPolicy = new Map([
    [CONVERSATION_LIST_MENU_IDS.BATCH_OPERATIONS, () => {
      console.log('batch operations');
    }],
    [CONVERSATION_LIST_MENU_IDS.NEW_CONVERSATION, () => {
      console.log('new conversation');
      router.push('/conversation')
    }],
    [CONVERSATION_LIST_MENU_IDS.SORT_BY_CREATE_TIME, () => conversationsStore.setSortMode('createAt', conversationsStore.sortOrder)],
    [CONVERSATION_LIST_MENU_IDS.SORT_BY_UPDATE_TIME, () => conversationsStore.setSortMode('updatedAt', conversationsStore.sortOrder)],
    [CONVERSATION_LIST_MENU_IDS.SORT_BY_NAME, () => conversationsStore.setSortMode('name', conversationsStore.sortOrder)],
    [CONVERSATION_LIST_MENU_IDS.SORT_BY_MODEL, () => conversationsStore.setSortMode('model', conversationsStore.sortOrder)],
    [CONVERSATION_LIST_MENU_IDS.SORT_DESCENDING, () => conversationsStore.setSortMode(conversationsStore.sortBy, 'desc')],
    [CONVERSATION_LIST_MENU_IDS.SORT_ASCENDING, () => conversationsStore.setSortMode(conversationsStore.sortBy, 'asc')],
  ])

  const handle = async () => {
    const { sortBy, sortOrder } = conversationsStore.sortMode;

    const sortById = SortByIdMap.get(sortBy) ?? '';
    const sortOrderId = SortOrderIdMap.get(sortOrder) ?? '';
    const newConversationEnabled = !!route.params.id;

    const item = await createContextMenu(MENU_IDS.CONVERSATION_LIST, void 0, [
      { id: CONVERSATION_LIST_MENU_IDS.NEW_CONVERSATION, enabled: newConversationEnabled },
      { id: sortById, checked: true },
      { id: sortOrderId, checked: true },
    ]);

    const action = actionPolicy.get(item as CONVERSATION_LIST_MENU_IDS);
    action?.();
  }

  return {
    handle
  }
}
