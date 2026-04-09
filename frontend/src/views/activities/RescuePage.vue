<template>
  <div class="rescue-page">
    <header class="rescue-topbar">
      <button type="button" class="rescue-icon-btn" aria-label="Voltar" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <h1 class="rescue-topbar-title">Resgate de Perda</h1>
    </header>

    <section class="rescue-hero" aria-label="Destaque do evento">
      <img
        class="rescue-hero-img"
        src="/first/activities/rescue-hero-bg.png"
        alt=""
        decoding="async"
        fetchpriority="high"
      />
      <div class="rescue-hero-overlay">
        <div class="rescue-timer" aria-live="polite">
          <div class="timer-vine" aria-hidden="true" />
          <div class="timer-row">
            <span class="timer-digits">{{ pad2(timerParts.d) }}</span>
            <span class="timer-sep">:</span>
            <span class="timer-digits">{{ pad2(timerParts.h) }}</span>
            <span class="timer-sep">:</span>
            <span class="timer-digits">{{ pad2(timerParts.m) }}</span>
            <span class="timer-sep">:</span>
            <span class="timer-digits">{{ pad2(timerParts.s) }}</span>
          </div>
        </div>
      </div>
    </section>

    <div class="rescue-inner">
      <div class="rescue-table-card">
        <h3 class="rescue-section-title rescue-event-title">Evento de Contagem Regressiva: permanente</h3>
        <div class="table-wrap">
          <div class="t-head t-head--two">
            <span>Valor da perda</span>
            <span>Coletável</span>
          </div>
          <div v-for="row in rescueTable" :key="row.min" class="t-row t-row--two">
            <span class="t-cell-loss">{{ merchantCy }} {{ formatAmount(row.min) }}</span>
            <span class="t-cell-pct">+{{ formatAmount(row.rate) }}%</span>
          </div>
        </div>
      </div>

      <div class="rescue-status">
        <div class="status-card">
          <span class="status-val status-val--top">{{ merchantCy }} {{ formatAmount(accumulatedLoss) }}</span>
          <span class="status-label">Minhas perdas</span>
        </div>
        <div class="status-card">
          <span class="status-val status-val--top status-val--accent">{{ merchantCy }} {{ formatAmount(availableCompensation) }}</span>
          <span class="status-label">Coletável</span>
        </div>
      </div>

      <div class="rescue-rules-card">
        <h4 class="rescue-rules-title">Regras do evento</h4>
        <p class="rescue-rules-sub">Atividades:</p>
        <ol class="rescue-rules-list">
          <li v-for="(rule, idx) in rescueRules" :key="idx">{{ rule }}</li>
        </ol>
      </div>

      <button
        type="button"
        class="receive-btn"
        :class="{ 'receive-btn--on': canClaim }"
        :disabled="!canClaim"
        @click="requestCompensation"
      >
        Receber
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { formatAmount, getMerchantCurrency } from '../../utils/currency'
import { toastSuccess, toastError } from '../../utils/toast'

const merchantCy = getMerchantCurrency()

const rescueTable = [
  { min: 10, rate: 5 },
  { min: 500, rate: 6 },
  { min: 1000, rate: 8 },
  { min: 5000, rate: 10 },
  { min: 10000, rate: 15 },
  { min: 30000, rate: 20 },
  { min: 50000, rate: 25 }
]

const rescueRules = [
  'Nas modalidades como Resgate Humanitário e Resgate de Emergência, utilizadores que tenham perdido R$ 10,00 ou mais no dia anterior podem receber valor de resgate de até 25% sobre a perda.',
  'Cálculo: valor da recompensa = valor atual da perda (deduzido o desconto já recebido) × taxa de desconto aplicável.',
  'A distribuição ocorre entre 00:00 e 04:00 e expira após 23:59:59 do período indicado.',
  'O bônus deve ser apostado 1x (rollover) antes do saque. Válido em slots dos provedores: PG, Tada, JDB, PP, CP, FCGAMES, G759, POPOK, PLAYSON.',
  'Atividade destinada a uso manual. É proibido uso de robôs, plug-ins, arbitragem, múltiplas contas ou exploração de falhas técnicas.',
  'A plataforma reserva-se o direito de interpretação final deste evento.'
]

/** Valores de demonstração até existir endpoint de resgate. */
const accumulatedLoss = ref(0)
const availableCompensation = ref(0)

const canClaim = computed(() => availableCompensation.value > 0)

const endAt = ref(0)
const timerParts = ref({ d: 0, h: 0, m: 0, s: 0 })

function pad2(n) {
  return String(Math.max(0, Math.floor(Number(n) || 0))).padStart(2, '0')
}

let timerId = null

function tickCountdown() {
  const ms = Math.max(0, endAt.value - Date.now())
  timerParts.value = {
    d: Math.floor(ms / 86400000),
    h: Math.floor((ms % 86400000) / 3600000),
    m: Math.floor((ms % 3600000) / 60000),
    s: Math.floor((ms % 60000) / 1000)
  }
}

onMounted(() => {
  const stored = sessionStorage.getItem('rescue-countdown-end')
  let end = stored ? parseInt(stored, 10) : 0
  if (!end || end < Date.now()) {
    end = Date.now() + 24 * 60 * 60 * 1000
    sessionStorage.setItem('rescue-countdown-end', String(end))
  }
  endAt.value = end
  tickCountdown()
  timerId = setInterval(tickCountdown, 1000)
})

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})

