<template>
  <div class="rescue-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Resgate de Perda</h2>
    </div>

    <div class="rescue-banner">
      <h3>💰 Não desista! Receba cashback!</h3>
      <p>Quando a sorte não está do seu lado, nós te ajudamos com compensação de perdas.</p>
    </div>

    <div class="rescue-table">
      <h3>Tabela de Compensação</h3>
      <div class="table-wrap">
        <div class="t-header">
          <span>Perda Total</span>
          <span>Compensação</span>
          <span>Taxa</span>
        </div>
        <div v-for="row in rescueTable" :key="row.min" class="t-row">
          <span>≥ R$ {{ row.min }}</span>
          <span class="comp-val">R$ {{ row.compensation }}</span>
          <span>{{ row.rate }}%</span>
        </div>
      </div>
    </div>

    <div class="rescue-status">
      <div class="status-card">
        <span class="status-label">Sua perda acumulada</span>
        <span class="status-val">R$ 0,00</span>
      </div>
      <div class="status-card">
        <span class="status-label">Compensação disponível</span>
        <span class="status-val highlight">R$ 0,00</span>
      </div>
    </div>

    <button class="apply-btn" disabled>Solicitar Compensação</button>
  </div>
</template>

<script setup>
const rescueTable = [
  { min: '100', compensation: '5', rate: 5 },
  { min: '500', compensation: '30', rate: 6 },
  { min: '1.000', compensation: '80', rate: 8 },
  { min: '5.000', compensation: '500', rate: 10 },
  { min: '10.000', compensation: '1.200', rate: 12 },
  { min: '50.000', compensation: '7.500', rate: 15 },
]
</script>

<style scoped>
.rescue-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }

.rescue-banner { background: linear-gradient(135deg, #1e3a5f, #3b82f6); border-radius: var(--radius-lg); padding: 20px 16px; margin-bottom: 16px; }
.rescue-banner h3 { font-size: 17px; font-weight: 700; margin-bottom: 4px; }
.rescue-banner p { font-size: 12px; color: rgba(255,255,255,0.8); }

.rescue-table { background: var(--bg-card); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 12px; }
.rescue-table h3 { font-size: 15px; font-weight: 700; margin-bottom: 10px; }
.t-header { display: grid; grid-template-columns: 1fr 1fr 60px; padding: 8px 10px; font-size: 11px; font-weight: 600; color: var(--text-muted); }
.t-row { display: grid; grid-template-columns: 1fr 1fr 60px; padding: 10px; font-size: 13px; color: var(--text-secondary); border-top: 1px solid rgba(255,255,255,0.04); }
.comp-val { color: var(--accent-green); font-weight: 600; }

.rescue-status { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
.status-card { background: var(--bg-card); border-radius: var(--radius-md); padding: 16px; text-align: center; }
.status-label { display: block; font-size: 11px; color: var(--text-muted); margin-bottom: 6px; }
.status-val { font-size: 20px; font-weight: 800; }
.status-val.highlight { color: var(--accent-green); }

.apply-btn { width: 100%; padding: 14px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--purple-300), var(--purple-500)); color: #fff; font-size: 16px; font-weight: 700; }
.apply-btn:disabled { opacity: 0.4; }
</style>
