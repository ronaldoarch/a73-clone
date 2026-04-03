<template>
  <div class="home-page">
    <!-- App Banner -->
    <div class="app-banner" v-if="showBanner">
      <button class="banner-close" @click="closeBanner">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
      </button>
      <div class="banner-inner">
        <div class="banner-left">
          <div class="banner-app-icon">
            <img src="https://upload-us.i-j-2-k.com/s5/app-icon/1222508/LOGO.jpg" alt="A73" />
          </div>
          <div>
            <div class="banner-title-text">Baixe Nosso APP,</div>
            <div class="banner-title-text">Ganhe Super Prêmios!</div>
          </div>
        </div>
        <button class="banner-btn shiny" @click="$router.push('/download')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          Instalar
        </button>
      </div>
    </div>

    <!-- Bonus Pool -->
    <BonusPool />

    <!-- Marquee -->
    <div v-if="marqueeText" class="marquee-bar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-currency)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
      <div class="marquee-text-wrap">
        <span class="marquee-text">{{ marqueeText }}</span>
      </div>
    </div>

    <!-- Game Segments -->
    <div class="segment-tabs">
      <button
        v-for="seg in segments"
        :key="seg.id"
        class="seg-btn"
        :class="{ active: activeSeg === seg.id }"
        @click="activeSeg = seg.id"
      >
        <span class="seg-icon" v-html="seg.icon"></span>
        <span class="seg-label">{{ seg.label }}</span>
      </button>
    </div>

    <!-- Search bar -->
    <div class="home-search" @click="$router.push('/game/search')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
      <span>Pesquisar jogos...</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Carregando jogos...</p>
    </div>

    <!-- Popular Section -->
    <GameSection
      v-if="hotGames.length"
      name="Popular"
      :games="hotGames"
      :total-count="hotGames.length"
      :max-games="20"
      provider-code=""
    />

    <!-- Provider Sections -->
    <GameSection
      v-for="provider in topProviders"
      :key="provider.code"
      :name="provider.name || provider.code"
      :games="getProviderGames(provider.code)"
      :total-count="(gamesByProvider[provider.code] || []).length"
      :max-games="20"
      :provider-code="provider.code"
      @view-all="$router.push(`/game/category/all/${provider.code}`)"
    />

    <!-- All Providers List -->
    <div v-if="providers.length > 5" class="all-providers">
      <h3 class="all-providers-title">Todos os Provedores</h3>
      <div class="providers-grid">
        <div
          v-for="p in providers"
          :key="p.code"
          class="provider-card"
          @click="$router.push(`/game/category/all/${p.code}`)"
        >
          <div class="prov-badge" :style="{ background: getColor(p.code) }">
            {{ (p.name || p.code).charAt(0) }}
          </div>
          <span class="prov-name">{{ p.name || p.code }}</span>
          <span class="prov-count">{{ (gamesByProvider[p.code] || []).length }}</span>
        </div>
      </div>
    </div>

    <div class="bottom-spacer"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useGamesStore } from '../stores/games'
import { useSystemStore } from '../stores/system'
import GameSection from '../components/GameSection.vue'
import BonusPool from '../components/BonusPool.vue'

const store = useGamesStore()
const systemStore = useSystemStore()
const { providers, gamesByProvider, loading, hotGames, topProviders } = storeToRefs(store)
const { fetchCatalog, getProviderGames } = store

const showBanner = ref(!sessionStorage.getItem('banner_closed'))
const activeSeg = ref('hot')

const marqueeText = computed(() => {
  const items = systemStore.marqueeContent
  if (items.length) return items.map(i => i.content || i.text || i).join(' • ')
  return ''
})

