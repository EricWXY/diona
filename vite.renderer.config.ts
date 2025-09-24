import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// https://vitejs.dev/config
export default defineConfig(async () => {
  const vue = (await import('@vitejs/plugin-vue')).default;
  const tailwindcss = (await import('@tailwindcss/vite')).default;

  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
  }
});
