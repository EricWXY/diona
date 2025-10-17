import { MENU_IDS, CONVERSATION_LIST_MENU_IDS } from '@common/constants';
import { createContextMenu } from '@renderer/utils/contextMenu';
import { useConversationsStore } from '@renderer/stores/conversations';


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
    [CONVERSATION_LIST_MENU_IDS.SORT_BY_CREATE_TIME, () => {
      console.log('sort by create time');
    }
    ],
    [CONVERSATION_LIST_MENU_IDS.SORT_BY_UPDATE_TIME, () => {
      console.log('sort by update time');
    }
    ],
    [CONVERSATION_LIST_MENU_IDS.SORT_BY_NAME, () => {
      console.log('sort by name');
    }
    ],
    [CONVERSATION_LIST_MENU_IDS.SORT_BY_MODEL, () => {
      console.log('sort by model');
    }
    ],
    [CONVERSATION_LIST_MENU_IDS.SORT_DESCENDING, () => {
      console.log('sort descending');
    }],
    [CONVERSATION_LIST_MENU_IDS.SORT_ASCENDING, () => {
      console.log('sort ascending');
    }],
  ])

  const handle = async () => {

    const item = await createContextMenu(MENU_IDS.CONVERSATION_LIST, void 0);

    const action = actionPolicy.get(item as CONVERSATION_LIST_MENU_IDS);
    action?.();
  }

  return {
    handle
  }
}
