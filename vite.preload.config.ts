import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      '@common': resolve(__dirname, 'common'),
      '@main': resolve(__dirname, 'main'),
      '@renderer': resolve(__dirname, 'renderer'),
      '@locales': resolve(__dirname, 'locales'),
    },
  },
});
