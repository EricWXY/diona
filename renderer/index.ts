import './styles/index.css';
import 'vfonts/Lato.css';

import { createApp, type Plugin } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import i18n from './i18n';
import errorHandler from './utils/errorHandler';
import App from '../renderer/App.vue';

import TitleBar from './components/TitleBar.vue';
import DragRegion from './components/DragRegion.vue';

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

createApp(App)
  .use(pinia)
  .use(router)
  .use(components)
  .use(i18n)
  .use(errorHandler)
  .mount('#app');
