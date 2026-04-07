<template>
  <div class="home-page">
    <!-- Banner Carousel (Swiper) -->
    <div class="carousel-wrapper" v-if="displayBanners.length">
      <Swiper
        :modules="swiperModules"
        :slides-per-view="1"
        :loop="displayBanners.length > 1"
        :autoplay="{ delay: 4000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        :space-between="0"
        class="banner-swiper"
      >
        <SwiperSlide v-for="(banner, i) in displayBanners" :key="i">
          <div class="carousel-slide" @click="onBannerClick(banner)">
            <img
              :src="banner.img"
              :alt="banner.title || ''"
              @error="(e) => e.target.src = '/assets/banners/banner-bonus.svg'"
            />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>

    <!-- Category Icons - Hexagonal -->
    <div class="category-icons" v-if="displayCategories.length">
      <div
        v-for="cat in displayCategories"
        :key="cat.id"
        class="cat-item"
        :class="{ active: activeCat === cat.id }"
        @click="onCategoryClick(cat)"
      >
        <div class="cat-hex-wrap">
          <svg class="cat-hex-bg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient :id="'hex-grad-' + cat.id" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#FFE44D"/>
                <stop offset="100%" stop-color="#D4960A"/>
              </linearGradient>
            </defs>
            <polygon :fill="`url(#hex-grad-${cat.id})`" points="50,2 93,27 93,73 50,98 7,73 7,27" />
            <polygon fill="rgba(255,255,255,.15)" points="50,8 87,30 87,70 50,92 13,70 13,30" />
          </svg>
          <span v-if="cat.isEmoji" class="cat-hex-emoji">{{ cat.abbrev }}</span>
          <span v-else class="cat-hex-logo">{{ cat.abbrev }}</span>
          <span class="cat-hex-name">{{ cat.label }}</span>
        </div>
      </div>
    </div>

    <!-- Marquee + Search -->
    <div class="marquee-search-row">
      <div class="marquee-dot"></div>
      <div class="marquee-icon-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFE44D"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
      </div>
      <div v-if="marqueeText" class="marquee-text-wrap">
        <span class="marquee-text">{{ marqueeText }}</span>
      </div>
      <button class="search-icon-btn" @click="$router.push('/game/search')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
      </button>
    </div>

    <!-- Activity Banners - with real images -->
    <div class="activity-banners">
      <div class="activity-row-2">
        <div class="activity-img-card" @click="$router.push('/spread')">
          <img src="/assets/download/download.gif" alt="Convide amigos" />
        </div>
        <div class="activity-img-card" @click="$router.push('/activity/vip')">
          <img src="/assets/download/download-2.gif" alt="VIP" />
        </div>
      </div>
      <div class="activity-wide-card" @click="$router.push('/main/promo')">
        <img src="/assets/download/download-1.gif" alt="Bônus Login" />
      </div>
    </div>

    <!-- Hot Games Horizontal Scroll -->
    <HotGamesScroll :max-games="20" card-size="size-md" />

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Carregando jogos...</p>
    </div>

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


    <!-- Footer -->
    <div class="home-footer">
      <div class="footer-social" v-if="socialLinks.length">
        <span class="footer-social-title">Redes Sociais</span>
        <div class="footer-social-icons">
          <a v-for="link in socialLinks" :key="link.name" :href="link.url" target="_blank" class="social-link">
            <span class="social-icon-wrap" :style="{ background: link.color }">
              <span class="social-letter">{{ link.name.charAt(0) }}</span>
            </span>
          </a>
        </div>
      </div>

      <div class="footer-badges">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".4"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <span class="footer-18">18+</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>

      <div class="footer-desc">Jogos de azar podem ser viciantes. Jogue com responsabilidade.</div>
      <div class="footer-name">{{ systemStore.tenantName || 'A73' }}</div>
      <div class="footer-copy">©2026 {{ systemStore.tenantName || 'A73' }}. Todos os direitos reservados.</div>
    </div>

    <div class="bottom-spacer"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { useGamesStore } from '../stores/games'
import { useSystemStore } from '../stores/system'
import GameSection from '../components/GameSection.vue'
import HotGamesScroll from '../components/HotGamesScroll.vue'

const swiperModules = [Autoplay, Pagination]

const router = useRouter()
const store = useGamesStore()
const systemStore = useSystemStore()
const { providers, gamesByProvider, loading, hotGames, topProviders } = storeToRefs(store)
const { fetchCatalog, getProviderGames } = store

const activeCat = ref('hot')

const fallbackBanners = [
  { img: '/assets/banners/banner-cashback.svg', title: '5% Cashback', route: '/main/promo' },
  { img: '/assets/banners/banner-vip.svg', title: 'VIP', route: '/activity/vip' },
  { img: '/assets/banners/banner-bonus.svg', title: 'Bônus Primeiro Depósito', route: '/main/promo' },
]

