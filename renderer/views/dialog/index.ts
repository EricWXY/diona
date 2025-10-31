import '@renderer/styles/index.css';
import 'vfonts/Lato.css';

import errorHandler from '@renderer/utils/errorHandler';
import i18n from '@renderer/i18n';
import TitleBar from '@renderer/components/TitleBar.vue';
import DragRegion from '@renderer/components/DragRegion.vue';

import Dialog from './index.vue';

createApp(Dialog)
  .use(i18n)
  .use(errorHandler)
  .component('TitleBar', TitleBar)
  .component('DragRegion', DragRegion)
  .mount('#app')
