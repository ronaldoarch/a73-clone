<template>
  <div class="activity-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>{{ activityName || 'Promoção de Recarga' }}</h2>
    </div>

    <div v-if="isLoaded" class="act-content">
      <div class="act-banner">
        <h3>Promoção Especial de Recarga</h3>
        <p v-if="!isMultiple">Faça uma recarga e ganhe bônus!</p>
        <p v-else>Recarga múltipla com bônus crescente!</p>
      </div>

      <div class="reward-levels">
        <div v-for="level in rewardList" :key="level.uuid || level.conditionAmount" class="level-card">
          <div class="level-info">
            <span class="level-condition">Recarga ≥ {{ merchantCy }} {{ formatAmount(level.conditionAmount) }}</span>
            <span class="level-reward">Bônus: {{ merchantCy }} {{ formatAmount(level.rewardAmount) }}</span>
          </div>
          <button class="level-btn" @click="claimReward(level.uuid)">
            Depositar
          </button>
        </div>
      </div>

      <div v-if="isSumRecharge" class="sum-info">
        <span>Recarga acumulada:</span>
        <span class="sum-val">{{ merchantCy }} {{ sumRechargeAmount }}</span>
      </div>

      <button
        v-if="!isMultiple"
        class="action-btn"
        :disabled="isDisabled"
        @click="claimReward()"
      >
        {{ isDisabled ? 'Nenhum bônus disponível' : 'Coletar Bônus' }}
      </button>

      <div v-if="activityRule" class="rules-section">
        <h3>Regras</h3>
        <div v-for="(line, i) in descriptionList" :key="i" class="rule-line">{{ line }}</div>
      </div>
    </div>

    <div v-else class="loading-state">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { useRecharge } from '../../composables/useRecharge'

const {
  activityName,
  activityRule,
  rewardList,
  merchantCy,
  isLoaded,
  isMultiple,
  isDisabled,
  isSumRecharge,
  sumRechargeAmount,
  descriptionList,
  claimReward,
  formatAmount
} = useRecharge()
</script>

<style scoped>
.activity-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100vh; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; background: none; border: none; cursor: pointer; }
.act-banner { border-radius: var(--radius-lg); padding: 20px 16px; margin-bottom: 16px; text-align: center; background: linear-gradient(135deg, #ea580c, #f97316); }
.act-banner h3 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.act-banner p { font-size: 12px; color: rgba(255,255,255,0.8); }
.reward-levels { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.level-card { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: var(--bg-card); border-radius: var(--radius-md); }
.level-info { display: flex; flex-direction: column; gap: 2px; }
.level-condition { font-size: 13px; font-weight: 600; }
.level-reward { font-size: 14px; font-weight: 800; color: var(--accent-green); }
.level-btn { padding: 8px 16px; border-radius: 20px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; font-size: 12px; font-weight: 700; border: none; cursor: pointer; }
.sum-info { display: flex; justify-content: space-between; padding: 14px 16px; background: var(--bg-card); border-radius: var(--radius-md); margin-bottom: 16px; font-size: 14px; }
.sum-val { font-weight: 800; color: var(--accent-yellow); }
.action-btn { width: 100%; padding: 14px; border-radius: var(--radius-md); background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; font-size: 16px; font-weight: 700; border: none; cursor: pointer; margin-bottom: 16px; }
.action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.rules-section { padding: 14px; background: var(--bg-card); border-radius: var(--radius-md); }
.rules-section h3 { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
.rule-line { font-size: 12px; color: var(--text-muted); line-height: 1.6; }
.loading-state { display: flex; justify-content: center; padding: 60px 0; }
.spinner { width: 32px; height: 32px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--accent-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
