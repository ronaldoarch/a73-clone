<template>
  <nav class="tab-bar" v-show="showTabBar">
    <router-link
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="tab-item"
      :class="{
        active: tab.center ? isPromoHubActive() : isActive(tab.path),
        center: tab.center,
      }"
    >
      <div v-if="tab.center" class="tab-center-wrap">
        <div class="center-fab" aria-hidden="true">
          <div class="center-fab-rotor" />
          <div class="center-fab-inner">
            <svg class="center-flame" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2.5c.8 2.1 2.4 3.4 3.2 5.8.5 1.6.3 3.4-.4 4.9-.4.9-1 1.7-1.7 2.4-.3.3-.6.5-.9.7-.5.3-1 .4-1.5.4h-.3c-.6 0-1.2-.2-1.7-.6-.4-.3-.8-.6-1.1-1-.9-1.1-1.3-2.5-1.1-3.9.2-1.4.9-2.7 1.9-3.7.4-.4.8-.7 1.2-1 .3-.5.5-1.1.6-1.7.2-1.3.3-2.3.3-2.3Z"
                fill="#ea580c"
              />
              <path
                d="M12 14.2c.9 0 1.6.7 1.6 1.6 0 .7-.4 1.3-1 1.5-.2.1-.4.1-.6.1-.9 0-1.6-.7-1.6-1.6 0-.7.4-1.3 1-1.5.2-.1.4-.1.6-.1Z"
                fill="#fb923c"
              />
            </svg>
          </div>
        </div>
      </div>

      <template v-else-if="tab.key === 'inicio'">
        <div class="tab-top-wrap">
          <div class="tab-top-icon" :class="{ 'tab-top-icon--on': isActive(tab.path) }">
            <svg class="tab-rocket" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2.5l1.8 4.2 4.5.4-3.4 2.9 1.1 4.3L12 11.9 7 14.3l1.1-4.3-3.4-2.9 4.5-.4L12 2.5Z"
                fill="currentColor"
              />
              <path d="M8.5 17.5l-1.5 3.5 3.5-1.5-2-2Z" fill="currentColor" opacity="0.85" />
            </svg>
          </div>
          <span class="tab-label tab-label--top">{{ tab.label }}</span>
        </div>
      </template>

      <template v-else>
        <div class="tab-icon-wrap">
          <img
            class="tab-icon-img"
            :src="isActive(tab.path) ? tab.activeIcon : tab.icon"
            :alt="tab.label"
          />
          <span v-if="tab.key === 'perfil' && showProfileDot" class="tab-dot" aria-hidden="true" />
        </div>
        <span class="tab-label">{{ tab.label }}</span>
      </template>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useNotificationStore } from '../stores/notification'
import { storeToRefs } from 'pinia'

const route = useRoute()
const userStore = useUserStore()
const notifStore = useNotificationStore()
const { mailCount } = storeToRefs(userStore)
const { unreadCount } = storeToRefs(notifStore)

const tabs = [
  {
    path: '/main/inicio',
    key: 'inicio',
    label: 'Top',
    icon: '/assets/inicio-36-DJCGom9R.svg',
    activeIcon: '/assets/inicio-active-36-DXDK5bQT.svg',
  },
  {
    path: '/main/deposito',
    key: 'deposito',
    label: 'Depósito',
    icon: '/assets/deposit-38-rfCJB114.svg',
    activeIcon: '/assets/deposit-38-rfCJB114.svg',
  },
  { path: '/main/promo', key: 'promo', label: '', center: true },
  {
    path: '/main/perfil',
    key: 'perfil',
    label: 'Perfil',
    icon: '/assets/perfil-36-lFSEwN4x.svg',
    activeIcon: '/assets/perfil-active-36-BU8j8ncL.svg',
  },
  {
    path: '/main/menu',
    key: 'menu',
    label: 'Menu',
    icon: '/assets/menu-36-BInLkXMM.svg',
    activeIcon: '/assets/menu-active-36-DlSSzBxl.svg',
  },
]

const hiddenRoutes = ['/login', '/register', '/launch']
const showTabBar = computed(() => {
  return !hiddenRoutes.some((r) => route.path.startsWith(r))
})

const showProfileDot = computed(() => {
  const total = (mailCount.value || 0) + (unreadCount.value || 0)
  return total > 0
})

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}

