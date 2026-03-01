<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="perfil-toolbar">
        <ion-title>Perfil</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="perfil-content">
      <!-- Não logado -->
      <div v-if="!isLoggedIn" class="perfil-login-prompt">
        <p>Faça login para acessar seu perfil.</p>
        <ion-button expand="block" color="warning" @click="$router.push('/main/login/')">
          Entrar
        </ion-button>
        <ion-button expand="block" fill="outline" @click="$router.push('/main/register/')">
          Registro R$ +99
        </ion-button>
      </div>

      <!-- Logado - Dashboard do perfil -->
      <div v-else class="perfil-dashboard">
        <!-- Info do usuário -->
        <div class="perfil-user-section">
          <div class="perfil-avatar">👤</div>
          <div class="perfil-user-info">
            <span class="perfil-phone">{{ account }}</span>
            <span class="perfil-vip-badge">VIP 0</span>
            <span class="perfil-id">ID {{ userId }}</span>
            <button type="button" class="perfil-copy-btn" @click="copyId" aria-label="Copiar ID">
              📋
            </button>
          </div>
        </div>

        <!-- Saldo e bônus -->
        <div class="perfil-balance-section">
          <div class="perfil-balance-wrap">
            <span class="perfil-balance-label">Saldo</span>
            <span class="perfil-balance-value">R$ {{ balance }}</span>
            <ion-icon name="refresh" class="perfil-refresh" @click="refreshBalance" />
          </div>
          <span class="perfil-bonus">O bônus recebido hoje: {{ bonusToday }}</span>
        </div>

        <!-- Botões Depósito e Saque -->
        <div class="perfil-actions">
          <ion-button class="perfil-action-btn" @click="$router.push('/main/entrar/')">
            <ion-icon name="wallet" />
            Depósito
          </ion-button>
          <ion-button class="perfil-action-btn" @click="showSaqueModal = true">
            <ion-icon name="cash" />
            Saque
          </ion-button>
        </div>

        <!-- VIP -->
        <div class="perfil-vip-section">
          <div class="perfil-vip-header">
            <div class="perfil-vip-level-row">
              <span class="perfil-vip-badge-card">
                <ion-icon name="shield-outline" class="perfil-vip-shield" />
                VIP 0
              </span>
              <span class="perfil-vip-nivel-label">Nível Atual</span>
            </div>
            <button type="button" class="perfil-vip-detalhes-btn">
              Detalhes VIP
              <ion-icon name="chevron-forward" class="perfil-vip-arrow" />
            </button>
          </div>
          <div class="perfil-vip-progress-row">
            <span class="perfil-vip-badge-card perfil-vip-badge-start">
              <ion-icon name="shield-outline" class="perfil-vip-shield" />
              VIP 0
            </span>
            <div class="perfil-vip-bar">
              <div class="perfil-vip-progress" :style="{ width: vipProgress + '%' }"></div>
            </div>
            <span class="perfil-vip-badge-card perfil-vip-badge-end">
              <ion-icon name="shield-outline" class="perfil-vip-shield" />
              VIP 1
            </span>
          </div>
          <div class="perfil-vip-criteria-block">
            <h4 class="perfil-vip-criteria-title">Critérios de Promoção</h4>
            <p class="perfil-vip-criteria-text">
              • Aposta necessária: <strong class="perfil-vip-value-orange">{{ currentWager }}</strong>
              <span class="perfil-vip-value-muted">({{ currentWager }}/{{ requiredWager }})</span>
            </p>
          </div>
        </div>

        <!-- Menu de opções -->
        <div class="perfil-menu">
          <a href="#" class="perfil-menu-item" @click.prevent="$router.push('/main/centro-mensagens/')">
            <span class="perfil-menu-left">
              <ion-icon name="headset" />
              Suporte
            </span>
            <span class="perfil-menu-badge">4</span>
            <ion-icon name="chevron-forward" />
          </a>
          <a href="#" class="perfil-menu-item" @click.prevent="$router.push('/main/relatorios/')">
            <ion-icon name="document-text" />
            Relatórios
            <ion-icon name="chevron-forward" />
          </a>
          <a href="#" class="perfil-menu-item" @click.prevent="$router.push('/main/convidar/')">
            <ion-icon name="heart" />
            <span>
              Convidar
              <small>Convide 1 pessoa ganhe R$ 50 com comissão da agência de até 5%</small>
            </span>
            <ion-icon name="chevron-forward" />
          </a>
          <a href="#" class="perfil-menu-item">
            <ion-icon name="pricetag" />
            Código de Resgate
            <ion-icon name="chevron-forward" />
          </a>
          <a href="#" class="perfil-menu-item">
            <ion-icon name="shield-checkmark" />
            Centro de Segurança
            <ion-icon name="chevron-forward" />
          </a>
          <button type="button" class="perfil-menu-item perfil-logout" @click="logout">
            <ion-icon name="log-out" />
            Sair
          </button>
        </div>
      </div>
    </ion-content>

    <!-- Modal senha de fundo (ao clicar em Saque) - overlay fora do ion-content -->
    <div v-if="showSaqueModal" class="fund-password-overlay" @click.self="showSaqueModal = false">
      <div class="fund-password-modal-content">
        <div class="fund-password-modal-logo">
          <img src="/logo-senha-fundo.png" alt="Logo" />
        </div>
        <div class="fund-password-modal-body">
          <p class="fund-password-modal-text">
            Para a segurança dos seus fundos,<br />
            por favor, configure primeiro uma<br />
            senha de fundo
          </p>
          <ion-button class="fund-password-modal-btn" expand="block" @click="onConfirmarSenhaFundo">
            Confirmar
          </ion-button>
        </div>
      </div>
    </div>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  onIonViewWillEnter
} from '@ionic/vue'

