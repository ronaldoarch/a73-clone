<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="vip-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="$router.back()">
            <ion-icon name="chevron-back" />
          </ion-button>
        </ion-buttons>
        <ion-title>VIP</ion-title>
        <ion-buttons slot="end">
          <ion-button>
            <ion-icon name="document-text" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="vip-content">
      <!-- Status atual -->
      <div class="vip-status">
        <div class="vip-status-top">
          <div class="vip-status-level">
            <ion-icon name="shield-checkmark" class="vip-shield" />
            <span>VIP {{ nivelAtual }}</span>
            <span class="vip-nivel-label">Nível Atual</span>
          </div>
          <ion-button class="vip-btn-coletar a73-shimmer" fill="solid" @click="coletar">
            Coletar Tudo
          </ion-button>
        </div>
        <div class="vip-progress-wrap">
          <span class="vip-progress-label">Critérios de Promoção</span>
          <span class="vip-progress-text">Aposta necessária: <strong class="vip-destaque">{{ apostaAtual }}</strong> ({{ apostaAtual }}/{{ apostaProximo }})</span>
          <div class="vip-progress-bar">
            <div class="vip-progress-fill" :style="{ width: progresso + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Lista de níveis VIP -->
      <h3 class="vip-lista-titulo">Lista de níveis VIP</h3>

      <!-- Tabs -->
      <div class="vip-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="vip-tab"
          :class="{ active: tabAtivo === tab.id }"
          @click="tabAtivo = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tabela VIP -->
      <div class="vip-tabela">
        <div class="vip-tabela-header">
          <span>Nível</span>
          <span>Aposta necessária</span>
          <span>Bônus</span>
        </div>
        <div
          v-for="nivel in niveisVipFormatados"
          :key="nivel.nivel"
          class="vip-tabela-row"
        >
          <div class="vip-nivel-cell">
            <ion-icon name="shield-checkmark" class="vip-row-shield" />
            <span>VIP {{ nivel.nivel }}</span>
          </div>
          <span class="vip-aposta-cell">{{ nivel.aposta }}</span>
          <span class="vip-bonus-cell">{{ nivel.bonus }}</span>
        </div>
      </div>

      <!-- Botão reclamar -->
      <div class="vip-btn-reclamar-wrap a73-shimmer">
        <ion-button class="vip-btn-reclamar" expand="block" @click="reclamar">
          Reclamar Recompensa de Upgrade
        </ion-button>
      </div>

      <!-- Instruções -->
      <div class="vip-instrucoes">
        <h4 class="vip-instrucoes-titulo">Instruções sobre regras VIP</h4>
        <div class="vip-instrucoes-texto">
          <p><strong>Padrão de promoção:</strong> Atendendo aos requisitos de promoção VIP (recargas ou apostas efetivas), você pode avançar ao nível VIP correspondente e receber o bônus de promoção. O bônus pode ser recebido periodicamente.</p>
          <p><strong>Bônus Diário:</strong> Ao cumprir os requisitos de depósito e apostas válidas do nível atual, você receberá o bônus diário correspondente. Se avançar vários níveis consecutivamente, apenas o bônus diário do nível atual será concedido. Bônus em tempo real podem ser reclamados.</p>
          <p><strong>Bônus Semanal:</strong> Similar ao bônus diário, mas para apostas válidas semanais e bônus semanal. Se avançar vários níveis consecutivamente, apenas o bônus semanal do nível atual será concedido. Bônus em tempo real podem ser reclamados.</p>
          <p><strong>Bônus Mensal:</strong> Ao cumprir os requisitos de depósito e apostas válidas do nível atual a cada mês, você receberá o bônus mensal correspondente. Se avançar vários níveis consecutivamente, apenas o bônus mensal do nível atual será concedido. Bônus em tempo real podem ser reclamados.</p>
          <p><strong>Tempo de Expiração da Recompensa:</strong> As recompensas devem ser reclamadas manualmente. Bônus expirados e não reclamados serão imediatamente invalidados.</p>
          <p><strong>Instruções para auditoria:</strong> O bônus VIP só pode ser sacado após cumprir requisito de rollover de 1x (apostas auditadas ou válidas). As apostas do bônus são limitadas a slots dos provedores: PG, JDB, PP, CP, FaChai, POPOK, PLAYSON, RUBYPLAY, inout, PANDA, Spribe, FASTSPIN, Tada, G759.</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { confetti } from '@/utils/confetti'
import { useAfiliado } from '@/composables/useAfiliado'
import { useToast } from '@/composables/useToast'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons
} from '@ionic/vue'

const { vipProgresso, niveisVip, podeColetarVip, coletarVip, fmt } = useAfiliado()
const toast = useToast()

