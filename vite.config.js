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
        name: 'A73',
        short_name: 'A73',
        description: 'Plataforma de jogos A73',
        theme_color: '#4D087B',
        background_color: '#0f0f14',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/assets/hot-platform-36-gold.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: [
          '**/hot-platform-36-gold.svg'
          // index.html e index-*.js no precache (navigateFallback exige) - cada deploy gera novo SW
        ],
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024 // 20 MB - assets legados podem ser grandes
      }
    })
  ],
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
