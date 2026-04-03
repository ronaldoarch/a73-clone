<template>
  <div class="red-packet-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Red Packet</h2>
    </div>

    <div class="rp-banner">
      <div class="rp-icon">🧧</div>
      <h3>Abra o Envelope Vermelho!</h3>
      <p>Convide amigos e ganhe envelopes com prêmios em dinheiro!</p>
    </div>

    <div class="rp-action">
      <button class="open-btn" :disabled="openedToday" @click="openPacket">
        {{ openedToday ? 'Já aberto hoje' : 'Abrir Red Packet' }}
      </button>
    </div>

    <div class="rp-history">
      <h3>Histórico de Prêmios</h3>
      <Empty v-if="!history.length" type="data" text="Nenhum prêmio ainda" />
      <div v-else class="history-list">
        <div v-for="item in history" :key="item.id" class="history-item">
          <span class="h-amount">{{ item.amount }}</span>
          <span class="h-date">{{ item.date }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Empty from '../../components/Empty.vue'

const openedToday = ref(false)
const history = ref([])

function openPacket() {
  const prize = (Math.random() * 10 + 1).toFixed(2)
  openedToday.value = true
  history.value.unshift({ id: Date.now(), amount: `R$ ${prize}`, date: new Date().toLocaleDateString('pt-BR') })
  alert(`Você ganhou R$ ${prize}!`)
}
</script>

<style scoped>
.red-packet-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }

.rp-banner { background: linear-gradient(135deg, #dc2626, #b91c1c); border-radius: var(--radius-lg); padding: 24px 16px; text-align: center; margin-bottom: 16px; }
.rp-icon { font-size: 48px; margin-bottom: 8px; }
.rp-banner h3 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
.rp-banner p { font-size: 13px; color: rgba(255,255,255,0.8); }

.rp-action { text-align: center; margin-bottom: 20px; }
.open-btn { padding: 16px 48px; border-radius: var(--radius-lg); background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000; font-size: 18px; font-weight: 800; transition: var(--transition); }
.open-btn:active { transform: scale(0.95); }
.open-btn:disabled { opacity: 0.4; }

.rp-history { background: var(--bg-card); border-radius: var(--radius-lg); padding: 16px; }
.rp-history h3 { font-size: 15px; font-weight: 700; margin-bottom: 12px; }
.history-list { display: flex; flex-direction: column; gap: 4px; }
.history-item { display: flex; justify-content: space-between; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: var(--radius-sm); }
.h-amount { font-size: 14px; font-weight: 700; color: var(--accent-yellow); }
.h-date { font-size: 12px; color: var(--text-muted); }
</style>
