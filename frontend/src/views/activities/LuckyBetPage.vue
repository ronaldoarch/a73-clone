<template>
  <div class="lucky-bet-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Lucky Bet</h2>
      <button class="record-btn" @click="showHistory = true">Registros</button>
    </div>

    <div class="bet-banner">
      <div class="banner-bg"></div>
      <div class="banner-inner">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.5">
          <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 4v16"/><path d="M2 12h20"/>
        </svg>
        <h3>Lucky Bet</h3>
        <p>Selecione seus números da sorte e ganhe prêmios!</p>
      </div>
    </div>

    <div class="round-info">
      <div class="round-left">
        <span class="round-label">Rodada</span>
        <span class="round-num">#{{ currentRound }}</span>
      </div>
      <div class="round-right">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>{{ countdown }}</span>
      </div>
    </div>

    <div class="selection-section">
      <h3>Selecione até 3 números</h3>
      <div class="grid-3x3">
        <div
          v-for="n in 9"
          :key="n"
          class="bet-cell"
          :class="{ selected: selected.includes(n) }"
          @click="toggleSelect(n)"
        >
          <span class="ball">{{ n }}</span>
        </div>
      </div>
      <div class="selection-info">
        <span>Selecionados: {{ selected.length }}/3</span>
        <button class="clear-btn" v-if="selected.length" @click="selected = []">Limpar</button>
      </div>
    </div>

    <div class="bet-amount-section">
      <h3>Valor da Aposta</h3>
      <div class="amount-options">
        <button
          v-for="amt in amounts"
          :key="amt"
          class="amt-btn"
          :class="{ active: betAmount === amt }"
          @click="betAmount = amt"
        >
          R$ {{ amt }}
        </button>
      </div>
    </div>

    <div class="potential-win">
      <span>Ganho potencial:</span>
      <span class="win-val">R$ {{ potentialWin }}</span>
    </div>

    <button
      class="place-bet-btn"
      :disabled="!selected.length || isPlacing"
      @click="placeBet"
    >
      {{ isPlacing ? 'Apostando...' : 'Apostar' }}
    </button>

    <div class="last-result" v-if="lastResult">
      <h3>Último Resultado</h3>
      <div class="result-numbers">
        <span v-for="n in lastResult.winning" :key="n" class="result-ball">{{ n }}</span>
      </div>
      <div class="result-info">
        <span v-if="lastResult.won" class="result-won">Você ganhou R$ {{ lastResult.prize }}!</span>
        <span v-else class="result-lost">Não foi desta vez</span>
      </div>
    </div>

    <div class="rules-section">
      <h3>Regras</h3>
      <ul>
        <li>Selecione de 1 a 3 números (1-9)</li>
        <li>Quanto mais números acertar, maior o prêmio</li>
        <li>1 acerto = 3x | 2 acertos = 10x | 3 acertos = 50x</li>
        <li>Resultado divulgado a cada hora</li>
        <li>Apostas são finais e não podem ser canceladas</li>
      </ul>
    </div>

    <div v-if="showHistory" class="modal-overlay" @click.self="showHistory = false">
      <div class="history-modal">
        <div class="history-header">
          <h3>Histórico de Apostas</h3>
          <button class="modal-close" @click="showHistory = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="history-list" v-if="betHistory.length">
          <div v-for="bet in betHistory" :key="bet.id" class="history-item">
            <div class="hi-top">
              <span class="hi-round">Rodada #{{ bet.round }}</span>
              <span :class="['hi-status', bet.won ? 'won' : 'lost']">
                {{ bet.won ? '+R$ ' + bet.prize : '-R$ ' + bet.amount }}
              </span>
            </div>
            <div class="hi-bottom">
              <span>Números: {{ bet.numbers.join(', ') }}</span>
              <span class="hi-date">{{ bet.date }}</span>
            </div>
          </div>
        </div>
        <div v-else class="history-empty">Nenhuma aposta ainda</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const selected = ref([])
