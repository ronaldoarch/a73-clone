import { createPinia, setActivePinia } from 'pinia'

const pinia = createPinia()
setActivePinia(pinia)

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './utils/i18n'
import { initAdAnalytics } from './utils/adAnalytics'
import { registerServiceWorker } from './utils/serviceWorker'
import { platformInfo } from './utils/platform'
import { initSentry } from './utils/sentry'
import { initDevtoolsGuard } from './utils/devtoolsGuard'

import './styles/global.css'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)

initSentry(app, router)

app.config.globalProperties.$platform = platformInfo

router.isReady().then(() => {
  app.mount('#app')
})

initAdAnalytics()
initDevtoolsGuard()

registerServiceWorker().catch(() => {})

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.deferredPrompt = e
})
