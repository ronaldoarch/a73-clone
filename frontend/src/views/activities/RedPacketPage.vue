<template>
  <div class="red-packet-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Red Packet</h2>
      <button class="record-btn" @click="showHistory = true">Histórico</button>
    </div>

    <div class="rp-banner">
      <div class="rp-glow"></div>
      <div class="rp-content">
        <div class="rp-envelope" :class="{ opening: isOpening, opened: lastPrize }" @click="openPacket">
          <div class="envelope-top">
            <div class="envelope-seal">
              <span class="seal-text">{{ openedToday ? 'Aberto' : 'Abrir' }}</span>
            </div>
          </div>
          <div class="envelope-body">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,.9)" stroke-width="1.5">
              <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"/><rect x="2" y="7" width="20" height="5" rx="1"/>
              <path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
              <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
            </svg>
          </div>
        </div>

        <h3>Envelope da Sorte</h3>
        <p>Abra seu envelope diário e ganhe prêmios em dinheiro!</p>
      </div>
    </div>

    <div class="countdown-section" v-if="openedToday">
      <div class="countdown-label">Próximo envelope disponível em:</div>
      <div class="countdown-timer">
        <div class="time-block">
          <span class="time-val">{{ hours }}</span>
          <span class="time-lbl">Horas</span>
        </div>
        <span class="time-sep">:</span>
        <div class="time-block">
          <span class="time-val">{{ minutes }}</span>
          <span class="time-lbl">Min</span>
        </div>
        <span class="time-sep">:</span>
        <div class="time-block">
          <span class="time-val">{{ seconds }}</span>
          <span class="time-lbl">Seg</span>
        </div>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-val">{{ openCount }}</span>
        <span class="stat-lbl">Envelopes abertos</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">R$ {{ totalWon }}</span>
        <span class="stat-lbl">Total ganho</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">{{ streakDays }}</span>
        <span class="stat-lbl">Dias seguidos</span>
      </div>
    </div>

    <div class="levels-section">
      <h3>Níveis de Prêmio</h3>
      <div class="levels-grid">
        <div v-for="level in levels" :key="level.name" class="level-item">
          <div class="level-bar" :style="{ width: level.chance + '%' }"></div>
          <span class="level-name">{{ level.name }}</span>
          <span class="level-range">{{ level.range }}</span>
          <span class="level-pct">{{ level.chance }}%</span>
        </div>
      </div>
    </div>

    <div class="rules-section">
      <h3>Regras</h3>
      <ul>
        <li>Abra 1 envelope vermelho por dia gratuitamente</li>
        <li>Dias consecutivos aumentam a chance de prêmios maiores</li>
        <li>Prêmios variam de R$ 0,50 a R$ 88,00</li>
        <li>O valor é creditado automaticamente na carteira</li>
        <li>Faça um depósito mínimo para desbloquear prêmios VIP</li>
      </ul>
    </div>

    <div v-if="lastPrize" class="modal-overlay" @click.self="lastPrize = null">
      <div class="prize-modal">
        <div class="prize-confetti"></div>
        <button class="modal-close" @click="lastPrize = null">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="prize-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </div>
        <h3>Parabéns!</h3>
        <p class="prize-amount">R$ {{ lastPrize }}</p>
        <p class="prize-sub">O valor foi creditado na sua carteira</p>
        <button class="prize-btn" @click="lastPrize = null">Coletar</button>
      </div>
    </div>

    <div v-if="showHistory" class="modal-overlay" @click.self="showHistory = false">
      <div class="history-modal">
        <div class="history-header">
          <h3>Histórico</h3>
          <button class="modal-close" @click="showHistory = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="history-list" v-if="history.length">
          <div v-for="item in history" :key="item.id" class="history-item">
            <div class="hi-left">
              <span class="hi-amount">+ R$ {{ item.amount }}</span>
              <span class="hi-date">{{ item.date }}</span>
            </div>
            <span class="hi-status">Creditado</span>
          </div>
        </div>
        <div v-else class="history-empty">Nenhum prêmio ainda</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useActivityDetail } from '../../composables/useActivityDetail'

const {
  activityInfo,
  merchantCy,
  claimReward,
  formatAmount
} = useActivityDetail('RedPacket')

const openedToday = ref(false)
const isOpening = ref(false)
const lastPrize = ref(null)
const showHistory = ref(false)
const openCount = ref(0)
const totalWon = ref('0,00')
const streakDays = ref(0)
const hours = ref('00')
const minutes = ref('00')
const seconds = ref('00')
let timer = null

const history = ref([])

const levels = ref([])

