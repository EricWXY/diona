<script setup lang="ts">
import type { Ref } from 'vue';
import { NConfigProvider } from 'naive-ui';

const { t } = useI18n();

const params: Ref<CreateDialogProps> = ref({
  title: '',
  content: '',
  confirmText: '',
  cancelText: '',
})

window.api._dialogGetParams().then(res => params.value = res)

function handleCancel() {
  window.api._dialogFeedback('cancel', Number(params.value.winId));
}
function handleConfirm() {
  window.api._dialogFeedback('confirm', Number(params.value.winId));
}
</script>

<template>
  <n-config-provider class="h-screen w-full flex flex-col">
    <title-bar class="h-[30px]" :is-minimizable="false" :is-maximizable="false">
      <drag-region class="p-3 text-sm font-bold text-tx-primary">
        {{ t(params.title ?? '') }}
      </drag-region>
    </title-bar>
    <p class="flex-auto p-5 text-sm text-tx-primary">
      {{ t(params.content ?? '') }}
    </p>

    <div class="h-[40px] flex justify-end items-center gap-2 p-4 mb-[20px]">
      <button
        class="mr-1 px-4 py-1.5 cursor-pointer rounded-md text-sm text-tx-secondary hover:bg-input transition-colors"
        @click="handleCancel">
        {{ t(params.cancelText || 'dialog.cancel') }}
      </button>
      <button
        class="px-4 py-1.5 cursor-pointer rounded-md text-sm text-tx-primary hover:bg-red-200 hover:text-red-300   transition-colors"
        @click="handleConfirm">
        {{ t(params.confirmText || 'dialog.confirm') }}
      </button>
    </div>

  </n-config-provider>
</template>
