<template>
  <div class="home-page">
    <!-- Topo: mesmo roxo do header até o banner; transição no meio da faixa de hexágonos -->
    <div v-if="displayBanners.length" class="home-hero-purple">
      <div class="carousel-wrapper">
        <Swiper
          :modules="swiperModules"
          :slides-per-view="carouselSlidesPerView"
          :centered-slides="displayBanners.length > 1"
          :loop="displayBanners.length > 1"
          :autoplay="{ delay: 4000, disableOnInteraction: false }"
          :pagination="{ clickable: true }"
          :space-between="20"
          :touch-start-prevent-default="false"
          :threshold="8"
          class="banner-swiper"
        >
          <SwiperSlide v-for="(banner, i) in displayBanners" :key="i">
            <div class="carousel-slide" @click="onBannerClick(banner)">
              <img
                class="banner-bg-img"
                :src="banner.img"
                :alt="banner.title || ''"
                @error="(e) => e.target.src = '/assets/banners/banner-bonus.svg'"
              />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
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
          <div class="cat-hex-bg" aria-hidden="true"></div>
          <span class="cat-hex-letters">{{ cat.letters }}</span>
        </div>
        <span class="cat-hex-name">{{ cat.label }}</span>
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
          <img class="activity-banner-img" src="/assets/download/download.gif" alt="Convide amigos" />
        </div>
        <div class="activity-img-card" @click="$router.push('/activity/vip')">
          <img class="activity-banner-img" src="/assets/download/download-2.gif" alt="VIP" />
        </div>
      </div>
      <div class="activity-wide-card" @click="$router.push('/main/promo')">
        <img class="activity-banner-img" src="/assets/download/download-1.gif" alt="Bônus e promoções" />
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

    <ProfitRanking />

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

    <NewUserRoulettePopup v-model="showNovosRoulettePopup" />
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
import { LOCAL_HOME_BANNERS } from '../constants/homeBanners'
import GameSection from '../components/GameSection.vue'
import HotGamesScroll from '../components/HotGamesScroll.vue'
import ProfitRanking from '../components/ProfitRanking.vue'
import NewUserRoulettePopup from '../components/NewUserRoulettePopup.vue'
import { useAuthStore } from '../stores/auth'
import { fetchRoletaNovosStatus } from '../utils/roletaApi'
import { PENDING_NOVOS_ROULETTE_WELCOME_KEY } from '../utils/novosRouletteWelcome'

const swiperModules = [Autoplay, Pagination]

const router = useRouter()
const store = useGamesStore()
const systemStore = useSystemStore()
const authStore = useAuthStore()

const showNovosRoulettePopup = ref(false)

async function tryOpenNovosRouletteWelcome() {
  if (!authStore.token) return
  if (sessionStorage.getItem(PENDING_NOVOS_ROULETTE_WELCOME_KEY) !== '1') return
  sessionStorage.removeItem(PENDING_NOVOS_ROULETTE_WELCOME_KEY)
  try {
    const st = await fetchRoletaNovosStatus(authStore.token)
    if (st?.eligible) showNovosRoulettePopup.value = true
  } catch {
    /* evita bloquear a home */
  }
}
const { providers, gamesByProvider, loading, hotGames, topProviders } = storeToRefs(store)
const { fetchCatalog, getProviderGames } = store

const activeCat = ref('hot')

const displayBanners = computed(() => {
  const apiList = systemStore.carouselList
  if (apiList?.length) {
    const fromApi = apiList.map(b => ({
      img: b.imageUrl || b.img || b.banner || '',
      title: b.title || b.name || '',
      route: b.targetValue || b.url || '/main/promo',
      targetType: b.targetType || 'none'
    })).filter(b => b.img)
    if (fromApi.length) return fromApi
  }
  return LOCAL_HOME_BANNERS
})

/** Próximo banner levemente visível (como no original), só com 2+ slides */
const carouselSlidesPerView = computed(() =>
  displayBanners.value.length > 1 ? 1.12 : 1
)

