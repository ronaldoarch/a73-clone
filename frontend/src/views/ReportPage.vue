<template>
  <div class="report-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Relatórios</h2>
    </div>

    <div class="report-tabs">
      <button v-for="tab in tabs" :key="tab.id" class="report-tab" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
        {{ tab.label }}
      </button>
    </div>

    <div class="date-filter">
      <button v-for="d in dateOptions" :key="d.id" class="date-btn" :class="{ active: dateRange === d.id }" @click="dateRange = d.id">
        {{ d.label }}
      </button>
    </div>

    <div class="report-summary" v-if="activeTab === 'statement'">
      <div class="summary-item">
        <span class="s-label">Depósitos</span>
        <span class="s-value green">R$ 0,00</span>
      </div>
      <div class="summary-item">
        <span class="s-label">Saques</span>
        <span class="s-value red">R$ 0,00</span>
      </div>
      <div class="summary-item">
        <span class="s-label">Apostas</span>
        <span class="s-value">R$ 0,00</span>
      </div>
      <div class="summary-item">
        <span class="s-label">Ganhos</span>
        <span class="s-value green">R$ 0,00</span>
      </div>
    </div>

    <Empty type="data" text="Nenhum registro encontrado" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Empty from '../components/Empty.vue'

const activeTab = ref('statement')
const dateRange = ref('today')

const tabs = [
  { id: 'statement', label: 'Extrato' },
  { id: 'personal', label: 'Pessoal' },
  { id: 'betting', label: 'Apostas' },
  { id: 'sports', label: 'Esportes' }
]

const dateOptions = [
  { id: 'today', label: 'Hoje' },
  { id: 'week', label: '7 dias' },
  { id: 'month', label: '30 dias' },
  { id: 'custom', label: 'Período' }
]
</script>

<style scoped>
.report-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }

.report-tabs { display: flex; gap: 4px; margin-bottom: 12px; }
.report-tab { flex: 1; padding: 10px; border-radius: var(--radius-md); background: rgba(255,255,255,0.04); font-size: 13px; font-weight: 600; color: var(--text-muted); text-align: center; }
.report-tab.active { background: var(--purple-500); color: #fff; }

.date-filter { display: flex; gap: 6px; margin-bottom: 16px; }
.date-btn { padding: 7px 14px; border-radius: 20px; background: rgba(255,255,255,0.06); color: var(--text-muted); font-size: 12px; font-weight: 600; }
.date-btn.active { background: rgba(168,85,247,0.2); color: var(--purple-200); border: 1px solid var(--purple-400); }

.report-summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px; }
.summary-item { background: var(--bg-card); border-radius: var(--radius-md); padding: 14px; }
.s-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
.s-value { font-size: 16px; font-weight: 700; }
.s-value.green { color: var(--accent-green); }
.s-value.red { color: var(--accent-red); }
</style>
