<template>
  <div class="menu-page">
    <header class="menu-toolbar">
      <AppLogoMark @click="router.push('/main/inicio')" />

      <div class="toolbar-right" v-if="!isLoggedIn">
        <button type="button" class="btn-login" @click="router.push('/login')">Entrar</button>
        <button type="button" class="btn-register" @click="router.push('/register')">Registro</button>
      </div>

      <div class="toolbar-right logged" v-else>
        <div class="balance-block" @click="router.push('/main/deposito')">
          <img
            class="balance-wallet-icon"
            src="/assets/ui/balance-wallet-icon.png"
            width="28"
            height="28"
            alt=""
          />
          <span class="balance-value">{{ formattedBalance }}</span>
        </div>
        <button
          type="button"
          class="deposit-square"
          aria-label="Depositar"
          @click="router.push('/main/deposito')"
        >
          <img class="deposit-piggy-icon" src="/assets/deposit-38-rfCJB114.svg" width="22" height="22" alt="" />
        </button>
      </div>
    </header>

    <nav class="shield-nav" aria-label="Atalhos do menu">
      <button
        type="button"
        class="shield-item shield-item--active"
        @click="router.push('/main/promo')"
      >
        <span class="shield-shape">
          <svg class="shield-ico" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.21 1.59 2.18 2.75 2.78V19h-2v2h8v-2h-2v-4.28c1.16-.61 2.12-1.58 2.75-2.78C19.08 11.63 21 9.55 21 7V7c0-1.1-.9-2-2-2zM5 8V7h2v4.17C5.25 10.52 5 9.26 5 8zm14 0c0 1.25-.25 2.51-.71 3.67L17 7h2v1z"
            />
          </svg>
        </span>
        <span class="shield-label">Promoção</span>
      </button>
      <button type="button" class="shield-item" @click="router.push('/game/search/POPULAR')">
        <span class="shield-shape">
          <svg class="shield-ico" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
            />
          </svg>
        </span>
        <span class="shield-label">Jogos</span>
      </button>
      <button type="button" class="shield-item" @click="router.push('/game/category/all/all')">
        <span class="shield-shape">
          <svg class="shield-ico" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M8 5v9H6V5h2zm6 0v4h-2V5h2zm0 6v8h-2v-8h2zm4-6v14h-2V5h2zM4 20h16v2H4v-2z"
            />
          </svg>
        </span>
        <span class="shield-label">Provedores</span>
      </button>
    </nav>

    <div class="jackpot-slot">
      <BonusPool />
    </div>

    <ul class="menu-rows" role="list">
      <li v-for="row in menuRows" :key="row.label" class="menu-row">
        <span class="row-icon" aria-hidden="true" v-html="row.iconSvg" />
        <span class="row-label">{{ row.label }}</span>
        <button type="button" class="row-go" @click="go(row)">Go!</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/user'
import BonusPool from '../components/BonusPool.vue'
import AppLogoMark from '../components/AppLogoMark.vue'

const router = useRouter()
const auth = useAuthStore()
const userStore = useUserStore()
const { isLoggedIn } = storeToRefs(auth)
const { balance } = storeToRefs(userStore)

const formattedBalance = computed(() =>
  (Number(balance.value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
)

const ico = (pathD, fill = true) =>
  `<svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">${fill ? `<path fill="currentColor" d="${pathD}"/>` : ''}</svg>`

const menuRows = [
  {
    label: 'Depósito',
    path: '/main/deposito',
    iconSvg: ico(
      'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z'
    )
  },
  {
    label: 'Saque',
    path: '/main/withdraw',
    iconSvg: ico(
      'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z'
    )
  },
  {
    label: 'Bônus R$50',
    path: '/main/indique-amigos',
    iconSvg: ico(
      'M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z'
    )
  },
  {
    label: 'Comissão 5%',
    path: '/main/promo?tab=rebate',
    iconSvg: ico(
      'M2 6h20v12H2V6zm2 2v8h16V8H4zm2 2h12v2H6v-2zm0 4h10v2H6v-2z'
    )
  },
  {
    label: 'Bônus VIP',
    path: '/activity/vip',
    iconSvg: ico(
      'M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.7-2h8.6l.9-5.5-2.5 2-3.4-5.4L10 10.5 6.8 8.5l.9 5.5z'
    )
  },
  {
    label: 'Misterioso',
    path: '/activity/MysteryReward',
    iconSvg: ico(
      'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z'
    )
  },
  {
    label: 'Resgate',
    path: '/activity/Rescue',
    iconSvg: ico(
      'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'
    )
  },
  {
    label: 'Códigos',
    path: '/Redeem',
    iconSvg: ico(
      'M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16zM16 17H5V7h11l3.55 5L16 17z'
    )
  },
  {
    label: 'Bônus R$899',
    path: '/main/promo',
    iconSvg: ico(
      'M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z'
    )
  }
]

function go(row) {
  if (row.path) router.push(row.path)
}
</script>

<style scoped>
.menu-page {
  min-height: 100%;
  background: #2b004d;
  color: #fff;
  padding: 0 0.75rem 1rem;
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

.menu-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 3rem;
  padding: 0.35rem 0 0.75rem;
  position: sticky;
  top: 0;
  z-index: 50;
  background: linear-gradient(180deg, #3a0a6e 0%, #2b004d 100%);
  margin: 0 -0.75rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.toolbar-right.logged {
  gap: 0.35rem;
}

.btn-login {
  padding: 0.35rem 0.9rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #fff;
  background: transparent;
  border: 1.5px solid rgba(232, 223, 245, 0.5);
}
.btn-register {
  padding: 0.35rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #1a1a2e;
  background: linear-gradient(180deg, #ffe44d, #e8b230);
  border: none;
}

.balance-block {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  padding: 0.2rem 0;
}
.balance-wallet-icon {
  width: 1.65rem;
  height: 1.65rem;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
}
.balance-value {
  font-size: 0.875rem;
  font-weight: 800;
  color: #fff;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  white-space: nowrap;
}

.deposit-square {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.45rem;
  border: 1.5px solid rgba(255, 213, 79, 0.95);
  background: rgba(120, 55, 170, 0.55);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
  cursor: pointer;
}
.deposit-square:active {
  opacity: 0.88;
}

.shield-nav {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.25rem 0 0.75rem;
}

.shield-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.55);
}

.shield-item--active {
  color: #ffe566;
}

.shield-shape {
  width: 4.25rem;
  height: 4.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  background: linear-gradient(165deg, #5a3d7a 0%, #2d1848 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.shield-item--active .shield-shape {
  background: linear-gradient(165deg, #ffe566 0%, #e8a820 45%, #c78a10 100%);
  color: #3d2200;
  box-shadow: 0 4px 14px rgba(255, 200, 60, 0.35);
}

.shield-ico {
  width: 1.85rem;
  height: 1.85rem;
}

.shield-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-align: center;
  line-height: 1.15;
}

.shield-item--active .shield-label {
  color: #ffe566;
}

.jackpot-slot :deep(.bonus-pool-wrap) {
  margin-top: 0;
  margin-bottom: 0.75rem;
}

.menu-rows {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.65rem 0.75rem;
  background: #431d6e;
  border-radius: 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.row-icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c6ef31;
}

.row-icon :deep(svg) {
  display: block;
}

.row-label {
  flex: 1;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #fff;
  min-width: 0;
}

.row-go {
  flex-shrink: 0;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  border: none;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.02em;
  color: #1a1020;
  background: #c6ef31;
  cursor: pointer;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.15);
}
.row-go:active {
  transform: scale(0.96);
  opacity: 0.92;
}
</style>
