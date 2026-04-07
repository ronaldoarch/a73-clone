<template>
  <div class="wheel-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>{{ activityName }}</h2>
      <button class="record-btn" @click="showHistory = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
      </button>
    </div>

    <div class="status-bar" v-if="calcStatus">
      <span class="status-tag" :class="statusClass">
        <span>{{ activityStatus ? (showEndCountdown ? 'Atividade' : 'Atividade Permanente') : '' }}</span>
        <span v-if="activityStatus">{{ showEndCountdown ? ' encerra' : ' encerrada' }}</span>
        <span v-else-if="overTime > 0"> inicia</span>
        <span v-else> encerrada</span>
      </span>
      <span v-if="overTime > 0" class="countdown-text">
        {{ showEndCountdown ? 'Contagem regressiva' : 'Permanente' }}: 
        <span class="countdown-val">{{ countdown }}</span>
      </span>
    </div>

    <div class="wheel-container">
      <div class="wheel-glow"></div>
      <div class="wheel-assembly">
        <LuckyWheel
          ref="luckyWheelRef"
          width="300px"
          height="300px"
          :prizes="luckyPrizes"
          :blocks="luckyBlocks"
          :buttons="luckyButtons"
          :default-config="luckyConfig"
          @start="onLuckyStart"
          @end="onLuckyEnd"
        />
      </div>
      <div class="ticket-display">
        <span class="ticket-icon">🎫</span>
        <span class="ticket-count">x{{ ticketCount }}</span>
      </div>
    </div>

    <div class="cards-section">
      <div class="cards-row">
        <div
          v-for="(card, i) in rewardCards"
          :key="i"
          class="happy-card"
          :class="[`card-${card.name}`, { shiny: isRedeemable }]"
          :style="getCardStyle(card.name)"
        >
          <span class="card-letter" :style="getCardNameStyle(card.name)">{{ card.name.charAt(0) }}</span>
          <span class="card-amount" :style="getCardStrokeStyle(card.name)">x{{ card.amount }}</span>
        </div>
      </div>

      <div class="exchange-area">
        <button
          class="exchange-btn"
          :class="{ shiny: isRedeemable }"
          @click="showExchangeModal = true"
        >
          Resgatar
        </button>
        <p class="exchange-tip">
          Colete "H","A","P","P","Y" para trocar por {{ merchantCy }} {{ exchangeReward }}
        </p>
      </div>
    </div>

    <div class="divider"></div>

    <div class="tickets-section">
      <div class="section-header">
        <span class="deco-icon">🎫</span>
        <h3>Obter Vouchers de Recompensa</h3>
        <span class="deco-icon flip">🎫</span>
      </div>

      <div
        v-for="ticket in ticketSources"
        :key="ticket.uuid"
        class="ticket-source"
      >
        <div class="ticket-top">
          <span class="ticket-type">{{ getTicketLabel(ticket.type) }}{{ ticket.type !== 'firstLogin' ? ` (${formatAmount(ticket.conditionAmount)})` : '' }}</span>
          <span class="ticket-progress">{{ Math.min(ticket.receiveCount, ticket.triggerCount) }}/{{ ticket.triggerCount }}</span>
        </div>
        <div class="ticket-bottom">
          <div class="ticket-reward">
            <span class="ticket-icon-sm">🎫</span>
            <span>x{{ ticket.amount }}</span>
          </div>
          <button
            v-if="ticket.receiveCount >= ticket.triggerCount || ticket.type === 'firstLogin'"
            class="ticket-status done"
            :class="{ hidden: ticket.type === 'firstLogin' && !ticket.receiveCount }"
          >
            Concluído
          </button>
          <button
            v-else-if="['validBet', 'cumulativeValidBet'].includes(ticket.type)"
            class="ticket-action"
            @click="$router.push('/main/inicio')"
          >
            Apostar
          </button>
          <button
            v-else
            class="ticket-action"
            @click="$router.push('/recharge/apply')"
          >
            Recarregar
          </button>
        </div>
      </div>
    </div>

    <div class="rules-section">
      <h3>Regras da Atividade</h3>
      <ul>
        <li v-for="(rule, i) in rules" :key="i">{{ rule }}</li>
      </ul>
    </div>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showRewardModal" class="modal-overlay" @click.self="showRewardModal = false">
          <div class="reward-modal">
            <button class="modal-close" @click="showRewardModal = false">✕</button>
            <div class="reward-light"></div>
            <h3 class="reward-title">Acabou de ganhar!</h3>
            <div v-if="currentPrize.type === 'goldCoins'" class="gold-prize">
              <span class="gold-icon">🪙</span>
              <span class="gold-amount">{{ formatAmount(currentPrize.amount) }}</span>
            </div>
            <div v-else class="card-prize">
              <div class="prize-card-big" :style="getCardStyle(currentPrize.type?.replace('prop_',''))">
                <span class="big-letter" :style="getCardNameStyle(currentPrize.type?.replace('prop_',''))">
                  {{ currentPrize.type?.replace('prop_','') }}
                </span>
                <span class="big-amount" :style="getCardStrokeStyle(currentPrize.type?.replace('prop_',''))">
                  x{{ currentPrize.amount }}
                </span>
              </div>
            </div>
            <button class="confirm-btn" @click="confirmReward">Confirmar</button>
          </div>
        </div>
      </Transition>

      <Transition name="modal-fade">
        <div v-if="showExchangeModal" class="modal-overlay" @click.self="showExchangeModal = false">
          <div class="exchange-modal">
            <button class="modal-close" @click="showExchangeModal = false">✕</button>
            <h3>Resgatar Recompensa</h3>
            <div class="cards-preview">
              <div
                v-for="(card, i) in rewardCards"
                :key="i"
                class="mini-card"
                :style="getCardStyle(card.name)"
              >
                <span class="mini-letter" :style="getCardNameStyle(card.name)">{{ card.name.charAt(0) }}</span>
                <span class="mini-amount">x{{ card.amount }}</span>
              </div>
            </div>
            <p class="exchange-info">Disponível para troca: {{ exchangeSummation }}</p>
            <form @submit.prevent="handleExchange">
              <div class="input-row">
                <input
                  v-model.number="exchangeAmount"
                  type="number"
                  :placeholder="'Quantidade para trocar'"
                  :max="exchangeSummation"
                  min="1"
                  :readonly="!exchangeSummation"
                />
                <button type="button" class="max-btn" @click="exchangeAmount = exchangeSummation">Max</button>
              </div>
              <button
                type="submit"
                class="submit-exchange"
                :class="{ enabled: exchangeSummation > 0 }"
                :disabled="!exchangeSummation"
              >
                Resgatar
              </button>
            </form>
          </div>
        </div>
      </Transition>

      <Transition name="modal-fade">
        <div v-if="showHistory" class="modal-overlay" @click.self="showHistory = false">
          <div class="history-modal">
            <button class="modal-close" @click="showHistory = false">✕</button>
            <h3>Histórico</h3>
            <div v-if="historyRecords.length" class="history-list">
              <div v-for="rec in historyRecords" :key="rec.id" class="history-item">
                <span>{{ rec.prize }}</span>
                <span class="history-date">{{ rec.date }}</span>
              </div>
            </div>
            <div v-else class="empty-history">Nenhum registro ainda</div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { LuckyWheel } from '@lucky-canvas/vue'