const displayBanners = computed(() => {
  const apiList = systemStore.carouselList
  if (apiList?.length) {
    return apiList.map(b => ({
      img: b.imageUrl || b.img || b.banner || '',
      title: b.title || b.name || '',
      route: b.targetValue || b.url || '/main/promo',
      targetType: b.targetType || 'none'
    })).filter(b => b.img)
  }
  return fallbackBanners
})

function onBannerClick(banner) {
  if (banner.route) router.push(banner.route)
}

const marqueeText = computed(() => {
  const items = systemStore.marqueeContent
  if (items?.length) return items.map(i => i.content || i.text || i).join('    ')
  return '🍊🤡 Participe do Evento Super Popular e Ganhe Prêmios Incríveis! 🎁    💎 Site oficial permanente【A73.com】Favorito~seguir!    🔥 Depósito rápido, saque instantâneo, suporte 24h!    🎰 1000+ jogos dos melhores provedores do mundo! 🌍'
})

const providerLogos = {
  'pg': 'PG', 'pgsoft': 'PG',
  'pp': 'PP', 'pragmatic': 'PP', 'pragmaticplay': 'PP',
  'jili': 'JL', 'jl': 'JL',
  'cq9': 'CQ9',
  'fc': 'FC', 'fachai': 'FC',
  'mg': 'MG', 'microgaming': 'MG',
  'evo': 'EVO', 'evolution': 'EVO',
  'sg': 'SG', 'spadegaming': 'SG',
  'live22': 'L22',
  'joker': 'JK',
  'ka': 'KA', 'kagaming': 'KA',
  'rt': 'RT', 'redtiger': 'RT',
  'habanero': 'HB', 'hb': 'HB',
  'booongo': 'BG', 'bg': 'BG',
  'netent': 'NE', 'ne': 'NE',
  'playtech': 'PT', 'pt': 'PT',
}

const displayCategories = computed(() => {
  const cats = [
    {
      id: 'hot',
      label: 'Popular',
      hexColor: '#F5C84C',
      abbrev: '🔥',
      isEmoji: true
    }
  ]
  const provs = providers.value.slice(0, 7)
  provs.forEach((p) => {
    const code = (p.code || '').toLowerCase()
    const name = (p.name || p.code || '').toUpperCase()
    const abbrev = providerLogos[code] || name.slice(0, 2)
    cats.push({
      id: p.code,
      label: name.length > 6 ? name.slice(0, 5) + '…' : name,
      hexColor: '#F5C84C',
      abbrev,
      isEmoji: false
    })
  })
  return cats
})

function onCategoryClick(cat) {
  activeCat.value = cat.id
  if (cat.id === 'hot') return
  router.push(`/game/category/all/${cat.id}`)
}

const socialLinks = computed(() => [
  { name: 'Telegram', url: 'https://t.me/a73support', color: '#0088cc' },
  { name: 'WhatsApp', url: 'https://wa.me/', color: '#25D366' },
  { name: 'Instagram', url: '#', color: 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)' },
  { name: 'Facebook', url: '#', color: '#1877F2' },
])



onMounted(() => {
  fetchCatalog()
  systemStore.fetchMarquee()
  systemStore.fetchCarousel()
})
</script>

<style scoped>
.home-page {
  padding: 0 .75rem;
  background: var(--ep-color-background-fill-body-default);
}

/* ── Carousel (Swiper) ── */
.carousel-wrapper {
  position: relative; border-radius: .75rem; overflow: hidden; margin: .5rem 0;
}
.banner-swiper { width: 100%; aspect-ratio: 16 / 7; border-radius: .75rem; }
.carousel-slide { width: 100%; height: 100%; cursor: pointer; }
.carousel-slide img {
  width: 100%; height: 100%; object-fit: cover; border-radius: .75rem;
  background: linear-gradient(135deg, #2D1B69 0%, #4C1D95 50%, #1A0A3E 100%);
}
.banner-swiper :deep(.swiper-pagination-bullet) {
  width: .375rem; height: .375rem; background: rgba(255,255,255,.4); opacity: 1;
}
.banner-swiper :deep(.swiper-pagination-bullet-active) {
  width: 1rem; border-radius: .1875rem; background: #fff;
}

/* ── Category Icons ── */
.category-icons {
  display: flex; gap: .5rem; overflow-x: auto; padding: .75rem 0;
  -webkit-overflow-scrolling: touch;
}
.category-icons::-webkit-scrollbar { display: none; }
.cat-item {
  display: flex; flex-direction: column; align-items: center;
  flex-shrink: 0; cursor: pointer;
}
.cat-item:active .cat-hex-wrap { transform: scale(0.92); }
.cat-item.active .cat-hex-wrap {
  transform: scale(1.08);
  filter: brightness(1.15);
}

.cat-hex-wrap {
  width: 3.75rem; height: 3.75rem;
  position: relative;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  transition: transform .2s ease, filter .2s ease;
}
.cat-hex-bg {
  position: absolute; inset: 0; width: 100%; height: 100%;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,.35));
}
.cat-hex-emoji {
  position: relative; z-index: 1;
  font-size: 1.25rem;
  line-height: 1;
}
.cat-hex-logo {
  position: relative; z-index: 1;
  font-size: .875rem; font-weight: 900;
  color: #1a0a2e;
  text-shadow: 0 1px 0 rgba(255,255,255,.3);
  letter-spacing: .5px;
  line-height: 1;
}
.cat-hex-name {
  position: relative; z-index: 1;
  font-size: .5rem; font-weight: 800;
  color: #fff; text-align: center;
  line-height: 1; white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0,0,0,.3);
  letter-spacing: .3px;
  margin-top: .0625rem;
}

