import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3001,
    hmr: { port: 3001, clientPort: 3001 },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/igamewin-api': {
        target: 'https://igamewin.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/igamewin-api/, '/api/v1')
      }
    }
  }
})
