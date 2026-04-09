<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="modelValue" class="drawer-overlay" @click.self="close">
        <div class="drawer-panel">
          <div class="drawer-header">
            <div class="drawer-logo-wrap">
              <AppLogoMark @click="goHome" />
            </div>
            <button class="drawer-close" @click="close">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="drawer-user" v-if="isLoggedIn">
            <div class="drawer-avatar">
              <img :src="avatarUrl" alt="Avatar" />
            </div>
            <div class="drawer-user-info">
              <span class="drawer-username">{{ user?.account || 'Usuário' }}</span>
              <span class="drawer-vip">VIP {{ vipLevel }}</span>
            </div>
          </div>

          <div class="drawer-auth" v-else>
            <button class="drawer-login-btn" @click="navigate('/login')">Entrar</button>
            <button class="drawer-register-btn" @click="navigate('/register')">Registrar</button>
          </div>

          <div class="drawer-scroll">
            <!-- Game Categories -->
            <div class="drawer-section" v-if="gameCategories.length">
              <h4 class="drawer-section-title">Categorias</h4>
              <div class="drawer-categories">
                <div
                  v-for="cat in gameCategories"
                  :key="cat.id"
                  class="drawer-cat-item"
                  @click="onCategoryClick(cat)"
                >
                  <div class="cat-icon-wrap" :style="{ background: cat.color }">
                    <span class="cat-icon-letter">{{ cat.name.charAt(0) }}</span>
                  </div>
                  <span class="cat-label">{{ cat.name }}</span>
                </div>
              </div>
            </div>

            <!-- Game Platforms -->
            <div class="drawer-section" v-if="gamePlatforms.length">
              <h4 class="drawer-section-title">Plataformas</h4>
              <div class="drawer-platforms">
                <div
                  v-for="plat in gamePlatforms"
                  :key="plat.code"
                  class="drawer-plat-item"
                  @click="onPlatformClick(plat)"
                >
                  <div class="plat-icon-wrap" :style="{ background: plat.color }">
                    <span class="plat-letter">{{ plat.name.charAt(0) }}</span>
                  </div>
                  <span class="plat-label">{{ plat.name }}</span>
                </div>
              </div>
            </div>

            <!-- Activities -->
            <div class="drawer-section" v-if="activityItems.length">
              <h4 class="drawer-section-title">Atividades</h4>
              <div class="drawer-activities">
                <div
                  v-for="act in activityItems"
                  :key="act.path"
                  class="drawer-act-item"
                  @click="navigate(act.path)"
                >
                  <div class="act-icon-bg" :style="{ background: act.color }">
                    <span class="act-icon-letter">{{ act.label.charAt(0) }}</span>
                  </div>
                  <span class="act-label">{{ act.label }}</span>
                </div>
              </div>
            </div>

            <!-- Menu Sections -->
            <div class="drawer-section" v-for="section in menuSections" :key="section.title">
              <h4 class="drawer-section-title">{{ section.title }}</h4>
              <div class="drawer-items">
                <div
                  v-for="item in section.items"
                  :key="item.path"
                  class="drawer-item"
                  :class="{ active: isActive(item.path) }"
                  @click="navigate(item.path)"
                >
                  <span class="drawer-item-icon" v-html="item.icon"></span>
                  <span class="drawer-item-label">{{ item.label }}</span>
                  <span v-if="item.badge" class="drawer-badge">{{ item.badge }}</span>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="drawer-section">
              <h4 class="drawer-section-title">Atalhos</h4>
              <div class="drawer-quick-actions">
                <button class="quick-action" @click="navigate('/main/deposito')">
                  <span class="qa-icon deposit-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                  </span>
                  <span>Depósito</span>
                </button>
                <button class="quick-action" @click="navigate('/withdraw/apply')">
                  <span class="qa-icon withdraw-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  </span>
                  <span>Saque</span>
                </button>
                <button class="quick-action" @click="navigate('/main/promo')">
                  <span class="qa-icon promo-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01z"/></svg>
                  </span>
                  <span>Promoções</span>
                </button>
                <button class="quick-action" @click="navigate('/spread')">
                  <span class="qa-icon spread-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                  </span>
                  <span>Convidar</span>
                </button>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="drawer-footer-actions">
              <button class="drawer-footer-btn" @click="openSupport">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                <span>Suporte 24/7</span>
              </button>
              <button class="drawer-footer-btn" @click="showLanguageModal = true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                </svg>
                <span>Idioma</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <LanguageSelector v-if="showLanguageModal" ref="langRef" @close="showLanguageModal = false" />
  </Teleport>
