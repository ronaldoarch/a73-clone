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

      <!-- Tabela VIP ou painel periódico -->
      <div v-if="tabAtivo === 'bonus'" class="vip-tabela">
        <div class="vip-tabela-header">
          <span>Nível</span>
          <span>Aposta necessária</span>
          <span>Bônus Upgrade</span>
        </div>
        <div v-for="nivel in niveisVipFormatados" :key="nivel.nivel" class="vip-tabela-row">
          <div class="vip-nivel-cell">
            <ion-icon name="shield-checkmark" class="vip-row-shield" />
            <span>VIP {{ nivel.nivel }}</span>
          </div>
          <span class="vip-aposta-cell">{{ nivel.aposta }}</span>
          <span class="vip-bonus-cell">{{ nivel.bonus }}</span>
        </div>
      </div>

      <div v-else-if="tabAtivo === 'diario'" class="vip-periodico-panel">
        <div class="vip-tabela">
          <div class="vip-tabela-header"><span>Nível</span><span>Bônus Diário</span></div>
          <div v-for="nivel in niveisVipPeriodico" :key="nivel.nivel" class="vip-tabela-row">
            <div class="vip-nivel-cell"><ion-icon name="shield-checkmark" class="vip-row-shield" /><span>VIP {{ nivel.nivel }}</span></div>
            <span class="vip-bonus-cell">R$ {{ nivel.diario }}</span>
          </div>
        </div>
        <div class="vip-btn-reclamar-wrap a73-shimmer">
          <ion-button class="vip-btn-reclamar" expand="block" :disabled="!podeColetarVipDiario" @click="coletarDiario">
            {{ podeColetarVipDiario ? `Coletar Bônus Diário (R$ ${fmt(vipDiarioDisp)})` : 'Já coletado hoje' }}
          </ion-button>
        </div>
      </div>

      <div v-else-if="tabAtivo === 'semanal'" class="vip-periodico-panel">
        <div class="vip-tabela">
          <div class="vip-tabela-header"><span>Nível</span><span>Bônus Semanal</span></div>
          <div v-for="nivel in niveisVipPeriodico" :key="nivel.nivel" class="vip-tabela-row">
            <div class="vip-nivel-cell"><ion-icon name="shield-checkmark" class="vip-row-shield" /><span>VIP {{ nivel.nivel }}</span></div>
            <span class="vip-bonus-cell">R$ {{ nivel.semanal }}</span>
          </div>
        </div>
        <div class="vip-btn-reclamar-wrap a73-shimmer">
          <ion-button class="vip-btn-reclamar" expand="block" :disabled="!podeColetarVipSemanal" @click="coletarSemanal">
            {{ podeColetarVipSemanal ? `Coletar Bônus Semanal (R$ ${fmt(vipSemanalDisp)})` : 'Já coletado esta semana' }}
          </ion-button>
        </div>
      </div>

      <div v-else-if="tabAtivo === 'mensal'" class="vip-periodico-panel">
        <div class="vip-tabela">
          <div class="vip-tabela-header"><span>Nível</span><span>Bônus Mensal</span></div>
          <div v-for="nivel in niveisVipPeriodico" :key="nivel.nivel" class="vip-tabela-row">
            <div class="vip-nivel-cell"><ion-icon name="shield-checkmark" class="vip-row-shield" /><span>VIP {{ nivel.nivel }}</span></div>
            <span class="vip-bonus-cell">R$ {{ nivel.mensal }}</span>
          </div>
        </div>
        <div class="vip-btn-reclamar-wrap a73-shimmer">
          <ion-button class="vip-btn-reclamar" expand="block" :disabled="!podeColetarVipMensal" @click="coletarMensal">
            {{ podeColetarVipMensal ? `Coletar Bônus Mensal (R$ ${fmt(vipMensalDisp)})` : 'Já coletado este mês' }}
          </ion-button>
        </div>
      </div>

      <!-- Botão reclamar upgrade (visível só na aba bônus) -->
      <div v-if="tabAtivo === 'bonus'" class="vip-btn-reclamar-wrap a73-shimmer">
        <ion-button class="vip-btn-reclamar" expand="block" @click="reclamar">
          Reclamar Recompensa de Upgrade
        </ion-button>
      </div>

      <!-- Rollover pendente -->
      <div v-if="rolloverPendente > 0" class="vip-rollover-aviso">
        <ion-icon name="information-circle" />
        Rollover restante: <strong>R$ {{ fmt(rolloverPendente) }}</strong> em apostas para liberar saque.
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

const {
  vipProgresso, niveisVip, podeColetarVip, coletarVip, fmt,
  coletarVipDiario, coletarVipSemanal, coletarVipMensal,
  podeColetarVipDiario, podeColetarVipSemanal, podeColetarVipMensal,
  rolloverPendente, vipDiarioDisp, vipSemanalDisp, vipMensalDisp
} = useAfiliado()
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

const BONUS_DIARIO  = [0, 0.10, 0.30, 0.50, 0.80, 1.50, 2.00, 3.00,  8.00,  13.00,  18.00,  28.00,  38.00,  43.00,  48.00,  53.00]
const BONUS_SEMANAL = [0, 0.50, 1.00, 2.00, 3.00, 5.00, 7.00, 10.00, 30.00,  50.00,  70.00, 110.00, 150.00, 170.00, 190.00, 210.00]
const BONUS_MENSAL  = [0, 1.00, 3.00, 5.00, 8.00, 15.00, 20.00, 30.00, 80.00, 130.00, 180.00, 280.00, 380.00, 430.00, 480.00, 530.00]

const niveisVipFormatados = niveisVip.map(n => ({
  nivel: n.nivel,
  aposta: fmt(n.aposta),
  bonus: fmt(n.bonus),
}))

const niveisVipPeriodico = niveisVip.slice(1).map(n => ({
  nivel: n.nivel,
  diario: BONUS_DIARIO[n.nivel]?.toFixed(2) ?? '0.00',
  semanal: BONUS_SEMANAL[n.nivel]?.toFixed(2) ?? '0.00',
  mensal: BONUS_MENSAL[n.nivel]?.toFixed(2) ?? '0.00',
}))

async function coletar() {
  if (await coletarVip()) {
    confetti()
    toast.success('Bônus VIP coletado!')
  } else {
    toast.warning('Nenhum bônus disponível para coletar.')
  }
}
async function reclamar() {
  if (await coletarVip()) {
    confetti()
    toast.success('Recompensa de upgrade reclamada!')
  } else {
    toast.warning('Requisitos não atendidos ou bônus já reclamado.')
  }
}
async function coletarDiario() {
  try {
    await coletarVipDiario()
    confetti()
    toast.success('Bônus diário coletado!')
  } catch (e) { toast.error(e.message) }
}
async function coletarSemanal() {
  try {
    await coletarVipSemanal()
    confetti()
    toast.success('Bônus semanal coletado!')
  } catch (e) { toast.error(e.message) }
}
async function coletarMensal() {
  try {
    await coletarVipMensal()
    confetti()
    toast.success('Bônus mensal coletado!')
  } catch (e) { toast.error(e.message) }
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
.vip-rollover-aviso {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 16px;
  padding: 10px 14px;
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.4);
  border-radius: 10px;
  color: #fbbf24;
  font-size: 0.88rem;
}
.vip-periodico-panel { margin-top: 0; }
</style>
