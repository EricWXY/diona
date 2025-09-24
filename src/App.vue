<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
function handleClick(){
  count.value++
}
</script>
<template>
  <div class="flex flex-col items-center justify-center h-screen bg-gray-100">
    <h1 class="text-2xl font-bold text-center mb-1">Hello World</h1>
    <p>click this button to increment the count</p>
    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" @click="handleClick">count: {{ count }}</button>
  </div>
</template>