</template>

<script setup>
import { computed, ref, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LanguageSelector from './LanguageSelector.vue'
import AppLogoMark from './AppLogoMark.vue'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/user'
import { useNotificationStore } from '../stores/notification'
import { useGamesStore } from '../stores/games'
import { storeToRefs } from 'pinia'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const userStore = useUserStore()
const notifStore = useNotificationStore()
const gamesStore = useGamesStore()
const { isLoggedIn, user } = storeToRefs(auth)
const { vipLevel, userDetails } = storeToRefs(userStore)
const { unreadCount } = storeToRefs(notifStore)

const showLanguageModal = ref(false)
const langRef = ref(null)

watch(showLanguageModal, async (val) => {
  if (val) {
    await nextTick()
    langRef.value?.show()
  }
})

function openSupport() {
  window.open('https://t.me/a73support', '_blank')
  close()
}

const avatarUrl = computed(() => {
  const saved = userDetails.value?.avatar
  if (saved && (saved.startsWith('/') || saved.startsWith('http'))) return saved
  const idx = ((user.value?.id || 1) % 20) + 1
  const num = String(idx).padStart(2, '0')
  const gender = (user.value?.id || 0) % 2 === 0 ? 'male' : 'female'
  return `/assets/avatars/${gender}/${num}.jpg`
})

const catColors = ['#6C5CE7', '#00B894', '#E17055', '#0984E3', '#D63031', '#FDCB6E', '#A29BFE', '#55EFC4']
function hashColor(str) {
  let h = 0
  for (let i = 0; i < (str || '').length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return catColors[Math.abs(h) % catColors.length]
}

const defaultCategories = [
  { id: 'POPULAR', name: 'Popular', icon: '🔥' },
  { id: 'SLOTS', name: 'Slots', icon: '🎰' },
  { id: 'LIVE', name: 'Ao Vivo', icon: '🎥' },
  { id: 'TABLE', name: 'Mesa', icon: '🃏' },
  { id: 'FISH', name: 'Pesca', icon: '🐟' },
  { id: 'SPORTS', name: 'Esportes', icon: '⚽' },
  { id: 'LOTTERY', name: 'Loteria', icon: '🎫' },
  { id: 'CRASH', name: 'Crash', icon: '🚀' },
]

const gameCategories = computed(() => {
  return defaultCategories.map(c => ({
    ...c,
    color: hashColor(c.id)
  }))
})

const gamePlatforms = computed(() => {
  if (gamesStore.providers.length) {
    return gamesStore.providers.slice(0, 12).map(p => ({
      ...p,
      name: p.name || p.code,
      color: hashColor(p.code)
    }))
  }
  return []
})

const actColors = ['#E040FB', '#FF6B35', '#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6', '#D63031', '#6C5CE7']
const activityItems = computed(() => [
  { label: 'Check-in', path: '/activity/SignIn', color: actColors[0] },
  { label: 'Roleta', path: '/activity/LuckyWheel', color: actColors[1] },
  { label: 'Recarga', path: '/activity/RechargeBonus', color: actColors[2] },
  { label: 'Aposta', path: '/activity/ValidBet', color: actColors[3] },
  { label: 'Agência', path: '/activity/Agency', color: actColors[4] },
  { label: 'Pacote', path: '/activity/RedPacket', color: actColors[5] },
  { label: 'Mistério', path: '/activity/MysteryReward', color: actColors[6] },
  { label: 'Comissão', path: '/main/promo?tab=rebate', color: actColors[7] },
  { label: 'Indicação', path: '/activity/ReferralRewardsNew', color: actColors[8] },
  { label: 'Novo User', path: '/activity/NewUserExclusive', color: actColors[9] },
])

const menuSections = computed(() => [
  {
    title: 'Principal',
    items: [
      { path: '/main/inicio', label: 'Início', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>' },
      { path: '/game/search', label: 'Buscar Jogos', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>' },
      { path: '/notification', label: 'Notificações', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>', badge: unreadCount.value > 0 ? unreadCount.value : null }
    ]
  },
  {
    title: 'Conta',
    items: [
      { path: '/main/perfil', label: 'Perfil', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
      { path: '/activity/vip', label: 'VIP', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
      { path: '/spread', label: 'Convide e Ganhe', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>' },
      { path: '/report', label: 'Relatórios', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
      { path: '/security', label: 'Segurança', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' }
    ]
  },
  {
    title: 'Outros',
    items: [
      { path: '/download', label: 'Baixar APP', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>' },
      { path: '/Redeem', label: 'Resgatar Código', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>' }
    ]
  }
])

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}

function navigate(path) {
  router.push(path)
  close()
}

function goHome() {
  router.push('/main/inicio')
  close()
}

function close() {
  emit('update:modelValue', false)
}

function onCategoryClick(cat) {
  router.push({ path: `/game/category/${cat.id}` })
  close()
}

function onPlatformClick(plat) {
  router.push({ path: `/game/category/ALL/${plat.code}` })
  close()
}

onMounted(() => {
  if (!gamesStore.allGames.length) {
    gamesStore.fetchCatalog().catch(() => {})
  }
})
</script>

<style scoped>
.drawer-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: var(--z-drawer, 10000);
  backdrop-filter: blur(2px);
}

.drawer-panel {
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 18rem; max-width: 85vw;
  background: var(--ep-color-background-fill-surface-raised-L1, #18254E);
  display: flex; flex-direction: column;
  border-right: 1px solid var(--ep-color-border-default);
}

.drawer-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem; flex-shrink: 0;
  border-bottom: 1px solid var(--ep-color-border-default);
}

.drawer-logo-wrap { display: flex; align-items: center; cursor: pointer; }
.drawer-close { color: var(--ep-color-text-weakest); padding: .25rem; }

.drawer-user { display: flex; align-items: center; gap: .75rem; padding: .75rem 1rem 1rem; }
.drawer-avatar {
  width: 2.75rem; height: 2.75rem; border-radius: 50%;
  background: var(--gradient-primary); display: flex; align-items: center;
  justify-content: center; overflow: hidden;
  border: 2px solid var(--color-currency, #FE963B);
}
.drawer-avatar img { width: 100%; height: 100%; object-fit: cover; }
.drawer-username {
  font-size: var(--ep-font-size-m, .9375rem); font-weight: var(--ep-font-weight-bold, 700);
  display: block; color: var(--ep-color-text-default);
}
.drawer-vip {
  font-size: var(--ep-font-size-xs, .6875rem);
  color: var(--color-currency, #FE963B); font-weight: var(--ep-font-weight-semi-bold, 600);
}

.drawer-auth { display: flex; gap: .5rem; padding: .5rem 1rem 1rem; }
.drawer-login-btn {
  flex: 1; padding: .625rem; border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--ep-color-background-fill-btn-level-2-bg, rgba(24,170,255,.15));
  border: 1px solid var(--ep-color-border-default);
  color: var(--ep-color-text-default); font-size: var(--ep-font-size-m, .875rem);
  font-weight: var(--ep-font-weight-semi-bold, 600);
}
.drawer-register-btn {
  flex: 1; padding: .625rem; border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--gradient-primary); color: var(--ep-color-text-inverse, #0E1E3D);
  font-size: var(--ep-font-size-m, .875rem); font-weight: var(--ep-font-weight-bold, 700);
}

.drawer-scroll { flex: 1; overflow-y: auto; padding-bottom: 1.5rem; }

.drawer-section { padding: 0 1rem; margin-bottom: .25rem; }
.drawer-section-title {
  font-size: var(--ep-font-size-xs, .6875rem); font-weight: var(--ep-font-weight-semi-bold, 600);
  color: var(--ep-color-text-weakest); text-transform: uppercase;
  letter-spacing: 0.5px; padding: .75rem 0 .375rem;
}

/* Categories grid */
.drawer-categories {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: .5rem;
}
.drawer-cat-item {
  display: flex; flex-direction: column; align-items: center; gap: .25rem;
  cursor: pointer; padding: .375rem; border-radius: .5rem;
  transition: background .15s;
}
.drawer-cat-item:active { background: rgba(255,255,255,0.06); }
.cat-icon-wrap {
  width: 2.25rem; height: 2.25rem; border-radius: .625rem;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
}
.cat-icon-letter { font-size: .875rem; font-weight: 800; color: #fff; }
.cat-label {
  font-size: .5625rem; color: var(--ep-color-text-weak, rgba(213,224,245,.8));
  font-weight: 500; text-align: center; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; max-width: 100%;
}

/* Platforms horizontal scroll */
.drawer-platforms {
  display: flex; gap: .625rem; overflow-x: auto; padding-bottom: .25rem;
  scrollbar-width: none;
}
.drawer-platforms::-webkit-scrollbar { display: none; }
.drawer-plat-item {
  display: flex; flex-direction: column; align-items: center; gap: .25rem;
  cursor: pointer; flex-shrink: 0; min-width: 3.5rem;
  padding: .25rem; border-radius: .5rem; transition: background .15s;
}
.drawer-plat-item:active { background: rgba(255,255,255,0.06); }
.plat-icon-wrap {
  width: 2.5rem; height: 2.5rem; border-radius: .75rem;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.plat-letter { font-size: 1rem; font-weight: 800; color: #fff; }
.plat-label {
  font-size: .5625rem; color: var(--ep-color-text-weak, rgba(213,224,245,.8));
  font-weight: 500; white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis; max-width: 3.5rem; text-align: center;
}

/* Activities grid */
.drawer-activities {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: .375rem;
}
.drawer-act-item {
  display: flex; flex-direction: column; align-items: center; gap: .25rem;
  cursor: pointer; padding: .25rem; border-radius: .5rem;
  transition: background .15s;
}
.drawer-act-item:active { background: rgba(255,255,255,0.06); }
.act-icon-bg {
  width: 2rem; height: 2rem; border-radius: .5rem;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  transform: rotate(45deg);
}
.act-icon-letter {
  font-size: .6875rem; font-weight: 800; color: #fff;
  transform: rotate(-45deg);
}
.act-label {
  font-size: .5rem; color: var(--ep-color-text-weak, rgba(213,224,245,.8));
  font-weight: 500; text-align: center; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; max-width: 100%;
}

/* Quick actions */
.drawer-quick-actions {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: .5rem;
}
.quick-action {
  display: flex; flex-direction: column; align-items: center; gap: .375rem;
  padding: .625rem .25rem; border-radius: .5rem; cursor: pointer;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
  transition: all .15s; color: var(--ep-color-text-weak);
  font-size: .5625rem; font-weight: 600;
}
.quick-action:active { transform: scale(0.95); background: rgba(255,255,255,0.08); }
.qa-icon {
  width: 2rem; height: 2rem; border-radius: .5rem;
  display: flex; align-items: center; justify-content: center;
}
.deposit-icon { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; }
.withdraw-icon { background: linear-gradient(135deg, #3b82f6, #1e40af); color: #fff; }
.promo-icon { background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; }
.spread-icon { background: linear-gradient(135deg, #a855f7, #7c3aed); color: #fff; }

/* Menu items */
.drawer-items { display: flex; flex-direction: column; }
.drawer-item {
  display: flex; align-items: center; gap: .75rem;
  padding: .6875rem .75rem; border-radius: var(--ep-border-radius-l, .5rem);
  cursor: pointer; transition: all .2s ease;
  color: var(--ep-color-text-weak, rgba(213,224,245,.8));
}
.drawer-item:active { opacity: 0.7; }
.drawer-item.active {
  background: var(--ep-color-background-fill-btn-level-2-bg, rgba(24,170,255,.15));
  color: var(--ep-color-text-selected);
}
.drawer-item-icon { display: flex; align-items: center; width: 1.25rem; }
.drawer-item-label {
  flex: 1; font-size: var(--ep-font-size-m, .875rem);
  font-weight: var(--ep-font-weight-medium, 500);
}
.drawer-badge {
  background: var(--ep-light-accent-color-red, #F5222D); color: #fff;
  font-size: var(--ep-font-size-xxs, .625rem); font-weight: var(--ep-font-weight-bold, 700);
  padding: 2px .375rem; border-radius: var(--ep-border-radius-infinity, 624.9375rem);
  min-width: 1.125rem; text-align: center;
}

/* Footer actions */
.drawer-footer-actions {
  display: flex; gap: .5rem; padding: .75rem;
  border-top: 1px solid var(--ep-color-border-default);
  margin-top: .5rem;
}
.drawer-footer-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: .375rem;
  padding: .5rem; border-radius: .5rem;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.06);
  color: var(--ep-color-text-weakest); font-size: .6875rem; font-weight: 500;
  transition: all .15s;
}
.drawer-footer-btn:active { background: rgba(255,255,255,.08); }

/* Drawer transition */
.drawer-enter-active, .drawer-leave-active { transition: all 0.3s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .drawer-panel, .drawer-leave-to .drawer-panel { transform: translateX(-100%); }
.drawer-enter-active .drawer-panel, .drawer-leave-active .drawer-panel { transition: transform 0.3s ease; }
</style>
