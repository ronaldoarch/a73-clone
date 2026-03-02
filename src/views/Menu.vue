<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="menu-header-toolbar">
        <ion-buttons slot="start">
          <div class="menu-header-logo-wrap">
            <img :src="logoUrl" alt="A73" class="menu-header-logo" />
            <span class="menu-header-brand">{{ siteName }}</span>
          </div>
        </ion-buttons>
        <ion-buttons slot="end">
          <span class="menu-balance">R$ {{ balanceFormatted }}</span>
          <ion-button fill="clear" class="menu-header-btn" @click="$router.push('/main/entrar/')">
            <ion-icon name="wallet" />
          </ion-button>
          <ion-button fill="clear" class="menu-header-btn" @click="$router.push('/main/perfil/')">
            <ion-icon name="person" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="menu-content">
      <!-- Botões hexagonais -->
      <div class="menu-hex-row">
        <div class="menu-hex-item" @click="$router.push('/main/promo/')">
          <ion-icon name="trophy" class="menu-hex-icon" />
          <span class="menu-hex-label">Promoção</span>
        </div>
        <div class="menu-hex-item" @click="$router.push('/main/inicio/')">
          <ion-icon name="game-controller" class="menu-hex-icon" />
          <span class="menu-hex-label">Jogos</span>
        </div>
        <div class="menu-hex-item" @click="$router.push('/main/promo/')">
          <ion-icon name="extension-puzzle" class="menu-hex-icon" />
          <span class="menu-hex-label">Provedores</span>
        </div>
      </div>

      <!-- Banner Jackpot -->
      <div class="menu-jackpot">
        <div class="menu-jackpot-stripes"></div>
        <img :src="jackpotBg" alt="JACKPOT" class="menu-jackpot-bg" />
        <div class="menu-jackpot-value-wrap">
          <ion-icon name="chevron-back" class="menu-jackpot-arrow" />
          <span class="menu-jackpot-value">{{ jackpotFormatted }}</span>
          <ion-icon name="chevron-forward" class="menu-jackpot-arrow" />
          <ion-icon name="gift" class="menu-jackpot-coin" />
        </div>
      </div>

      <!-- Cards de ação -->
      <div class="menu-cards">
        <a
          v-for="item in menuItems"
          :key="item.label"
          href="#"
          class="menu-card a73-card-hover"
          @click.prevent="goTo(item.path)"
        >
          <ion-icon :name="item.icon" class="menu-card-icon" />
          <span class="menu-card-label">{{ item.label }}</span>
          <span class="menu-go-btn a73-shimmer">Go !</span>
        </a>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonContent, IonButtons, IonButton, IonIcon,
  onIonViewWillEnter
} from '@ionic/vue'
import { useRouter } from 'vue-router'
import jackpotBg from '@/assets/bg-36-ByTDysgk.png'
import { useSettings } from '@/composables/useSettings'
import { useAfiliado } from '@/composables/useAfiliado'

const { logoUrl, siteName } = useSettings()
const { balanceFormatted, refresh } = useAfiliado()
const router = useRouter()
const jackpotValue = ref(151095524.11)

function formatJackpot(val) {
  const n = Math.floor(val)
  const intPart = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const dec = Math.floor((val % 1) * 100)
  return `${intPart},${String(dec).padStart(2, '0')}`
}
const jackpotFormatted = computed(() => formatJackpot(jackpotValue.value))

const menuItems = [
  { label: 'Depósito', icon: 'wallet', path: '/main/entrar/' },
  { label: 'Saque', icon: 'bag', path: '/main/withdraw/' },
  { label: 'Bônus R$50', icon: 'gift', path: '/main/promo/' },
  { label: 'Comissão 5%', icon: 'cash', path: '/main/comissao/' },
  { label: 'Bônus VIP', icon: 'ribbon', path: '/main/vip/' },
  { label: 'Misterioso', icon: 'help-circle-outline', path: '/main/misterioso/' },
  { label: 'Resgate', icon: 'gift', path: '/main/promo/' },
  { label: 'Códigos', icon: 'pricetag', path: '/main/promo/' },
]

