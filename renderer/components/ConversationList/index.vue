<script setup lang="ts">
import { useFilter } from './useFilter';
import { CTX_KEY } from './constants';
import SearchBar from './SearchBar.vue';
import ListItem from './ListItem.vue';

defineOptions({ name: 'ConversationList' });

const props = defineProps<{ width: number }>();

const { conversations } = useFilter();

provide(CTX_KEY, {
  width: computed(() => props.width),
});
</script>

<template>
  <div class="conversation-list px-2 pt-3 h-[100vh] flex flex-col" :style="{ width: 'calc(100% - 57px)' }">
    <search-bar class="mt-3" />
    <ul class="flex-auto overflow-auto">
      <template v-for="item in conversations" :key="item.id">
        <li v-if="item.type !== 'divider'"
          class="cursor-pointer p-2 mt-2 rounded-md hover:bg-input flex flex-col items-start gap-2">
          <list-item v-bind="item" />
        </li>
        <li v-else class="divider my-2 h-px bg-input"></li>
      </template>
    </ul>
  </div>
</template>
