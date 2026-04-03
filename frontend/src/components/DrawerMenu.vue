<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="modelValue" class="drawer-overlay" @click.self="close">
        <div class="drawer-panel">
          <div class="drawer-header">
            <div class="drawer-logo" @click="goHome">
              <span class="logo-a">A</span><span class="logo-num">73</span><span class="logo-dot">.com</span>
            </div>
            <button class="drawer-close" @click="close">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="drawer-user" v-if="isLoggedIn">
            <div class="drawer-avatar">
              <span>{{ (user?.account || 'U').charAt(0).toUpperCase() }}</span>
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
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/user'
import { useNotificationStore } from '../stores/notification'
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
const { isLoggedIn, user } = storeToRefs(auth)
const { vipLevel } = storeToRefs(userStore)
const { unreadCount } = storeToRefs(notifStore)

const menuSections = computed(() => [
  {
    title: 'Principal',
    items: [
      { path: '/main/inicio', label: 'Início', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>' },
      { path: '/main/promo', label: 'Promoções', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01z"/></svg>' },
      { path: '/game/search', label: 'Buscar Jogos', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>' }
    ]
  },
  {
    title: 'Financeiro',
    items: [
      { path: '/main/deposito', label: 'Depósito', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>' },
      { path: '/withdraw/apply', label: 'Saque', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>' },
      { path: '/report', label: 'Relatórios', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' }
    ]
  },
  {
    title: 'Conta',
    items: [
      { path: '/main/perfil', label: 'Perfil', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
      { path: '/activity/vip', label: 'VIP', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
      { path: '/spread', label: 'Convide e Ganhe', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>' },
      { path: '/security', label: 'Segurança', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
      { path: '/notification', label: 'Notificações', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>', badge: unreadCount.value > 0 ? unreadCount.value : null }
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
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: var(--z-drawer, 10000);
  backdrop-filter: blur(2px);
}

.drawer-panel {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 17.5rem;
  max-width: 85vw;
  background: var(--ep-color-background-fill-surface-raised-L1, #18254E);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--ep-color-border-default);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  flex-shrink: 0;
  border-bottom: 1px solid var(--ep-color-border-default);
}

.drawer-logo {
  display: flex;
  align-items: baseline;
  cursor: pointer;
}

.logo-a {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 800;
  font-style: italic;
  color: var(--accent-color-yellow, #FFC41A);
}

.logo-num {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 800;
  font-style: italic;
  background: linear-gradient(180deg, #fde68a, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-dot {
  font-family: var(--font-display);
  font-size: .625rem;
  font-weight: 600;
  color: var(--accent-color-yellow, #FFC41A);
  font-style: italic;
}

.drawer-close {
  color: var(--ep-color-text-weakest);
  padding: .25rem;
}

.drawer-user {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .75rem 1rem 1rem;
}

.drawer-avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ep-color-text-inverse, #0E1E3D);
}

.drawer-username {
  font-size: var(--ep-font-size-m, .9375rem);
  font-weight: var(--ep-font-weight-bold, 700);
  display: block;
  color: var(--ep-color-text-default);
}

.drawer-vip {
  font-size: var(--ep-font-size-xs, .6875rem);
  color: var(--color-currency, #FE963B);
  font-weight: var(--ep-font-weight-semi-bold, 600);
}

.drawer-auth {
  display: flex;
  gap: .5rem;
  padding: .5rem 1rem 1rem;
}

.drawer-login-btn {
  flex: 1;
  padding: .625rem;
  border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--ep-color-background-fill-btn-level-2-bg, rgba(24,170,255,.15));
  border: 1px solid var(--ep-color-border-default);
  color: var(--ep-color-text-default);
  font-size: var(--ep-font-size-m, .875rem);
  font-weight: var(--ep-font-weight-semi-bold, 600);
}

.drawer-register-btn {
  flex: 1;
  padding: .625rem;
  border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--gradient-primary);
  color: var(--ep-color-text-inverse, #0E1E3D);
  font-size: var(--ep-font-size-m, .875rem);
  font-weight: var(--ep-font-weight-bold, 700);
}

.drawer-scroll {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 1.5rem;
}

.drawer-section {
  padding: 0 1rem;
  margin-bottom: .5rem;
}

.drawer-section-title {
  font-size: var(--ep-font-size-xs, .6875rem);
  font-weight: var(--ep-font-weight-semi-bold, 600);
  color: var(--ep-color-text-weakest);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: .75rem 0 .375rem;
}

.drawer-items {
  display: flex;
  flex-direction: column;
}

.drawer-item {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .6875rem .75rem;
  border-radius: var(--ep-border-radius-l, .5rem);
  cursor: pointer;
  transition: all .2s ease;
  color: var(--ep-color-text-weak, rgba(213,224,245,.8));
}

.drawer-item:active {
  opacity: 0.7;
}

.drawer-item.active {
  background: var(--ep-color-background-fill-btn-level-2-bg, rgba(24,170,255,.15));
  color: var(--ep-color-text-selected);
}

.drawer-item-icon {
  display: flex;
  align-items: center;
  width: 1.25rem;
}

.drawer-item-label {
  flex: 1;
  font-size: var(--ep-font-size-m, .875rem);
  font-weight: var(--ep-font-weight-medium, 500);
}

.drawer-badge {
  background: var(--ep-light-accent-color-red, #F5222D);
  color: #fff;
  font-size: var(--ep-font-size-xxs, .625rem);
  font-weight: var(--ep-font-weight-bold, 700);
  padding: 2px .375rem;
  border-radius: var(--ep-border-radius-infinity, 624.9375rem);
  min-width: 1.125rem;
  text-align: center;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer-panel,
.drawer-leave-to .drawer-panel {
  transform: translateX(-100%);
}

.drawer-enter-active .drawer-panel,
.drawer-leave-active .drawer-panel {
  transition: transform 0.3s ease;
}
</style>
