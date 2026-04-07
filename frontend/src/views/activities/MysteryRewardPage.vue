<template>
  <div class="mystery-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Recompensa Misteriosa</h2>
    </div>

    <div class="mystery-banner">
      <div class="banner-particles"></div>
      <div class="banner-inner">
        <div class="gem-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#gemGrad)" stroke-width="1.5">
            <defs><linearGradient id="gemGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#a855f7"/><stop offset="100%" stop-color="#6366f1"/></linearGradient></defs>
            <polygon points="6 3 18 3 22 9 12 22 2 9"/>
            <line x1="12" y1="22" x2="6" y2="3"/><line x1="12" y1="22" x2="18" y2="3"/>
            <line x1="2" y1="9" x2="22" y2="9"/>
          </svg>
        </div>
        <h3>Caixas Misteriosas</h3>
        <p>Abra caixas para revelar prêmios ocultos. Aposte mais para desbloquear tiers melhores!</p>
        <div class="banner-tier">
          <span>Seu Tier:</span>
          <span class="tier-badge" :class="currentTierClass">{{ currentTier }}</span>
        </div>
      </div>
    </div>

    <div class="countdown-bar" v-if="nextResetTime">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span>Renova em: <strong>{{ countdown }}</strong></span>
    </div>

    <div class="boxes-section">
      <h3>Suas Caixas <span class="box-count">{{ openedCount }}/{{ boxes.length }}</span></h3>
      <div class="mystery-boxes">
        <div
          v-for="box in boxes"
          :key="box.id"
          class="box-card"
          :class="{ opened: box.opened, opening: box.opening, locked: box.locked }"
          @click="openBox(box)"
        >
          <div class="box-inner">
            <div v-if="!box.opened && !box.opening" class="box-closed">
              <svg v-if="!box.locked" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-yellow)" stroke-width="1.5">
                <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"/><rect x="2" y="7" width="20" height="5" rx="1"/>
              </svg>
              <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <span class="box-q" v-if="!box.locked">?</span>
            </div>
            <div v-else-if="box.opening" class="box-opening-anim">
              <div class="spinner-ring"></div>
            </div>
            <div v-else class="box-opened">
              <span class="box-prize-val">{{ box.prize }}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
          <span v-if="box.locked" class="box-lock-label">Nível {{ box.requiredLevel }}</span>
        </div>
      </div>
    </div>

    <div class="tier-section">
      <h3>Níveis de Caixa</h3>
      <div class="tier-list">
        <div v-for="t in tiers" :key="t.name" class="tier-row" :class="{ active: t.name === currentTier }">
          <span class="tier-name" :class="t.class">{{ t.name }}</span>
          <span class="tier-req">Aposte ≥ R$ {{ t.minBet }}</span>
          <span class="tier-range">{{ t.range }}</span>
        </div>
      </div>
    </div>

    <div class="rules-section">
      <h3>Regras</h3>
      <ul>
        <li>Caixas disponíveis renovam a cada 24 horas</li>
        <li>Aposte mais para desbloquear caixas de tiers superiores</li>
        <li>Prêmios são creditados automaticamente</li>
        <li>Caixas bloqueadas exigem nível VIP específico</li>
        <li>Máximo de 6 caixas por dia</li>
      </ul>
    </div>

    <div v-if="showPrize" class="modal-overlay" @click.self="showPrize = null">
      <div class="prize-modal">
        <button class="modal-close" @click="showPrize = null">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="prize-gem">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="1.5">
            <polygon points="6 3 18 3 22 9 12 22 2 9"/>
          </svg>
        </div>
        <h3>Prêmio Revelado!</h3>
        <p class="prize-value">{{ showPrize }}</p>
        <button class="prize-btn" @click="showPrize = null">Coletar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const showPrize = ref(null)
const countdown = ref('--:--:--')
const nextResetTime = ref(true)
let timer = null

const currentTier = ref('Bronze')
const currentTierClass = computed(() => {
  const m = { Bronze: 'tier-bronze', Prata: 'tier-silver', Ouro: 'tier-gold', Diamante: 'tier-diamond' }
  return m[currentTier.value] || 'tier-bronze'
})

const boxes = ref([
  { id: 1, opened: false, opening: false, prize: 'R$ 2,00', locked: false, requiredLevel: 0 },
  { id: 2, opened: false, opening: false, prize: 'R$ 5,00', locked: false, requiredLevel: 0 },
  { id: 3, opened: false, opening: false, prize: 'R$ 1,50', locked: false, requiredLevel: 0 },
  { id: 4, opened: false, opening: false, prize: 'R$ 10,00', locked: false, requiredLevel: 0 },
  { id: 5, opened: false, opening: false, prize: 'R$ 3,00', locked: true, requiredLevel: 3 },
  { id: 6, opened: false, opening: false, prize: 'R$ 20,00', locked: true, requiredLevel: 5 },
])

const openedCount = computed(() => boxes.value.filter(b => b.opened).length)

const tiers = [
  { name: 'Bronze', minBet: '0', range: 'R$ 0,50 - R$ 3,00', class: 'tier-bronze' },
  { name: 'Prata', minBet: '500', range: 'R$ 1,00 - R$ 8,00', class: 'tier-silver' },
  { name: 'Ouro', minBet: '2.000', range: 'R$ 3,00 - R$ 20,00', class: 'tier-gold' },
  { name: 'Diamante', minBet: '10.000', range: 'R$ 10,00 - R$ 100,00', class: 'tier-diamond' },
]