const SEGMENT_COUNT = 10
const SPIN_DURATION = 5000
const luckyWheelRef = ref(null)

const activityName = ref('Roda da Sorte')
const ticketCount = ref(3)
const spinning = ref(false)
const rotation = ref(0)
const showRewardModal = ref(false)
const showExchangeModal = ref(false)
const showHistory = ref(false)
const exchangeAmount = ref(0)
const currentPrize = ref({})
const calcStatus = ref(true)
const activityStatus = ref(true)
const showEndCountdown = ref(true)
const overTime = ref(86400)
const countdown = ref('23:59:59')
const merchantCy = ref('R$')

const rewardCards = ref([
  { name: 'H', amount: 2 },
  { name: 'A', amount: 1 },
  { name: 'P', amount: 3 },
  { name: 'P2', amount: 0 },
  { name: 'Y', amount: 1 },
])

const isRedeemable = computed(() => rewardCards.value.every(c => c.amount > 0))

const exchangeReward = computed(() => '50,00')

const exchangeSummation = computed(() => {
  if (!isRedeemable.value) return 0
  return Math.min(...rewardCards.value.map(c => c.amount))
})

const ticketSources = ref([
  { uuid: '1', type: 'firstLogin', conditionAmount: 0, amount: 1, receiveCount: 1, triggerCount: 1 },
  { uuid: '2', type: 'recharge', conditionAmount: 50, amount: 2, receiveCount: 0, triggerCount: 3 },
  { uuid: '3', type: 'validBet', conditionAmount: 200, amount: 1, receiveCount: 1, triggerCount: 5 },
  { uuid: '4', type: 'cumulativeValidBet', conditionAmount: 1000, amount: 3, receiveCount: 0, triggerCount: 1 },
])

