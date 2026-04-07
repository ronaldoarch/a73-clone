<template>
  <header class="app-header-wrap">
    <div class="header-toolbar">
      <div class="header-left">
        <div class="logo" @click="$router.push('/main/inicio')">
          <span class="logo-a">A</span><span class="logo-num">73</span><span class="logo-dot">.com</span>
        </div>
      </div>

      <div class="header-right" v-if="!isLoggedIn">
        <button class="btn-login" @click="$router.push('/login')">Entrar</button>
        <button class="btn-register" @click="$router.push('/register')">
          <span class="register-bonus-badge">
            <span class="rb-rs">R$</span>
            <span class="rb-val">+99</span>
          </span>
          Registro
        </button>
      </div>

      <div class="header-right logged-in" v-else>
        <div class="balance-bar">
          <div class="balance-info" @click="$router.push('/main/deposito')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700"><circle cx="12" cy="12" r="10" stroke="#D4A800" stroke-width="1.5"/><text x="12" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#B8860B">$</text></svg>
            <span class="balance-currency">BRL</span>
            <span class="balance-value">{{ formattedBalance }}</span>
          </div>
          <button class="deposit-btn" @click="$router.push('/main/deposito')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          </button>
          <button class="withdraw-btn" @click="$router.push('/main/withdraw')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 10l5 5 5-5"/></svg>
          </button>
        </div>
        <button class="notif-btn" @click="$router.push('/notification')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span v-if="totalUnread > 0" class="notif-badge">{{ totalUnread > 99 ? '99+' : totalUnread }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/user'
import { useNotificationStore } from '../stores/notification'
import { storeToRefs } from 'pinia'


const auth = useAuthStore()
const userStore = useUserStore()
const notifStore = useNotificationStore()
const { isLoggedIn } = storeToRefs(auth)
const { balance, mailCount } = storeToRefs(userStore)
const { unreadCount } = storeToRefs(notifStore)

const totalUnread = computed(() => (unreadCount.value || 0) + (mailCount.value || 0))

const formattedBalance = computed(() => {
  return (balance.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})
</script>

<style scoped>
.app-header-wrap {
  position: sticky;
  top: 0;
  background: var(--ep-color-background-fill-top-nav-secondary, var(--header-dynamic-bg, #140E38));
  color: var(--ep-color-text-default, #fff);
  flex-shrink: 0;
  z-index: 100;
}
.header-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--header-height, 48px);
  padding: 0 .75rem;
}

.header-left { display: flex; align-items: center; gap: .5rem; }
.logo { cursor: pointer; display: flex; align-items: baseline; }
.logo-a {
  font-family: var(--font-display); font-size: 1.625rem; font-weight: 900;
  font-style: italic;
  background: linear-gradient(180deg, #FF6B6B, #E53E3E, #C53030);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 1px 2px rgba(229,62,62,.3));
}
.logo-num {
  font-family: var(--font-display); font-size: 1.625rem; font-weight: 900;
  font-style: italic;
  background: linear-gradient(180deg, #FFD700, #F5C84C, #E8B230);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 1px 2px rgba(245,200,76,.3));
}
.logo-dot {
  font-family: var(--font-display); font-size: .75rem; font-weight: 700;
  font-style: italic; margin-left: 1px;
  background: linear-gradient(180deg, #FFD700, #E8B230);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.header-right { display: flex; align-items: center; gap: .5rem; }

.btn-login {
  padding: .4375rem 1.125rem; border-radius: var(--ep-border-radius-l, .5rem);
  font-size: var(--ep-font-size-s, .8125rem); font-weight: var(--ep-font-weight-semi-bold, 600);
  color: var(--ep-color-text-default); background: transparent;
  border: 1.5px solid var(--ep-color-text-weaker, rgba(232,223,245,.5));
  transition: all .2s ease;
}
.btn-login:active { opacity: 0.7; background: rgba(255,255,255,.05); }

.btn-register {
  padding: .4375rem .875rem; border-radius: var(--ep-border-radius-l, .5rem);
  font-size: var(--ep-font-size-s, .8125rem); font-weight: var(--ep-font-weight-bold, 700);
  color: #1a1a2e; background: linear-gradient(180deg, #FFE44D, #F5C84C, #E8B230);
  position: relative; border: none;
  box-shadow: 0 2px 6px rgba(245,200,76,.35);
  transition: all .15s ease;
}
.btn-register:active { opacity: 0.85; transform: scale(0.97); }

.register-bonus-badge {
  position: absolute; top: -.5rem; right: -.375rem;
  display: flex; align-items: center; gap: 1px;
  background: linear-gradient(135deg, #F5222D, #FF4D4F);
  padding: 1px .3rem; border-radius: .5rem;
  box-shadow: 0 1px 4px rgba(245,34,45,.4);
  z-index: 2; line-height: 1;
}
.rb-rs { font-size: .5rem; font-weight: 800; color: #fff; }
.rb-val { font-size: .5625rem; font-weight: 800; color: #FFE44D; }

/* Logged-in balance bar */
.balance-bar {
  display: flex; align-items: center;
  background: var(--ep-color-background-fill-surface-raised-L2);
  border-radius: var(--ep-border-radius-l, .5rem);
  border: 1px solid var(--ep-color-border-default);
  overflow: hidden;
}
.balance-info {
  display: flex; align-items: center; gap: .25rem;
  padding: .3125rem .5rem; cursor: pointer;
}
.balance-currency {
  font-size: .5625rem; font-weight: 700;
  color: var(--ep-color-text-weakest);
}
.balance-value {
  font-size: var(--ep-font-size-s, .8125rem);
  font-weight: var(--ep-font-weight-bold, 700);
  color: var(--ep-color-text-default);
  font-family: var(--font-mono, 'Share Tech Mono', monospace);
}

.deposit-btn, .withdraw-btn {
  display: flex; align-items: center; justify-content: center;
  width: 1.75rem; height: 1.75rem; flex-shrink: 0;
  transition: background .15s;
}
.deposit-btn {
  background: var(--ep-accent-green, #17C964); color: #fff;
}
.deposit-btn:active { background: #15a355; }
.withdraw-btn {
  background: var(--ep-color-background-fill-surface-raised-L2);
  color: var(--ep-color-text-weak);
  border-left: 1px solid var(--ep-color-border-default);
}
.withdraw-btn:active { background: rgba(255,255,255,0.08); }

.notif-btn { position: relative; color: var(--ep-color-text-default); padding: .25rem; }
.notif-badge {
  position: absolute; top: -2px; right: -4px;
  background: var(--ep-light-accent-color-red, #F5222D); color: #fff;
  font-size: .5rem; font-weight: 700;
  padding: 1px .25rem; border-radius: .5rem;
  min-width: .875rem; text-align: center; line-height: 1.3;
}
</style>
