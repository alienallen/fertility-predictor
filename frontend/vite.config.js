import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig({
  plugins: [
    uni({
      ssr: false,
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 8080,
    open: false,
  },
  build: {
    target: 'es2015',
    cssTarget: '#chrome80',
  },
});
