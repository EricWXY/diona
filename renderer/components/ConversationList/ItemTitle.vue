<script setup lang="ts">
import { CTX_KEY } from './constants';
import { NInput } from 'naive-ui';

import NativeTooltip from '../NativeTooltip.vue';

interface ItemTitleProps {
  title: string;
  isEditable: boolean;
}

defineOptions({ name: 'ItemTitle' });

const props = defineProps<ItemTitleProps>();
const emit = defineEmits(['updateTitle']);

const ctx = inject(CTX_KEY, void 0);

const isTitleOverflow = ref(false);
const _title = ref(props.title);
const titleRef = useTemplateRef<HTMLElement>('titleRef');


function checkOverflow(element: HTMLElement | null): boolean {
  if (!element) return false;
  return element.scrollWidth > element.clientWidth;
}

function _updateOverflowStatus() {
  isTitleOverflow.value = checkOverflow(titleRef.value);
}

const updateOverflowStatus = useDebounceFn(_updateOverflowStatus, 100);

function updateTitle() {
  emit('updateTitle', _title.value);
}

onMounted(() => {
  updateOverflowStatus();
  window.addEventListener('resize', updateOverflowStatus);
})

onUnmounted(() => {
  window.removeEventListener('resize', updateOverflowStatus);
})

watch([() => props.title, () => ctx?.width.value], () => updateOverflowStatus());
</script>

<template>
  <n-input v-if="isEditable" class="w-full" size="tiny" v-model:value="_title" @keydown.enter="updateTitle" />
  <h2 v-else ref="titleRef" class="conversation-title w-full text-tx-secondary font-semibold loading-5 truncate">
    <template v-if="isTitleOverflow">
      <native-tooltip :content="title">
        {{ title }}
      </native-tooltip>
    </template>
    <template v-else>
      {{ title }}
    </template>
  </h2>
</template>
