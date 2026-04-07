import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue()
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/gold_api': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia', 'vue-i18n'],
          'sentry': ['@sentry/vue'],
          'swiper': ['swiper'],
          'utils': ['decimal.js', 'superjson', 'zod', 'localforage', 'uuid', 'ua-parser-js', 'dayjs']
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'swiper',
      'swiper/vue',
      'pusher-js',
      'decimal.js',
      'superjson',
      'localforage',
      'zod',
      'axios',
      'uuid'
    ]
  }
})
