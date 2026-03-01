<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="deposit-toolbar">
        <ion-title class="deposit-title">
          <ion-icon name="wallet" class="deposit-title-icon" />
          Depósito
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="deposit-content">
      <!-- Não logado -->
      <div v-if="!isLoggedIn" class="deposit-login-prompt">
        <p>Faça login para realizar depósitos.</p>
        <ion-button expand="block" color="warning" @click="$router.push('/main/login/')">
          Entrar
        </ion-button>
      </div>

      <!-- Logado - Página de depósito completa -->
      <div v-else class="deposit-page">
        <!-- Suporte -->
        <p class="deposit-support-msg">
          Se você tiver dúvidas ou problemas, entre em contato com o suporte ao cliente. Obrigado!
        </p>
        <a href="#" class="deposit-support-link" @click.prevent="openSupport">
          <ion-icon name="headset" />
          suporte online.
        </a>

        <!-- Depósito on-line -->
        <div class="deposit-online-wrap">
          <span class="deposit-reco-badge">RECO</span>
          <ion-button class="deposit-online-btn" expand="block" @click="selectOnlineDeposit">
            Depósito on-line
          </ion-button>
        </div>

        <div class="deposit-divider"></div>

        <!-- Pagamento -->
        <h3 class="deposit-section-title">Pagamento</h3>
        <ion-button class="deposit-pix-btn" fill="outline" @click="selectPix">
          <ion-icon name="flame" class="pix-flame" />
          PIX
        </ion-button>

        <!-- Montante -->
        <h3 class="deposit-section-title">Montante</h3>
        <div class="deposit-amount-display">
          R$ {{ amountDisplay }}
        </div>

        <!-- Texto PIX -->
        <p class="deposit-pix-promo">
          🏠 Para garantir mais agilidade, pague via PIX! 🔥⚡ É rápido, seguro e a confirmação sai em segundos! 💰 Aproveite ao máximo os jogos e boa sorte nos ganhos! 🌸🌸🌸
        </p>

        <!-- Valores pré-definidos -->
        <div class="deposit-amounts-grid">
          <button
            v-for="val in presetAmounts"
            :key="val"
            type="button"
            class="deposit-amount-btn"
            :class="{ active: selectedAmount === val }"
            @click="selectAmount(val)"
          >
            {{ formatAmount(val) }}
          </button>
        </div>

        <!-- Botão depositar -->
        <ion-button class="deposit-now-btn" expand="block" @click="doDeposit">
          Depositar Agora
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  onIonViewWillEnter
} from '@ionic/vue'
import { useAfiliado } from '@/composables/useAfiliado'
import { useToast } from '@/composables/useToast'

const { registrarDeposito } = useAfiliado()
const toast = useToast()
const isLoggedIn = ref(!!localStorage.getItem('token'))

function checkLogin() {
  isLoggedIn.value = !!localStorage.getItem('token')
}
onMounted(checkLogin)
onIonViewWillEnter(checkLogin)

const presetAmounts = [10, 30, 50, 100, 500, 1000, 5000, 10000, 50000]
const selectedAmount = ref(10)
const minAmount = 10
const maxAmount = 50000

const amountDisplay = computed(() => {
  return `${selectedAmount.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
})

function formatAmount(val) {
  return val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

function selectAmount(val) {
  selectedAmount.value = val
}

function selectPix() {
  // PIX já selecionado por padrão
}

function selectOnlineDeposit() {
  // Abre fluxo de depósito online
}

function doDeposit() {
  const valor = selectedAmount.value
  registrarDeposito(valor)
  toast.success(`Depósito de R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} registrado!`)
}

function openSupport() {
  window.open('https://wa.me/', '_blank')
}
</script>

<style scoped>
.deposit-toolbar {
  --background: var(--bg);
  --color: #fff;
  border-bottom: 1px solid var(--border);
}
.deposit-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-smooch);
  font-weight: 800;
  font-size: 1.4rem;
}
.deposit-title-icon {
  font-size: 1.5rem;
  color: #fbbf24;
}
.deposit-content {
  --background: var(--bg);
}

.deposit-login-prompt {
  padding: 32px 20px;
  text-align: center;
}
.deposit-login-prompt p {
  color: var(--text);
  margin-bottom: 20px;
}

.deposit-page {
  padding: 20px 16px 32px;
}
.deposit-support-msg {
  color: #fff;
  font-size: 0.9rem;
  margin: 0 0 8px 0;
  line-height: 1.4;
}
.deposit-support-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #f97316;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  margin-bottom: 24px;
}
.deposit-support-link ion-icon {
  font-size: 1.1rem;
  color: #fbbf24;
}

.deposit-online-wrap {
  position: relative;
  margin-bottom: 24px;
}
.deposit-reco-badge {
  position: absolute;
  top: -4px;
  right: 16px;
  z-index: 1;
  background: #f97316;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}
.deposit-online-btn {
  --background: var(--color-bg-100);
  --color: #fff;
  --border-radius: 12px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  font-weight: 700;
  font-size: 1rem;
  border: 1px solid rgba(168, 85, 247, 0.5);
}

.deposit-divider {
  height: 1px;
  background: rgba(255,255,255,0.15);
  margin: 0 0 20px 0;
}

.deposit-section-title {
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 12px 0;
}
.deposit-pix-btn {
  --border-color: rgba(168, 85, 247, 0.6);
  --color: #fff;
  --padding-start: 16px;
  --padding-end: 16px;
  margin-bottom: 24px;
  border-radius: 10px;
}
.pix-flame {
  margin-right: 6px;
  color: #f97316;
}

.deposit-amount-display {
  background: var(--color-bg-100);
  border: 1px solid rgba(168, 85, 247, 0.5);
  border-radius: 10px;
  padding: 14px 16px;
  color: #f97316;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.deposit-pix-promo {
  color: #fff;
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0 0 24px 0;
  opacity: 0.95;
}

.deposit-amounts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}
.deposit-amount-btn {
  background: var(--color-bg-100);
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 10px;
  padding: 12px 8px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.deposit-amount-btn:hover,
.deposit-amount-btn.active {
  border-color: #a855f7;
  background: rgba(168, 85, 247, 0.2);
  box-shadow: 0 0 12px rgba(168, 85, 247, 0.3);
}

.deposit-now-btn {
  --background: #84cc16;
  --background-hover: #a3e635;
  --background-activated: #65a30d;
  --color: #fff;
  font-weight: 800;
  font-size: 1.1rem;
  --padding-top: 16px;
  --padding-bottom: 16px;
  border-radius: 12px;
}
</style>
