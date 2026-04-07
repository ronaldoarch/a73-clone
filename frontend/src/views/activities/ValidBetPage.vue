<template>
  <div class="valid-bet-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>{{ activityName }}</h2>
    </div>

    <template v-if="!isLoading">
      <div class="hero-banner">
        <div class="hero-bg">
          <div class="hero-circle c1"></div>
          <div class="hero-circle c2"></div>
        </div>
        <div class="hero-content">
          <span class="hero-icon">🎯</span>
          <h3>Ganhe com Apostas</h3>
          <p>Quanto mais você aposta, maiores os bônus!</p>
        </div>
      </div>

      <div class="bonus-table">
        <div class="table-title">
          <span>Bônus por Aposta Válida</span>
        </div>
        <div class="table-head">
          <span>Aposta Válida</span>
          <span>Bônus</span>
          <span>Status</span>
        </div>
        <div v-for="(row, idx) in bonusData" :key="idx" class="table-row" :class="{ even: idx % 2 === 0 }">
          <span class="row-bet">≥ {{ merchantCy }} {{ formatAmount(row.conditionAmount) }}</span>
          <span class="row-bonus">{{ merchantCy }} {{ formatAmount(row.rewardAmount) }}</span>
          <span class="row-status">
            <button
              class="status-btn"
              :class="getStatusClass(row)"
              :disabled="getItemStatus(row) !== 'receivable'"
              @click="handleReceive(row)"
            >
              {{ getStatusLabel(row) }}
            </button>
          </span>
        </div>
      </div>

      <div v-if="!isAutoReceive && totalUnreceivedAmount > 0" class="total-bar">
        <div class="total-left">
          <span class="total-label">Total Não Recebido</span>
          <span class="total-val">{{ merchantCy }} {{ formatAmount(totalUnreceivedAmount) }}</span>
        </div>
        <div class="total-icon">💰</div>
      </div>

      <div v-if="activityRule" class="rules-section">
        <div class="rules-header">
          <span class="deco-line"></span>
          <h3>Regras</h3>
          <span class="deco-line"></span>
        </div>
        <p class="rules-text">{{ activityRule }}</p>
      </div>

      <div v-if="!isAutoReceive" class="bottom-actions">
        <button
          class="claim-all-btn"
          :class="{ enabled: canClaimAll }"
          :disabled="!canClaimAll"
          @click="handleClaimAll"
        >
          {{ canClaimAll ? 'Coletar Todos os Bônus' : 'Nenhum bônus disponível' }}
        </button>
      </div>
      <div v-else class="auto-notice">
        <span class="auto-icon">⚡</span>
        <span>Bônus distribuído automaticamente ao atingir a meta</span>
      </div>
    </template>

    <div v-else class="loading-state">
      <div class="loader">
        <div class="loader-ring"></div>
        <span>Carregando...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activityName = ref('Bônus de Aposta Válida')
const merchantCy = ref('R$')
const isLoading = ref(false)
const isAutoReceive = ref(false)
const canClaimAll = ref(true)
const totalUnreceivedAmount = ref(45)
const activityRule = ref('Faça apostas válidas para desbloquear bônus progressivos. Quanto maior a aposta acumulada, maior o bônus. Requisitos de aposta se aplicam antes do saque.')

const bonusData = ref([
  { conditionAmount: 100, rewardAmount: 5, received: false, receivable: true },
  { conditionAmount: 500, rewardAmount: 15, received: false, receivable: true },
  { conditionAmount: 1000, rewardAmount: 25, received: false, receivable: false },
  { conditionAmount: 2000, rewardAmount: 50, received: false, receivable: false },
  { conditionAmount: 5000, rewardAmount: 120, received: false, receivable: false },
  { conditionAmount: 10000, rewardAmount: 280, received: false, receivable: false },
  { conditionAmount: 50000, rewardAmount: 1500, received: false, receivable: false },
])

function getItemStatus(row) {
  if (row.received) return 'received'
  if (row.receivable) return 'receivable'
  return 'unreceivable'
}

function getStatusClass(row) {
  const s = getItemStatus(row)
  return { active: s === 'receivable', done: s === 'received', locked: s === 'unreceivable' }
}

function getStatusLabel(row) {
  const s = getItemStatus(row)
  if (s === 'received') return 'Recebido'
  if (s === 'receivable') return 'Receber'
  return 'Bloqueado'
}

function handleReceive(row) {
  if (getItemStatus(row) !== 'receivable') return
  row.received = true
  row.receivable = false
  totalUnreceivedAmount.value -= row.rewardAmount
  if (totalUnreceivedAmount.value <= 0) canClaimAll.value = false
}

