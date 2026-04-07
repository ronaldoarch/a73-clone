<template>
  <div class="member-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Agradecimento ao Membro</h2>
    </div>

    <div class="member-banner">
      <div class="banner-bg"></div>
      <div class="banner-inner">
        <h3>Obrigado por fazer parte!</h3>
        <p>Como membro valioso, você tem acesso a recompensas exclusivas</p>
        <div class="banner-info">
          <div class="bi-item">
            <span class="bi-label">Ciclo</span>
            <span class="bi-val">{{ cycle }}</span>
          </div>
          <div class="bi-divider"></div>
          <div class="bi-item">
            <span class="bi-label">Máximo</span>
            <span class="bi-val">R$ {{ maxReward }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="countdown-section" v-if="endTime">
      <div class="cd-label">Termina em:</div>
      <div class="cd-timer">{{ countdown }}</div>
    </div>

    <div class="rewards-section">
      <h3>Recompensas Diárias</h3>
      <div class="rewards-grid">
        <div
          v-for="reward in rewards"
          :key="reward.day"
          class="reward-card"
          :class="{ claimed: reward.claimed, available: reward.available && !reward.claimed, locked: !reward.available && !reward.claimed }"
          @click="claim(reward)"
        >
          <span class="rc-day">Dia {{ reward.day }}</span>
          <div class="rc-icon">
            <svg v-if="reward.claimed" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else-if="reward.available" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-yellow)" stroke-width="1.5">
              <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"/><rect x="2" y="7" width="20" height="5" rx="1"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <span class="rc-amount">{{ reward.amount }}</span>
          <button
            v-if="reward.available && !reward.claimed"
            class="rc-claim-btn"
            @click.stop="claim(reward)"
          >
            Coletar
          </button>
        </div>
      </div>
    </div>

    <button
      class="main-claim-btn"
      :disabled="!hasClaimable"
      @click="claimAll"
    >
      {{ hasClaimable ? 'Coletar Disponíveis' : 'Nenhum bônus disponível' }}
    </button>

    <div class="rules-section">
      <h3>Regras</h3>
      <ul>
        <li>Recompensas de membro são distribuídas por ciclo</li>
        <li>Cada dia tem uma recompensa diferente</li>
        <li>Dias consecutivos aumentam o valor do bônus</li>
        <li>Membros VIP recebem recompensas maiores</li>
        <li>Bônus creditado automaticamente na carteira</li>
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
        <h3>Recompensa Coletada!</h3>
        <p class="result-amount">+ {{ lastClaimed }}</p>
        <button class="result-btn" @click="showResult = false">Confirmar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const cycle = ref('Semanal')
const maxReward = ref('100')
const endTime = ref(true)
const countdown = ref('--:--:--')
const showResult = ref(false)
const lastClaimed = ref('')
let timer = null

const rewards = ref([
  { day: 1, amount: 'R$ 2', claimed: true, available: true },
  { day: 2, amount: 'R$ 3', claimed: true, available: true },
  { day: 3, amount: 'R$ 5', claimed: false, available: true },
  { day: 5, amount: 'R$ 10', claimed: false, available: false },
  { day: 7, amount: 'R$ 20', claimed: false, available: false },
  { day: 14, amount: 'R$ 50', claimed: false, available: false },
  { day: 30, amount: 'R$ 100', claimed: false, available: false },
])

const hasClaimable = computed(() => rewards.value.some(r => r.available && !r.claimed))

function claim(reward) {
  if (!reward.available || reward.claimed) return
  reward.claimed = true
  lastClaimed.value = reward.amount
  showResult.value = true
}

function claimAll() {
  const claimable = rewards.value.filter(r => r.available && !r.claimed)
  if (!claimable.length) return
  claimable.forEach(r => { r.claimed = true })
  lastClaimed.value = claimable.map(r => r.amount).join(' + ')
  showResult.value = true
}

function startCountdown() {
  timer = setInterval(() => {
    const now = new Date()
    const end = new Date(now)
    end.setDate(end.getDate() + 1)
    end.setHours(0, 0, 0, 0)
    const diff = end - now
    if (diff <= 0) { clearInterval(timer); return }
    const h = String(Math.floor(diff / 3600000)).padStart(2, '0')
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
    countdown.value = `${h}:${m}:${s}`
  }, 1000)
}

onMounted(() => startCountdown())
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.member-page {
  padding: 0 .75rem 6rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100vh;
}
.page-header { display: flex; align-items: center; padding: .75rem 0; gap: .75rem; }
.page-header h2 { flex: 1; font-size: 1.125rem; font-weight: 700; color: var(--ep-color-text-default); }
.back-btn { color: var(--ep-color-text-default); padding: .25rem; background: none; border: none; cursor: pointer; }

