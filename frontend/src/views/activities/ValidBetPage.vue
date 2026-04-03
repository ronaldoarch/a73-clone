<template>
  <div class="activity-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
      <h2>Aposta Válida</h2>
    </div>
    <div class="act-banner" style="background:linear-gradient(135deg,#0891b2,#06b6d4)">
      <h3>📊 Bônus por Apostas Válidas</h3>
      <p>Quanto mais você aposta, mais bônus recebe!</p>
    </div>
    <div class="bet-table">
      <div class="bt-header"><span>Aposta Válida</span><span>Bônus</span></div>
      <div v-for="row in betRows" :key="row.min" class="bt-row">
        <span>≥ R$ {{ row.min }}</span>
        <span class="bonus-val">R$ {{ row.bonus }}</span>
      </div>
    </div>
    <div class="current-bet">
      <span>Sua aposta válida total:</span>
      <span class="cur-val">R$ 0,00</span>
    </div>
    <button class="action-btn" disabled>Coletar Bônus</button>
  </div>
</template>
<script setup>
const betRows = [
  { min: '500', bonus: '5' }, { min: '2.000', bonus: '25' },
  { min: '5.000', bonus: '80' }, { min: '10.000', bonus: '200' },
  { min: '50.000', bonus: '1.200' }, { min: '100.000', bonus: '3.000' },
]
</script>
<style scoped>
.activity-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }
.act-banner { border-radius: var(--radius-lg); padding: 20px 16px; margin-bottom: 16px; text-align: center; }
.act-banner h3 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.act-banner p { font-size: 12px; color: rgba(255,255,255,0.8); }
.bet-table { background: var(--bg-card); border-radius: var(--radius-lg); margin-bottom: 12px; overflow: hidden; }
.bt-header { display: grid; grid-template-columns: 1fr 1fr; padding: 10px 16px; font-size: 12px; font-weight: 600; color: var(--text-muted); background: rgba(255,255,255,0.04); }
.bt-row { display: grid; grid-template-columns: 1fr 1fr; padding: 12px 16px; font-size: 14px; border-top: 1px solid rgba(255,255,255,0.04); }
.bonus-val { color: var(--accent-green); font-weight: 700; }
.current-bet { display: flex; justify-content: space-between; padding: 14px 16px; background: var(--bg-card); border-radius: var(--radius-md); margin-bottom: 16px; font-size: 14px; }
.cur-val { font-weight: 800; font-size: 16px; }
.action-btn { width: 100%; padding: 14px; border-radius: var(--radius-md); background: linear-gradient(135deg, #06b6d4, #0891b2); color: #fff; font-size: 16px; font-weight: 700; }
.action-btn:disabled { opacity: 0.4; }
</style>