function openBox(box) {
  if (box.opened || box.locked || box.opening) return
  box.opening = true
  setTimeout(() => {
    box.opening = false
    box.opened = true
    showPrize.value = box.prize
  }, 1200)
}

function startCountdown() {
  timer = setInterval(() => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const diff = tomorrow - now
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
.mystery-page {
  padding: 0 .75rem 6rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100vh;
}
.page-header { display: flex; align-items: center; padding: .75rem 0; gap: .75rem; }
.page-header h2 { flex: 1; font-size: 1.125rem; font-weight: 700; color: var(--ep-color-text-default); }
.back-btn { color: var(--ep-color-text-default); padding: .25rem; background: none; border: none; cursor: pointer; }

.mystery-banner {
  position: relative; border-radius: .75rem; overflow: hidden;
  margin-bottom: .75rem;
}
.banner-particles {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #a855f7 100%);
}
.banner-inner {
  position: relative; z-index: 1; padding: 1.5rem 1rem; text-align: center;
}
.gem-icon { margin-bottom: .5rem; }
.banner-inner h3 { font-size: 1.25rem; font-weight: 800; margin-bottom: .25rem; }
.banner-inner p { font-size: .75rem; color: rgba(255,255,255,.7); margin-bottom: .75rem; }
.banner-tier { display: flex; align-items: center; justify-content: center; gap: .375rem; font-size: .75rem; }
.tier-badge {
  padding: .125rem .625rem; border-radius: .5rem;
  font-size: .6875rem; font-weight: 700;
}
.tier-bronze { background: #cd7f32; color: #fff; }
.tier-silver { background: #c0c0c0; color: #333; }
.tier-gold { background: linear-gradient(135deg, #ffd700, #ffaa00); color: #333; }
.tier-diamond { background: linear-gradient(135deg, #b9f2ff, #0ea5e9); color: #0c4a6e; }

.countdown-bar {
  display: flex; align-items: center; gap: .375rem;
  padding: .625rem .75rem; background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .5rem; margin-bottom: .75rem; font-size: .75rem;
  color: var(--ep-color-text-weakest);
  border: 1px solid var(--ep-color-border-default);
}
.countdown-bar strong { color: var(--ep-color-text-default); }

.boxes-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-bottom: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.boxes-section h3 {
  font-size: .875rem; font-weight: 700; margin-bottom: .75rem;
  color: var(--ep-color-text-default);
  display: flex; align-items: center; gap: .375rem;
}
.box-count { font-size: .6875rem; color: var(--ep-color-text-weakest); font-weight: 500; }

.mystery-boxes { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; }
.box-card {
  aspect-ratio: 1; border-radius: .5rem;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  cursor: pointer; position: relative;
  transition: all .2s; overflow: hidden;
  background: rgba(255,255,255,.03);
  border: 1.5px solid rgba(255,255,255,.06);
}
.box-card:active:not(.opened):not(.locked) { transform: scale(.93); }
.box-card.opened {
  background: rgba(34,197,94,.06);
  border-color: rgba(34,197,94,.2);
}
.box-card.locked { opacity: .4; cursor: not-allowed; }

.box-inner { display: flex; flex-direction: column; align-items: center; gap: .25rem; }
.box-closed { display: flex; flex-direction: column; align-items: center; }
.box-q { font-size: 1.25rem; font-weight: 900; color: var(--accent-yellow, #fbbf24); margin-top: .125rem; }

.box-opening-anim { display: flex; align-items: center; justify-content: center; }
.spinner-ring {
  width: 2rem; height: 2rem;
  border: 3px solid rgba(168,85,247,.2);
  border-top-color: #a855f7;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

.box-opened { display: flex; flex-direction: column; align-items: center; gap: .25rem; }
.box-prize-val { font-size: .875rem; font-weight: 800; color: var(--accent-green, #22c55e); }

.box-lock-label {
  position: absolute; bottom: .25rem;
  font-size: .5rem; color: var(--ep-color-text-weakest);
}

.tier-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-bottom: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.tier-section h3 { font-size: .875rem; font-weight: 700; margin-bottom: .625rem; color: var(--ep-color-text-default); }
.tier-list { display: flex; flex-direction: column; gap: .25rem; }
.tier-row {
  display: flex; align-items: center; gap: .5rem;
  padding: .5rem .625rem; border-radius: .375rem;
  font-size: .75rem; background: rgba(255,255,255,.02);
}
.tier-row.active { background: rgba(168,85,247,.1); border: 1px solid rgba(168,85,247,.25); }
.tier-name { font-weight: 700; min-width: 4.5rem; }
.tier-req { flex: 1; color: var(--ep-color-text-weakest); }
.tier-range { color: var(--accent-yellow, #fbbf24); font-weight: 600; }

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
  background: #a855f7;
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
.prize-modal {
  position: relative; width: 100%; max-width: 20rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: 1rem; padding: 2rem 1.5rem; text-align: center;
  border: 1px solid var(--ep-color-border-default);
  animation: modalIn .3s ease;
}
.prize-gem { margin-bottom: .5rem; }
.prize-modal h3 { font-size: 1.125rem; font-weight: 800; color: var(--ep-color-text-default); }
.prize-value {
  font-size: 2rem; font-weight: 900;
  color: #a855f7; margin: .5rem 0 1.25rem;
}
.prize-btn {
  width: 100%; padding: .75rem;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff; border: none; border-radius: .5rem;
  font-size: .9375rem; font-weight: 700; cursor: pointer;
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes modalIn {
  from { transform: scale(.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