function onBannerClick(banner) {
  const r = banner.route
  if (!r) return
  if (/^https?:\/\//i.test(r)) {
    window.open(r, '_blank', 'noopener,noreferrer')
    return
  }
  router.push(r)
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

/** Sempre 2 caracteres dentro do hexágono (letras/números). */
function providerTwoLetters(code, displayName) {
  const c = (code || '').toLowerCase().trim()
  const mapped = providerLogos[c]
  const base = (mapped || displayName || code || '').toString().toUpperCase()
  const compact = base.replace(/[^A-Z0-9]/g, '')
  if (compact.length >= 2) return compact.slice(0, 2)
  if (compact.length === 1) return (compact + compact).slice(0, 2)
  return '??'
}

const displayCategories = computed(() => {
  const cats = [
    {
      id: 'hot',
      label: 'Popular',
      letters: 'PO',
    },
  ]
  const provs = providers.value.slice(0, 4)
  provs.forEach((p) => {
    const rawName = (p.name || p.code || '').trim()
    cats.push({
      id: p.code,
      label: rawName || p.code,
      letters: providerTwoLetters(p.code, rawName),
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
  tryOpenNovosRouletteWelcome()
})
</script>

<style scoped>
.home-page {
  display: flow-root;
  padding: .5rem .75rem 0;
  background: var(--color-home-lower-bg, #200943);
  /* Cartões / faixa marquee levemente escurecidos sobre o roxo */
  --ep-color-background-fill-surface-raised-L1: rgba(0, 0, 0, 0.22);
  --ep-color-background-fill-surface-raised-L2: rgba(0, 0, 0, 0.3);
  /* Carrossel: 2:1 (mais alto que 9:4); contain mantém a arte inteira. */
  --home-carousel-aspect: 2 / 1;
  --home-activity-tile-aspect: 3 / 1;
  --home-activity-wide-aspect: 6 / 1;
  --home-banner-radius: .75rem;
  /* Meio vertical dos hexágonos = padding-top da faixa + metade da altura do hex (igual .cat-hex-wrap) */
  --home-cat-pad-top: 0.65rem;
  --home-cat-hex-h: 4.625rem;
  --home-hex-split-y: calc(var(--home-cat-pad-top) + (var(--home-cat-hex-h) / 2));
  /* Faixa de mistura em torno do meio do hex (degradê suave entre os dois roxos) */
  --home-hex-blend-up: 1.75rem;
  --home-hex-blend-down: 2.1rem;
  --home-hex-blend-y0: max(0px, calc(var(--home-hex-split-y) - var(--home-hex-blend-up)));
  --home-hex-blend-y1: calc(var(--home-hex-split-y) + var(--home-hex-blend-down));
}

/* Faixa superior roxa (banner) alinhada à largura útil + colada ao header */
.home-hero-purple {
  background: var(--color-brand-purple-original, #650C96);
  margin: -0.5rem -0.75rem 0;
  padding: 0.5rem 0.75rem 0.5rem;
}

/* ── Carousel (Swiper) ── */
.carousel-wrapper {
  position: relative;
  margin: 0 0 .5rem;
  padding: 0 .25rem;
}
.banner-swiper {
  width: 100%;
  aspect-ratio: var(--home-carousel-aspect);
  border-radius: var(--home-banner-radius);
  overflow: hidden;
}
.carousel-slide {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  overflow: hidden;
  border-radius: var(--home-banner-radius);
  /* Mesmo roxo sólido da página — degradê #4a0a72 parecia “faixa escura” com contain */
  background: var(--color-brand-purple-original, #650C96);
}
.banner-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
  border-radius: var(--home-banner-radius);
}
.banner-swiper :deep(.swiper-pagination-bullet) {
  width: .375rem; height: .375rem; background: rgba(255,255,255,.4); opacity: 1;
}
.banner-swiper :deep(.swiper-pagination-bullet-active) {
  width: 1rem; border-radius: .1875rem; background: #fff;
}

/* ── Category Icons (hex + nome; tamanho ajustável) ── */
.category-icons {
  display: flex;
  gap: .75rem;
  overflow-x: auto;
  padding: var(--home-cat-pad-top) 0 .85rem;
  margin-left: -.75rem;
  margin-right: -.75rem;
  padding-left: .75rem;
  padding-right: .75rem;
  box-sizing: border-box;
  /* Degradê vertical: roxo vivo → #200943, centrado no meio dos hexágonos */
  background: linear-gradient(
    180deg,
    var(--color-brand-purple-original, #650C96) 0,
    var(--color-brand-purple-original, #650C96) var(--home-hex-blend-y0),
    var(--color-home-lower-bg, #200943) var(--home-hex-blend-y1),
    var(--color-home-lower-bg, #200943) 100%
  );
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.category-icons::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
.cat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  max-width: 6.75rem;
  cursor: pointer;
}
.cat-item:active .cat-hex-wrap { transform: scale(0.92); }
.cat-item.active .cat-hex-wrap {
  transform: scale(1.08);
  filter: brightness(1.15);
}

.cat-hex-wrap {
  width: var(--home-cat-hex-h);
  height: var(--home-cat-hex-h);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform .2s ease, filter .2s ease;
}
.cat-hex-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  clip-path: polygon(50% 2%, 93% 27%, 93% 73%, 50% 98%, 7% 73%, 7% 27%);
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.22) 0%,
      rgba(255, 255, 255, 0) 42%
    ),
    linear-gradient(
      128deg,
      #3d2a06 0%,
      #6b4810 14%,
      #a67418 28%,
      #e8c85a 44%,
      #fff6d8 49%,
      #d4a82a 54%,
      #8a5c0e 72%,
      #4a3208 100%
    );
  box-shadow: inset 0 0.08rem 0.12rem rgba(255, 255, 255, 0.35);
}
.cat-hex-bg.cat-hex-bg--image {
  background: url('/assets/ui/cat-hex-gold.png') center / cover no-repeat;
  box-shadow: inset 0 0.06rem 0.1rem rgba(255, 255, 255, 0.2);
}
.cat-hex-letters {
  position: relative;
  z-index: 1;
  font-size: 1.05rem;
  font-weight: 900;
  color: #1a0a2e;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
  letter-spacing: 0.02em;
  line-height: 1;
  user-select: none;
}
.cat-hex-name {
  display: block;
  width: 100%;
  margin-top: 0.45rem;
  padding: 0 0.15rem;
  font-size: 0.8125rem;
  font-weight: 800;
  color: #fff;
  text-align: center;
  line-height: 1.15;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  letter-spacing: 0.02em;
  white-space: normal;
  word-break: break-word;
  hyphens: auto;
}

/* ── Marquee + Search ── */
.marquee-search-row {
  display: flex;
  align-items: center;
  gap: .5rem;
  /* Menos padding em cima — números/texto ficam um pouco mais altos na faixa */
  padding: .2rem .625rem .6rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .5rem;
  margin: 0 0 .625rem;
  overflow: hidden;
  border: 1px solid var(--ep-color-border-default);
}
.marquee-dot {
  width: .5rem; height: .5rem; border-radius: 50%;
  background: var(--ep-accent-green, #17C964); flex-shrink: 0;
  animation: breathing 2s ease-in-out infinite;
}
.marquee-text-wrap {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  min-height: 1.25rem;
}
.marquee-text {
  display: inline-block;
  white-space: nowrap;
  animation: scroll-horizontal 20s linear infinite;
  font-size: .75rem;
  color: var(--ep-color-text-weaker);
  line-height: 1.15;
  position: relative;
  top: -0.25rem;
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

/* ── Activity Banners: quadrados 2:1; faixa full-width 4:1 (altura ≈ metade da largura / 2, igual ao tile) ── */
.activity-banners {
  margin: .35rem 0 .5rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
}
.activity-row-2 {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: .375rem;
  margin-bottom: .375rem;
}
.activity-img-card,
.activity-wide-card {
  position: relative;
  min-width: 0;
  border-radius: var(--home-banner-radius);
  overflow: hidden;
  cursor: pointer;
  transition: transform .15s ease;
  background: rgba(0, 0, 0, 0.18);
}
.activity-img-card {
  aspect-ratio: var(--home-activity-tile-aspect);
}
.activity-wide-card {
  width: 100%;
  aspect-ratio: var(--home-activity-wide-aspect);
}
.activity-img-card:active,
.activity-wide-card:active {
  transform: scale(0.97);
}
.activity-banner-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center center;
  pointer-events: none;
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
