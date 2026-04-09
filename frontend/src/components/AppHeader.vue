<template>
  <header class="app-header-wrap">
    <div class="header-toolbar">
      <div class="header-left">
        <AppLogoMark @click="$router.push('/main/inicio')" />
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
            <img
              class="balance-wallet-icon"
              src="/assets/ui/balance-wallet-icon.png"
              width="28"
              height="28"
              alt=""
            />
            <span class="balance-value">{{ formattedBalance }}</span>
          </div>
          <div class="balance-actions">
            <button type="button" class="deposit-btn" @click="$router.push('/main/deposito')" aria-label="Depositar">
              <img class="deposit-piggy-icon" src="/assets/deposit-38-rfCJB114.svg" width="22" height="22" alt="" />
            </button>
            <button type="button" class="withdraw-btn" @click="$router.push('/main/withdraw')" aria-label="Sacar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 10l5 5 5-5"/></svg>
            </button>
          </div>
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
import AppLogoMark from './AppLogoMark.vue'
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

const formattedBalance = computed(() =>
  (Number(balance.value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
)
</script>

<style scoped>
.app-header-wrap {
  position: sticky;
  top: 0;
  background: var(--color-brand-purple-original, #650C96);
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

/* Saldo sem caixa ao redor — direto no roxo do header */
.balance-bar {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  min-height: 2rem;
  background: transparent;
  border: none;
  box-shadow: none;
  /* Alinha melhor com o logo (evita sensação de texto “baixo” na toolbar) */
  transform: translateY(-4px);
}
.balance-info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.35rem 0.25rem 0;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}
.balance-wallet-icon {
  width: 1.75rem;
  height: 1.75rem;
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
}
.balance-value {
  font-size: 0.875rem;
  font-weight: 800;
  color: #fff;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  white-space: nowrap;
}

.balance-actions {
  display: flex;
  align-items: stretch;
  flex-shrink: 0;
}

.deposit-btn,
.withdraw-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}
.deposit-btn {
  align-self: center;
  margin: 0.2rem 0.15rem 0.2rem 0.1rem;
  min-width: 2.25rem;
  padding: 0 0.35rem;
  border-radius: 0.45rem;
  background: rgba(120, 55, 170, 0.55);
  border: 1.5px solid rgba(255, 213, 79, 0.95);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}
.deposit-piggy-icon {
  display: block;
  width: 1.375rem;
  height: 1.375rem;
  object-fit: contain;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.25));
}
.deposit-btn:active {
  opacity: 0.88;
  background: rgba(140, 75, 190, 0.65);
}
.withdraw-btn {
  min-width: 1.85rem;
  padding: 0 0.25rem;
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
}
.withdraw-btn:active {
  opacity: 0.75;
}

.notif-btn { position: relative; color: var(--ep-color-text-default); padding: .25rem; }
.notif-badge {
  position: absolute; top: -2px; right: -4px;
  background: var(--ep-light-accent-color-red, #F5222D); color: #fff;
  font-size: .5rem; font-weight: 700;
  padding: 1px .25rem; border-radius: .5rem;
  min-width: .875rem; text-align: center; line-height: 1.3;
}
</style>