const wheelPrizes = [
  { label: 'H x1', icon: '🟣', type: 'prop_H' },
  { label: 'R$ 5', icon: '🪙', type: 'goldCoins' },
  { label: 'A x1', icon: '🔴', type: 'prop_A' },
  { label: 'R$ 2', icon: '🪙', type: 'goldCoins' },
  { label: 'P x1', icon: '🟡', type: 'prop_P' },
  { label: 'R$ 10', icon: '🪙', type: 'goldCoins' },
  { label: 'P x1', icon: '🩷', type: 'prop_P2' },
  { label: 'R$ 1', icon: '🪙', type: 'goldCoins' },
  { label: 'Y x1', icon: '🔵', type: 'prop_Y' },
  { label: 'R$ 3', icon: '🪙', type: 'goldCoins' },
]

const historyRecords = ref([
  { id: 1, prize: 'Carta H x1', date: '2026-04-01 14:30' },
  { id: 2, prize: 'R$ 5,00', date: '2026-04-01 14:25' },
  { id: 3, prize: 'Carta P x1', date: '2026-04-01 14:20' },
])

const rules = [
  'Cada giro consome 1 voucher de recompensa.',
  'Colete as cartas H, A, P, P, Y para trocar por bônus.',
  'Vouchers podem ser obtidos por login, recarga ou aposta válida.',
  'Os prêmios da roda incluem moedas de ouro e cartas colecionáveis.',
  'Prêmios serão creditados automaticamente na sua conta.',
  'A atividade pode ser encerrada a qualquer momento.',
]

const statusClass = computed(() => {
  if (activityStatus.value) return 'active'
  if (overTime.value > 0) return 'pending'
  return 'ended'
})

const prizeColors = ['#2d1b4e', '#1e1145']
const luckyPrizes = computed(() =>
  wheelPrizes.map((prize, i) => ({
    background: prizeColors[i % 2],
    fonts: [{ text: prize.label, top: '18%', fontSize: '11px', fontColor: '#fff', fontWeight: '700' }],
    imgs: [{ src: prize.icon === '🪙' ? '' : '', top: '40%', width: '24px', height: '24px' }]
  }))
)

const luckyBlocks = [
  { padding: '12px', background: 'linear-gradient(135deg, #a855f7, #7c3aed)' },
  { padding: '4px', background: '#1a0533' }
]

const luckyButtons = [{
  radius: '26%',
  background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
  pointer: true,
  fonts: [{ text: 'GIRAR', top: '-10px', fontSize: '13px', fontColor: '#fff', fontWeight: '800' }]
}]

const luckyConfig = {
  speed: 20,
  accelerationTime: 2500,
  decelerationTime: 2500,
  offsetDegree: 0
}

