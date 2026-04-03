<template>
  <div class="vip-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>VIP</h2>
    </div>

    <div class="vip-banner">
      <div class="vip-level-display">
        <div class="vip-crown">👑</div>
        <h3>VIP {{ currentLevel }}</h3>
      </div>
      <div class="vip-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="progress-labels">
          <span>VIP {{ currentLevel }}</span>
          <span>VIP {{ nextLevel }}</span>
        </div>
        <p class="progress-text">Deposite mais R$ {{ remainAmount.toLocaleString() }} para VIP {{ nextLevel }}</p>
      </div>
    </div>

    <div class="vip-benefits">
      <h3>Benefícios por Nível</h3>
      <div class="benefits-table">
        <div class="table-header">
          <span>Nível</span>
          <span>Upgrade</span>
          <span>Diário</span>
          <span>Semanal</span>
          <span>Mensal</span>
        </div>
        <div v-for="level in vipLevels" :key="level.level" class="table-row" :class="{ current: level.level === currentLevel }">
          <span class="level-cell">
            <span class="level-badge" :style="{ background: level.color }">{{ level.level }}</span>
          </span>
          <span>R$ {{ level.upgradeBonus }}</span>
          <span>R$ {{ level.dailyBonus }}</span>
          <span>R$ {{ level.weeklyBonus }}</span>
          <span>R$ {{ level.monthlyBonus }}</span>
        </div>
      </div>
    </div>

    <div class="vip-actions">
      <button class="claim-btn" :disabled="!canClaimDaily" @click="claimDaily">
        {{ canClaimDaily ? 'Coletar Bônus Diário' : 'Já coletado hoje' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { vipLevel } = storeToRefs(userStore)

const currentLevel = computed(() => vipLevel.value || 0)
const nextLevel = computed(() => Math.min(currentLevel.value + 1, 10))
const progressPercent = ref(35)
const remainAmount = ref(2500)
const canClaimDaily = ref(true)

const vipLevels = [
  { level: 0, color: '#6b7280', upgradeBonus: '0', dailyBonus: '0', weeklyBonus: '0', monthlyBonus: '0' },
  { level: 1, color: '#22c55e', upgradeBonus: '5', dailyBonus: '1', weeklyBonus: '5', monthlyBonus: '20' },
  { level: 2, color: '#3b82f6', upgradeBonus: '10', dailyBonus: '2', weeklyBonus: '10', monthlyBonus: '40' },
  { level: 3, color: '#8b5cf6', upgradeBonus: '20', dailyBonus: '3', weeklyBonus: '15', monthlyBonus: '60' },
  { level: 4, color: '#ec4899', upgradeBonus: '50', dailyBonus: '5', weeklyBonus: '25', monthlyBonus: '100' },
  { level: 5, color: '#f59e0b', upgradeBonus: '100', dailyBonus: '10', weeklyBonus: '50', monthlyBonus: '200' },
  { level: 6, color: '#ef4444', upgradeBonus: '200', dailyBonus: '15', weeklyBonus: '75', monthlyBonus: '300' },
  { level: 7, color: '#14b8a6', upgradeBonus: '500', dailyBonus: '25', weeklyBonus: '150', monthlyBonus: '500' },
  { level: 8, color: '#a855f7', upgradeBonus: '1.000', dailyBonus: '50', weeklyBonus: '300', monthlyBonus: '1.000' },
  { level: 9, color: '#dc2626', upgradeBonus: '2.500', dailyBonus: '100', weeklyBonus: '500', monthlyBonus: '2.000' },
  { level: 10, color: '#fbbf24', upgradeBonus: '5.000', dailyBonus: '200', weeklyBonus: '1.000', monthlyBonus: '5.000' },
]

function claimDaily() {
  canClaimDaily.value = false
  alert('Bônus diário coletado!')
}

onMounted(() => { userStore.fetchVipInfo() })
</script>

<style scoped>
.vip-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }

.vip-banner { background: linear-gradient(135deg, #4c1d95, #7c3aed, #f59e0b); border-radius: var(--radius-lg); padding: 24px 16px; margin-bottom: 16px; }
.vip-level-display { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.vip-crown { font-size: 32px; }
.vip-level-display h3 { font-size: 24px; font-weight: 800; }
.vip-progress { }
.progress-bar { height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #fde68a, #f59e0b); border-radius: 4px; transition: width 0.5s ease; }
.progress-labels { display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 4px; }
.progress-text { font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 8px; text-align: center; }

.vip-benefits { margin-bottom: 16px; }
.vip-benefits h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.benefits-table { background: var(--bg-card); border-radius: var(--radius-lg); overflow: hidden; }
.table-header { display: grid; grid-template-columns: 50px repeat(4, 1fr); padding: 10px 12px; font-size: 11px; font-weight: 600; color: var(--text-muted); background: rgba(255,255,255,0.04); text-align: center; }
.table-row { display: grid; grid-template-columns: 50px repeat(4, 1fr); padding: 10px 12px; font-size: 12px; color: var(--text-secondary); text-align: center; border-top: 1px solid rgba(255,255,255,0.04); }
.table-row.current { background: rgba(168,85,247,0.1); }
.level-cell { display: flex; justify-content: center; }
.level-badge { width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #fff; }

.vip-actions { margin-top: 8px; }
.claim-btn { width: 100%; padding: 14px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--accent-yellow), #f59e0b); color: #000; font-size: 16px; font-weight: 700; transition: var(--transition); }
.claim-btn:active { transform: scale(0.98); }
.claim-btn:disabled { opacity: 0.4; }
</style>
