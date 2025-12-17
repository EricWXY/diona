import { loadIcon } from '@iconify/vue';

export async function preloadIcons() {
  await Promise.all([
    loadIcon('material-symbols:keep-rounded'),
    loadIcon('material-symbols:close'),
    loadIcon('material-symbols:chrome-maximize-outline-sharp'),
    loadIcon('material-symbols:chrome-restore-outline-sharp'),
    loadIcon('material-symbols:chrome-minimize-sharp'),
    loadIcon('material-symbols:chat-outline'),
    loadIcon('material-symbols:settings-outline'),
    loadIcon('material-symbols:light-mode-outline'),
    loadIcon('material-symbols:dark-mode-outline'),
    loadIcon('material-symbols:auto-awesome-outline'),
    loadIcon('material-symbols:arrow-upward')
  ])
}