function onLuckyStart() {
  if (spinning.value || ticketCount.value <= 0) return
  spinning.value = true
  ticketCount.value--

  const targetIndex = Math.floor(Math.random() * SEGMENT_COUNT)
  const prize = wheelPrizes[targetIndex]
  currentPrize.value = {
    type: prize.type,
    amount: prize.type === 'goldCoins' ? parseInt(prize.label.replace(/\D/g, '')) : 1,
  }

  luckyWheelRef.value?.play()
  setTimeout(() => {
    luckyWheelRef.value?.stop(targetIndex)
  }, 3000)
}

function onLuckyEnd(prize) {
  spinning.value = false
  showRewardModal.value = true
  if (currentPrize.value.type !== 'goldCoins') {
    const cardName = currentPrize.value.type.replace('prop_', '')
    const card = rewardCards.value.find(c => c.name === cardName)
    if (card) card.amount++
  }
}

function confirmReward() {
  showRewardModal.value = false
}

function handleExchange() {
  if (!exchangeSummation.value || !exchangeAmount.value) return
  rewardCards.value.forEach(c => { c.amount -= exchangeAmount.value })
  exchangeAmount.value = 0
  showExchangeModal.value = false
}

function getTicketLabel(type) {
  const labels = {
    firstLogin: 'Primeiro Login',
    recharge: 'Recarga',
    validBet: 'Aposta Válida',
    cumulativeValidBet: 'Aposta Acumulada',
  }
  return labels[type] || type
}

function formatAmount(val) {
  if (typeof val === 'number') return val.toLocaleString('pt-BR')
  return val
}

function getCardStyle(name) {
  const styles = {
    H: { background: 'linear-gradient(135deg, #AD65ED, #E693F9)' },
    A: { background: 'linear-gradient(135deg, #ED6565, #F99393)' },
    P: { background: 'linear-gradient(135deg, #ED6565, #FFE925)' },
    P2: { background: 'linear-gradient(135deg, #ED65B7, #F793F9)' },
    Y: { background: 'linear-gradient(135deg, #65EDCC, #939DF9)' },
  }
  return styles[name] || styles.Y
}

function getCardNameStyle(name) {
  const colors = { H: '#DB55FF', A: '#FF5B5B', P: '#EEC473', P2: '#F68EF1', Y: '#53BBFF' }
  return { color: colors[name] || '#53BBFF' }
}

function getCardStrokeStyle(name) {
  const shadows = {
    H: '#BD5AF2', A: '#FF5959', P: '#FF8F16', P2: '#FD49CA', Y: '#5182FF',
  }
  const c = shadows[name] || '#5182FF'
  return {
    color: 'white',
    textShadow: `-1px -1px 0 ${c}, 1px -1px 0 ${c}, -1px 1px 0 ${c}, 1px 1px 0 ${c}`,
  }
}

let countdownInterval
onMounted(() => {
  countdownInterval = setInterval(() => {
    if (overTime.value > 0) {
      overTime.value--
      const h = String(Math.floor(overTime.value / 3600)).padStart(2, '0')
      const m = String(Math.floor((overTime.value % 3600) / 60)).padStart(2, '0')
      const s = String(overTime.value % 60).padStart(2, '0')
      countdown.value = `${h}:${m}:${s}`
    }
  }, 1000)
})

onUnmounted(() => {
  clearInterval(countdownInterval)
})
</script>

<style scoped>
.wheel-page {
  padding: 0 12px 24px;
  background: linear-gradient(180deg, #1a0533 0%, #0f172a 40%);
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 12px 0;
  gap: 12px;
}
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; color: #fff; }
.back-btn, .record-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(255,255,255,0.08); color: #fff; border: none; cursor: pointer;
}

