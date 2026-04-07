<template>
  <div class="signin-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Check-in Diário</h2>
      <div class="header-right">
        <button class="record-btn" @click="showRecords = true">Registros</button>
      </div>
    </div>

    <div class="signin-banner">
      <div class="banner-bg"></div>
      <div class="banner-content">
        <div class="vip-badge">VIP {{ vipLevel }}</div>
        <h3>Check-in Diário</h3>
        <p>Faça check-in consecutivo para ganhar recompensas cada vez maiores!</p>
        <div class="banner-stats">
          <div class="bstat">
            <span class="bstat-val">{{ streak }}</span>
            <span class="bstat-lbl">Consecutivos</span>
          </div>
          <div class="bstat-divider"></div>
          <div class="bstat">
            <span class="bstat-val">{{ totalClaimed }}</span>
            <span class="bstat-lbl">Total</span>
          </div>
          <div class="bstat-divider"></div>
          <div class="bstat">
            <span class="bstat-val">R$ {{ totalEarned }}</span>
            <span class="bstat-lbl">Ganho</span>
          </div>
        </div>
      </div>
    </div>

    <div class="calendar-section">
      <div class="calendar-header">
        <span class="cal-month">{{ currentMonthLabel }}</span>
        <span class="cal-cycle">Ciclo {{ currentCycle }}/4</span>
      </div>

      <div class="days-grid">
        <div
          v-for="day in days"
          :key="day.day"
          class="day-card"
          :class="{
            claimed: day.claimed,
            today: day.isToday && !day.claimed,
            locked: !day.available && !day.claimed,
            special: day.special
          }"
          @click="claimDay(day)"
        >
          <div class="day-top">
            <span class="day-num">Dia {{ day.day }}</span>
            <span v-if="day.special" class="special-tag">VIP</span>
          </div>
          <div class="day-icon">
            <svg v-if="day.claimed" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else-if="day.isToday" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h6"/><path d="M12 11l9-9"/><path d="M15 2h6v6"/></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>
          </div>
          <span class="day-reward" :class="{ 'text-green': day.claimed }">{{ day.reward }}</span>
        </div>
      </div>
    </div>

    <div class="big-prize-card" v-if="bigPrize">
      <div class="big-prize-left">
        <span class="big-prize-label">Prêmio do 7º Dia</span>
        <span class="big-prize-val">{{ bigPrize.reward }}</span>
        <span class="big-prize-sub">+ {{ bigPrize.extra }} bônus VIP</span>
      </div>
      <div class="big-prize-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-yellow)" stroke-width="1.5">
          <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"/><rect x="2" y="7" width="20" height="5" rx="1"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
        </svg>
      </div>
    </div>

    <button
      class="checkin-btn"
      :class="{ disabled: !canCheckIn, done: todayClaimed }"
      :disabled="!canCheckIn"
      @click="doCheckIn"
    >
      <span v-if="todayClaimed">Já fez check-in hoje</span>
      <span v-else-if="canCheckIn">Fazer Check-in</span>
      <span v-else>Indisponível</span>
    </button>

    <div class="next-reset" v-if="todayClaimed">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      Próximo check-in em {{ countdown }}
    </div>

    <div class="rules-section">
      <h3>Regras do Check-in</h3>
      <ul>
        <li>Faça check-in uma vez por dia para ganhar recompensas</li>
        <li>Check-in consecutivo por 7 dias desbloqueia o prêmio especial</li>
        <li>Nível VIP mais alto = recompensas maiores</li>
        <li>A sequência é resetada ao perder um dia</li>
        <li>Bônus creditado automaticamente na carteira</li>
        <li>Cada ciclo de 7 dias reinicia com recompensas crescentes</li>
      </ul>
    </div>

    <div v-if="showResult" class="modal-overlay" @click.self="showResult = false">
      <div class="result-modal">
        <button class="modal-close" @click="showResult = false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="result-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h3>Check-in Realizado!</h3>
        <p class="result-amount">+ {{ lastReward }}</p>
        <p class="result-streak">{{ streak }} dias consecutivos</p>
        <button class="result-btn" @click="showResult = false">Confirmar</button>
      </div>
    </div>

    <div v-if="showRecords" class="modal-overlay" @click.self="showRecords = false">
      <div class="records-modal">
        <div class="records-header">
          <h3>Histórico de Check-in</h3>
          <button class="modal-close" @click="showRecords = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="records-list" v-if="records.length">
          <div v-for="rec in records" :key="rec.date" class="record-item">
            <span class="rec-date">{{ rec.date }}</span>
            <span class="rec-amount">+ {{ rec.amount }}</span>
          </div>
        </div>
        <div v-else class="records-empty">Nenhum registro ainda</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useActivityDetail } from '../../composables/useActivityDetail'

