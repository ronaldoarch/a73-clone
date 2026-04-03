<template>
  <div class="wheel-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Roda da Sorte</h2>
      <span class="spins-count">{{ spins }} giros</span>
    </div>

    <div class="wheel-container">
      <div class="wheel" :style="{ transform: `rotate(${rotation}deg)` }">
        <div v-for="(prize, i) in prizes" :key="i" class="wheel-segment" :style="segmentStyle(i)">
          <span class="segment-text">{{ prize.label }}</span>
        </div>
      </div>
      <div class="wheel-pointer">▼</div>
    </div>

    <button class="spin-btn" :disabled="spinning || spins <= 0" @click="spin">
      {{ spinning ? 'Girando...' : 'GIRAR' }}
    </button>

    <div class="wheel-records">
      <h3>Últimos Ganhadores</h3>
      <div class="records-scroll">
        <div v-for="rec in records" :key="rec.id" class="record-item">
          <span class="rec-user">{{ rec.user }}</span>
          <span class="rec-prize">{{ rec.prize }}</span>
        </div>
      </div>
    </div>

    <div class="wheel-rules">
      <h3>Regras</h3>
      <ul>
        <li>Cada giro consome 1 chance</li>
        <li>Ganhe chances fazendo depósitos</li>
        <li>Prêmios creditados automaticamente</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const spins = ref(3)
const spinning = ref(false)
const rotation = ref(0)

const prizes = [
  { label: 'R$ 1', color: '#ef4444' },
  { label: 'R$ 5', color: '#f59e0b' },
  { label: 'R$ 2', color: '#22c55e' },
  { label: 'R$ 10', color: '#3b82f6' },
  { label: 'R$ 0.5', color: '#8b5cf6' },
  { label: 'R$ 50', color: '#ec4899' },
  { label: 'R$ 3', color: '#14b8a6' },
  { label: 'Bônus', color: '#a855f7' },
]

const records = ref([
  { id: 1, user: 'U***7', prize: 'R$ 50,00' },
  { id: 2, user: 'J***3', prize: 'R$ 10,00' },
  { id: 3, user: 'M***9', prize: 'R$ 5,00' },
])

function segmentStyle(i) {
  const angle = 360 / prizes.length
  return {
    transform: `rotate(${angle * i}deg)`,
    background: prizes[i].color
  }
}

function spin() {
  if (spinning.value || spins.value <= 0) return
  spinning.value = true
  spins.value--
  const targetIndex = Math.floor(Math.random() * prizes.length)
  const angle = 360 / prizes.length
  const extraSpins = 5 * 360
  rotation.value += extraSpins + (360 - targetIndex * angle)

  setTimeout(() => {
    spinning.value = false
    alert(`Você ganhou: ${prizes[targetIndex].label}!`)
  }, 4000)
}
</script>

<style scoped>
.wheel-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }
.spins-count { font-size: 13px; color: var(--accent-yellow); font-weight: 600; }

.wheel-container { position: relative; width: 280px; height: 280px; margin: 16px auto; }
.wheel { width: 100%; height: 100%; border-radius: 50%; position: relative; overflow: hidden; border: 4px solid var(--accent-yellow); transition: transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99); }
.wheel-segment { position: absolute; width: 50%; height: 50%; left: 50%; top: 0; transform-origin: 0% 100%; display: flex; align-items: center; justify-content: center; }
.segment-text { font-size: 11px; font-weight: 700; color: #fff; transform: rotate(22.5deg) translateX(20px); }
.wheel-pointer { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); font-size: 28px; color: var(--accent-yellow); z-index: 2; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); }

.spin-btn { display: block; margin: 0 auto 20px; padding: 14px 48px; border-radius: 30px; background: linear-gradient(135deg, var(--accent-yellow), #f59e0b); color: #000; font-size: 18px; font-weight: 800; letter-spacing: 2px; transition: var(--transition); }
.spin-btn:active { transform: scale(0.95); }
.spin-btn:disabled { opacity: 0.4; }

.wheel-records { background: var(--bg-card); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 12px; }
.wheel-records h3 { font-size: 15px; font-weight: 700; margin-bottom: 10px; }
.record-item { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: var(--text-secondary); border-bottom: 1px solid rgba(255,255,255,0.04); }
.rec-prize { color: var(--accent-yellow); font-weight: 600; }

.wheel-rules { background: var(--bg-card); border-radius: var(--radius-lg); padding: 16px; }
.wheel-rules h3 { font-size: 15px; font-weight: 700; margin-bottom: 10px; }
.wheel-rules ul { list-style: none; padding: 0; }
.wheel-rules li { font-size: 13px; color: var(--text-secondary); padding: 6px 0 6px 16px; position: relative; }
.wheel-rules li::before { content: '•'; position: absolute; left: 0; color: var(--purple-300); }
</style>
