import './styles/index.css';
import 'vfonts/Lato.css';
// import 'highlight.js/styles/lioshi.css';

import { createApp, type Plugin } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import i18n from './i18n';
import errorHandler from './utils/errorHandler';
import App from '../renderer/App.vue';

import TitleBar from './components/TitleBar.vue';
import DragRegion from './components/DragRegion.vue';

import hljs from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
import { preloadIcons } from './utils/icons';
import logger from './utils/logger';

hljs.registerLanguage('vue', xml);

const components: Plugin = function (app) {
  app.component('TitleBar', TitleBar);
  app.component('DragRegion', DragRegion);
}

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./views/index.vue'),
      children: [
        {
          path: '/',
          redirect: 'conversation'
        },
        {
          name: 'conversation',
          path: 'conversation/:id?',
          component: () => import('./views/conversation.vue')
        }
      ]
    },
  ],
})

const pinia = createPinia();

preloadIcons().finally(() => {
  logger.info('Icons preloaded');
  createApp(App)
    .use(pinia)
    .use(router)
    .use(components)
    .use(i18n)
    .use(errorHandler)
    .mount('#app');
})
