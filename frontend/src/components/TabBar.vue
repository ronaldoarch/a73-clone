<template>
  <nav class="tab-bar" v-show="showTabBar">
    <router-link
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="tab-item"
      :class="{
        active: isActive(tab.path),
        center: tab.center
      }"
    >
      <div v-if="tab.center" class="tab-center-wrap">
        <div class="center-icon-plain">
          <svg width="36" height="36" viewBox="0 0 18 18" fill="none">
            <path d="M15.3638 2.63623L14.294 3.35312L13.49 4.51006L15.3528 9.00018L16.6705 9.35308L17.9999 9.00018C17.9999 6.59623 17.0638 4.33613 15.3638 2.63623Z" fill="#C157FF"/>
            <path d="M2.64706 8.99991L1.18825 8.64697L0 8.99991C0 11.4039 0.93614 13.636 2.63605 15.3638L3.75293 14.5999L4.50988 13.4912L2.64706 8.99912Z" fill="#C157FF"/>
            <path d="M2.63599 2.63605L3.09403 4.03532L4.50982 4.50992L8.99994 2.64706L9.59924 1.58824L8.99994 0C6.59595 0 4.33586 0.93614 2.63599 2.63605Z" fill="#C157FF"/>
            <path d="M15.3639 2.63605C13.664 0.93614 11.404 0 9 0V2.64706L13.4901 4.50988L15.3639 2.63605Z" fill="#005D81"/>
            <path d="M2.63605 2.63623C0.93614 4.33613 0 6.59619 0 9.00018H2.64706L4.50988 4.51006L2.63605 2.63623Z" fill="#005D81"/>
            <path d="M13.49 13.4901L8.99991 15.3531L8.64697 16.8354L8.99991 18.0001C11.4038 18.0001 13.6639 17.064 15.3638 15.3641L14.3767 13.49L13.49 13.4902Z" fill="#C157FF"/>
            <path d="M15.3528 9L13.49 13.4901L15.3638 15.364C17.0638 13.664 17.9999 11.404 17.9999 9H15.3528Z" fill="#005D81"/>
            <path d="M4.50982 13.4902L2.63599 15.364C4.33589 17.064 6.59595 18.0001 8.99994 18.0001V15.3531L4.50982 13.4902Z" fill="#005D81"/>
            <path d="M4.47719 4.53879C2.01315 7.03659 2.04054 11.059 4.53834 13.5231L9.37676 9.37213L13.4614 4.47765C10.9636 2.01362 6.94122 2.04099 4.47719 4.53879Z" fill="#FEDEAE"/>
            <path d="M13.4617 4.47754L4.53861 13.5229C7.03639 15.9869 11.0587 15.9595 13.5228 13.4617C15.9868 10.9639 15.9595 6.94155 13.4617 4.47754Z" fill="#FED3AE"/>
          </svg>
        </div>
        <span class="center-label">{{ tab.label }}</span>
      </div>
      <template v-else>
        <div class="tab-icon-wrap">
          <img
            class="tab-icon-img"
            :src="isActive(tab.path) ? tab.activeIcon : tab.icon"
            :alt="tab.label"
          />
          <span v-if="getBadge(tab.key)" class="tab-badge">{{ getBadge(tab.key) }}</span>
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
    path: '/main/inicio', key: 'inicio', label: 'Início',
    icon: '/assets/inicio-36-DJCGom9R.svg',
    activeIcon: '/assets/inicio-active-36-DXDK5bQT.svg'
  },
  {
    path: '/main/deposito', key: 'deposito', label: 'Depósito',
    icon: '/assets/entrar-36-Dr2VMD0M.svg',
    activeIcon: '/assets/entrar-active-36-Dl4TFkUE.svg'
  },
  { path: '/main/promo', key: 'promo', label: 'Promoção', center: true },
  {
    path: '/main/perfil', key: 'perfil', label: 'Perfil',
    icon: '/assets/perfil-36-lFSEwN4x.svg',
    activeIcon: '/assets/perfil-active-36-BU8j8ncL.svg'
  },
  {
    path: '/main/menu', key: 'menu', label: 'Menu',
    icon: '/assets/menu-36-BInLkXMM.svg',
    activeIcon: '/assets/menu-active-36-DlSSzBxl.svg'
  }
]

const hiddenRoutes = ['/login', '/register', '/launch']
const showTabBar = computed(() => {
  return !hiddenRoutes.some(r => route.path.startsWith(r))
})

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}

function getBadge(key) {
  if (key === 'perfil') {
    const total = (mailCount.value || 0) + (unreadCount.value || 0)
    if (total > 0) return total > 99 ? '99+' : total
  }
  return null
}
</script>

<style scoped>
.tab-bar {
  height: 3.75rem;
  display: flex; align-items: stretch; justify-content: space-around;
  background: linear-gradient(180deg, rgb(0, 12, 140) 0%, rgb(76, 8, 124) 100%);
  position: fixed; bottom: 0; left: 0; right: 0;
  z-index: 100; flex-shrink: 0;
  padding-bottom: var(--safe-bottom, env(safe-area-inset-bottom, 0px));
}

.tab-item {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; flex: 1; height: 100%;
  color: rgba(213, 224, 245, .55);
  transition: color .2s ease; gap: 3px; text-decoration: none;
  position: relative;
}
.tab-item.active {
  color: #fff;
}

.tab-icon-wrap { position: relative; display: inline-flex; }
.tab-icon-img { width: 22px; height: 22px; transition: transform .15s ease; }
.tab-item.active .tab-icon-img { transform: scale(1.1); }

.tab-badge {
  position: absolute; top: -4px; right: -10px;
  background: #F44336; color: #fff;
  font-size: .5rem; font-weight: 700;
  padding: 1px 4px; border-radius: .5rem; min-width: .875rem;
  text-align: center; line-height: 1.2;
}

.tab-label {
  font-size: .6rem;
  font-weight: 500;
  line-height: 1; color: inherit;
}
.tab-item.active .tab-label {
  font-weight: 700;
}

/* Center floating button */
.tab-item.center {
  position: relative;
}

.tab-center-wrap {
  display: flex; flex-direction: column;
  align-items: center; justify-content: flex-end;
  height: 100%; gap: 2px;
  padding-bottom: .25rem;
}

.center-icon-plain {
  display: flex; align-items: center; justify-content: center;
  width: 3rem; height: 3rem;
  margin-top: -1.25rem;
  animation: center-spin 4s linear infinite;
}
.tab-item.center:active .center-icon-plain {
  animation-play-state: paused;
  transform: scale(0.9);
}

@keyframes center-spin {
  to { transform: rotate(360deg); }
}

.center-label {
  font-size: .6rem;
  font-weight: 600;
  color: rgba(213, 224, 245, .55);
}
.tab-item.center.active .center-label {
  color: #fff;
}
</style>