async function requestCompensation() {
  if (!canClaim.value) return
  try {
    // TODO: trpcMutation('activity.rescueClaim') ou equivalente quando existir no backend
    toastSuccess('Valor recebido. Confira seu saldo e as regras de rollover.')
    availableCompensation.value = 0
  } catch (e) {
    toastError(e?.message || 'Não foi possível solicitar agora.')
  }
}
</script>

<style scoped>
.rescue-page {
  min-height: 100vh;
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
  background: #0c0a12;
  color: #fff;
}

.rescue-topbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem;
  background: linear-gradient(180deg, #4a1f7a 0%, #321056 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.rescue-topbar-title {
  flex: 1;
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-align: center;
  color: #fff;
  line-height: 1.2;
  padding: 0 0.25rem;
}

.rescue-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.35rem;
  height: 2.35rem;
  padding: 0;
  border: none;
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.25);
  color: #fde047;
  cursor: pointer;
}

.rescue-icon-btn:active {
  transform: scale(0.96);
}

.rescue-hero {
  position: relative;
  margin: 0;
  width: 100%;
  background: #0a1628;
  line-height: 0;
}

/* Largura 100%, altura natural = arte completa visível (sem crop tipo cover). */
.rescue-hero-img {
  display: block;
  width: 100%;
  height: auto;
  vertical-align: top;
}

.rescue-hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Timer ainda mais abaixo */
  padding: clamp(11rem, 48%, 24rem) 0.75rem 6%;
  gap: clamp(0.35rem, 2vw, 0.65rem);
  pointer-events: none;
  box-sizing: border-box;
}

.rescue-hero-overlay .rescue-timer {
  pointer-events: auto;
}

.rescue-timer {
  width: 100%;
  max-width: 19rem;
  /* Deslocamento: direita + um pouco para baixo */
  transform: translate(clamp(3.35rem, 15vw, 6.25rem), clamp(0.4rem, 1.8vw, 0.95rem));
}

.timer-vine {
  height: 0.35rem;
  margin-bottom: 0.15rem;
  background: linear-gradient(90deg, transparent, #3d7a3d, #5a9e5a, #3d7a3d, transparent);
  border-radius: 999px;
  opacity: 0.85;
}

.timer-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  flex-wrap: wrap;
}

.timer-digits {
  min-width: 2rem;
  padding: 0.3rem 0.4rem;
  border-radius: 0.35rem;
  font-size: 0.8rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: #fff;
  text-align: center;
  background: linear-gradient(180deg, #2c1810 0%, #1a0f0a 100%);
  border: 1px solid #5c4030;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 2px 6px rgba(0, 0, 0, 0.45);
}

.timer-sep {
  font-size: 0.85rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1;
  padding-bottom: 0.1rem;
}

.rescue-inner {
  padding: 0 0.75rem;
  margin-top: 0.5rem;
}

.rescue-table-card {
  background: rgba(55, 35, 95, 0.45);
  border-radius: 0.75rem;
  padding: 0.9rem 0.85rem 1rem;
  margin-bottom: 0.65rem;
  border: 1px solid rgba(167, 139, 250, 0.12);
}

.rescue-section-title {
  margin: 0 0 0.65rem;
  font-size: 0.88rem;
  font-weight: 800;
}

.rescue-event-title {
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.95);
}

.table-wrap {
  overflow: hidden;
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.25);
}

.t-head--two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  padding: 0.5rem 0.65rem;
  font-size: 0.62rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.45);
  background: rgba(0, 0, 0, 0.35);
}

.t-row--two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  align-items: center;
  padding: 0.55rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 700;
  border-top: 1px solid rgba(0, 0, 0, 0.2);
  background: rgba(40, 25, 70, 0.65);
}

.t-cell-loss {
  color: rgba(255, 255, 255, 0.88);
  font-variant-numeric: tabular-nums;
}

.t-cell-pct {
  text-align: right;
  color: #fde047;
  font-variant-numeric: tabular-nums;
}

.rescue-status {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}

.status-card {
  background: rgba(55, 35, 95, 0.4);
  border-radius: 0.65rem;
  padding: 0.75rem 0.45rem 0.65rem;
  text-align: center;
  border: 1px solid rgba(167, 139, 250, 0.1);
}

.status-label {
  display: block;
  font-size: 0.58rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 0.35rem;
  line-height: 1.3;
}

.status-val {
  font-size: 1rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.status-val--top {
  display: block;
  margin-top: 0;
}

.status-val--accent {
  color: #fde047;
}

.rescue-rules-card {
  background: rgba(35, 22, 58, 0.85);
  border-radius: 0.75rem;
  padding: 0.9rem 0.85rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.rescue-rules-title {
  margin: 0 0 0.4rem;
  font-size: 0.82rem;
  font-weight: 800;
  color: #fff;
}

.rescue-rules-sub {
  margin: 0 0 0.45rem;
  font-size: 0.68rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
}

.rescue-rules-list {
  margin: 0;
  padding-left: 1.1rem;
  font-size: 0.62rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.72);
}

.rescue-rules-list li {
  margin-bottom: 0.45rem;
}

.rescue-rules-list li:last-child {
  margin-bottom: 0;
}

.receive-btn {
  width: 100%;
  padding: 0.95rem 1rem;
  border: none;
  border-radius: 0.55rem;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.4);
  background: rgba(60, 65, 35, 0.55);
  cursor: not-allowed;
  transition: transform 0.15s, box-shadow 0.2s, filter 0.2s;
}

.receive-btn--on {
  background: linear-gradient(180deg, #9aad3f 0%, #6b7a2e 55%, #5a6625 100%);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.25);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.35);
}

.receive-btn--on:active {
  transform: scale(0.99);
}

.receive-btn:disabled {
  opacity: 0.65;
  filter: saturate(0.65);
}
</style>