/* ── Marquee + Search ── */
.marquee-search-row {
  display: flex; align-items: center; gap: .5rem; padding: .5rem .625rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .5rem; margin: 0 0 .625rem; overflow: hidden;
  border: 1px solid var(--ep-color-border-default);
}
.marquee-dot {
  width: .5rem; height: .5rem; border-radius: 50%;
  background: var(--ep-accent-green, #17C964); flex-shrink: 0;
  animation: breathing 2s ease-in-out infinite;
}
.marquee-text-wrap { flex: 1; overflow: hidden; }
.marquee-text {
  display: inline-block; white-space: nowrap;
  animation: scroll-horizontal 20s linear infinite;
  font-size: .75rem; color: var(--ep-color-text-weaker);
}
.marquee-text:hover { animation-play-state: paused; }
.search-icon-btn {
  width: 2rem; height: 2rem; border-radius: 50%;
  background: var(--ep-color-background-fill-surface-raised-L2);
  color: var(--ep-color-text-weaker); display: flex; align-items: center;
  justify-content: center; flex-shrink: 0; transition: all .2s ease;
}
.search-icon-btn:active {
  transform: scale(0.9); background: var(--ep-color-background-fill-active-primary);
  color: var(--ep-color-text-inverse);
}

/* ── Activity Banners (image-based) ── */
.activity-banners { margin: .375rem 0 .625rem; }
.activity-row-2 {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: .375rem; margin-bottom: .375rem;
}
.activity-img-card {
  border-radius: .5rem; overflow: hidden; cursor: pointer;
  transition: transform .15s ease; position: relative;
}
.activity-img-card:active { transform: scale(0.97); }
.activity-img-card img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.activity-wide-card {
  border-radius: .5rem; overflow: hidden; cursor: pointer;
  transition: transform .15s ease;
}
.activity-wide-card:active { transform: scale(0.97); }
.activity-wide-card img {
  width: 100%; height: auto; display: block;
}

/* ── Loading ── */
.loading-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 3.75rem 0; gap: .75rem; color: var(--ep-color-text-weakest);
}
.loading-spinner {
  width: 2rem; height: 2rem; border: 3px solid var(--ep-color-border-default);
  border-top-color: var(--ep-color-text-selected);
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.home-footer {
  text-align: center; padding: 1.5rem .75rem 1rem;
  margin-top: 1.5rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem .75rem 0 0;
}
.footer-social { margin-bottom: 1rem; }
.footer-social-title {
  display: block; font-size: .6875rem; font-weight: 600;
  color: var(--ep-color-text-weakest); margin-bottom: .5rem;
  text-transform: uppercase; letter-spacing: .5px;
}
.footer-social-icons {
  display: flex; justify-content: center; gap: .75rem;
}
.social-link { text-decoration: none; }
.social-icon-wrap {
  width: 2rem; height: 2rem; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: transform .15s; box-shadow: 0 2px 6px rgba(0,0,0,0.25);
}
.social-icon-wrap:active { transform: scale(0.9); }
.social-letter { font-size: .75rem; font-weight: 800; color: #fff; }

.footer-badges {
  display: flex; justify-content: center; align-items: center; gap: 1rem;
  margin-bottom: .75rem; color: var(--ep-color-text-weakest);
}
.footer-18 {
  font-size: 1.125rem; font-weight: 800;
  color: var(--ep-color-text-weakest); opacity: .6;
  border: 2px solid; border-radius: .25rem; padding: .125rem .375rem;
}
.footer-desc {
  font-size: .625rem; color: var(--ep-color-text-weakest);
  margin-bottom: .75rem; opacity: .7;
}
.footer-name {
  font-size: 1.125rem; font-weight: 700; color: var(--ep-color-text-default);
  margin-bottom: .375rem;
}
.footer-copy {
  font-size: .625rem; color: var(--ep-color-text-weakest);
}

.bottom-spacer { height: 1.5rem; }

@keyframes breathing {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

@keyframes scroll-horizontal {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
</style>