const {
  activityInfo,
  activityName,
  merchantCy,
  claimReward,
  formatAmount
} = useActivityDetail('SignIn')

const vipLevel = ref(0)
const streak = ref(0)
const totalClaimed = ref(0)
const totalEarned = ref('0,00')
const currentCycle = ref(1)
const showResult = ref(false)
const showRecords = ref(false)
const lastReward = ref('')
const todayClaimed = ref(false)
const countdown = ref('--:--:--')
let countdownTimer = null

const currentMonthLabel = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
})

const days = ref([])

const bigPrize = computed(() => {
  const d7 = days.value.find(d => d.day === 7)
  if (!d7) return null
  return { reward: d7.reward, extra: `${merchantCy.value} 5,00` }
})

const canCheckIn = computed(() => {
  const today = days.value.find(d => d.isToday)
  return today && !today.claimed
})

const records = ref([])

function buildDaysFromActivity(info) {
  if (!info) {
    const defaultDays = []
    for (let i = 1; i <= 7; i++) {
      defaultDays.push({
        day: i, reward: `${merchantCy.value} ${i * 2},00`,
        claimed: false, available: i === 1, isToday: i === 1, special: i === 7
      })
    }
    days.value = defaultDays
    return
  }

  const signInDays = info.signInDays || info.checkInDays || info.rewardLevels || []
  const signedDays = info.signedDays || info.checkedDays || []
  const todayIndex = (info.continuousDays || info.streak || 0)
  streak.value = todayIndex
  totalClaimed.value = signedDays.length
  vipLevel.value = info.vipLevel || 0

  if (signInDays.length) {
    days.value = signInDays.map((d, i) => ({
      day: i + 1,
      reward: `${merchantCy.value} ${formatAmount((d.rewardAmount || d.amount || 0) / 100)}`,
      claimed: signedDays.includes(i + 1) || i < todayIndex,
      available: i <= todayIndex,
      isToday: i === todayIndex,
      special: i === signInDays.length - 1 || d.special
    }))
  } else {
    for (let i = 1; i <= 7; i++) {
      days.value.push({
        day: i, reward: `${merchantCy.value} ${i * 2},00`,
        claimed: i <= todayIndex, available: i <= todayIndex + 1,
        isToday: i === todayIndex + 1, special: i === 7
      })
    }
  }

  todayClaimed.value = days.value.some(d => d.isToday && d.claimed)
  if (info.records) records.value = info.records.map(r => ({
    date: new Date(r.createdAt || r.date).toLocaleDateString('pt-BR'),
    amount: `${merchantCy.value} ${formatAmount((r.amount || 0) / 100)}`
  }))
}

async function doCheckIn() {
  const today = days.value.find(d => d.isToday)
  if (!today || today.claimed) return

  const result = await claimReward({ day: today.day })
  if (result) {
    today.claimed = true
    todayClaimed.value = true
    streak.value++
    totalClaimed.value++
    lastReward.value = today.reward
    records.value.unshift({
      date: new Date().toLocaleDateString('pt-BR'),
      amount: today.reward
    })
    showResult.value = true
    startCountdown()
  }
}

function claimDay(day) {
  if (day.isToday && !day.claimed) doCheckIn()
}

function startCountdown() {
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const diff = tomorrow - now
    if (diff <= 0) {
      countdown.value = '00:00:00'
      clearInterval(countdownTimer)
      return
    }
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    countdown.value = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }, 1000)
}

