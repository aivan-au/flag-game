import { defineConfig } from 'vite';

export default defineConfig({
  base: '/flag-game/',
  server: {
    port: 4173,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
});
