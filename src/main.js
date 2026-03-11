import { createApp } from 'vue'
import { createRouter, createWebHistory } from '@ionic/vue-router'
import App from './App.vue'
import { IonicVue } from '@ionic/vue'
import { addIcons } from 'ionicons'
import { downloadOutline, gift, chevronForward, chevronBack, chevronDown, chevronUp, flame, trophy, wallet, person, personCircleOutline, menu, lockClosed, cash, ribbon, sparkles, pricetag, logoAndroid, logoApple, headset, eyeOutline, eyeOffOutline, documentText, heart, shieldCheckmark, logOut, refresh, bag, chatbubbleOutline, copyOutline, informationCircleOutline, search, gameController, extensionPuzzle, helpCircleOutline, logoFacebook, logoWhatsapp, logoInstagram, logoTwitter, logoTiktok, logoYoutube, send, videocam, timeOutline, cashOutline, openOutline, close } from 'ionicons/icons'
addIcons({ 'download-outline': downloadOutline, gift, 'chevron-forward': chevronForward, 'chevron-back': chevronBack, 'chevron-down': chevronDown, 'chevron-up': chevronUp, flame, trophy, wallet, person, 'person-circle-outline': personCircleOutline, menu, 'lock-closed': lockClosed, cash, ribbon, sparkles, pricetag, 'logo-android': logoAndroid, 'logo-apple': logoApple, headset, 'eye-outline': eyeOutline, 'eye-off-outline': eyeOffOutline, 'document-text': documentText, heart, 'shield-checkmark': shieldCheckmark, 'log-out': logOut, refresh, bag, 'chatbubble-outline': chatbubbleOutline, 'copy-outline': copyOutline, 'information-circle-outline': informationCircleOutline, search, 'game-controller': gameController, 'extension-puzzle': extensionPuzzle, 'help-circle-outline': helpCircleOutline, 'logo-facebook': logoFacebook, 'logo-whatsapp': logoWhatsapp, 'logo-instagram': logoInstagram, 'logo-twitter': logoTwitter, 'logo-tiktok': logoTiktok, 'logo-youtube': logoYoutube, send, videocam, 'time-outline': timeOutline, 'cash-outline': cashOutline, 'open-outline': openOutline, close })
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'
import './theme.css'
import './assets/a73-original-utils.css'
import './assets/a73-animations.css'

import '@/utils/viteDepsMap'

import TabsLayout from './views/TabsLayout.vue'
import Inicio from './views/Inicio.vue'

// Lazy load: demais rotas carregam só quando acessadas
const Login = () => import('./views/Login.vue')
const Register = () => import('./views/Register.vue')
const Promo = () => import('./views/Promo.vue')
const Entrar = () => import('./views/Entrar.vue')
const Withdraw = () => import('./views/Withdraw.vue')
const SaqueSenha = () => import('./views/SaqueSenha.vue')
const CentroMensagens = () => import('./views/CentroMensagens.vue')
const Relatorios = () => import('./views/Relatorios.vue')
const Convidar = () => import('./views/Convidar.vue')
const Perfil = () => import('./views/Perfil.vue')
const Menu = () => import('./views/Menu.vue')
const Comissao = () => import('./views/Comissao.vue')
const TaxaReembolso = () => import('./views/TaxaReembolso.vue')
const Misterioso = () => import('./views/Misterioso.vue')
const Vip = () => import('./views/Vip.vue')
const Admin = () => import('./views/Admin.vue')
const OriginalSpa = () => import('./views/OriginalSpa.vue')
const Jogos = () => import('./views/Jogos.vue')
const Jogo = () => import('./views/Jogo.vue')
const Roleta = () => import('./views/Roleta.vue')
const Eventos = () => import('./views/Eventos.vue')

const routes = [
  { path: '/', redirect: '/main/inicio/' },
  {
    path: '/main/',
    component: TabsLayout,
    children: [
      { path: '', redirect: 'inicio/' },
      { path: 'inicio/', name: 'inicio', component: Inicio },
      { path: 'login/', name: 'login', component: Login },
      { path: 'register/', name: 'register', component: Register },
      { path: 'promo/', name: 'promo', component: Promo },
      { path: 'entrar/', name: 'entrar', component: Entrar },
      { path: 'withdraw/', name: 'withdraw', component: Withdraw },
      { path: 'saque-senha/', name: 'saque-senha', component: SaqueSenha },
      { path: 'centro-mensagens/', name: 'centro-mensagens', component: CentroMensagens },
      { path: 'relatorios/', name: 'relatorios', component: Relatorios },
      { path: 'convidar/', name: 'convidar', component: Convidar },
      { path: 'comissao/', name: 'comissao', component: Comissao },
      { path: 'taxa-reembolso/', name: 'taxa-reembolso', component: TaxaReembolso },
      { path: 'misterioso/', name: 'misterioso', component: Misterioso },
      { path: 'vip/', name: 'vip', component: Vip },
      { path: 'perfil/', name: 'perfil', component: Perfil },
      { path: 'menu/', name: 'menu', component: Menu },
      { path: 'jogos/', name: 'jogos', component: Jogos },
      { path: 'roleta/', name: 'roleta', component: Roleta },
      { path: 'eventos/', name: 'eventos', component: Eventos },
    ]
  },
  { path: '/admin/:section?', name: 'admin', component: Admin },
  { path: '/admin/', redirect: '/admin/dashboard' },
  { path: '/main/original/', name: 'original', component: OriginalSpa },
  { path: '/main/jogo/', name: 'jogo', component: Jogo },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Listener para tema aplicado pelo Admin (preview em iframe)
function applyThemeFromAdmin(theme) {
  if (!theme) return
  const r = document.documentElement
  const hexToRgb = (h) => {
    const m = (h || '#f59e0b').slice(1).match(/.{2}/g)
    return m ? m.map(x => parseInt(x, 16)).join(', ') : '245, 158, 11'
  }
  r.style.setProperty('--primary', theme.primary)
  r.style.setProperty('--primary-hover', theme.primaryHover || theme.primary)
  r.style.setProperty('--ion-color-primary', theme.primary)
  r.style.setProperty('--ion-color-primary-rgb', hexToRgb(theme.primary))
  r.style.setProperty('--ion-background-color', theme.bg)
  r.style.setProperty('--ion-card-background', theme.card)
  r.style.setProperty('--ion-text-color', theme.text)
  r.style.setProperty('--ion-color-medium', theme.textMuted)
  r.style.setProperty('--ion-color-success', theme.success)
  r.style.setProperty('--ion-color-danger', theme.danger)
  r.style.setProperty('--bg', theme.bg)
  r.style.setProperty('--card', theme.card)
  r.style.setProperty('--border', theme.border)
  r.style.setProperty('--text', theme.text)
  r.style.setProperty('--text-muted', theme.textMuted)
  r.style.setProperty('--success', theme.success)
  r.style.setProperty('--danger', theme.danger)
}
window.addEventListener('message', (e) => {
  if (e.data?.type === 'a73_apply_theme' && e.data.theme) applyThemeFromAdmin(e.data.theme)
})

// Captura pid da URL (?pid=xxx) para afiliado - persiste para uso no registro
import { capturePidFromUrl } from '@/composables/useAfiliado'
capturePidFromUrl()

const app = createApp(App)
app.use(IonicVue)
app.use(router)
app.mount('#app')
// Esconde loading assim que o app monta (fallback caso onMounted do App.vue atrase)
if (typeof window.__hideAppLoading === 'function') {
  requestAnimationFrame(() => window.__hideAppLoading())
}