const segments = [
  { id: 'hot', label: 'Popular', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/></svg>' },
  { id: 'slots', label: 'Slots', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="4" width="20" height="16" rx="2"/></svg>' },
  { id: 'live', label: 'Ao Vivo', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/><path d="M7.05 7.05a7 7 0 010 9.9M16.95 7.05a7 7 0 010 9.9"/></svg>' },
  { id: 'fish', label: 'Pesca', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20c-4.4 0-8-3.6-8-8h2c0 3.3 2.7 6 6 6s6-2.7 6-6h2c0 4.4-3.6 8-8 8z"/></svg>' },
  { id: 'sport', label: 'Esporte', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/></svg>' },
]

const colors = ['#18AAFF', '#AB63FF', '#17C964', '#FA8313', '#F5222D', '#FFC41A', '#14B8A6', '#E879F9']
function getColor(code) {
  let h = 0
  for (let i = 0; i < code.length; i++) h = code.charCodeAt(i) + ((h << 5) - h)
  return colors[Math.abs(h) % colors.length]
}

function closeBanner() {
  showBanner.value = false
  sessionStorage.setItem('banner_closed', '1')
}

onMounted(() => {
  fetchCatalog()
  systemStore.fetchMarquee()
})
</script>

<style scoped>
.home-page {
  padding: 0 .75rem;
  background: var(--ep-color-background-fill-body-default);
}

.app-banner {
  position: relative;
}

.banner-close {
  position: absolute;
  top: .75rem;
  left: .25rem;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  background: var(--ep-neutral-black-black-40, rgba(0,0,0,.4));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.banner-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: var(--ep-border-radius-l, .5rem);
  padding: .625rem .875rem;
  margin: .5rem 0;
  border: 1px solid var(--ep-color-border-default);
}

.banner-left {
  display: flex;
  align-items: center;
  gap: .625rem;
}

.banner-app-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: .625rem;
  overflow: hidden;
  flex-shrink: 0;
}

.banner-app-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-title-text {
  font-size: var(--ep-font-size-s, .75rem);
  font-weight: var(--ep-font-weight-bold, 700);
  color: var(--ep-color-text-default);
  line-height: 1.4;
}

.banner-btn {
  display: flex;
  align-items: center;
  gap: .25rem;
  padding: .5rem .875rem;
  background: var(--gradient-primary);
  border-radius: var(--ep-border-radius-infinity, 624.9375rem);
  color: var(--ep-color-text-inverse, #0E1E3D);
  font-size: var(--ep-font-size-s, .75rem);
  font-weight: var(--ep-font-weight-bold, 700);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.marquee-bar {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .375rem .625rem;
  background: var(--ep-color-background-fill-surface-raised-L2);
  border-radius: var(--ep-border-radius-m, .375rem);
  margin: .25rem 0 .5rem;
  overflow: hidden;
  border: 1px solid var(--ep-color-border-default);
}

.marquee-text-wrap {
  flex: 1;
  overflow: hidden;
}

.marquee-text {
  display: inline-block;
  white-space: nowrap;
  animation: scroll-horizontal 20s linear infinite;
  font-size: var(--ep-font-size-s, .75rem);
  color: var(--ep-color-text-weaker);
}

.marquee-text:hover {
  animation-play-state: paused;
}

.segment-tabs {
  display: flex;
  gap: .25rem;
  overflow-x: auto;
  padding: .25rem 0 .5rem;
  -webkit-overflow-scrolling: touch;
}

.segment-tabs::-webkit-scrollbar {
  display: none;
}

.seg-btn {
  display: flex;
  align-items: center;
  gap: .25rem;
  padding: .4375rem .875rem;
  border-radius: var(--ep-border-radius-infinity, 624.9375rem);
  background: var(--ep-color-background-fill-surface-raised-L2);
  color: var(--ep-color-text-weaker);
  font-size: var(--ep-font-size-s, .75rem);
  font-weight: var(--ep-font-weight-semi-bold, 600);
  white-space: nowrap;
  transition: all .2s ease;
  flex-shrink: 0;
  border: 1px solid var(--ep-color-border-default);
}

.seg-btn.active {
  background: var(--gradient-primary);
  color: var(--ep-color-text-inverse, #0E1E3D);
  border-color: transparent;
  font-weight: var(--ep-font-weight-bold, 700);
}

.seg-btn:active {
  opacity: 0.7;
}

.seg-icon {
  display: flex;
  align-items: center;
}

.home-search {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .625rem .875rem;
  background: var(--game-searchbar-bg, var(--ep-color-background-fill-surface-lowered));
  border-radius: var(--ep-border-radius-l, .5rem);
  margin: 0 0 .75rem;
  cursor: pointer;
  border: 1px solid var(--game-searchbar-border-color, var(--ep-color-border-default));
}

.home-search svg {
  color: var(--ep-color-text-weakest);
  flex-shrink: 0;
}

.home-search span {
  color: var(--game-searchbar-placeholder, var(--ep-color-text-weakest));
  font-size: var(--ep-font-size-s, .8125rem);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3.75rem 0;
  gap: .75rem;
  color: var(--ep-color-text-weakest);
}

.all-providers {
  margin-top: .75rem;
}

.all-providers-title {
  font-size: var(--ep-font-size-m, .9375rem);
  font-weight: var(--ep-font-weight-bold, 700);
  margin-bottom: .625rem;
  color: var(--ep-color-text-default);
}

.providers-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: .5rem;
}

.provider-card {
  display: flex;
  align-items: center;
  gap: .625rem;
  padding: .75rem;
  background: var(--ep-color-background-fill-surface-raised-L2);
  border-radius: var(--ep-border-radius-l, .5rem);
  cursor: pointer;
  transition: all .2s ease;
  border: 1px solid var(--ep-color-border-default);
}

.provider-card:active {
  opacity: 0.7;
}

.prov-badge {
  width: 1.875rem;
  height: 1.875rem;
  border-radius: .5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--ep-font-size-m, .875rem);
  font-weight: var(--ep-font-weight-bold, 700);
  color: #fff;
  flex-shrink: 0;
}

.prov-name {
  font-size: var(--ep-font-size-s, .8125rem);
  font-weight: var(--ep-font-weight-semi-bold, 600);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--ep-color-text-default);
}

.prov-count {
  font-size: var(--ep-font-size-s, .75rem);
  color: var(--ep-color-text-weakest);
}

.bottom-spacer {
  height: 1.5rem;
}
</style>
