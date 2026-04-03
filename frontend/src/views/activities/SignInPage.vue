<template>
  <div class="signin-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Check-in Diário</h2>
    </div>

    <div class="signin-banner">
      <h3>🎁 Faça check-in e ganhe prêmios!</h3>
      <p>Quanto mais dias consecutivos, maiores as recompensas!</p>
    </div>

    <div class="days-grid">
      <div
        v-for="day in days"
        :key="day.day"
        class="day-card"
        :class="{ claimed: day.claimed, today: day.isToday, locked: !day.available }"
        @click="claimDay(day)"
      >
        <span class="day-num">Dia {{ day.day }}</span>
        <span class="day-reward">{{ day.reward }}</span>
        <div v-if="day.claimed" class="check-mark">✓</div>
      </div>
    </div>

    <div class="streak-info">
      <div class="streak-card">
        <span class="streak-val">{{ streak }}</span>
        <span class="streak-label">Dias consecutivos</span>
      </div>
      <div class="streak-card">
        <span class="streak-val">{{ totalClaimed }}</span>
        <span class="streak-label">Total coletados</span>
      </div>
    </div>

    <div class="rules-section">
      <h3>Regras</h3>
      <ul>
        <li>Faça check-in uma vez por dia</li>
        <li>Check-in consecutivo aumenta o bônus</li>
        <li>Perder um dia reseta a sequência</li>
        <li>Bônus creditado automaticamente</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const streak = ref(3)
const totalClaimed = ref(15)

const days = ref([
  { day: 1, reward: 'R$ 1', claimed: true, available: true, isToday: false },
  { day: 2, reward: 'R$ 2', claimed: true, available: true, isToday: false },
  { day: 3, reward: 'R$ 3', claimed: true, available: true, isToday: false },
  { day: 4, reward: 'R$ 5', claimed: false, available: true, isToday: true },
  { day: 5, reward: 'R$ 8', claimed: false, available: false, isToday: false },
  { day: 6, reward: 'R$ 10', claimed: false, available: false, isToday: false },
  { day: 7, reward: 'R$ 20', claimed: false, available: false, isToday: false },
])

function claimDay(day) {
  if (!day.isToday || day.claimed) return
  day.claimed = true
  streak.value++
  totalClaimed.value++
  alert(`Check-in realizado! Você ganhou ${day.reward}`)
}
</script>

<style scoped>
.signin-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }

.signin-banner { background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: var(--radius-lg); padding: 20px 16px; margin-bottom: 16px; text-align: center; }
.signin-banner h3 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.signin-banner p { font-size: 12px; color: rgba(255,255,255,0.8); }

.days-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
.day-card { background: var(--bg-card); border-radius: var(--radius-md); padding: 14px 8px; text-align: center; cursor: pointer; position: relative; transition: var(--transition); border: 2px solid transparent; }
.day-card.today { border-color: var(--accent-yellow); animation: pulse 2s infinite; }
.day-card.claimed { background: rgba(34,197,94,0.15); border-color: var(--accent-green); }
.day-card.locked { opacity: 0.4; cursor: default; }
.day-card:last-child { grid-column: span 1; }
.day-num { display: block; font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
.day-reward { display: block; font-size: 14px; font-weight: 700; color: var(--accent-yellow); }
.check-mark { position: absolute; top: 4px; right: 6px; color: var(--accent-green); font-size: 14px; font-weight: 700; }
@keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,0.4); } 50% { box-shadow: 0 0 0 6px rgba(251,191,36,0); } }

.streak-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
.streak-card { background: var(--bg-card); border-radius: var(--radius-md); padding: 16px; text-align: center; }
.streak-val { display: block; font-size: 24px; font-weight: 800; color: var(--accent-yellow); margin-bottom: 4px; }
.streak-label { font-size: 12px; color: var(--text-muted); }

.rules-section { background: var(--bg-card); border-radius: var(--radius-lg); padding: 16px; }
.rules-section h3 { font-size: 15px; font-weight: 700; margin-bottom: 10px; }
.rules-section ul { list-style: none; padding: 0; }
.rules-section li { font-size: 13px; color: var(--text-secondary); padding: 6px 0; padding-left: 16px; position: relative; }
.rules-section li::before { content: '•'; position: absolute; left: 0; color: var(--purple-300); }
</style>