const betAmount = ref(5)
const isPlacing = ref(false)
const showHistory = ref(false)
const currentRound = ref(1042)
const countdown = ref('--:--')
const amounts = [1, 2, 5, 10, 20, 50]
let timer = null

const lastResult = ref(null)

const betHistory = ref([
  { id: 1, round: 1041, numbers: [3, 7], amount: 5, won: true, prize: '50,00', date: '01/04 14:00' },
  { id: 2, round: 1040, numbers: [1, 5, 9], amount: 10, won: false, prize: '0', date: '01/04 13:00' },
])

const potentialWin = computed(() => {
  const mult = selected.value.length === 3 ? 50 : selected.value.length === 2 ? 10 : 3
  return (betAmount.value * mult).toFixed(2)
})

function toggleSelect(n) {
  const i = selected.value.indexOf(n)
  if (i >= 0) {
    selected.value.splice(i, 1)
  } else if (selected.value.length < 3) {
    selected.value.push(n)
  }
}

function placeBet() {
  if (!selected.value.length || isPlacing.value) return
  isPlacing.value = true
  setTimeout(() => {
    const winning = [
      Math.ceil(Math.random() * 9),
      Math.ceil(Math.random() * 9),
      Math.ceil(Math.random() * 9)
    ]
    const uniqueWinning = [...new Set(winning)].slice(0, 3)
    const matches = selected.value.filter(n => uniqueWinning.includes(n)).length
    const mult = matches >= 3 ? 50 : matches === 2 ? 10 : matches === 1 ? 3 : 0
    const won = matches > 0
    const prize = (betAmount.value * mult).toFixed(2)

    lastResult.value = { winning: uniqueWinning, won, prize }
    betHistory.value.unshift({
      id: Date.now(),
      round: currentRound.value,
      numbers: [...selected.value],
      amount: betAmount.value,
      won,
      prize,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    })
    currentRound.value++
    selected.value = []
    isPlacing.value = false
  }, 1500)
}

function startCountdown() {
  timer = setInterval(() => {
    const now = new Date()
    const next = new Date(now)
    next.setMinutes(0, 0, 0)
    next.setHours(next.getHours() + 1)
    const diff = next - now
    const m = String(Math.floor(diff / 60000)).padStart(2, '0')
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
    countdown.value = `${m}:${s}`
  }, 1000)
}

onMounted(() => startCountdown())
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.lucky-bet-page {
  padding: 0 .75rem 6rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100vh;
}
.page-header { display: flex; align-items: center; padding: .75rem 0; gap: .75rem; }
.page-header h2 { flex: 1; font-size: 1.125rem; font-weight: 700; color: var(--ep-color-text-default); }
.back-btn { color: var(--ep-color-text-default); padding: .25rem; background: none; border: none; cursor: pointer; }
.record-btn {
  font-size: .75rem; color: var(--ep-color-text-selected);
  background: none; border: 1px solid var(--ep-color-text-selected);
  border-radius: 1rem; padding: .25rem .75rem; cursor: pointer;
}

.bet-banner { position: relative; border-radius: .75rem; overflow: hidden; margin-bottom: .75rem; }
.banner-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%); }
.banner-inner { position: relative; z-index: 1; padding: 1.5rem 1rem; text-align: center; }
.banner-inner h3 { font-size: 1.25rem; font-weight: 800; margin-top: .5rem; }
.banner-inner p { font-size: .75rem; color: rgba(255,255,255,.75); margin-top: .25rem; }

