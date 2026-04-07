<template>
  <div class="app-shell" :data-theme="currentTheme">
    <PwaInstallBanner />
    <AppHeader />
    <div class="page-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <TabBar v-if="showTabBar" />
    <FloatingRefreshButton v-if="showFloat" />
    <BackToTop v-if="showFloat" />
    <DrawerMenu v-model="drawerOpen" />
    <AnnouncementModal :announcements="announcements" />

    <MysteryMineWidget v-if="showFloat" />

    <a
      v-if="showFloat"
      class="support-float"
      href="javascript:void(0)"
      @click="openSupport"
    >
      <img src="/assets/ui/support.png" alt="Suporte" />
    </a>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import TabBar from './components/TabBar.vue'
import FloatingRefreshButton from './components/FloatingRefreshButton.vue'
import BackToTop from './components/BackToTop.vue'
import DrawerMenu from './components/DrawerMenu.vue'
import AnnouncementModal from './components/AnnouncementModal.vue'
import PwaInstallBanner from './components/PwaInstallBanner.vue'
import MysteryMineWidget from './components/MysteryMineWidget.vue'
import { useSystemStore } from './stores/system'
import { useAuthStore } from './stores/auth'
import { useUserStore } from './stores/user'

const route = useRoute()
const drawerOpen = ref(false)
const currentTheme = ref(localStorage.getItem('app_theme') || 'amber-purple')

const hiddenTabRoutes = ['Login', 'Register', 'Launch', 'GameAction']
const hiddenFloatRoutes = ['Launch', 'GameAction']

const showTabBar = computed(() => !hiddenTabRoutes.includes(route.name))
const showFloat = computed(() => !hiddenFloatRoutes.includes(route.name))

watch(currentTheme, (val) => {
  localStorage.setItem('app_theme', val)
  document.documentElement.setAttribute('data-theme', val)
})

const announcements = ref([])

onMounted(async () => {
  document.documentElement.setAttribute('data-theme', currentTheme.value)

  try {
    const system = useSystemStore()
    await system.init()
    system.fetchAnnouncements().then(() => {
      if (system.announcements?.length) announcements.value = system.announcements
    }).catch(() => {})
  } catch (e) {
    console.warn('[App] System init error:', e.message)
  }

  try {
    const auth = useAuthStore()
    const userStore = useUserStore()
    if (auth.isLoggedIn) {
      userStore.fetchDetails().catch(() => {})
      userStore.fetchAssets().catch(() => {})
    }
  } catch (e) {
    console.warn('[App] Auth init error:', e.message)
  }
})

function openSupport() {
  window.open('https://t.me/a73support', '_blank')
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--ep-color-background-fill-body-default, #0F0B2E);
  color: var(--ep-color-text-default, #fff);
}

.page-content {
  padding-bottom: 4.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.support-float {
  position: fixed;
  bottom: 5.5rem;
  right: .75rem;
  width: 3rem;
  height: 3rem;
  z-index: 9998;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
  transition: transform .2s ease;
}

.support-float:active {
  transform: scale(0.9);
}

.support-float img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