onMounted(() => {
  setTimeout(() => {
    buildDaysFromActivity(activityInfo.value)
    if (todayClaimed.value) startCountdown()
  }, 500)
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
.signin-page {
  padding: 0 .75rem 6rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100vh;
}

.page-header {
  display: flex; align-items: center; padding: .75rem 0; gap: .75rem;
}
.page-header h2 {
  flex: 1; font-size: 1.125rem; font-weight: 700;
  color: var(--ep-color-text-default);
}
.back-btn { color: var(--ep-color-text-default); padding: .25rem; background: none; border: none; cursor: pointer; }
.header-right { display: flex; }
.record-btn {
  font-size: .75rem; color: var(--ep-color-text-selected);
  background: none; border: 1px solid var(--ep-color-text-selected);
  border-radius: 1rem; padding: .25rem .75rem; cursor: pointer;
}

.signin-banner {
  position: relative; border-radius: .75rem; overflow: hidden;
  margin-bottom: 1rem;
}
.banner-bg {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%);
}
.banner-content {
  position: relative; z-index: 1; padding: 1.25rem 1rem;
  text-align: center;
}
.vip-badge {
  display: inline-block; padding: .125rem .625rem;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #000; font-size: .625rem; font-weight: 800;
  border-radius: .625rem; margin-bottom: .5rem;
  letter-spacing: .5px;
}
.banner-content h3 {
  font-size: 1.25rem; font-weight: 800; margin-bottom: .25rem;
}
.banner-content p {
  font-size: .75rem; color: rgba(255,255,255,.75); margin-bottom: .75rem;
}
.banner-stats {
  display: flex; justify-content: center; align-items: center; gap: .75rem;
}
.bstat { text-align: center; }
.bstat-val {
  display: block; font-size: 1.25rem; font-weight: 800;
  color: var(--accent-yellow, #fbbf24);
}
.bstat-lbl { font-size: .625rem; color: rgba(255,255,255,.7); }
.bstat-divider {
  width: 1px; height: 1.5rem; background: rgba(255,255,255,.2);
}

.calendar-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem;
  margin-bottom: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.calendar-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: .75rem;
}
.cal-month {
  font-size: .875rem; font-weight: 700; text-transform: capitalize;
  color: var(--ep-color-text-default);
}
.cal-cycle {
  font-size: .6875rem; color: var(--ep-color-text-weakest);
  background: rgba(255,255,255,.05); padding: .125rem .5rem;
  border-radius: .5rem;
}

.days-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: .5rem;
}
.day-card {
  background: rgba(255,255,255,.03); border-radius: .5rem;
  padding: .625rem .375rem; text-align: center;
  cursor: pointer; position: relative;
  transition: all .2s; border: 1.5px solid transparent;
}
.day-card.today {
  border-color: var(--ep-color-text-selected);
  background: rgba(24,170,255,.08);
  animation: todayPulse 2s infinite;
}
.day-card.claimed {
  background: rgba(34,197,94,.08);
  border-color: rgba(34,197,94,.3);
}
.day-card.locked { opacity: .35; cursor: default; }
.day-card.special {
  background: linear-gradient(135deg, rgba(251,191,36,.1), rgba(245,158,11,.05));
  grid-column: span 1;
}
.day-card:last-child { grid-column: span 4; }
.day-card.special:last-child {
  display: flex; align-items: center; gap: .75rem;
  padding: .75rem 1rem;
}

.day-top {
  display: flex; justify-content: center; align-items: center;
  gap: .25rem; margin-bottom: .25rem;
}
.day-num { font-size: .625rem; color: var(--ep-color-text-weakest); }
.special-tag {
  font-size: .5rem; padding: 1px 4px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #000; border-radius: .25rem; font-weight: 700;
}
.day-icon { height: 1.5rem; display: flex; align-items: center; justify-content: center; margin-bottom: .125rem; }
.day-reward {
  font-size: .6875rem; font-weight: 700;
  color: var(--accent-yellow, #fbbf24);
}
.day-reward.text-green { color: #22c55e; }

@keyframes todayPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(24,170,255,.3); }
  50% { box-shadow: 0 0 0 4px rgba(24,170,255,0); }
}