function goTo(path) {
  router.push(path)
}

onMounted(() => {
  if (localStorage.getItem('token')) refresh()
})
onIonViewWillEnter(() => {
  if (localStorage.getItem('token')) refresh()
})
</script>

<style scoped>
.menu-header-toolbar {
  --background: linear-gradient(135deg, #670d98 0%, #640c95 50%, #5B2875 100%);
  --color: #fff;
  --border-width: 0;
}
.menu-header-logo-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.menu-header-logo {
  height: 32px;
  width: auto;
  max-width: 48px;
  object-fit: contain;
  border-radius: 8px;
}
.menu-header-brand {
  font-family: var(--font-smooch);
  font-size: 1rem;
  font-weight: 700;
  color: #ff972f;
  text-shadow: 0 0 8px rgba(255, 151, 47, 0.5);
}
.menu-balance {
  font-family: var(--font-smooch);
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  margin-right: 8px;
}
.menu-header-btn {
  --color: #fff;
  --padding-start: 8px;
  --padding-end: 8px;
}
.menu-header-btn ion-icon {
  font-size: 22px;
}

.menu-content {
  --background: linear-gradient(180deg, #4D087B 0%, #5d108b 50%, #4D087B 100%);
}

/* Hexagonais */
.menu-hex-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px;
}
.menu-hex-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(245, 158, 11, 0.15));
  border: 1px solid rgba(251, 191, 36, 0.4);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  min-width: 72px;
  min-height: 82px;
  cursor: pointer;
  transition: filter 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.menu-hex-item:hover {
  filter: drop-shadow(0 6px 20px rgba(251, 191, 36, 0.5));
}
.menu-hex-icon {
  font-size: 32px;
  color: #FDD835;
  margin-bottom: 6px;
}
.menu-hex-label {
  font-family: var(--font-smooch);
  font-size: 0.7rem;
  font-weight: 600;
  color: #fff;
  text-align: center;
}

/* Jackpot */
.menu-jackpot {
  margin: 0 16px 16px;
  position: relative;
  overflow: hidden;
  min-height: 180px;
  border-radius: 24px;
  background: #4D087B;
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
}
.menu-jackpot-stripes {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 8px,
    rgba(0, 0, 0, 0.08) 8px,
    rgba(0, 0, 0, 0.08) 16px
  );
  z-index: 0;
}
.menu-jackpot-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  z-index: 1;
}
.menu-jackpot-value-wrap {
  position: absolute;
  bottom: 24px;
  left: 12px;
  right: 12px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.menu-jackpot-arrow {
  font-size: 24px;
  color: #fff;
}
.menu-jackpot-value {
  font-family: var(--font-smooch);
  font-size: 1.5rem;
  font-weight: 900;
  color: #FDD835;
  letter-spacing: 0.05em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
.menu-jackpot-coin {
  font-size: 24px;
  color: #FDD835;
}

/* Cards */
.menu-cards {
  padding: 0 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.menu-card {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: rgba(91, 33, 182, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  text-decoration: none;
  color: #fff;
  transition: background 0.2s ease;
}
.menu-card:hover {
  background: rgba(91, 33, 182, 0.7);
}
.menu-card-icon {
  font-size: 28px;
  color: #FDD835;
  margin-right: 14px;
  flex-shrink: 0;
}
.menu-card-label {
  flex: 1;
  font-family: var(--font-smooch);
  font-size: 0.95rem;
  font-weight: 600;
}
.menu-go-btn {
  font-family: var(--font-smooch);
  font-size: 0.75rem;
  font-weight: 800;
  color: #1a1a1a;
  background: #84cc16;
  padding: 8px 18px;
  border-radius: 10px;
  flex-shrink: 0;
  display: inline-block;
  position: relative;
}
</style>
