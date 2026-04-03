<template>
  <nav class="tab-bar">
    <router-link
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="tab-item"
      :class="{ active: isActive(tab.path), center: tab.center }"
    >
      <div v-if="tab.center" class="tab-center-wrap">
        <div class="tab-center-btn">
          <img src="/assets/hot-platform-36-wytewSgn.svg" class="center-icon" alt="" />
        </div>
      </div>
      <template v-else>
        <img
          :src="isActive(tab.path) ? tab.iconActive : tab.icon"
          class="tab-icon"
          alt=""
        />
        <span class="tab-label">{{ tab.label }}</span>
      </template>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  {
    path: '/main/inicio',
    label: 'Inicio',
    icon: '/assets/inicio-36-DJCGom9R.svg',
    iconActive: '/assets/inicio-active-36-DXDK5bQT.svg'
  },
  {
    path: '/main/deposito',
    label: 'Depósito',
    icon: '/assets/entrar-36-Dr2VMD0M.svg',
    iconActive: '/assets/entrar-active-36-Dl4TFkUE.svg'
  },
  {
    path: '/main/promo',
    label: '',
    center: true,
    icon: '/assets/hot-platform-36-wytewSgn.svg',
    iconActive: '/assets/hot-platform-36-wytewSgn.svg'
  },
  {
    path: '/main/perfil',
    label: 'Perfil',
    icon: '/assets/perfil-36-lFSEwN4x.svg',
    iconActive: '/assets/perfil-active-36-BU8j8ncL.svg'
  },
  {
    path: '/main/menu',
    label: 'Menu',
    icon: '/assets/menu-36-BInLkXMM.svg',
    iconActive: '/assets/menu-active-36-DlSSzBxl.svg'
  }
]

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<style scoped>
.tab-bar {
  height: var(--tab-bar-height, 3.375rem);
  display: flex;
  align-items: stretch;
  justify-content: space-around;
  background: var(--ep-color-background-fill-foot-bar, var(--footer-dynamic-bg));
  position: relative;
  z-index: 100;
  flex-shrink: 0;
  padding-bottom: var(--safe-bottom);
  border-top: 1px solid var(--ep-color-border-default);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  color: var(--ep-color-text-navigation-default, rgba(213,224,245,.6));
  transition: all .2s ease;
  gap: 2px;
  text-decoration: none;
}

.tab-item.active {
  color: var(--ep-color-text-navigation-selected, var(--ep-color-text-selected));
}

.tab-label {
  font-size: var(--ep-font-size-xxs, .625rem);
  font-weight: var(--ep-font-weight-medium, 500);
  line-height: 1;
  color: inherit;
}

.tab-item.active .tab-label {
  color: var(--ep-color-text-navigation-selected, var(--ep-color-text-selected));
  font-weight: var(--ep-font-weight-bold, 700);
}

.tab-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.tab-item.active .tab-icon {
  filter: brightness(1.2);
}

.tab-center-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.tab-center-btn {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -1.5rem;
  box-shadow: 0 .25rem 1.25rem var(--ep-color-background-fill-glow-primary-opacity-40, rgba(24,170,255,.4));
  border: 3px solid var(--ep-color-background-fill-foot-bar, var(--footer-dynamic-bg));
}

.center-icon {
  width: 1.75rem;
  height: 1.75rem;
}

.tab-item.center:active .tab-center-btn {
  transform: scale(0.92);
}
</style>
