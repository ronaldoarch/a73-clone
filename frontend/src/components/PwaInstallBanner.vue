<template>
  <Transition name="pwa-slide">
    <div v-if="showBanner" class="pwa-banner">
      <button class="bar-close" @click="dismissBanner" aria-label="Fechar">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
      </button>

      <div class="bar-icon">
        <img
          :src="bannerIconSrc"
          alt=""
          decoding="async"
          @error="onBannerIconError"
        />
      </div>

      <div class="bar-text">
        <span class="bar-line1">Baixe Nosso APP,</span>
        <span class="bar-line2">Ganhe Super Prêmios! 🎊</span>
      </div>

      <div class="bar-emojis">💰🎊🎁</div>

      <button class="bar-install" @click="install">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 4v13m0 0l-4-4m4 4l4-4"/><path d="M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2"/></svg>
        <span>Instalar</span>
      </button>

      <div v-if="installing" class="pwa-progress">
        <div class="pwa-progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useSystemStore } from '../stores/system'

/** Mesma ordem que o header: logo do Admin → tenant → ícone app → arte genérica */
const FALLBACK_ICON = '/assets/download/download-4.png'
const system = useSystemStore()
const { brandingLogoUrl, siteLogo, appIcon } = storeToRefs(system)

const preferredIcon = computed(() => {
  const a = (brandingLogoUrl.value || '').trim()
  const b = (siteLogo.value || '').trim()
  const c = (appIcon.value || '').trim()
  return a || b || c || ''
})

const bannerIconSrc = ref(FALLBACK_ICON)

watch(
  preferredIcon,
  (u) => {
    bannerIconSrc.value = u || FALLBACK_ICON
  },
  { immediate: true }
)

function onBannerIconError() {
  if (bannerIconSrc.value !== FALLBACK_ICON) {
    bannerIconSrc.value = FALLBACK_ICON
  }
}

const showBanner = ref(false)
const installing = ref(false)
const progress = ref(0)
let deferredPrompt = null

function handleBeforeInstall(e) {
  e.preventDefault()
  deferredPrompt = e
  const dismissed = localStorage.getItem('pwa_dismissed')
  if (dismissed) {
    const daysSince = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24)
    if (daysSince < 3) return
  }
  showBanner.value = true
}

async function install() {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    deferredPrompt = null
    if (outcome === 'accepted') {
      installing.value = true
      simulateProgress()
    }
  } else {
    installing.value = true
    simulateProgress()
  }
}

function simulateProgress() {
  const interval = setInterval(() => {
    progress.value += Math.random() * 15
    if (progress.value >= 100) {
      progress.value = 100
      clearInterval(interval)
      setTimeout(() => { showBanner.value = false }, 800)
    }
  }, 200)
}

function dismissBanner() {
  localStorage.setItem('pwa_dismissed', Date.now().toString())
  showBanner.value = false
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstall)
  if (window.matchMedia('(display-mode: standalone)').matches) return
  if (navigator.standalone) return
  const dismissed = localStorage.getItem('pwa_dismissed')
  if (dismissed) {
    const daysSince = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24)
    if (daysSince < 3) return
  }
  showBanner.value = true
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
})
</script>

<style scoped>
.pwa-banner {
  display: flex;
  align-items: center;
  gap: .625rem;
  background: linear-gradient(90deg, #1A0A3E 0%, #2D1B69 50%, #1A0A3E 100%);
  padding: .5rem .625rem .5rem 2rem;
  position: relative;
  z-index: 101;
  flex-shrink: 0;
  min-height: 3rem;
}

.bar-close {
  position: absolute;
  top: 50%;
  left: .5rem;
  transform: translateY(-50%);
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, .15);
  color: rgba(255, 255, 255, .6);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  padding: 0;
}
.bar-close:active {
  background: rgba(255, 255, 255, .25);
}

.bar-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: .625rem;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .4);
  border: 1.5px solid rgba(255, 255, 255, .1);
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.bar-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
}

.bar-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: .0625rem;
}

.bar-line1,
.bar-line2 {
  font-size: .8125rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
  white-space: nowrap;
}

.bar-emojis {
  font-size: 1rem;
  flex-shrink: 0;
  line-height: 1;
  letter-spacing: 1px;
}

.bar-install {
  display: flex;
  align-items: center;
  gap: .25rem;
  padding: .4375rem 1rem;
  background: linear-gradient(180deg, #FFE44D 0%, #F5C84C 50%, #E8B230 100%);
  border-radius: 624.9375rem;
  border: none;
  color: #1a1a2e;
  font-size: .8125rem;
  font-weight: 800;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(245, 200, 76, .35);
  cursor: pointer;
  transition: all .15s ease;
}
.bar-install:active {
  opacity: .85;
  transform: scale(.96);
}
.bar-install svg {
  stroke: #1a1a2e;
}

.pwa-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, .05);
}
.pwa-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #FFE44D, #E8B230);
  transition: width .3s ease;
}

.pwa-slide-enter-active { transition: all .35s cubic-bezier(.34, 1.56, .64, 1); }
.pwa-slide-leave-active { transition: all .25s ease-in; }
.pwa-slide-enter-from { transform: translateY(-100%); opacity: 0; }
.pwa-slide-leave-to { transform: translateY(-100%); opacity: 0; }
</style>
