<template>
  <div class="app-shell" :data-theme="currentTheme">
    <PwaInstallBanner />
    <AppHeader v-if="route.name !== 'Menu'" />
    <div
      class="page-content"
      :class="{
        'page-content--brand-purple': route.name === 'Home',
        'page-content--menu': route.name === 'Menu'
      }"
    >
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <!-- TabBar é position:fixed; o wrapper evita que o flex reserve altura e estrague o scroll no mobile -->
    <div class="tab-bar-anchor" aria-hidden="true">
      <TabBar v-if="showTabBar" />
    </div>
    <DrawerMenu v-model="drawerOpen" />
    <AnnouncementModal :announcements="announcements" />

    <MysteryMineFloat v-if="showFloat" />
    <PromoCarouselFloat v-if="showFloat" />
    <SupportFloat v-if="showFloat" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import TabBar from './components/TabBar.vue'
import DrawerMenu from './components/DrawerMenu.vue'
import AnnouncementModal from './components/AnnouncementModal.vue'
import PwaInstallBanner from './components/PwaInstallBanner.vue'
import MysteryMineFloat from './components/MysteryMineFloat.vue'
import PromoCarouselFloat from './components/PromoCarouselFloat.vue'
import SupportFloat from './components/SupportFloat.vue'
import { useSystemStore } from './stores/system'
import { useAuthStore } from './stores/auth'
import { useUserStore } from './stores/user'
import { isValidAppUiTheme } from './constants/appThemeCatalog'

const route = useRoute()
const authStore = useAuthStore()
const drawerOpen = ref(false)
const systemStore = useSystemStore()

/** Tema: admin pode fixar em Branding (appUiTheme em /api/settings); senão segue skin do tenant. */
const currentTheme = computed(() => {
  const fixed = systemStore.settings?.appUiTheme
  if (fixed && isValidAppUiTheme(fixed)) return fixed
  return systemStore.themeConfig?.theme || 'amber-purple'
})

const hiddenTabRoutes = ['Login', 'Register', 'Launch', 'GameAction']

const showTabBar = computed(() => !hiddenTabRoutes.includes(route.name))
/** Flutuantes (mina, carrossel promo, suporte) só na página inicial */
const showFloat = computed(() => route.name === 'Home')

watch(
  currentTheme,
  (val) => {
    document.documentElement.setAttribute('data-theme', val)
    try {
      localStorage.setItem('app_theme', val)
    } catch (_) {}
  },
  { immediate: true }
)

watch(
  () => route.query,
  () => {
    authStore.setParentId(route)
  },
  { deep: true, immediate: true }
)

const announcements = ref([])

function mergeAnnouncementsForModal() {
  const system = useSystemStore()
  const base = [...(system.announcements || [])]
  const p = system.settings?.sitePopup
  if (p && p.enabled && (p.title || p.content || p.imageUrl)) {
    const aud = p.audience || 'all'
    const logged = authStore.isLoggedIn
    const ok = aud === 'all' || (aud === 'guest' && !logged) || (aud === 'auth' && logged)
    if (ok) {
      const k = p.dismissKey || 'default'
      let dismissed = false
      try {
        dismissed = localStorage.getItem('site_popup_dismiss_' + k) === '1'
      } catch (_) {}
      if (!dismissed) {
        base.unshift({
          id: 'cms-popup',
          title: p.title || 'Aviso',
          content: p.content || '',
          type: p.imageUrl ? 'img' : undefined,
          imageUrl: p.imageUrl || undefined,
          cmsDismissKey: k
        })
      }
    }
  }
  announcements.value = base
}

watch(
  () => [systemStore.settings, systemStore.announcements, authStore.isLoggedIn],
  () => mergeAnnouncementsForModal(),
  { deep: true }
)

onMounted(async () => {
  document.getElementById('app')?.classList.remove('app-full-bleed')

  try {
    const system = useSystemStore()
    await system.init()
    mergeAnnouncementsForModal()
    system.fetchAnnouncements().then(() => mergeAnnouncementsForModal()).catch(() => {})
  } catch (e) {
    console.warn('[App] System init error:', e.message)
  }

  try {
    authStore.setParentId(route)
    const userStore = useUserStore()
    if (authStore.isLoggedIn) {
      userStore.fetchDetails().catch(() => {})
      userStore.fetchAssets().catch(() => {})
    }
  } catch (e) {
    console.warn('[App] Auth init error:', e.message)
  }
})

</script>

<style scoped>
.app-shell {
  flex: 1;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--ep-color-background-fill-body-default, #0F0B2E);
  color: var(--ep-color-text-default, #fff);
}

.tab-bar-anchor {
  flex: none;
  height: 0;
  width: 100%;
  overflow: visible;
  position: relative;
}

.page-content {
  padding-bottom: 5.15rem;
}

/* Home: fundo do scroll = roxo escuro (#200943); topo roxo vivo fica no herói dentro da HomePage */
.page-content.page-content--brand-purple {
  background: var(--color-home-lower-bg, #200943);
}

/* Menu: fundo roxo profundo contínuo com a tela (toolbar fica dentro da página) */
.page-content.page-content--menu {
  background: #2b004d;
  padding-top: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>
