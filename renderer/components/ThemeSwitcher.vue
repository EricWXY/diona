<script setup lang="ts">
import { useThemeMode } from '@renderer/hooks/useThemeMode';
import { Icon as IconifyIcon } from '@iconify/vue';

import NativeTooltip from './NativeTooltip.vue';

defineOptions({ name: 'ThemeSwitcher' });

const {
  themeIcon,
  setThemeMode,
  themeTooltip,
} = useThemeMode();
const isDarkMode = usePreferredDark();

function toggleThemeMode() {
  setThemeMode(isDarkMode.value ? 'light' : 'dark');
}
</script>

<template>
  <native-tooltip :content="themeTooltip">
    <iconify-icon :icon="themeIcon" width="24" height="24" @click="toggleThemeMode" />
  </native-tooltip>
</template>
