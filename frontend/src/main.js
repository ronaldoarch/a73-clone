import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/global.css'
import { initAdAnalytics } from './utils/adAnalytics'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')

initAdAnalytics()

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.deferredPrompt = e
})
