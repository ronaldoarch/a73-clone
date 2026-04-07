<template>
  <div class="newuser-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Exclusivo Novos Usuários</h2>
    </div>

    <div class="newuser-banner">
      <div class="banner-bg"></div>
      <div class="banner-inner">
        <h3>Boas-Vindas!</h3>
        <p>Exclusivo para novos membros. Gire a grade e ganhe prêmios!</p>
      </div>
    </div>

    <div class="grid-section">
      <div class="lucky-grid">
        <div
          v-for="(cell, idx) in gridCells"
          :key="idx"
          class="grid-cell"
          :class="{
            center: idx === 4,
            active: activeIdx === idx,
            revealed: cell.revealed
          }"
          @click="idx === 4 && spin()"
        >
          <div v-if="idx === 4" class="center-btn">
            <span v-if="!isSpinning && !hasSpun">GIRAR</span>
            <span v-else-if="isSpinning" class="spinning-text">...</span>
            <span v-else>Feito!</span>
          </div>
          <template v-else>
            <div v-if="cell.revealed" class="cell-prize">
              <span class="cell-amount">{{ cell.prize }}</span>
            </div>
            <div v-else class="cell-hidden">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
                <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"/><rect x="2" y="7" width="20" height="5" rx="1"/>
              </svg>
            </div>
          </template>
        </div>
      </div>
      <p class="grid-tip" v-if="!hasSpun">Toque em GIRAR para revelar seu prêmio!</p>
      <p class="grid-tip won" v-else>Você ganhou {{ wonPrize }}!</p>
    </div>

    <div class="prizes-overview">
      <h3>Prêmios Possíveis</h3>
      <div class="prizes-list">
        <div v-for="p in allPrizes" :key="p" class="prize-tag">{{ p }}</div>
      </div>
    </div>

    <div class="rules-section">
      <h3>Regras</h3>
      <ul>
        <li>Disponível apenas para novos membros (primeiros 7 dias)</li>
        <li>Toque em GIRAR para sortear seu prêmio</li>
        <li>Cada novo usuário tem 1 giro grátis</li>
        <li>O prêmio é creditado automaticamente na carteira</li>
        <li>Faça um depósito para desbloquear giros adicionais</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const prizes = ['R$ 1', 'R$ 2', 'R$ 5', 'R$ 10', 'R$ 3', 'R$ 20', 'R$ 8', 'R$ 15']
const allPrizes = ['R$ 1', 'R$ 2', 'R$ 3', 'R$ 5', 'R$ 8', 'R$ 10', 'R$ 15', 'R$ 20']
const gridCells = ref(
  [0,1,2,3,4,5,6,7,8].map((_, idx) => ({
    prize: idx === 4 ? '' : prizes[idx > 4 ? idx - 1 : idx],
    revealed: false
  }))
)

const activeIdx = ref(-1)
const isSpinning = ref(false)
const hasSpun = ref(false)
const wonPrize = ref('')

const spinOrder = [0, 1, 2, 5, 8, 7, 6, 3]

function spin() {
  if (isSpinning.value || hasSpun.value) return
  isSpinning.value = true

  const totalSteps = spinOrder.length * 3 + Math.floor(Math.random() * spinOrder.length)
  const winIdx = totalSteps % spinOrder.length
  let step = 0

  const interval = setInterval(() => {
    activeIdx.value = spinOrder[step % spinOrder.length]
    step++
    if (step >= totalSteps) {
      clearInterval(interval)
      const finalCellIdx = spinOrder[winIdx]
      activeIdx.value = finalCellIdx
      gridCells.value[finalCellIdx].revealed = true
      wonPrize.value = gridCells.value[finalCellIdx].prize
      isSpinning.value = false
      hasSpun.value = true
    }
  }, 100 + Math.floor(step / totalSteps * 200))
}
</script>

<style scoped>
.newuser-page {
  padding: 0 .75rem 6rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100vh;
}
.page-header { display: flex; align-items: center; padding: .75rem 0; gap: .75rem; }
.page-header h2 { flex: 1; font-size: 1.125rem; font-weight: 700; color: var(--ep-color-text-default); }
.back-btn { color: var(--ep-color-text-default); padding: .25rem; background: none; border: none; cursor: pointer; }

.newuser-banner { position: relative; border-radius: .75rem; overflow: hidden; margin-bottom: .75rem; }
.banner-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #ec4899, #f43f5e, #fb7185); }
.banner-inner { position: relative; z-index: 1; padding: 1.25rem 1rem; text-align: center; }
.banner-inner h3 { font-size: 1.25rem; font-weight: 800; }
.banner-inner p { font-size: .75rem; color: rgba(255,255,255,.75); margin-top: .25rem; }

.grid-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-bottom: .75rem;
  border: 1px solid var(--ep-color-border-default);
}

.lucky-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .375rem; }
.grid-cell {
  aspect-ratio: 1; border-radius: .5rem; display: flex;
  align-items: center; justify-content: center;
  background: rgba(255,255,255,.03); border: 2px solid rgba(255,255,255,.06);
  cursor: default; transition: all .15s; position: relative;
}
.grid-cell.center {
  background: linear-gradient(135deg, #ec4899, #f43f5e);
  border: none; cursor: pointer;
}
.grid-cell.center:active { transform: scale(.93); }
.grid-cell.active {
  border-color: var(--accent-yellow, #fbbf24);
  background: rgba(251,191,36,.12);
  box-shadow: 0 0 8px rgba(251,191,36,.3);
}
.grid-cell.revealed {
  background: rgba(34,197,94,.08);
  border-color: rgba(34,197,94,.3);
}

.center-btn { font-size: 1rem; font-weight: 800; color: #fff; }
.spinning-text { animation: blink .4s infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }

.cell-prize { text-align: center; }
.cell-amount { font-size: .875rem; font-weight: 800; color: var(--accent-green, #22c55e); }
.cell-hidden { opacity: .6; }

.grid-tip { text-align: center; margin-top: .625rem; font-size: .75rem; color: var(--ep-color-text-weakest); }
.grid-tip.won { color: var(--accent-green, #22c55e); font-weight: 700; }

.prizes-overview {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-bottom: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.prizes-overview h3 { font-size: .875rem; font-weight: 700; margin-bottom: .625rem; color: var(--ep-color-text-default); }
.prizes-list { display: flex; flex-wrap: wrap; gap: .375rem; }
.prize-tag {
  padding: .25rem .625rem; border-radius: 1rem; font-size: .6875rem;
  font-weight: 600; background: rgba(236,72,153,.1);
  color: #ec4899; border: 1px solid rgba(236,72,153,.2);
}

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
  background: #ec4899;
}
</style>