.big-prize-card {
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(135deg, rgba(251,191,36,.12), rgba(245,158,11,.06));
  border: 1px solid rgba(251,191,36,.2);
  border-radius: .75rem; padding: 1rem; margin-bottom: .75rem;
}
.big-prize-label {
  font-size: .75rem; color: var(--ep-color-text-weakest); display: block;
  margin-bottom: .125rem;
}
.big-prize-val {
  font-size: 1.25rem; font-weight: 800;
  color: var(--accent-yellow, #fbbf24); display: block;
}
.big-prize-sub {
  font-size: .6875rem; color: var(--accent-green, #22c55e); display: block;
  margin-top: .125rem;
}
.big-prize-icon { opacity: .8; }

.checkin-btn {
  width: 100%; padding: .875rem; border-radius: .5rem;
  font-size: 1rem; font-weight: 700; border: none; cursor: pointer;
  background: var(--gradient-primary);
  color: var(--ep-color-text-inverse, #0E1E3D);
  transition: all .2s;
}
.checkin-btn:active:not(.disabled) { transform: scale(.97); }
.checkin-btn.disabled, .checkin-btn.done {
  opacity: .5; cursor: default;
}

.next-reset {
  display: flex; align-items: center; justify-content: center;
  gap: .375rem; margin-top: .5rem; font-size: .75rem;
  color: var(--ep-color-text-weakest);
}

.rules-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-top: 1rem;
  border: 1px solid var(--ep-color-border-default);
}
.rules-section h3 {
  font-size: .875rem; font-weight: 700; margin-bottom: .625rem;
  color: var(--ep-color-text-default);
}
.rules-section ul { list-style: none; padding: 0; margin: 0; }
.rules-section li {
  font-size: .75rem; color: var(--ep-color-text-weakest);
  padding: .375rem 0 .375rem 1rem; position: relative; line-height: 1.5;
}
.rules-section li::before {
  content: ''; position: absolute; left: 0; top: .625rem;
  width: .25rem; height: .25rem; border-radius: 50%;
  background: var(--ep-color-text-selected);
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
  border: none; cursor: pointer; padding: .25rem;
}

.result-modal {
  position: relative; width: 100%; max-width: 20rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: 1rem; padding: 2rem 1.5rem; text-align: center;
  border: 1px solid var(--ep-color-border-default);
  animation: modalIn .3s ease;
}
.result-icon { margin-bottom: .75rem; }
.result-modal h3 {
  font-size: 1.125rem; font-weight: 800; margin-bottom: .5rem;
  color: var(--ep-color-text-default);
}
.result-amount {
  font-size: 1.75rem; font-weight: 900;
  color: var(--accent-green, #22c55e); margin-bottom: .25rem;
}
.result-streak {
  font-size: .8125rem; color: var(--ep-color-text-weakest);
  margin-bottom: 1.25rem;
}
.result-btn {
  width: 100%; padding: .75rem;
  background: var(--gradient-primary);
  color: var(--ep-color-text-inverse, #0E1E3D);
  border: none; border-radius: .5rem;
  font-size: .9375rem; font-weight: 700; cursor: pointer;
}

.records-modal {
  position: relative; width: 100%; max-width: 22rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: 1rem; max-height: 70vh; overflow: hidden;
  border: 1px solid var(--ep-color-border-default);
  animation: modalIn .3s ease;
  display: flex; flex-direction: column;
}
.records-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; border-bottom: 1px solid var(--ep-color-border-default);
}
.records-header h3 {
  font-size: 1rem; font-weight: 700;
  color: var(--ep-color-text-default);
}
.records-list {
  padding: .5rem 1.25rem; overflow-y: auto; flex: 1;
}
.record-item {
  display: flex; justify-content: space-between; padding: .75rem 0;
  border-bottom: 1px solid rgba(255,255,255,.04);
  font-size: .8125rem;
}
.rec-date { color: var(--ep-color-text-weakest); }
.rec-amount { color: var(--accent-green, #22c55e); font-weight: 700; }
.records-empty {
  padding: 2rem; text-align: center;
  color: var(--ep-color-text-weakest); font-size: .8125rem;
}

@keyframes modalIn {
  from { transform: scale(.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