watch(activityInfo, (info) => {
  if (!info) return
  openCount.value = info.openCount || info.totalReceived || 0
  totalWon.value = formatAmount((info.totalAmount || 0) / 100)
  streakDays.value = info.continuousDays || info.streak || 0
  openedToday.value = !!info.todayReceived
  if (info.records) {
    history.value = info.records.map(r => ({
      id: r.id || Date.now() + Math.random(),
      amount: formatAmount((r.amount || 0) / 100),
      date: new Date(r.createdAt || r.date).toLocaleDateString('pt-BR')
    }))
  }
  if (info.rewardLevels) {
    levels.value = info.rewardLevels.map(l => ({
      name: l.name || l.levelName || '',
      range: `${merchantCy.value} ${formatAmount((l.minAmount || 0) / 100)} - ${formatAmount((l.maxAmount || 0) / 100)}`,
      chance: l.probability || l.chance || 0
    }))
  }
  if (openedToday.value) startCountdown()
}, { immediate: true })

async function openPacket() {
  if (openedToday.value || isOpening.value) return
  isOpening.value = true

  const result = await claimReward()
  if (result) {
    const prizeAmount = (result.amount || result.rewardAmount || 0) / 100
    lastPrize.value = formatAmount(prizeAmount)
    openedToday.value = true
    openCount.value++
    streakDays.value++
    history.value.unshift({
      id: Date.now(),
      amount: formatAmount(prizeAmount),
      date: new Date().toLocaleDateString('pt-BR')
    })
    startCountdown()
  }
  isOpening.value = false
}

function startCountdown() {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const diff = tomorrow - now
    if (diff <= 0) {
      clearInterval(timer)
      return
    }
    hours.value = String(Math.floor(diff / 3600000)).padStart(2, '0')
    minutes.value = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
    seconds.value = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
  }, 1000)
}

onMounted(() => { if (openedToday.value) startCountdown() })
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.red-packet-page {
  padding: 0 .75rem 6rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100vh;
}
.page-header {
  display: flex; align-items: center; padding: .75rem 0; gap: .75rem;
}
.page-header h2 { flex: 1; font-size: 1.125rem; font-weight: 700; color: var(--ep-color-text-default); }
.back-btn { color: var(--ep-color-text-default); padding: .25rem; background: none; border: none; cursor: pointer; }
.record-btn {
  font-size: .75rem; color: var(--ep-color-text-selected);
  background: none; border: 1px solid var(--ep-color-text-selected);
  border-radius: 1rem; padding: .25rem .75rem; cursor: pointer;
}

.rp-banner {
  position: relative; border-radius: .75rem; overflow: hidden;
  margin-bottom: 1rem;
}
.rp-glow {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, #c41e1e 0%, #8b0000 50%, #6d0000 100%);
}
.rp-content {
  position: relative; z-index: 1; padding: 2rem 1rem;
  text-align: center;
}
.rp-content h3 { font-size: 1.25rem; font-weight: 800; margin-top: 1rem; }
.rp-content p { font-size: .75rem; color: rgba(255,255,255,.75); margin-top: .25rem; }

.rp-envelope {
  width: 6rem; height: 7rem; margin: 0 auto;
  cursor: pointer; position: relative;
  transition: transform .3s;
}
.rp-envelope:active:not(.opened) { transform: scale(.9); }
.rp-envelope.opening { animation: shake .5s ease; }