.round-info {
  display: flex; align-items: center; justify-content: space-between;
  padding: .75rem; background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .5rem; margin-bottom: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.round-left { display: flex; align-items: center; gap: .375rem; }
.round-label { font-size: .75rem; color: var(--ep-color-text-weakest); }
.round-num { font-size: 1rem; font-weight: 800; color: var(--accent-yellow, #fbbf24); }
.round-right { display: flex; align-items: center; gap: .25rem; font-size: .8125rem; color: var(--ep-color-text-weakest); }

.selection-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-bottom: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.selection-section h3 { font-size: .875rem; font-weight: 700; margin-bottom: .75rem; color: var(--ep-color-text-default); }

.grid-3x3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; }
.bet-cell {
  aspect-ratio: 1; background: rgba(255,255,255,.03);
  border-radius: .5rem; display: flex; align-items: center;
  justify-content: center; cursor: pointer; border: 2px solid transparent;
  transition: all .2s;
}
.bet-cell.selected { border-color: var(--accent-yellow, #fbbf24); background: rgba(251,191,36,.1); }
.bet-cell:active { transform: scale(.93); }
.ball { font-size: 1.5rem; font-weight: 800; color: var(--accent-yellow, #fbbf24); }

.selection-info {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: .5rem; font-size: .75rem; color: var(--ep-color-text-weakest);
}
.clear-btn {
  font-size: .6875rem; color: #ef4444; background: none;
  border: 1px solid #ef4444; border-radius: .75rem;
  padding: .125rem .5rem; cursor: pointer;
}

.bet-amount-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-bottom: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.bet-amount-section h3 { font-size: .875rem; font-weight: 700; margin-bottom: .625rem; color: var(--ep-color-text-default); }
.amount-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: .375rem; }
.amt-btn {
  padding: .5rem; border-radius: .375rem; font-size: .8125rem;
  font-weight: 600; background: rgba(255,255,255,.03);
  color: var(--ep-color-text-default); border: 1.5px solid rgba(255,255,255,.06);
  cursor: pointer; transition: all .2s;
}
.amt-btn.active {
  border-color: var(--accent-yellow, #fbbf24);
  background: rgba(251,191,36,.1);
  color: var(--accent-yellow, #fbbf24);
}

.potential-win {
  display: flex; justify-content: space-between; align-items: center;
  padding: .75rem; background: rgba(251,191,36,.08);
  border: 1px solid rgba(251,191,36,.2);
  border-radius: .5rem; margin-bottom: .75rem; font-size: .875rem;
}
.win-val { font-size: 1.125rem; font-weight: 800; color: var(--accent-yellow, #fbbf24); }

.place-bet-btn {
  width: 100%; padding: .875rem; border-radius: .5rem;
  font-size: 1rem; font-weight: 700; border: none; cursor: pointer;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #000; transition: all .2s;
}
.place-bet-btn:active:not(:disabled) { transform: scale(.97); }
.place-bet-btn:disabled { opacity: .4; cursor: default; }

.last-result {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-top: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.last-result h3 { font-size: .875rem; font-weight: 700; margin-bottom: .625rem; color: var(--ep-color-text-default); }
.result-numbers { display: flex; gap: .5rem; margin-bottom: .5rem; }
.result-ball {
  width: 2.5rem; height: 2.5rem; border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.125rem; font-weight: 800; color: #000;
}
.result-won { color: var(--accent-green, #22c55e); font-weight: 700; }
.result-lost { color: var(--ep-color-text-weakest); }

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
  background: var(--accent-yellow, #fbbf24);
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
  padding: .75rem 0; border-bottom: 1px solid rgba(255,255,255,.04);
}
.hi-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: .25rem; }
.hi-round { font-size: .8125rem; font-weight: 600; color: var(--ep-color-text-default); }
.hi-status { font-size: .8125rem; font-weight: 700; }
.hi-status.won { color: var(--accent-green, #22c55e); }
.hi-status.lost { color: #ef4444; }
.hi-bottom { display: flex; justify-content: space-between; font-size: .6875rem; color: var(--ep-color-text-weakest); }
.history-empty { padding: 2rem; text-align: center; color: var(--ep-color-text-weakest); font-size: .8125rem; }

@keyframes modalIn {
  from { transform: scale(.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