/** Centro = hub de promoções: lista de eventos, rebate, atalhos VIP e código (páginas dedicadas). */
function isPromoHubActive() {
  const p = route.path
  if (p === '/main/promo') return true
  if (p === '/Redeem' || p.startsWith('/Redeem')) return true
  if (p.startsWith('/activity/vip')) return true
  if (p.startsWith('/activity/Rescue')) return true
  return false
}
</script>

<style scoped>
.tab-bar {
  height: 4.15rem;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  background: #fff;
  box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.08);
  border-top: 1px solid rgba(15, 23, 42, 0.06);
  position: fixed;
  bottom: 0;
  left: 50%;
  right: auto;
  transform: translateX(-50%);
  width: min(100vw, var(--max-width, 480px));
  max-width: 100%;
  z-index: 100;
  flex-shrink: 0;
  padding-bottom: calc(0.35rem + var(--safe-bottom, env(safe-area-inset-bottom, 0px)));
  padding-top: 0.15rem;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  min-width: 0;
  height: 100%;
  padding-bottom: 0.15rem;
  color: #6b7280;
  transition: color 0.2s ease;
  gap: 4px;
  text-decoration: none;
  position: relative;
}

.tab-item.active:not(.center) {
  color: #4b5563;
}

.tab-item.center {
  flex: 1.15;
  justify-content: flex-start;
  padding-bottom: 0;
  padding-top: 0;
}

.tab-icon-wrap {
  position: relative;
  display: inline-flex;
  height: 24px;
  align-items: center;
  justify-content: center;
}

.tab-icon-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  transition: transform 0.15s ease, opacity 0.2s ease;
  opacity: 0.72;
}

.tab-item.active .tab-icon-img {
  opacity: 1;
  transform: scale(1.05);
}

.tab-dot {
  position: absolute;
  top: -1px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  border: 2px solid #fff;
  box-sizing: content-box;
}

.tab-label {
  font-size: 0.62rem;
  font-weight: 500;
  line-height: 1;
  color: inherit;
}

.tab-item.active:not(.center) .tab-label {
  font-weight: 600;
  color: #374151;
}

/* Top — foguete */
.tab-top-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  height: 100%;
  padding-bottom: 0.15rem;
}

.tab-top-icon {
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transition: background 0.2s ease;
}

.tab-top-icon--on {
  background: #7c3aed;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.35);
}

.tab-rocket {
  width: 1.05rem;
  height: 1.05rem;
  color: #9ca3af;
}

.tab-top-icon--on .tab-rocket {
  color: #d9f99d;
}

.tab-label--top {
  font-weight: 700;
  font-size: 0.62rem;
}

.tab-item.active .tab-label--top {
  color: #7c3aed;
}

.tab-item:not(.active) .tab-label--top {
  color: #6b7280;
  font-weight: 600;
}

/* Centro — anel oscila; círculo pêssego + chama fixos */
.tab-center-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  margin-top: -0.35rem;
}

.center-fab {
  position: relative;
  width: 3.4rem;
  height: 3.4rem;
  flex-shrink: 0;
  filter: drop-shadow(0 4px 12px rgba(15, 23, 42, 0.2));
}

/* Disco completo com gradiente — só a borda aparece (centro coberto pelo .center-fab-inner) */
.center-fab-rotor {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(
    from 200deg,
    #2dd4bf 0deg,
    #2dd4bf 70deg,
    #c084fc 70deg,
    #c084fc 160deg,
    #14b8a6 160deg,
    #14b8a6 250deg,
    #a855f7 250deg,
    #a855f7 340deg,
    #2dd4bf 340deg
  );
  transform-origin: 50% 50%;
  animation: tab-ring-full-turn 1.4s ease-in-out infinite;
}

.center-fab-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  width: 2.42rem;
  height: 2.42rem;
  margin: 0;
  border-radius: 50%;
  background: linear-gradient(160deg, #ffedd5 0%, #fdba74 55%, #fed7aa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.65);
}

.center-flame {
  width: 1.15rem;
  height: 1.15rem;
}

/* Metade do tempo: 1 volta completa num sentido; outra metade: volta completa no sentido contrário */
@keyframes tab-ring-full-turn {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(360deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .center-fab-rotor {
    animation: none;
    transform: rotate(0deg);
  }
}

.tab-item.center:active .center-fab {
  transform: scale(0.94);
  transition: transform 0.1s ease;
}
</style>
