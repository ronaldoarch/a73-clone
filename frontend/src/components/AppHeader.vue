<template>
  <header class="app-header">
    <div class="header-left">
      <button class="menu-btn" @click="$emit('toggle-drawer')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div class="logo" @click="$router.push('/main/inicio')">
        <span class="logo-a">A</span><span class="logo-num">73</span><span class="logo-dot">.com</span>
      </div>
    </div>

    <div class="header-right" v-if="!isLoggedIn">
      <button class="btn-login" @click="$router.push('/login')">Entrar</button>
      <button class="btn-register shiny" @click="$router.push('/register')">
        <span class="register-bonus">R$</span>
        <span class="register-bonus-val">+99</span>
        Registro
      </button>
    </div>

    <div class="header-right" v-else>
      <div class="balance" @click="$router.push('/main/deposito')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
        <span class="balance-value">{{ formattedBalance }}</span>
        <button class="balance-add">+</button>
      </div>
      <button class="notif-btn" @click="$router.push('/notification')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/user'
import { useNotificationStore } from '../stores/notification'
import { storeToRefs } from 'pinia'

defineEmits(['toggle-drawer'])

const auth = useAuthStore()
const userStore = useUserStore()
const notifStore = useNotificationStore()
const { isLoggedIn } = storeToRefs(auth)
const { balance } = storeToRefs(userStore)
const { unreadCount } = storeToRefs(notifStore)

const formattedBalance = computed(() => {
  return (balance.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})
</script>

<style scoped>
.app-header {
  height: var(--header-height, 48px);
  padding: 0 .75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--ep-color-background-fill-top-nav-secondary, var(--header-dynamic-bg));
  position: relative;
  z-index: 100;
  flex-shrink: 0;
  border-bottom: 1px solid var(--ep-color-border-default);
}

.header-left {
  display: flex;
  align-items: center;
  gap: .5rem;
}

.menu-btn {
  color: var(--ep-color-text-default);
  padding: .25rem;
}

.logo {
  cursor: pointer;
  display: flex;
  align-items: baseline;
}

.logo-a {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  font-style: italic;
  color: var(--accent-color-yellow, #FFC41A);
}

.logo-num {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  font-style: italic;
  background: linear-gradient(180deg, #fde68a, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-dot {
  font-family: var(--font-display);
  font-size: .6875rem;
  font-weight: 600;
  color: var(--accent-color-yellow, #FFC41A);
  margin-left: 1px;
  font-style: italic;
}

.header-right {
  display: flex;
  align-items: center;
  gap: .5rem;
}

.btn-login {
  padding: .4375rem 1rem;
  border-radius: var(--ep-border-radius-l, .5rem);
  font-size: var(--ep-font-size-s, .75rem);
  font-weight: var(--ep-font-weight-semi-bold, 600);
  color: var(--ep-color-text-default);
  background: var(--ep-color-background-fill-btn-level-2-bg, rgba(24,170,255,.15));
  border: 1px solid var(--ep-color-border-default);
  transition: all .2s ease;
}

.btn-login:active {
  opacity: 0.7;
}

.btn-register {
  padding: .4375rem .75rem;
  border-radius: var(--ep-border-radius-l, .5rem);
  font-size: var(--ep-font-size-s, .75rem);
  font-weight: var(--ep-font-weight-bold, 700);
  color: var(--ep-color-text-inverse, #0E1E3D);
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  gap: .25rem;
  position: relative;
  overflow: hidden;
}

.btn-register:active {
  opacity: 0.8;
  transform: scale(0.97);
}

.register-bonus {
  font-size: .5625rem;
  font-weight: 800;
  background: var(--ep-accent-green, #17C964);
  color: #fff;
  padding: 1px .25rem;
  border-radius: .25rem;
  line-height: 1.2;
}

.register-bonus-val {
  font-size: .5625rem;
  font-weight: 800;
  color: var(--ep-accent-green, #17C964);
  margin-right: 2px;
}

.balance {
  display: flex;
  align-items: center;
  gap: .375rem;
  background: var(--ep-color-background-fill-surface-raised-L2);
  padding: .375rem .5rem .375rem .625rem;
  border-radius: var(--ep-border-radius-l, .5rem);
  cursor: pointer;
  border: 1px solid var(--ep-color-border-default);
}

.balance svg {
  color: var(--color-currency, #FE963B);
  flex-shrink: 0;
}

.balance-value {
  font-size: var(--ep-font-size-m, .875rem);
  font-weight: var(--ep-font-weight-bold, 700);
  color: var(--ep-color-text-default);
}

.balance-add {
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 50%;
  background: var(--ep-accent-green, #17C964);
  color: #fff;
  font-size: .875rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-btn {
  position: relative;
  color: var(--ep-color-text-default);
  padding: .25rem;
}

.notif-badge {
  position: absolute;
  top: -2px;
  right: -4px;
  background: var(--ep-light-accent-color-red, #F5222D);
  color: #fff;
  font-size: .5625rem;
  font-weight: 700;
  padding: 1px .25rem;
  border-radius: .5rem;
  min-width: 1rem;
  text-align: center;
  line-height: 1.3;
}
</style>
