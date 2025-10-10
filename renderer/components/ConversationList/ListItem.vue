<script setup lang="ts">
import type { Conversation } from '@common/types'
import { Icon as IconifyIcon } from '@iconify/vue'

const _PIN_ICON_SIZE = 16 as const

defineOptions({ name: 'ConversationListItem' });

defineProps<Conversation>();
const emit = defineEmits(['updateTitle']);
</script>

<template>
  <div class="conversation-desc text-tx-secondary flex justify-between items-center text-sm loading-5">
    <span>
      {{ selectedModel }}
      <iconify-icon class="inline-block" v-if="pinned" icon="material-symbols:keep-rounded" :width="_PIN_ICON_SIZE"
        :height="_PIN_ICON_SIZE" />
    </span>
  </div>
  <div class="w-full flex items-center">
    <!-- 复选框 预留 -->
    <div class="flex-auto">
      <h2 class="conversation-title w-full text-tx-secondary font-semibold loading-5 truncate">
        {{ title }}
      </h2>
    </div>
  </div>
</template>