.status-bar {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-bottom: 12px;
}
.status-tag {
  font-size: 12px; padding: 4px 12px; border-radius: 20px;
  background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7);
}
.status-tag.active { background: rgba(34,197,94,0.15); color: #22c55e; }
.status-tag.pending { background: rgba(251,191,36,0.15); color: #fbbf24; }
.status-tag.ended { background: rgba(239,68,68,0.15); color: #ef4444; }
.countdown-text { font-size: 12px; color: rgba(255,255,255,0.6); }
.countdown-val { color: #fbbf24; font-weight: 700; }

.wheel-container {
  position: relative;
  display: flex; flex-direction: column; align-items: center;
  margin-bottom: 20px; padding: 20px 0;
}
.wheel-glow {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 360px; height: 360px; border-radius: 50%;
  background: radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%);
  animation: glow-pulse 3s ease-in-out infinite alternate;
}
@keyframes glow-pulse {
  0% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.95); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
}

.wheel-assembly {
  position: relative; width: 300px; height: 300px; z-index: 1;
  display: flex; align-items: center; justify-content: center;
}

.ticket-display {
  display: flex; align-items: center; gap: 6px; margin-top: 12px;
  background: rgba(255,255,255,0.08); padding: 6px 16px; border-radius: 20px;
}
.ticket-icon { font-size: 20px; }
.ticket-count { font-size: 18px; font-weight: 800; color: #fbbf24; }

.cards-section { margin-bottom: 16px; }
.cards-row {
  display: flex; justify-content: center; gap: 6px; margin-bottom: 12px;
}
.happy-card {
  width: 58px; height: 76px; border-radius: 8px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  position: relative; overflow: hidden;
}
.happy-card.shiny::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%);
  animation: shine 2s ease-in-out infinite;
}
@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.card-letter { font-size: 28px; font-weight: 900; }
.card-amount { font-size: 13px; font-weight: 800; }

.exchange-area { text-align: center; }
.exchange-btn {
  padding: 10px 40px; border-radius: 24px; font-size: 14px; font-weight: 700;
  background: linear-gradient(135deg, #a855f7, #7c3aed); color: #fff;
  border: none; cursor: pointer; position: relative; overflow: hidden;
}
.exchange-btn.shiny::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%);
  animation: shine 2s ease-in-out infinite;
}
.exchange-tip {
  font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 8px;
}

.divider { height: 1px; background: rgba(255,255,255,0.06); margin: 16px 0; }

