<script setup lang="ts">
interface Props {
  direction: 'horizontal' | 'vertical';
  valIsNagetive?: boolean;
  size: number;
  maxSize: number;
  minSize: number;
}

interface Emits {
  (e: 'update:size', size: number): void;
}

defineOptions({ name: 'ResizeDivider' });

const props = withDefaults(defineProps<Props>(), {
  valIsNagetive: false,
})
const emit = defineEmits<Emits>();

const size = ref(props.size);

let isDragging = false;
let startSize = 0;
let startPoint = { x: 0, y: 0 };

function startDrag(e: MouseEvent) {
  isDragging = true;

  startPoint.x = e.clientX;
  startPoint.y = e.clientY;

  startSize = size.value;

  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDrag);
}

function stopDrag() {
  isDragging = false;
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
}

function handleDrag(e: MouseEvent) {
  if (!isDragging) return;

  const diffX = props.valIsNagetive ? startPoint.x - e.clientX : e.clientX - startPoint.x;
  const diffY = props.valIsNagetive ? startPoint.y - e.clientY : e.clientY - startPoint.y;

  if (props.direction === 'horizontal') {
    size.value = Math.max(props.minSize, Math.min(props.maxSize, startSize + diffY));
    emit('update:size', size.value);
    return
  }
  size.value = Math.max(props.minSize, Math.min(props.maxSize, startSize + diffX));
  emit('update:size', size.value);
}

watchEffect(() => size.value = props.size);
</script>

<template>
  <div class="bg-transparent z-[999]" :class="direction" @click.stop @mousedown="startDrag"></div>
</template>

<style scoped>
.vertical {
  width: 5px;
  height: 100%;
  cursor: ew-resize;
}

.horizontal {
  width: 100%;
  height: 5px;
  cursor: ns-resize;
}
</style>
