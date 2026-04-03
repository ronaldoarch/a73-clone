<template>
  <div class="app-shell" :data-theme="currentTheme">
    <AppHeader @toggle-drawer="drawerOpen = !drawerOpen" />
    <div class="page-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <TabBar v-if="showTabBar" />
    <FloatingRefreshButton v-if="showFloat" />
    <DrawerMenu v-model="drawerOpen" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import TabBar from './components/TabBar.vue'
import FloatingRefreshButton from './components/FloatingRefreshButton.vue'
import DrawerMenu from './components/DrawerMenu.vue'
import { useSystemStore } from './stores/system'
import { useAuthStore } from './stores/auth'
import { useUserStore } from './stores/user'

const route = useRoute()
const drawerOpen = ref(false)
const currentTheme = ref(localStorage.getItem('app_theme') || 'blue-default')

const hiddenTabRoutes = ['Login', 'Register', 'Launch', 'GameAction']
const hiddenFloatRoutes = ['Launch', 'GameAction']

const showTabBar = computed(() => !hiddenTabRoutes.includes(route.name))
const showFloat = computed(() => !hiddenFloatRoutes.includes(route.name))

watch(currentTheme, (val) => {
  localStorage.setItem('app_theme', val)
  document.documentElement.setAttribute('data-theme', val)
})

onMounted(async () => {
  document.documentElement.setAttribute('data-theme', currentTheme.value)

  const system = useSystemStore()
  const auth = useAuthStore()
  const userStore = useUserStore()

  await system.init()

  if (auth.isLoggedIn) {
    userStore.fetchDetails()
    userStore.fetchAssets()
  }
})
</script>

<style scoped>
.app-shell {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  background: var(--ep-color-background-fill-body-default, #0E1E3D);
}
</style>