.tickets-section { margin-bottom: 16px; }
.section-header {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  margin-bottom: 14px;
}
.section-header h3 { font-size: 16px; font-weight: 700; color: #fff; }
.deco-icon { font-size: 18px; }
.deco-icon.flip { transform: scaleX(-1); }

.ticket-source {
  background: rgba(255,255,255,0.06); border-radius: 12px;
  padding: 12px 14px; margin-bottom: 8px;
}
.ticket-top {
  display: flex; justify-content: space-between; margin-bottom: 6px;
}
.ticket-type { font-size: 12px; color: rgba(255,255,255,0.6); }
.ticket-progress { font-size: 12px; color: rgba(255,255,255,0.5); }
.ticket-bottom {
  display: flex; justify-content: space-between; align-items: center;
}
.ticket-reward {
  display: flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 700; color: #fbbf24;
}
.ticket-icon-sm { font-size: 20px; }
.ticket-action {
  padding: 4px 14px; border-radius: 14px; font-size: 12px; font-weight: 600;
  background: linear-gradient(135deg, #a855f7, #7c3aed); color: #fff;
  border: none; cursor: pointer;
}
.ticket-status.done {
  padding: 4px 14px; border-radius: 14px; font-size: 12px; font-weight: 600;
  background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); border: none;
}
.ticket-status.hidden { visibility: hidden; }

.rules-section {
  background: rgba(255,255,255,0.04); border-radius: 12px; padding: 14px;
}
.rules-section h3 { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 10px; }
.rules-section ul { list-style: none; padding: 0; margin: 0; }
.rules-section li {
  font-size: 12px; color: rgba(255,255,255,0.5); padding: 4px 0 4px 16px;
  position: relative; line-height: 1.6;
}
.rules-section li::before {
  content: ''; position: absolute; left: 4px; top: 50%; transform: translateY(-50%);
  width: 4px; height: 4px; border-radius: 50%; background: #a855f7;
}

.modal-overlay {
  position: fixed; inset: 0; z-index: 10010;
  background: rgba(0,0,0,0.75); display: flex;
  align-items: center; justify-content: center; backdrop-filter: blur(4px);
}
.modal-close {
  position: absolute; top: 12px; right: 12px;
  background: none; border: none; color: rgba(255,255,255,0.5);
  font-size: 18px; cursor: pointer;
}

.reward-modal {
  position: relative; background: linear-gradient(180deg, #2d1b69, #1a0533);
  border-radius: 20px; padding: 32px 24px; text-align: center;
  min-width: 280px; border: 1px solid rgba(168,85,247,0.3);
}
.reward-light {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 200px; height: 200px; border-radius: 50%;
  background: radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%);
  z-index: -1;
}
.reward-title { font-size: 18px; font-weight: 700; color: #fbbf24; margin-bottom: 16px; }
.gold-prize { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 20px; }
.gold-icon { font-size: 64px; }
.gold-amount { font-size: 24px; font-weight: 800; color: #fbbf24; }
.card-prize { display: flex; justify-content: center; margin-bottom: 20px; }
.prize-card-big {
  width: 80px; height: 100px; border-radius: 10px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
}
.big-letter { font-size: 36px; font-weight: 900; }
.big-amount { font-size: 16px; font-weight: 800; }
.confirm-btn {
  padding: 12px 40px; border-radius: 24px; font-size: 15px; font-weight: 700;
  background: linear-gradient(135deg, #a855f7, #7c3aed); color: #fff;
  border: none; cursor: pointer; width: 100%;
}

.exchange-modal {
  position: relative; background: linear-gradient(180deg, #2d1b69, #1a0533);
  border-radius: 20px; padding: 24px; min-width: 300px;
  border: 1px solid rgba(168,85,247,0.3);
}
.exchange-modal h3 { text-align: center; font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 16px; }
.cards-preview { display: flex; justify-content: center; gap: 6px; margin-bottom: 14px; }
.mini-card {
  width: 44px; height: 56px; border-radius: 6px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
}
.mini-letter { font-size: 20px; font-weight: 900; }
.mini-amount { font-size: 10px; font-weight: 700; color: #fff; }
.exchange-info { text-align: center; font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 12px; }
.input-row { display: flex; gap: 8px; margin-bottom: 12px; }
.input-row input {
  flex: 1; padding: 10px 14px; border-radius: 10px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  color: #fff; font-size: 14px; outline: none;
}
.max-btn {
  padding: 10px 16px; border-radius: 10px;
  background: linear-gradient(135deg, #a855f7, #7c3aed); color: #fff;
  font-size: 12px; font-weight: 700; border: none; cursor: pointer;
}
.submit-exchange {
  width: 100%; padding: 12px; border-radius: 12px;
  background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4);
  font-size: 14px; font-weight: 700; border: none; cursor: not-allowed;
}
.submit-exchange.enabled {
  background: linear-gradient(135deg, #a855f7, #7c3aed); color: #fff; cursor: pointer;
}

.history-modal {
  position: relative; background: linear-gradient(180deg, #2d1b69, #1a0533);
  border-radius: 20px; padding: 24px; min-width: 300px; max-height: 400px;
  overflow-y: auto; border: 1px solid rgba(168,85,247,0.3);
}
.history-modal h3 { text-align: center; font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 16px; }
.history-list { display: flex; flex-direction: column; gap: 4px; }
.history-item {
  display: flex; justify-content: space-between; padding: 10px 12px;
  background: rgba(255,255,255,0.04); border-radius: 8px; font-size: 13px; color: #fff;
}
.history-date { font-size: 11px; color: rgba(255,255,255,0.4); }
.empty-history { text-align: center; padding: 30px; color: rgba(255,255,255,0.4); font-size: 13px; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