const tabAtivo = ref('bonus')
const nivelAtual = computed(() => useAfiliado().nivelVip.value)
const apostaAtual = computed(() => vipProgresso.value.apostaAtual)
const apostaProximo = computed(() => vipProgresso.value.apostaProximo)
const progresso = computed(() => vipProgresso.value.progresso)

const tabs = [
  { id: 'bonus', label: 'Bônus' },
  { id: 'diario', label: 'Bônus Diário' },
  { id: 'semanal', label: 'Bônus Semanal' },
  { id: 'mensal', label: 'Bônus Mensal' },
]

const niveisVipFormatados = niveisVip.map(n => ({
  nivel: n.nivel,
  aposta: fmt(n.aposta),
  bonus: fmt(n.bonus),
}))

function coletar() {
  if (coletarVip()) {
    confetti()
    toast.success('Bônus VIP coletado!')
  } else {
    toast.warning('Nenhum bônus disponível para coletar.')
  }
}
function reclamar() {
  if (coletarVip()) {
    confetti()
    toast.success('Recompensa de upgrade reclamada!')
  } else {
    toast.warning('Requisitos não atendidos ou bônus já reclamado.')
  }
}
</script>

<style scoped>
.vip-toolbar {
  --background: #2d1f4e;
  --color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.vip-toolbar ion-button {
  --color: #fff;
}

.vip-content {
  --background: linear-gradient(180deg, #310d54 0%, #4a148c 30%, #310d54 100%);
}

.vip-status {
  margin: 16px;
  padding: 16px;
  background: rgba(91, 33, 182, 0.5);
  border-radius: 20px;
  border: 1px solid rgba(168, 85, 247, 0.4);
}
.vip-status-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.vip-status-level {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.vip-shield {
  font-size: 28px;
  color: #fbbf24;
}
.vip-status-level span:first-of-type {
  font-size: 1.2rem;
  font-weight: 800;
  color: #fff;
}
.vip-nivel-label {
  font-size: 0.85rem;
  color: #9ca3af;
  margin-left: 4px;
}
.vip-btn-coletar {
  --background: #22c55e;
  --color: #fff;
  font-weight: 700;
  border-radius: 12px;
}
.vip-progress-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.vip-progress-label {
  color: #9ca3af;
  font-size: 0.85rem;
}
.vip-progress-text {
  color: #e5e7eb;
  font-size: 0.9rem;
}
.vip-destaque {
  color: #f97316;
}
.vip-progress-bar {
  height: 8px;
  background: rgba(0,0,0,0.3);
  border-radius: 4px;
  overflow: hidden;
}
.vip-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f97316, #fbbf24);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.vip-lista-titulo {
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 16px 12px;
}

.vip-tabs {
  display: flex;
  gap: 4px;
  padding: 0 16px 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.vip-tab {
  flex-shrink: 0;
  background: rgba(91, 33, 182, 0.5);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 12px;
  padding: 10px 14px;
  color: #9ca3af;
  font-size: 0.85rem;
  cursor: pointer;
}
.vip-tab.active {
  background: rgba(168, 85, 247, 0.4);
  border-color: #fbbf24;
  color: #fef3c7;
  font-weight: 700;
  border-bottom: 2px solid #fbbf24;
}

.vip-tabela {
  margin: 0 16px 20px;
  background: rgba(91, 33, 182, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  overflow: hidden;
}
.vip-tabela-header {
  display: grid;
  grid-template-columns: 1.2fr 1.2fr 1fr;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(0,0,0,0.2);
  color: #9ca3af;
  font-size: 0.85rem;
}
.vip-tabela-row {
  display: grid;
  grid-template-columns: 1.2fr 1.2fr 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  color: #e5e7eb;
  font-size: 0.9rem;
}
.vip-tabela-row:last-child {
  border-bottom: none;
}
.vip-nivel-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.vip-row-shield {
  font-size: 1.2rem;
  color: #fbbf24;
}
.vip-aposta-cell {
  color: #e5e7eb;
}
.vip-bonus-cell {
  color: #f97316;
  font-weight: 700;
}

.vip-btn-reclamar-wrap {
  margin: 0 16px 24px;
  position: relative;
  border-radius: 16px;
}
.vip-btn-reclamar {
  --background: #84cc16;
  --color: #1a1a1a;
  font-weight: 700;
  border-radius: 16px;
  height: 48px;
}

.vip-instrucoes {
  margin: 0 16px 32px;
  padding: 20px;
  background: rgba(91, 33, 182, 0.3);
  border-radius: 16px;
  border: 1px solid rgba(168, 85, 247, 0.3);
}
.vip-instrucoes-titulo {
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 16px 0;
}
.vip-instrucoes-texto {
  color: #e5e7eb;
  font-size: 0.9rem;
  line-height: 1.6;
}
.vip-instrucoes-texto p {
  margin: 0 0 12px 0;
}
.vip-instrucoes-texto p:last-child {
  margin-bottom: 0;
}
</style>
