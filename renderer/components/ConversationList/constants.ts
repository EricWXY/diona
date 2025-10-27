import type { InjectionKey, ComputedRef, Ref } from 'vue';

export const CTX_KEY: InjectionKey<{
  width: ComputedRef<number>;
  editId: ComputedRef<number | void>;
  checkedIds: Ref<number[]>
}> = Symbol('ConversationListContext');
