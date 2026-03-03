<template>
  <ion-page>
    <!-- Banner "Baixe Nosso APP" no topo -->
    <div v-if="showAppBanner" class="app-download-banner">
      <ion-icon name="download-outline" class="app-banner-icon" />
      <span class="app-banner-text">Baixe Nosso APP, Ganhe Super Prêmios!</span>
      <ion-button size="small" color="warning" class="instalar-btn" @click="installApp">Instalar</ion-button>
      <ion-button fill="clear" size="small" class="close-banner" @click="closeBanner">✕</ion-button>
    </div>

    <ion-header>
      <ion-toolbar class="header-toolbar header-gradient">
        <ion-buttons slot="start">
          <div class="header-logo-wrap">
            <img :src="logoUrl" alt="" class="header-logo" />
            <span class="header-site-name">{{ siteName }}</span>
          </div>
        </ion-buttons>
        <ion-buttons slot="end">
          <template v-if="!isLoggedIn">
            <ion-button @click="$router.push('/main/login/')" class="btn-entrar">ENTRAR</ion-button>
            <ion-button @click="$router.push('/main/register/')" class="btn-registro">Registro R$ <span class="registro-plus">+99</span></ion-button>
          </template>
          <template v-else>
            <span class="header-balance" @click="$router.push('/main/perfil/')">R$ {{ balanceFormatted }}</span>
            <ion-button @click="$router.push('/main/perfil/')" class="btn-perfil">
              <ion-icon name="person-circle-outline" />
            </ion-button>
          </template>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="inicio-content">
      <!-- Ticker de ganhos recentes -->
      <div class="inicio-ticker-wrap">
        <div class="inicio-ticker-track">
          <span v-for="(g, i) in tickerGanhos" :key="i" class="inicio-ticker-item">
            Usuário {{ g.user }} ganhou R$ {{ g.amount }}
          </span>
          <span v-for="(g, i) in tickerGanhos" :key="'dup-' + i" class="inicio-ticker-item">
            Usuário {{ g.user }} ganhou R$ {{ g.amount }}
          </span>
        </div>
      </div>

      <!-- Banner principal / Carrossel - formato VIP neon -->
      <div class="banner-section banner-carousel">
        <div class="banner-neon-frame">
          <div class="banner-slide active">
            <img :src="bannerUrl" alt="Banner A73" class="banner-img" />
            <div class="banner-overlay">
              <span class="banner-text-main">COM AMIGOS COMPARTILHE R$100</span>
              <ion-button size="small" color="warning" class="banner-saque-btn">SAQUE RÁPIDO</ion-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Segmentos hexagonais (Popular + provedores iGameWin) -->
      <div class="hexagon-row">
        <div class="hex-item hex-active" @click="goToJogos()">
          <img src="/assets/hot-platform-36-gold.svg" alt="Popular" class="hex-icon-svg" />
          <span class="hex-label">Popular</span>
        </div>
        <div
          v-for="p in providersForDisplay"
          :key="p.code"
          class="hex-item"
          @click="goToJogos(p.code)"
        >
          <div class="hex-provider-logo">{{ p.logo }}</div>
          <span class="hex-label">{{ p.logo }}</span>
        </div>
      </div>

      <!-- Caixa do Tesouro -->
      <div class="caixa-tesouro" @click="$router.push('/main/register/')">
        <ion-icon name="gift" class="caixa-icon" />
        <div class="caixa-text-wrap">
          <div class="caixa-text-scroll">
            <span class="caixa-text">Caixa do Tesouro! Convide amigos e ganhe R$ 1 milhão! Não perca! Cadastre-se agora</span>
            <span class="caixa-text">Caixa do Tesouro! Convide amigos e ganhe R$ 1 milhão! Não perca! Cadastre-se agora</span>
          </div>
        </div>
        <ion-icon name="chevron-forward" class="caixa-arrow" />
      </div>

      <!-- Banners promocionais (GIFs) -->
      <div class="promo-banners">
        <div class="promo-card convide">
          <img src="/images/download.gif" alt="GANHE 1 SAQUE R$650" class="promo-card-img" />
        </div>
        <div class="promo-card vip">
          <img src="/images/download/anim2.gif" alt="VIP" class="promo-card-img" />
        </div>
      </div>

      <!-- Banner BÔNUS LOGIN -->
      <div class="bonus-login-banner">
        <img src="/images/download/anim1.gif" alt="BÔNUS LOGIN ATÉ R$899" class="bonus-login-img" />
      </div>

      <!-- Seção Popular (Games 100+) -->
      <div class="popular-section-header">
        <div class="popular-title-wrap">
          <ion-icon name="flame" class="popular-flame" />
          <span class="popular-title">Popular</span>
          <span class="popular-badge">Games 100+</span>
        </div>
        <a href="#" class="popular-todos" @click.prevent="goToJogos()">Todos &gt;</a>
      </div>

      <!-- Jackpot: números na imagem, moedas ao redor -->
      <div v-if="showJackpot" class="jackpot-section jackpot-with-coins">
        <div class="jackpot-float-coins">
          <img v-for="i in 6" :key="i" :src="jackpotCoin" alt="" class="jackpot-coin-float" :style="{ '--delay': (i - 1) * 0.5 + 's' }" />
        </div>
        <div class="jackpot-stripes"></div>
        <img :src="jackpotBg" alt="JACKPOT" class="jackpot-bg-img" />
        <!-- Mina Misteriosa -->
        <div class="mina-misteriosa-card" @click="$router.push('/main/roleta/')">
          <div class="mina-misteriosa-img-wrap">
            <img src="/images/mina-misteriosa.png" alt="Mina Misteriosa" class="mina-misteriosa-img" />
            <span class="mina-misteriosa-timer">{{ minaTimerFormatted }}</span>
          </div>
        </div>
        <span class="jackpot-hot">MEGA MILIONÁRIO</span>
        <!-- Moeda ao redor da imagem do jackpot -->
        <img :src="jackpotCoin" alt="" class="jackpot-coin-around" aria-hidden="true" />
        <!-- Números diretamente na imagem (sem card) -->
        <div class="jackpot-value-overlay">
          <ion-icon name="chevron-back" class="jackpot-arrow jackpot-arrow-left" aria-hidden="true" />
          <span class="jackpot-timer">{{ jackpotValueFormatted }}</span>
          <ion-icon name="chevron-forward" class="jackpot-arrow jackpot-arrow-right" aria-hidden="true" />
        </div>
      </div>

      <!-- Provedores e Jogos (iGameWin) -->
      <div class="games-catalog-section">
        <h2 class="games-catalog-title">Jogos</h2>
        <div v-if="catalogLoading" class="games-catalog-loading">Carregando jogos...</div>
        <div v-else-if="catalogError" class="games-catalog-error">
          {{ catalogError }}
          <button class="games-retry-btn" @click="loadCatalog(true)">Tentar novamente</button>
        </div>
        <div v-else-if="!catalogProviders.length" class="games-catalog-empty">
          Nenhum jogo disponível. No Admin: salve as credenciais (API de Jogos) e desmarque Sandbox.
          <br />Se o proxy estiver configurado (BACKEND_URL, VITE_API_URL vazio), os jogos aparecerão aqui.
          <button class="games-retry-btn" @click="loadCatalog(true)">Atualizar</button>
        </div>
        <template v-else>
          <!-- Blocos por provedor -->
          <div v-for="prov in catalogProviders" :key="prov.code" class="games-provider-block">
            <div class="games-provider-header">
              <h3 class="games-provider-title">{{ prov.name }}</h3>
              <button
                v-if="(catalogGamesByProvider[prov.code] || []).length > GAMES_PREVIEW"
                class="games-ver-todos-btn"
                @click="goToJogos(prov.code)"
              >
                Ver todos
                <ion-icon name="chevron-forward" />
              </button>
            </div>
            <div class="games-provider-line"></div>
            <div class="games-grid">
              <div
                v-for="g in getGamesToShow(prov.code)"
                :key="g.game_code"
                class="game-card"
                @click="launchGame(prov.code, g.game_code)"
              >
                <div class="game-card-banner">
                  <img v-if="g.banner" :src="g.banner" :alt="g.game_name" loading="lazy" />
                  <div v-else class="game-card-placeholder">{{ g.game_name?.slice(0, 2) || '?' }}</div>
                </div>
                <span class="game-card-name">{{ g.game_name }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Ranking de Lucro -->
      <div class="ranking-section">
        <div class="ranking-header">
          <span class="ranking-trophy">🏆</span>
          <div class="ranking-line-bar"></div>
          <h3 class="ranking-title">* Ranking de Lucro *</h3>
        </div>
        <div class="ranking-top3">
          <div v-if="rankingTop3[1]" class="rank-card rank-2">
            <div class="rank-avatar">👦</div>
            <span class="rank-user">{{ rankingTop3[1].user }}</span>
            <span class="rank-amount">{{ rankingTop3[1].amount }}</span>
            <span class="rank-badge rank-badge-2">2nd</span>
          </div>
          <div v-if="rankingTop3[0]" class="rank-card rank-1">
            <div class="rank-avatar">👨</div>
            <span class="rank-user">{{ rankingTop3[0].user }}</span>
            <span class="rank-amount">{{ rankingTop3[0].amount }}</span>
            <span class="rank-badge rank-badge-1">1st</span>
          </div>
          <div v-if="rankingTop3[2]" class="rank-card rank-3">
            <div class="rank-avatar">👩</div>
            <span class="rank-user">{{ rankingTop3[2].user }}</span>
            <span class="rank-amount">{{ rankingTop3[2].amount }}</span>
            <span class="rank-badge rank-badge-3">3rd</span>
          </div>
        </div>
        <div class="ranking-list">
          <div class="ranking-list-header">
            <span>Posição</span>
            <span>Membro</span>
            <span>Quantia</span>
          </div>
          <div class="ranking-list-scroll-view" v-if="rankingListRest.length">
            <div class="ranking-list-scroll-track">
              <div class="ranking-list-scroll-group" v-for="g in 2" :key="g">
                <div class="ranking-list-row" v-for="(r, i) in rankingListRest" :key="g + '-' + i">
                  <span class="rank-pos">{{ String(r.pos).padStart(2, '0') }}</span>
                  <span class="rank-member"><span class="rank-avatar-sm">👤</span> {{ r.user }}</span>
                  <span class="rank-qty">{{ r.amount }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="ranking-list-empty">{{ rankingLoading ? 'Carregando...' : 'Aguarde mais apostas para o ranking' }}</div>
        </div>
      </div>

      <!-- Imagem abaixo do ranking - carrossel infinito -->
      <div class="support-image-wrap" @click="openSupport">
        <div class="carousel-track">
          <img src="/images/download.jpg" alt="Suporte" class="support-banner-img" />
          <img src="/images/download.jpg" alt="" class="support-banner-img" aria-hidden="true" />
          <img src="/images/download.jpg" alt="" class="support-banner-img" aria-hidden="true" />
        </div>
      </div>

      <!-- Baixar App - igual na imagem -->
      <div class="download-section">
        <div class="download-content-wrap">
          <div class="download-text-wrap">
            <h3 class="download-title-new">Baixar o aplicativo</h3>
            <p class="download-desc">Baixe e instale o aplicativo no seu desktop para uma experiência de jogo mais fluida</p>
          </div>
          <img src="/images/papai-noel-download.png" alt="Papai Noel" class="download-santa-img" />
        </div>
        <div class="download-buttons-wrap">
          <ion-button class="download-platform-btn" @click="downloadAndroid">
            <ion-icon name="logo-android" />
            <span>Android</span>
          </ion-button>
          <ion-button class="download-platform-btn" @click="downloadIos">
            <ion-icon name="logo-apple" />
            <span>iOS</span>
          </ion-button>
        </div>
      </div>

      <!-- Provedores e Pagamentos (iGameWin) - carrossel animado -->
      <div class="providers-section">
        <div class="providers-carousel-wrap">
          <div class="providers-carousel-track">
            <div class="provider-card" v-for="p in providersForDisplay" :key="p.code" @click="goToJogos(p.code)">
              <div class="provider-logo">{{ p.logo }}</div>
              <span class="provider-name">{{ p.name }}</span>
            </div>
            <div class="provider-card" v-for="p in providersForDisplay" :key="'dup-' + p.code" @click="goToJogos(p.code)">
              <div class="provider-logo">{{ p.logo }}</div>
              <span class="provider-name">{{ p.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Intro / splash bottom -->
      <div class="intro-section">
        <img src="/images/intro.png" alt="A73" class="intro-img" />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonContent, IonButton, IonButtons, IonIcon, IonLabel,
  onIonViewWillEnter
} from '@ionic/vue'
import jackpotBg from '@/assets/bg-36-ByTDysgk.png'
import jackpotCoin from '@/assets/coin-36-DzGEC43m.png'
import { useRouter } from 'vue-router'
import { useSettings } from '@/composables/useSettings'
import { useAfiliado } from '@/composables/useAfiliado'
import { useGamesCatalog } from '@/composables/useGamesCatalog'
import { useRanking } from '@/composables/useRanking'
import { igamewinApi } from '@/api/igamewin'

const router = useRouter()
const { logoUrl, bannerUrl, siteName } = useSettings()
const { balanceFormatted, refresh } = useAfiliado()
const { top3: rankingTop3, list: rankingList, loading: rankingLoading, load: loadRanking } = useRanking()
const { providers: catalogProviders, gamesByProvider: catalogGamesByProvider, homeProviders, loading: catalogLoading, error: catalogError, load: loadCatalog } = useGamesCatalog()
const GAMES_PREVIEW = 30
function getGamesToShow(provCode) {
  const games = catalogGamesByProvider.value[provCode] || []
  return games.slice(0, GAMES_PREVIEW)
}
function goToJogos(providerCode) {
  router.push({ path: '/main/jogos/', query: providerCode ? { provider: providerCode } : {} })
}
const isLoggedIn = ref(!!localStorage.getItem('token'))
function checkLogin() {
  isLoggedIn.value = !!localStorage.getItem('token')
}
const showAppBanner = ref(true)
const showJackpot = ref(true)
const tickerGanhos = [
  { user: '42****71', amount: '1.234' },
  { user: '39****88', amount: '567' },
  { user: '45****12', amount: '2.890' },
  { user: '41****33', amount: '890' },
  { user: '48****55', amount: '5.432' },
]
const jackpotValue = ref(113713477.19)
const minaTimerSeconds = ref(32 * 60 + 20) // 32min 20s
let minaTimerInterval = null
let jackpotBurstInterval = null
let jackpotPauseTimeout = null

function formatJackpot(val) {
  const n = Math.floor(val)
  const intPart = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const dec = Math.floor((val % 1) * 100)
  return `${intPart},${String(dec).padStart(2, '0')}`
}
const jackpotValueFormatted = computed(() => formatJackpot(jackpotValue.value))
function formatMinaTimer(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}
const minaTimerFormatted = computed(() => formatMinaTimer(minaTimerSeconds.value))

const rankingListRest = computed(() => (rankingList.value || []).slice(3))

const providersForDisplay = computed(() => {
  const list = catalogProviders.value.map(p => ({
    code: p.code,
    name: p.name,
    logo: p.code.length <= 3 ? p.code : p.code.slice(0, 2)
  }))
  const selected = homeProviders.value
  if (!selected || selected.length === 0) return list
  return list.filter(p => selected.includes(p.code))
})

function openSupport() {
  window.open('https://wa.me/', '_blank')
}

function runJackpotBurst() {
  if (!showJackpot.value) return
  jackpotBurstInterval = setInterval(() => {
    jackpotValue.value += 50 + Math.floor(Math.random() * 150)
  }, 80)
  jackpotPauseTimeout = setTimeout(() => {
    clearInterval(jackpotBurstInterval)
    jackpotBurstInterval = null
    jackpotPauseTimeout = setTimeout(runJackpotBurst, 5000)
  }, 2000)
}

function launchGame(providerCode, gameCode) {
  const userCode = localStorage.getItem('account') || 'guest'
  igamewinApi.gameLaunch(userCode, providerCode, gameCode).then((data) => {
    if (data?.status === 1 && data?.launch_url) {
      window.location.href = data.launch_url
    }
  })
}

onMounted(() => {
  checkLogin()
  if (isLoggedIn.value) refresh()
  loadCatalog()
  loadRanking()
  if (localStorage.getItem('a73_app_banner_hidden') === '1') {
    showAppBanner.value = false
  }
  if (showJackpot.value) {
    runJackpotBurst()
  }
  minaTimerInterval = setInterval(() => {
    if (minaTimerSeconds.value > 0) minaTimerSeconds.value--
    else minaTimerSeconds.value = 32 * 60 + 20
  }, 1000)
})

onIonViewWillEnter(() => {
  checkLogin()
  if (isLoggedIn.value) refresh()
})

onUnmounted(() => {
  if (jackpotBurstInterval) clearInterval(jackpotBurstInterval)
  if (jackpotPauseTimeout) clearTimeout(jackpotPauseTimeout)
  if (minaTimerInterval) clearInterval(minaTimerInterval)
})

function closeJackpot() {
  showJackpot.value = false
  localStorage.setItem('a73_jackpot_hidden', '1')
  if (jackpotBurstInterval) {
    clearInterval(jackpotBurstInterval)
    jackpotBurstInterval = null
  }
  if (jackpotPauseTimeout) {
    clearTimeout(jackpotPauseTimeout)
    jackpotPauseTimeout = null
  }
}

function installApp() {
  if (window.__deferredPrompt) {
    window.__deferredPrompt.prompt()
    window.__deferredPrompt.userChoice.then(() => { window.__deferredPrompt = null })
  } else if (window.__webAppInstall) {
    window.__webAppInstall()
  } else {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    if (isIOS) {
      alert('Toque em Compartilhar e depois em "Adicionar à Tela de Início" para instalar o app.')
    } else {
      alert('Use o menu do navegador (⋮) e selecione "Instalar app" ou "Adicionar à tela inicial".')
    }
  }
}
function downloadAndroid() { installApp() }
function downloadIos() { installApp() }

function closeBanner() {
  showAppBanner.value = false
  localStorage.setItem('a73_app_banner_hidden', '1')
}
</script>

<style scoped>
.app-download-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  margin: 8px 16px 0;
  background: linear-gradient(90deg, rgba(139,92,246,0.35), rgba(168,85,247,0.2), rgba(255,255,255,0.08));
  border-radius: 20px;
  border: 1px solid rgba(139,92,246,0.3);
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.2);
  gap: 10px;
}
.app-banner-text {
  font-family: var(--font-smooch);
  flex: 1;
  font-size: 0.85rem;
  color: var(--text);
  font-weight: 500;
}
.instalar-btn {
  --background: var(--primary);
  --color: #000;
  font-weight: 700;
  text-transform: uppercase;
  flex-shrink: 0;
}
.close-banner {
  --color: var(--text-muted);
  min-width: 32px;
}

.header-toolbar {
  --background: var(--card);
  --color: var(--text);
  --border-color: var(--border);
  border-bottom: 1px solid var(--border);
}
.header-toolbar.header-gradient {
  --background: linear-gradient(135deg, #670d98 0%, #640c95 50%, #5B2875 100%);
  background: linear-gradient(135deg, #670d98 0%, #640c95 50%, #5B2875 100%);
}
.header-logo-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.header-site-name {
  font-family: var(--font-smooch);
  font-size: 1.1rem;
  font-weight: 700;
  color: #ff972f;
  text-shadow: 0 0 8px rgba(255, 151, 47, 0.5);
}
.header-logo {
  height: 52px;
  width: auto;
  max-width: 120px;
  object-fit: contain;
  border-radius: 10px;
}
.btn-entrar {
  --background: rgba(59, 52, 102, 0.9);
  --color: #fff;
  --border-width: 1px;
  --border-style: solid;
  --border-color: rgba(167, 139, 250, 0.6);
  font-family: var(--font-smooch);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  margin-right: 8px;
}
.btn-registro {
  --background: #fbbf24;
  --color: #fff;
  font-family: var(--font-smooch);
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
}
.registro-plus {
  color: #fef08a;
  font-weight: 800;
}
.btn-perfil {
  --background: rgba(59, 52, 102, 0.9);
  --color: #fff;
  --border-width: 1px;
  --border-style: solid;
  --border-color: rgba(167, 139, 250, 0.6);
  font-size: 0.8rem;
  font-weight: 600;
}
.btn-perfil ion-icon {
  vertical-align: middle;
}
.header-balance {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  margin-right: 8px;
  background: rgba(59, 52, 102, 0.9);
  border: 1px solid rgba(167, 139, 250, 0.6);
  border-radius: 12px;
  color: #22c55e;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
}

.inicio-content {
  --background: var(--bg);
}

/* Ticker de ganhos recentes */
.inicio-ticker-wrap {
  overflow: hidden;
  padding: 8px 0;
  background: linear-gradient(90deg, rgba(251,191,36,0.15), rgba(168,85,247,0.1));
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.inicio-ticker-track {
  display: flex;
  gap: 32px;
  animation: inicio-ticker-scroll 25s linear infinite;
  width: max-content;
}
.inicio-ticker-item {
  font-size: 0.8rem;
  color: #fbbf24;
  white-space: nowrap;
  font-weight: 600;
}
@keyframes inicio-ticker-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.banner-section {
  position: relative;
  width: 100%;
  padding: 12px 16px;
}
.banner-neon-frame {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  border: 2px solid transparent;
  background: linear-gradient(var(--bg), var(--bg)) padding-box,
    linear-gradient(135deg, #ec4899, #a855f7, #6366f1, #ec4899) border-box;
  box-shadow:
    0 0 20px rgba(236, 72, 153, 0.5),
    0 0 40px rgba(168, 85, 247, 0.35),
    0 0 60px rgba(99, 102, 241, 0.2),
    inset 0 0 30px rgba(99, 102, 241, 0.08);
}
.banner-slide {
  position: relative;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
  border-radius: 22px;
}
.banner-img {
  width: 100%;
  height: auto;
  min-height: 180px;
  max-height: 280px;
  object-fit: cover;
  display: block;
  opacity: 0.95;
  border-radius: 20px;
}
.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 14px 18px;
  background: linear-gradient(transparent, rgba(0,0,0,0.75));
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
}
.banner-text-main {
  font-family: var(--font-smooch);
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-shadow: 0 0 10px rgba(168, 85, 247, 0.5), 0 1px 2px rgba(0,0,0,0.5);
}
.banner-saque-btn {
  --background: linear-gradient(135deg, #ec4899, #a855f7);
  --color: #fff;
  font-family: var(--font-smooch);
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  box-shadow: 0 0 15px rgba(236, 72, 153, 0.5);
}

.hexagon-row {
  display: flex;
  gap: 12px;
  padding: 16px;
  overflow-x: auto;
  flex-wrap: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.hexagon-row::-webkit-scrollbar { display: none; }
.hex-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 12px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(245, 158, 11, 0.15));
  border: 1px solid rgba(251, 191, 36, 0.4);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  min-width: 64px;
  min-height: 74px;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  transition: filter 0.2s ease;
}
.hex-item.hex-active {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.4), rgba(245, 158, 11, 0.3));
  border: 2px solid #fbbf24;
  box-shadow: inset 0 0 0 2px #fbbf24;
  filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.5));
}
.hex-item:hover {
  filter: drop-shadow(0 6px 20px rgba(0, 0, 0, 0.6));
}
.hex-icon-svg {
  width: 32px;
  height: 32px;
  object-fit: contain;
  margin-bottom: 4px;
}
.hex-item:not(.hex-active) .hex-icon-svg {
  filter: brightness(0.85);
  opacity: 0.9;
}
.hex-label {
  font-family: var(--font-smooch);
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
}
.hex-provider-logo {
  font-size: 1.1rem;
  font-weight: 800;
  color: #fbbf24;
  margin-bottom: 4px;
}
.hex-icon-ion {
  font-size: 36px;
  color: #FDD835;
  margin-bottom: 6px;
}
.hex-label {
  font-family: var(--font-smooch);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text);
}
.site-oficial {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  color: var(--text-muted);
  font-size: 0.8rem;
}
.heart-icon {
  font-size: 1rem;
  color: #ef4444;
}
.site-oficial-sub {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.75rem;
  margin: 0 0 16px 0;
  padding: 0 16px;
}