.member-banner { position: relative; border-radius: .75rem; overflow: hidden; margin-bottom: .75rem; }
.banner-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #9333ea 0%, #c084fc 50%, #e879f9 100%); }
.banner-inner { position: relative; z-index: 1; padding: 1.25rem 1rem; text-align: center; }
.banner-inner h3 { font-size: 1.25rem; font-weight: 800; }
.banner-inner p { font-size: .75rem; color: rgba(255,255,255,.75); margin-top: .25rem; margin-bottom: .75rem; }
.banner-info { display: flex; justify-content: center; align-items: center; gap: 1rem; }
.bi-item { text-align: center; }
.bi-label { display: block; font-size: .625rem; color: rgba(255,255,255,.6); }
.bi-val { font-size: 1rem; font-weight: 800; }
.bi-divider { width: 1px; height: 1.5rem; background: rgba(255,255,255,.2); }

.countdown-section {
  display: flex; align-items: center; justify-content: center; gap: .5rem;
  padding: .625rem; background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .5rem; margin-bottom: .75rem;
  border: 1px solid var(--ep-color-border-default);
  font-size: .8125rem;
}
.cd-label { color: var(--ep-color-text-weakest); }
.cd-timer { font-weight: 700; color: var(--ep-color-text-default); }

.rewards-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-bottom: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.rewards-section h3 { font-size: .875rem; font-weight: 700; margin-bottom: .75rem; color: var(--ep-color-text-default); }

.rewards-grid { display: flex; flex-direction: column; gap: .375rem; }
.reward-card {
  display: flex; align-items: center; gap: .625rem;
  padding: .75rem; border-radius: .5rem;
  background: rgba(255,255,255,.02);
  border: 1.5px solid transparent;
  transition: all .2s;
}
.reward-card.available {
  border-color: rgba(251,191,36,.3);
  background: rgba(251,191,36,.05);
  cursor: pointer;
}
.reward-card.claimed {
  background: rgba(34,197,94,.05);
  border-color: rgba(34,197,94,.2);
}
.reward-card.locked { opacity: .4; }

.rc-day { font-size: .75rem; color: var(--ep-color-text-weakest); min-width: 3rem; }
.rc-icon { display: flex; align-items: center; }
.rc-amount { flex: 1; font-size: 1rem; font-weight: 700; color: var(--accent-yellow, #fbbf24); }
.reward-card.claimed .rc-amount { color: var(--accent-green, #22c55e); }

.rc-claim-btn {
  padding: .25rem .75rem; border-radius: 1rem;
  background: var(--gradient-primary);
  color: var(--ep-color-text-inverse, #0E1E3D);
  font-size: .6875rem; font-weight: 700;
  border: none; cursor: pointer;
}

.main-claim-btn {
  width: 100%; padding: .875rem; border-radius: .5rem;
  font-size: 1rem; font-weight: 700; border: none; cursor: pointer;
  background: linear-gradient(135deg, #9333ea, #c084fc);
  color: #fff; transition: all .2s;
}
.main-claim-btn:active:not(:disabled) { transform: scale(.97); }
.main-claim-btn:disabled { opacity: .4; cursor: default; }

.rules-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-top: .75rem;
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
  background: #9333ea;
}

.modal-overlay {
  position: fixed; inset: 0; z-index: 10000;
  background: rgba(0,0,0,.65);
  display: flex; align-items: center; justify-content: center; padding: 1.5rem;
}
.modal-close {
  position: absolute; top: .75rem; right: .75rem;
  color: var(--ep-color-text-weakest); background: none; border: none; cursor: pointer;
}
.result-modal {
  position: relative; width: 100%; max-width: 20rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: 1rem; padding: 2rem 1.5rem; text-align: center;
  border: 1px solid var(--ep-color-border-default);
  animation: modalIn .3s ease;
}
.result-icon { margin-bottom: .75rem; }
.result-modal h3 { font-size: 1.125rem; font-weight: 800; color: var(--ep-color-text-default); }
.result-amount { font-size: 1.75rem; font-weight: 900; color: var(--accent-green, #22c55e); margin: .5rem 0 1.25rem; }
.result-btn {
  width: 100%; padding: .75rem;
  background: linear-gradient(135deg, #9333ea, #c084fc);
  color: #fff; border: none; border-radius: .5rem;
  font-size: .9375rem; font-weight: 700; cursor: pointer;
}

@keyframes modalIn {
  from { transform: scale(.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