const router = useRouter()
const account = computed(() => localStorage.getItem('account') || '')
const userId = ref('4180019537')
const isLoggedIn = ref(!!localStorage.getItem('token'))
const balance = ref('0,00')
const bonusToday = ref('0,00')
const currentWager = ref('0,00')
const requiredWager = ref('100,00')
const vipProgress = ref(0)
const showSaqueModal = ref(false)

function onConfirmarSenhaFundo() {
  showSaqueModal.value = false
  router.push('/main/saque-senha/')
}

function checkLogin() {
  isLoggedIn.value = !!localStorage.getItem('token')
}
onMounted(checkLogin)
onIonViewWillEnter(checkLogin)

function copyId() {
  navigator.clipboard?.writeText(userId.value)
}
function refreshBalance() {
  // placeholder
}
function openSupport() {
  window.open('https://wa.me/', '_blank')
}
function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('account')
  router.push('/main/inicio/')
  window.location.reload()
}
</script>

<style scoped>
.perfil-toolbar {
  --background: var(--bg);
  --color: #fff;
  border-bottom: 1px solid var(--border);
}
.perfil-content {
  --background: var(--bg);
}

.perfil-login-prompt {
  padding: 32px 20px;
  text-align: center;
}
.perfil-login-prompt p {
  color: var(--text);
  margin-bottom: 20px;
}

.perfil-dashboard {
  padding: 16px;
}
.perfil-user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.perfil-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-bg-100);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}
.perfil-user-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
}
.perfil-phone {
  font-weight: 700;
  color: #fff;
  font-size: 1rem;
}
.perfil-vip-badge {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: #000;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 4px;
}
.perfil-id {
  font-size: 0.8rem;
  color: var(--text-muted);
}
.perfil-copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0 4px;
}

.perfil-balance-section {
  background: var(--color-bg-100);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}
.perfil-balance-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.perfil-balance-label {
  color: var(--text-muted);
  font-size: 0.9rem;
}
.perfil-balance-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fbbf24;
}
.perfil-refresh {
  font-size: 1.2rem;
  color: var(--text-muted);
  cursor: pointer;
}
.perfil-bonus {
  display: block;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 8px;
}

.perfil-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.perfil-action-btn {
  flex: 1;
  --background: #6d28d9;
  --color: #fff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.perfil-action-btn ion-icon {
  font-size: 1.3rem;
  color: #fbbf24;
}

.perfil-vip-section {
  background: #2D2B30;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
}
.perfil-vip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.perfil-vip-level-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.perfil-vip-badge-card {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #5C5C5C;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 20px;
}
.perfil-vip-shield {
  font-size: 1rem;
  color: #c0c0c0;
}
.perfil-vip-nivel-label {
  color: #e5e5e5;
  font-size: 0.85rem;
}
.perfil-vip-detalhes-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #5E2B87;
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}
.perfil-vip-arrow {
  color: #fbbf24;
  font-size: 0.9rem;
}
.perfil-vip-progress-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}
.perfil-vip-badge-start {
  flex-shrink: 0;
}
.perfil-vip-badge-end {
  flex-shrink: 0;
}
.perfil-vip-bar {
  flex: 1;
  height: 6px;
  background: #6b6b6b;
  border-radius: 3px;
  overflow: hidden;
}
.perfil-vip-progress {
  height: 100%;
  background: linear-gradient(90deg, #a855f7, #f59e0b);
  border-radius: 3px;
  transition: width 0.3s ease;
}
.perfil-vip-criteria-block {
  padding-top: 4px;
}
.perfil-vip-criteria-title {
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}
.perfil-vip-criteria-text {
  font-size: 0.85rem;
  color: #e5e5e5;
  margin: 0;
}
.perfil-vip-value-orange {
  color: #f59e0b;
  font-weight: 700;
}
.perfil-vip-value-muted {
  color: #b0b0b0;
  font-weight: 400;
}

.perfil-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.perfil-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--color-bg-100);
  border-radius: 10px;
  color: #fff;
  text-decoration: none;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 0.95rem;
  cursor: pointer;
}
.perfil-menu-item ion-icon:first-of-type {
  font-size: 1.2rem;
  color: var(--primary);
  flex-shrink: 0;
}
.perfil-menu-item ion-icon:last-of-type {
  margin-left: auto;
  font-size: 1rem;
  color: var(--text-muted);
}
.perfil-menu-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}
.perfil-menu-badge {
  background: #ef4444;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}
.perfil-menu-item small {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 2px;
}
.perfil-logout {
  color: #ef4444;
}
.perfil-logout ion-icon {
  color: #ef4444 !important;
}

/* Modal senha de fundo */
.fund-password-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.fund-password-modal-content {
  background: #4a3d6b;
  border-radius: 20px;
  overflow: hidden;
  max-width: 340px;
  width: 100%;
}
.fund-password-modal-logo {
  width: 100%;
  aspect-ratio: 1.2;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
}
.fund-password-modal-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.fund-password-modal-body {
  padding: 24px 20px 28px;
  text-align: center;
}
.fund-password-modal-text {
  color: #fff;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0 0 24px 0;
}
.fund-password-modal-btn {
  --background: #a3e635;
  --color: #1f2937;
  font-weight: 700;
  font-size: 1rem;
  --border-radius: 12px;
  height: 48px;
}
</style>