/* Caixa do Tesouro */
.caixa-tesouro {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 16px 16px;
  padding: 14px 16px;
  background: linear-gradient(90deg, rgba(139,92,246,0.4), rgba(168,85,247,0.25));
  border-radius: 20px;
  border: 1px solid rgba(139,92,246,0.5);
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.25);
  cursor: pointer;
}
.caixa-icon {
  font-size: 1.5rem;
  color: var(--primary);
  flex-shrink: 0;
}
.caixa-text-wrap {
  flex: 1;
  overflow: hidden;
  height: 1.4em;
  min-height: 22px;
  display: flex;
  align-items: center;
}
.caixa-text-scroll {
  animation: caixa-text-up 8s linear infinite;
}
.caixa-text {
  display: block;
  font-family: var(--font-smooch);
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
  padding: 0.1em 0;
  white-space: nowrap;
}
@keyframes caixa-text-up {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
.caixa-arrow {
  font-size: 1.2rem;
  color: var(--primary);
  flex-shrink: 0;
}

.promo-banners {
  display: flex;
  gap: 12px;
  padding: 0 16px 16px;
  overflow: hidden;
}
.promo-card {
  flex: 1 1 0;
  min-width: 0;
  height: 105px;
  border-radius: 22px;
  overflow: hidden;
  border: 2px solid transparent;
  background: linear-gradient(#1a1a2e, #1a1a2e) padding-box,
    linear-gradient(135deg, #ec4899, #a855f7, #6366f1) border-box;
  box-shadow:
    0 0 20px rgba(236, 72, 153, 0.45),
    0 0 35px rgba(168, 85, 247, 0.3),
    0 0 50px rgba(99, 102, 241, 0.15);
}
.promo-card.convide {
  background: linear-gradient(#1a1a2e, #1a1a2e) padding-box,
    linear-gradient(135deg, #f97316, #ec4899, #a855f7) border-box;
  box-shadow:
    0 0 20px rgba(249, 115, 22, 0.5),
    0 0 35px rgba(236, 72, 153, 0.3),
    0 0 50px rgba(168, 85, 247, 0.2);
}
.promo-card.vip {
  box-shadow:
    0 0 20px rgba(168, 85, 247, 0.5),
    0 0 35px rgba(236, 72, 153, 0.35),
    0 0 50px rgba(99, 102, 241, 0.2);
}
.promo-card-img {
  width: 100%;
  height: 105px;
  object-fit: cover;
  object-position: center top;
  display: block;
}
.promo-card-content {
  padding: 14px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.promo-title {
  font-family: var(--font-smooch);
  font-size: 0.7rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.35;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
.promo-title.convide-title {
  font-size: 0.65rem;
}
.promo-highlight {
  font-size: 1.1em;
  font-weight: 900;
  color: #fffbeb;
  text-shadow: 0 0 4px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.5);
}
.promo-vip-badge {
  font-family: var(--font-smooch);
  font-size: 1.4rem;
  font-weight: 900;
  color: #fbbf24;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  margin-bottom: 4px;
}
.vip-countdown {
  font-family: var(--font-smooch);
  font-size: 1rem;
  font-weight: 800;
  color: #fbbf24;
  margin-top: 6px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.bonus-login-banner {
  margin: 0 16px 24px;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  background: linear-gradient(#1a1a2e, #1a1a2e) padding-box,
    linear-gradient(135deg, #ec4899, #a855f7, #6366f1) border-box;
  box-shadow:
    0 0 20px rgba(236, 72, 153, 0.45),
    0 0 35px rgba(168, 85, 247, 0.3),
    0 0 50px rgba(99, 102, 241, 0.15);
}
.bonus-login-img {
  width: 100%;
  display: block;
  object-fit: cover;
  vertical-align: top;
}

/* Seção Popular */
.popular-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 12px;
  margin-top: 4px;
}
.popular-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.popular-flame {
  font-size: 1.2rem;
  color: #fbbf24;
}
.popular-title {
  font-family: var(--font-smooch);
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}
.popular-badge {
  font-size: 0.7rem;
  color: var(--text-muted);
  background: rgba(255,255,255,0.1);
  padding: 2px 8px;
  border-radius: 6px;
  margin-left: 4px;
}
.popular-todos {
  font-size: 0.85rem;
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.bonus-text {
  font-family: var(--font-smooch);
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
.bonus-amount {
  display: inline-block;
  font-size: 1.5em;
  font-weight: 900;
  color: #fce7f3;
  text-shadow: 0 0 2px #fff, 0 0 4px #fff, 0 2px 4px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3);
}

/* Jackpot - igual ao original (banner JACKPOT, painel valor, MEGA MILIONÁRIO) */
.jackpot-section {
  margin: 0 16px 16px;
  padding: 0;
  width: 100%;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
  background: #4D087B;
  border-radius: 24px;
  box-shadow:
    0 0 20px rgba(168, 85, 247, 0.4),
    0 0 40px rgba(77, 8, 123, 0.5);
  position: relative;
  overflow: hidden;
  min-height: 240px;
  padding-bottom: 4px;
}
.jackpot-with-coins {
  overflow: visible;
}
.jackpot-float-coins {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}
.jackpot-coin-float {
  position: absolute;
  width: 28px;
  height: 28px;
  opacity: 0.5;
  animation: a73-coin-float 4s ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}
.jackpot-coin-float:nth-child(1) { top: 10%; left: 5%; }
.jackpot-coin-float:nth-child(2) { top: 20%; right: 8%; }
.jackpot-coin-float:nth-child(3) { bottom: 25%; left: 10%; }
.jackpot-coin-float:nth-child(4) { bottom: 15%; right: 12%; }
.jackpot-coin-float:nth-child(5) { top: 50%; left: 3%; }
.jackpot-coin-float:nth-child(6) { top: 60%; right: 5%; }
.jackpot-stripes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 8px,
    rgba(0, 0, 0, 0.08) 8px,
    rgba(0, 0, 0, 0.08) 16px
  );
  z-index: 0;
  pointer-events: none;
}
.jackpot-bg-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  z-index: 1;
  pointer-events: none;
}
@keyframes mina-bounce-shake {
  0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
  10% { transform: translateY(-4px) translateX(-1px) rotate(-1deg); }
  20% { transform: translateY(-2px) translateX(1px) rotate(1deg); }
  30% { transform: translateY(-5px) translateX(0) rotate(0deg); }
  40% { transform: translateY(-2px) translateX(1px) rotate(0.5deg); }
  50% { transform: translateY(-4px) translateX(-1px) rotate(-0.5deg); }
  60% { transform: translateY(-4px) translateX(1px) rotate(1deg); }
  70% { transform: translateY(-2px) translateX(-1px) rotate(-1deg); }
  80% { transform: translateY(-5px) translateX(0) rotate(0deg); }
  90% { transform: translateY(-3px) translateX(1px) rotate(0.5deg); }
}
.mina-misteriosa-card {
  cursor: pointer;
  position: fixed;
  top: 450px;
  left: 12px;
  z-index: 999;
  width: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}
.mina-misteriosa-img-wrap {
  position: relative;
  width: 100%;
  animation: mina-bounce-shake 2s ease-in-out infinite;
}
.mina-misteriosa-img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}
.mina-misteriosa-timer {
  position: absolute;
  bottom: 8%;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 800;
  color: #FDD835;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.5);
}
.jackpot-hot {
  position: absolute;
  top: 0;
  right: 0;
  background: #dc2626;
  color: #fff;
  font-size: 0.55rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 0 0 0 4px;
  letter-spacing: 0.05em;
  z-index: 3;
}
.jackpot-value-overlay {
  position: absolute;
  bottom: 64px;
  left: 12px;
  right: 12px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0;
  background: transparent;
}
.jackpot-arrow {
  font-size: 32px;
  flex-shrink: 0;
}
/* Seta esquerda: branca, design simples e plano */
.jackpot-arrow-left {
  color: #fff;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}
/* Seta direita: dourada com efeito glossy/metálico */
.jackpot-arrow-right {
  color: #FDD835;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 8px rgba(253, 216, 53, 0.6)) brightness(1.1);
}
.jackpot-coin-around {
  position: absolute;
  top: 50%;
  right: 8px;
  width: 480px;
  height: 480px;
  object-fit: contain;
  z-index: 2;
  pointer-events: none;
  transform: translateY(-50%);
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 12px rgba(253, 216, 53, 0.4));
}
.jackpot-timer {
  font-family: var(--font-smooch);
  font-size: 2.2rem;
  font-weight: 900;
  color: #FDD835;
  letter-spacing: 0.08em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Provedores e Jogos (iGameWin) */
.games-catalog-section {
  margin: 0 16px 24px;
  padding: 0;
}
.games-catalog-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--primary, #f59e0b);
  margin: 0 0 16px 0;
}
.games-catalog-loading,
.games-catalog-error,
.games-catalog-empty {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
}
.games-catalog-error { color: var(--danger, #ef4444); }
.games-catalog-empty { font-size: 0.9rem; }
.games-retry-btn {
  display: block;
  margin: 12px auto 0;
  padding: 8px 16px;
  background: var(--primary, #f59e0b);
  color: #000;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.games-provider-block {
  margin-bottom: 24px;
}
.games-provider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.games-provider-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #FDD835;
  margin: 0;
}
.games-ver-todos-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: var(--primary, #f59e0b);
  color: #000;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}
.games-ver-todos-btn ion-icon {
  font-size: 1rem;
}
.games-provider-line {
  height: 1px;
  background: linear-gradient(90deg, var(--border, #2a2a3a), transparent);
  margin-bottom: 12px;
}
.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}
.game-card {
  background: var(--card, #1a1a24);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border, #2a2a3a);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.game-card:active { transform: scale(0.98); }
.game-card-banner {
  aspect-ratio: 1;
  overflow: hidden;
  background: rgba(0,0,0,0.3);
}
.game-card-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.game-card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary, #f59e0b) 0%, var(--card, #1a1a24) 100%);
  color: #000;
  font-weight: 700;
  font-size: 1.25rem;
}
.game-card-name {
  display: block;
  padding: 6px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text, #e5e7eb);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Ranking de Lucro - estilo bandeirolas */
.ranking-section {
  margin: 0 16px 24px;
  padding: 20px 16px;
  background: var(--color-bg-100);
  border-radius: 12px;
  border: 1px solid var(--border);
}
.ranking-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.ranking-trophy {
  font-size: 1.4rem;
}
.ranking-line-bar {
  width: 100%;
  max-width: 120px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #fbbf24, transparent);
}
.ranking-title {
  font-family: var(--font-smooch);
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  text-align: center;
  margin: 0;
}
.ranking-top3 {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 20px;
}
.rank-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 12px;
  border-radius: 14px;
  min-width: 90px;
  position: relative;
  border: none;
}
.rank-card.rank-1 {
  background: linear-gradient(180deg, #92400e, #78350f);
  order: 2;
  transform: translateY(-12px) scale(1.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}
.rank-card.rank-2 {
  background: linear-gradient(180deg, #1e3a5f, #1e40af);
  order: 1;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}
.rank-card.rank-3 {
  background: linear-gradient(180deg, #78350f, #92400e);
  order: 3;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}
.rank-avatar {
  font-size: 2rem;
  margin-bottom: 6px;
}
.rank-user {
  font-size: 0.7rem;
  color: #fff;
  margin-bottom: 4px;
}
.rank-amount {
  font-family: var(--font-smooch);
  font-size: 0.85rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 8px;
}
.rank-badge {
  font-size: 0.7rem;
  font-weight: 800;
  color: #fff;
  padding: 4px 12px;
  border-radius: 8px;
  margin-top: 4px;
}
.rank-badge-1 { background: #78350f; }
.rank-badge-2 { background: #1e40af; }
.rank-badge-3 { background: #92400e; }
.ranking-list {
  border-top: 1px solid rgba(251,191,36,0.3);
  padding-top: 12px;
}
.ranking-list-scroll-view {
  overflow: hidden;
  max-height: 180px;
}
.ranking-list-scroll-track {
  animation: ranking-scroll-up 15s linear infinite;
}
.ranking-list-scroll-track:hover {
  animation-play-state: paused;
}
.ranking-list-scroll-group {
  display: block;
}
@keyframes ranking-scroll-up {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
.ranking-list-empty {
  padding: 16px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.ranking-list-header {
  display: grid;
  grid-template-columns: 50px 1fr 90px;
  gap: 8px;
  padding: 0 8px 8px;
  font-size: 0.7rem;
  color: var(--text-muted);
}
.ranking-list-row {
  display: grid;
  grid-template-columns: 50px 1fr 90px;
  gap: 8px;
  padding: 10px 8px;
  font-size: 0.8rem;
  color: #fff;
  align-items: center;
}
.rank-avatar-sm { font-size: 1rem; margin-right: 4px; }

/* Provedores e Pagamentos - carrossel animado */
.providers-section {
  margin: 0 16px 24px;
  padding: 20px 0;
}
.providers-carousel-wrap {
  overflow: hidden;
  padding: 12px 0;
}
.providers-carousel-track {
  display: flex;
  gap: 8px;
  width: max-content;
  animation: providers-carousel-scroll 20s linear infinite;
}
.providers-carousel-track:hover {
  animation-play-state: paused;
}
.provider-card {
  flex: 0 0 75px;
  min-width: 75px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: var(--color-bg-100);
  border-radius: 12px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.provider-card:active {
  transform: scale(0.97);
}
@keyframes providers-carousel-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.provider-logo {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 8px;
}
.provider-name {
  font-size: 0.6rem;
  color: var(--text);
  text-align: center;
  line-height: 1.2;
}
/* Imagem abaixo do ranking - carrossel infinito */
.support-image-wrap {
  margin: 0 16px 20px;
  padding: 0 4px;
  cursor: pointer;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.2);
}
.carousel-track {
  display: flex;
  width: max-content;
  animation: carousel-scroll 4s linear infinite;
}
.carousel-track:hover {
  animation-play-state: paused;
}
@keyframes carousel-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-33.333%); }
}
.support-banner-img {
  width: 280px;
  height: 100px;
  flex-shrink: 0;
  display: block;
  object-fit: cover;
  object-position: center;
  border-radius: 16px;
}

/* Download Section - igual na imagem */
.download-section {
  margin: 0 16px 24px;
  padding: 24px 20px;
  background: linear-gradient(135deg, #c2410c 0%, #ea580c 30%, #7c3aed 70%, #4D087B 100%);
  border-radius: 24px;
  border: none;
  box-shadow:
    0 0 20px rgba(234, 88, 12, 0.35),
    0 0 40px rgba(124, 58, 237, 0.3);
}
.download-content-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
.download-text-wrap {
  flex: 1;
  min-width: 0;
}
.download-title-new {
  font-family: var(--font-smooch);
  font-size: 1.5rem;
  font-weight: 900;
  color: #fff;
  margin: 0 0 8px 0;
  line-height: 1.2;
}
.download-desc {
  font-size: 0.9rem;
  color: #fff;
  margin: 0;
  line-height: 1.4;
  opacity: 0.95;
}
.download-santa-img {
  width: 120px;
  height: auto;
  flex-shrink: 0;
  object-fit: contain;
  object-position: center;
}
.download-buttons-wrap {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.download-platform-btn {
  flex: 1;
  --background: #4D087B;
  --color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
}
.download-platform-btn ion-icon {
  font-size: 1.4rem;
}
.download-platform-btn:first-child ion-icon {
  color: #3ddc84;
}

/* Intro Section */
.intro-section {
  display: flex;
  justify-content: center;
  padding: 0 16px 32px;
}
.intro-img {
  width: 100%;
  max-width: 320px;
  height: auto;
  object-fit: contain;
  border-radius: 12px;
}
</style>
