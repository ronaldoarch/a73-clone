import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/** Em dev o index.html não passa pelo Express; substitui tokens OG para não aparecer __A73_*__ no browser. */
function socialMetaDevPlugin() {
  return {
    name: 'social-meta-dev-placeholders',
    transformIndexHtml(html, ctx) {
      if (!ctx.server) return html
      const base = 'http://localhost:5173'
      const devIcon = `${base}/assets/inicio-36-DJCGom9R.svg`
      const fill = (h) => h
        .replace(/__A73_PAGE_TITLE__/g, 'A73 (dev)')
        .replace(/__A73_OG_TITLE__/g, 'A73 (dev)')
        .replace(/__A73_SITE_NAME__/g, 'A73')
        .replace(/__A73_OG_DESC__/g, 'Ambiente de desenvolvimento')
        .replace(/__A73_OG_IMAGE__/g, devIcon)
        .replace(/__A73_OG_URL__/g, `${base}/`)
        .replace(/__A73_LOGO_ABS__/g, devIcon)
      return fill(html)
    }
  }
}

export default defineConfig({
  plugins: [
    vue(),
    socialMetaDevPlugin()
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/gold_api': 'http://localhost:3000',
      /* Logo/banner gravados em backend/uploads — sem isto o <img src="/uploads/..."> no :5173 dá 404 */
      '/uploads': 'http://localhost:3000'
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