.envelope-top {
  height: 2.5rem;
  background: linear-gradient(to bottom, #ff4444, #cc0000);
  border-radius: .5rem .5rem 0 0;
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.envelope-seal {
  width: 2.5rem; height: 2.5rem; border-radius: 50%;
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  display: flex; align-items: center; justify-content: center;
  position: absolute; bottom: -.75rem; z-index: 2;
  box-shadow: 0 2px 8px rgba(255,215,0,.5);
}
.seal-text {
  font-size: .5rem; font-weight: 800; color: #8b0000;
  text-transform: uppercase;
}
.envelope-body {
  height: 4.5rem;
  background: linear-gradient(to bottom, #cc0000, #990000);
  border-radius: 0 0 .5rem .5rem;
  display: flex; align-items: center; justify-content: center;
}

@keyframes shake {
  0%, 100% { transform: rotate(0); }
  20% { transform: rotate(-8deg); }
  40% { transform: rotate(8deg); }
  60% { transform: rotate(-5deg); }
  80% { transform: rotate(5deg); }
}

.countdown-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-bottom: .75rem;
  text-align: center; border: 1px solid var(--ep-color-border-default);
}
.countdown-label {
  font-size: .75rem; color: var(--ep-color-text-weakest);
  margin-bottom: .5rem;
}
.countdown-timer { display: flex; align-items: center; justify-content: center; gap: .375rem; }
.time-block { text-align: center; }
.time-val {
  display: block; font-size: 1.5rem; font-weight: 800;
  color: var(--ep-color-text-default);
  background: rgba(255,255,255,.05); padding: .25rem .5rem;
  border-radius: .375rem; min-width: 2.5rem;
}
.time-lbl { font-size: .5rem; color: var(--ep-color-text-weakest); display: block; margin-top: .125rem; }
.time-sep { font-size: 1.25rem; font-weight: 800; color: var(--ep-color-text-weakest); }

.stats-row {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: .5rem;
  margin-bottom: .75rem;
}
.stat-card {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .5rem; padding: .75rem .5rem; text-align: center;
  border: 1px solid var(--ep-color-border-default);
}
.stat-val { display: block; font-size: 1rem; font-weight: 800; color: var(--accent-yellow, #fbbf24); }
.stat-lbl { font-size: .5625rem; color: var(--ep-color-text-weakest); }

.levels-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-bottom: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.levels-section h3 { font-size: .875rem; font-weight: 700; margin-bottom: .625rem; color: var(--ep-color-text-default); }
.levels-grid { display: flex; flex-direction: column; gap: .375rem; }
.level-item {
  display: flex; align-items: center; gap: .5rem;
  padding: .5rem; position: relative; font-size: .75rem;
  background: rgba(255,255,255,.02); border-radius: .375rem;
}
.level-bar {
  position: absolute; left: 0; top: 0; bottom: 0;
  background: linear-gradient(90deg, rgba(196,30,30,.15), rgba(196,30,30,.05));
  border-radius: .375rem; z-index: 0;
}
.level-name { position: relative; z-index: 1; font-weight: 600; min-width: 4.5rem; }
.level-range { position: relative; z-index: 1; flex: 1; color: var(--ep-color-text-weakest); }
.level-pct { position: relative; z-index: 1; font-weight: 700; color: var(--accent-yellow, #fbbf24); }

.rules-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem;
  border: 1px solid var(--ep-color-border-default);
}
.rules-section h3 { font-size: .875rem; font-weight: 700; margin-bottom: .625rem; color: var(--ep-color-text-default); }
.rules-section ul { list-style: none; padding: 0; margin: 0; }
.rules-section li {
  font-size: .75rem; color: var(--ep-color-text-weakest);
  padding: .375rem 0 .375rem 1rem; position: relative; line-height: 1.5;
}
.rules-section li::before {
  content: ''; position: absolute; left: 0; top: .625rem;
  width: .25rem; height: .25rem; border-radius: 50%;
  background: #c41e1e;
}

.modal-overlay {
  position: fixed; inset: 0; z-index: 10000;
  background: rgba(0,0,0,.65);
  display: flex; align-items: center; justify-content: center;
  padding: 1.5rem;
}
.modal-close {
  position: absolute; top: .75rem; right: .75rem;
  color: var(--ep-color-text-weakest); background: none;
  border: none; cursor: pointer;
}

.prize-modal {
  position: relative; width: 100%; max-width: 20rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: 1rem; padding: 2rem 1.5rem; text-align: center;
  border: 1px solid var(--ep-color-border-default);
  animation: modalIn .3s ease; overflow: hidden;
}
.prize-confetti {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(circle at 30% 20%, rgba(255,215,0,.1) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(255,0,0,.08) 0%, transparent 50%);
}
.prize-icon { margin-bottom: .5rem; position: relative; z-index: 1; }
.prize-modal h3 {
  font-size: 1.125rem; font-weight: 800; position: relative; z-index: 1;
  color: var(--ep-color-text-default);
}
.prize-amount {
  font-size: 2rem; font-weight: 900;
  color: var(--accent-yellow, #fbbf24); margin: .5rem 0;
  position: relative; z-index: 1;
}
.prize-sub {
  font-size: .75rem; color: var(--ep-color-text-weakest);
  margin-bottom: 1.25rem; position: relative; z-index: 1;
}
.prize-btn {
  width: 100%; padding: .75rem;
  background: linear-gradient(135deg, #c41e1e, #8b0000);
  color: #fff; border: none; border-radius: .5rem;
  font-size: .9375rem; font-weight: 700; cursor: pointer;
  position: relative; z-index: 1;
}

.history-modal {
  position: relative; width: 100%; max-width: 22rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: 1rem; max-height: 70vh; overflow: hidden;
  border: 1px solid var(--ep-color-border-default);
  animation: modalIn .3s ease;
  display: flex; flex-direction: column;
}
.history-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; border-bottom: 1px solid var(--ep-color-border-default);
}
.history-header h3 { font-size: 1rem; font-weight: 700; color: var(--ep-color-text-default); }
.history-list { padding: .5rem 1.25rem; overflow-y: auto; flex: 1; }
.history-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: .75rem 0; border-bottom: 1px solid rgba(255,255,255,.04);
}
.hi-left { display: flex; flex-direction: column; gap: .125rem; }
.hi-amount { font-size: .875rem; font-weight: 700; color: var(--accent-green, #22c55e); }
.hi-date { font-size: .6875rem; color: var(--ep-color-text-weakest); }
.hi-status { font-size: .6875rem; color: var(--accent-green, #22c55e); }
.history-empty {
  padding: 2rem; text-align: center; color: var(--ep-color-text-weakest);
  font-size: .8125rem;
}

@keyframes modalIn {
  from { transform: scale(.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
