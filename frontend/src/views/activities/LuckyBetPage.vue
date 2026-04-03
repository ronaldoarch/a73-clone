<template>
  <div class="activity-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
      <h2>Lucky Bet</h2>
    </div>
    <div class="act-banner" style="background:linear-gradient(135deg,#f59e0b,#d97706)">
      <h3>🎲 Aposte na sorte!</h3>
      <p>Escolha números e ganhe prêmios incríveis baseado nas suas apostas.</p>
    </div>
    <div class="grid-3x3">
      <div v-for="n in 9" :key="n" class="bet-cell" :class="{ selected: selected.includes(n) }" @click="toggleSelect(n)">
        <span class="ball">{{ n }}</span>
      </div>
    </div>
    <button class="action-btn" :disabled="!selected.length" @click="placeBet">Apostar</button>
    <div class="rules-card"><h3>Regras</h3><ul><li>Selecione até 3 números</li><li>Quanto mais acertar, maior o prêmio</li><li>Resultado divulgado a cada hora</li></ul></div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const selected = ref([])
function toggleSelect(n) { const i = selected.value.indexOf(n); if (i >= 0) selected.value.splice(i, 1); else if (selected.value.length < 3) selected.value.push(n) }
function placeBet() { alert('Aposta registrada: ' + selected.value.join(', ')); selected.value = [] }
</script>
<style scoped>
.activity-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }
.act-banner { border-radius: var(--radius-lg); padding: 20px 16px; margin-bottom: 16px; text-align: center; }
.act-banner h3 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.act-banner p { font-size: 12px; color: rgba(255,255,255,0.8); }
.grid-3x3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
.bet-cell { aspect-ratio: 1; background: var(--bg-card); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid transparent; transition: var(--transition); }
.bet-cell.selected { border-color: var(--accent-yellow); background: rgba(251,191,36,0.15); }
.ball { font-size: 24px; font-weight: 800; color: var(--accent-yellow); }
.action-btn { width: 100%; padding: 14px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--accent-yellow), #f59e0b); color: #000; font-size: 16px; font-weight: 700; margin-bottom: 16px; }
.action-btn:disabled { opacity: 0.4; }
.rules-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 16px; }
.rules-card h3 { font-size: 15px; font-weight: 700; margin-bottom: 10px; }
.rules-card ul { list-style: none; padding: 0; }
.rules-card li { font-size: 13px; color: var(--text-secondary); padding: 6px 0 6px 16px; position: relative; }
.rules-card li::before { content: '•'; position: absolute; left: 0; color: var(--purple-300); }
</style>
