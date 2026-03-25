import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '35m',
        short_name: '35m',
        description: 'Plataforma de jogos 35m',
        theme_color: '#4D087B',
        background_color: '#0f0f14',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/assets/logo-35m.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Ícone do manifest e o glob incluíam o mesmo SVG duas vezes (com/sem ?__WB_REVISION__) → erro do Workbox
        globIgnores: ['**/assets/logo-35m.svg'],
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
        // Nunca cachear /api e /uploads (evita Cache.put em 404 e dados desatualizados)
        navigateFallbackDenylist: [/^\/api/, /^\/uploads/],
        runtimeCaching: [
          { urlPattern: /\/api\//, handler: 'NetworkOnly' },
          { urlPattern: /\/uploads\//, handler: 'NetworkOnly' }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'ionic': ['@ionic/vue', '@ionic/vue-router'],
          'vue': ['vue', 'vue-router'],
          'ionicons': ['ionicons']
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
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
      '/uploads': {
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
