import './styles/index.css';
import 'vfonts/Lato.css';

import { createApp } from 'vue';
import i18n from './i18n';
import errorHandler from './utils/errorHandler';
import App from '../renderer/App.vue';

createApp(App)
  .use(await i18n)
  .use(errorHandler)
  .mount('#app');