function handleClaimAll() {
  bonusData.value.forEach(row => {
    if (row.receivable) {
      row.received = true
      row.receivable = false
    }
  })
  totalUnreceivedAmount.value = 0
  canClaimAll.value = false
}

function formatAmount(val) {
  if (typeof val === 'number') return val.toLocaleString('pt-BR')
  return val || '0'
}
</script>

<style scoped>
.valid-bet-page {
  padding: 0 12px 24px;
  background: linear-gradient(180deg, #0c2340 0%, #0f172a 40%);
  min-height: 100vh;
}

.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; color: #fff; }
.back-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(255,255,255,0.08); color: #fff; border: none; cursor: pointer;
}

.hero-banner {
  position: relative; border-radius: 16px; overflow: hidden;
  padding: 28px 20px; margin-bottom: 16px;
  background: linear-gradient(135deg, #1e40af, #3b82f6);
}
.hero-bg { position: absolute; inset: 0; }
.hero-circle {
  position: absolute; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
}
.hero-circle.c1 { width: 200px; height: 200px; top: -60px; right: -40px; }
.hero-circle.c2 { width: 120px; height: 120px; bottom: -30px; left: -20px; }
.hero-content { position: relative; text-align: center; }
.hero-icon { font-size: 40px; display: block; margin-bottom: 8px; }
.hero-content h3 { font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 4px; }
.hero-content p { font-size: 13px; color: rgba(255,255,255,0.8); }

.bonus-table {
  background: rgba(255,255,255,0.04); border-radius: 14px;
  overflow: hidden; margin-bottom: 16px;
}
.table-title {
  padding: 12px 16px; font-size: 14px; font-weight: 700; color: #fff;
  background: rgba(255,255,255,0.04);
}
.table-head {
  display: grid; grid-template-columns: 1fr 1fr auto;
  padding: 10px 16px; font-size: 11px; font-weight: 600;
  color: rgba(255,255,255,0.4);
}
.table-row {
  display: grid; grid-template-columns: 1fr 1fr auto;
  padding: 12px 16px; font-size: 13px; color: rgba(255,255,255,0.7);
  border-top: 1px solid rgba(255,255,255,0.04); align-items: center;
}
.table-row.even { background: rgba(255,255,255,0.02); }
.row-bet { font-weight: 600; }
.row-bonus { color: #22c55e; font-weight: 700; }
.status-btn {
  padding: 4px 14px; border-radius: 14px; font-size: 11px; font-weight: 600;
  border: none; cursor: pointer; transition: all 0.2s;
}
.status-btn.active {
  background: linear-gradient(135deg, #3b82f6, #1e40af); color: #fff;
}
.status-btn.done {
  background: rgba(34,197,94,0.15); color: #22c55e; cursor: default;
}
.status-btn.locked {
  background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.3); cursor: not-allowed;
}
.status-btn:disabled { cursor: not-allowed; }

.total-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px; background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(30,64,175,0.15));
  border-radius: 14px; margin-bottom: 16px;
  border: 1px solid rgba(59,130,246,0.2);
}
.total-left { display: flex; flex-direction: column; gap: 4px; }
.total-label { font-size: 12px; color: rgba(255,255,255,0.5); }
.total-val { font-size: 22px; font-weight: 900; color: #3b82f6; }
.total-icon { font-size: 36px; }

.rules-section {
  background: rgba(255,255,255,0.04); border-radius: 12px; padding: 14px;
  margin-bottom: 16px;
}
.rules-header {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  margin-bottom: 10px;
}
.rules-header h3 { font-size: 14px; font-weight: 700; color: #fff; }
.deco-line { width: 30px; height: 2px; background: rgba(255,255,255,0.15); border-radius: 1px; }
.rules-text { font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.7; white-space: pre-wrap; }

.bottom-actions { margin-top: 8px; }
.claim-all-btn {
  width: 100%; padding: 14px; border-radius: 12px;
  font-size: 15px; font-weight: 700; border: none; cursor: pointer;
  background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4);
  transition: all 0.2s;
}
.claim-all-btn.enabled {
  background: linear-gradient(135deg, #3b82f6, #1e40af); color: #fff;
  box-shadow: 0 4px 16px rgba(59,130,246,0.3);
}
.claim-all-btn:disabled { cursor: not-allowed; }
.claim-all-btn:active:not(:disabled) { transform: scale(0.98); }

.auto-notice {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 16px; background: rgba(255,255,255,0.04);
  border-radius: 12px; font-size: 13px; color: rgba(255,255,255,0.6);
}
.auto-icon { font-size: 18px; }

.loading-state { display: flex; justify-content: center; padding: 80px 0; }
.loader { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.loader-ring {
  width: 40px; height: 40px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #3b82f6;
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
.loader span { font-size: 13px; color: rgba(255,255,255,0.5); }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
