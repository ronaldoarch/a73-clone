<template>
  <div class="recharge-bonus-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>{{ activityName }}</h2>
    </div>

    <div class="hero-banner">
      <div class="hero-glow"></div>
      <div class="hero-content">
        <span class="hero-label">Bônus máximo de até</span>
        <span class="hero-amount" v-html="maxRewardAmountText"></span>
      </div>
    </div>

    <div class="reward-info-card" v-if="rewardInfo.isShowProgress">
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">{{ rechargeTitle }}</span>
          <span class="info-val" v-if="rewardInfo.rechargeAmount">{{ merchantCy }} {{ rewardInfo.rechargeAmount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Bônus</span>
          <span class="info-val highlight">{{ merchantCy }} {{ rewardInfo.bonus }}</span>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Já Recebido</span>
          <span class="info-val">{{ merchantCy }} {{ rewardInfo.claimedAmount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Bônus Hoje</span>
          <span class="info-val accent">{{ merchantCy }} {{ rewardInfo.claimAmountToday }}</span>
        </div>
      </div>

      <div class="info-divider"></div>
      <p class="info-desc">{{ distributionDesc }}</p>

      <div v-if="rewardInfo.distributeDay" class="progress-area">
        <div class="dist-progress">
          <div class="dist-fill" :style="{ width: distributePercent + '%' }"></div>
        </div>
        <div class="dist-labels">
          <span>Distribuição</span>
          <span class="dist-day">{{ rewardInfo.currentDays }} / {{ rewardInfo.distributeDay }} dias</span>
        </div>
      </div>
    </div>

    <template v-if="isMultiple">
      <div class="multiple-section">
        <div class="mult-header">
          <span>Bônus da Atividade</span>
        </div>
        <div class="mult-table-head">
          <span>Depósito</span>
          <span>Ratio (%)</span>
          <span>Máx. Receber</span>
          <span>Status</span>
        </div>
        <div v-for="item in rewardData" :key="item.uuid" class="mult-row">
          <span>{{ item.name }}</span>
          <span>{{ item.rewardRatio }}</span>
          <span>{{ item.rewardLimito || 'Ilimitado' }}</span>
          <span>
            <button
              class="mult-btn"
              :class="{ active: item.canReceive, disabled: !item.canReceive }"
              :disabled="!item.canReceive"
              @click="getRec(item)"
            >
              {{ item.canReceive ? 'Receber' : (item.done ? 'Recebido' : 'Receber') }}
            </button>
          </span>
        </div>
        <div v-if="!isAuto" class="unreceived-bar">
          <span>Não recebido:</span>
          <span class="unreceived-val">{{ merchantCy }} {{ totalReceive }}</span>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="tiers-section">
        <div class="tiers-header">
          <span class="deco">🪙</span>
          <h3>Tiers de Recarga</h3>
          <span class="deco flip">🪙</span>
        </div>

        <div v-if="isSumRecharge" class="sum-recharge">
          <span>Recarga Acumulada:</span>
          <span class="sum-val">{{ merchantCy }} {{ sumRechargeAmount }}</span>
        </div>

        <div class="tiers-list">
          <div v-for="tier in rechargeList" :key="tier.uuid" class="tier-item">
            <div class="tier-left">
              <span class="tier-deposit">{{ merchantCy }} {{ formatAmount(tier.conditionAmount) }}</span>
            </div>
            <div class="tier-right">
              <span class="tier-bonus">+{{ formatAmount(tier.rewardAmount) }}</span>
            </div>
          </div>
        </div>

        <div class="collectable-row">
          <span>Disponível para coleta:</span>
          <span class="collectable-val">{{ merchantCy }} {{ formatAmount(awardCount) }}</span>
        </div>
      </div>
    </template>

    <div v-if="activityRule" class="rules-section">
      <div class="rules-header">
        <span class="deco-line"></span>
        <h3>Regras</h3>
        <span class="deco-line"></span>
      </div>
      <p class="rules-text">{{ activityRule }}</p>
    </div>

    <div v-if="showBtnClaim" class="bottom-bar">
      <button
        class="claim-btn"
        :class="{ enabled: !isDisabled, shiny: awardCount > 0 }"
        :disabled="isDisabled"
        @click="claimHandle"
      >
        {{ isDisabled ? 'Sem bônus disponível' : 'Receber' }}
      </button>
    </div>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showRechargeModal" class="modal-overlay" @click.self="closeRechargeModal">
          <div class="recharge-modal">
            <button class="modal-close" @click="closeRechargeModal">✕</button>
            <h3>Depositar para Receber Bônus</h3>
            <div class="modal-info">
              <p>Valor de recarga: <strong>{{ merchantCy }} {{ rechargeItemInfo.rechargeAmount }}</strong></p>
              <p>Bônus: <strong class="bonus-text">{{ merchantCy }} {{ rechargeItemInfo.rewardAmount }}</strong></p>
            </div>
            <button class="modal-deposit-btn" @click="$router.push('/recharge/apply'); closeRechargeModal()">
              Depositar Agora
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activityName = ref('Bônus de Recarga')
const merchantCy = ref('R$')
const maxRewardAmountText = ref('<strong>R$ 5.000</strong>')
const activityRule = ref('Cada depósito qualificado recebe o bônus correspondente. O bônus é distribuído diariamente durante o período especificado. Requisito de aposta aplica-se antes do saque.')
const showBtnClaim = ref(true)
const isDisabled = ref(false)
const isMultiple = ref(false)
const isAuto = ref(false)
const isSumRecharge = ref(false)
const sumRechargeAmount = ref('0')
const awardCount = ref(120)
const showRechargeModal = ref(false)
const rechargeItemInfo = ref({ rechargeAmount: 0, rewardAmount: 0 })

const rechargeTitle = ref('Depósito')
const distributionDesc = ref('Bônus distribuído diariamente de acordo com o plano')

const rewardInfo = ref({
  isShowProgress: true,
  rechargeAmount: '500',
  bonus: '50',
  claimedAmount: '25',
  claimAmountToday: '5',
  distributeDay: 10,
  currentDays: 5,
})

const totalReceive = ref('0')
const rewardData = ref([])

const rechargeList = ref([
  { uuid: '1', conditionAmount: 50, rewardAmount: 5 },
  { uuid: '2', conditionAmount: 100, rewardAmount: 12 },
  { uuid: '3', conditionAmount: 200, rewardAmount: 28 },
  { uuid: '4', conditionAmount: 500, rewardAmount: 75 },
  { uuid: '5', conditionAmount: 1000, rewardAmount: 160 },
  { uuid: '6', conditionAmount: 2000, rewardAmount: 350 },
  { uuid: '7', conditionAmount: 5000, rewardAmount: 1000 },
])

const distributePercent = computed(() => {
  const info = rewardInfo.value
  if (!info.distributeDay) return 0
  return Math.min(100, (info.currentDays / info.distributeDay) * 100)
})

function formatAmount(val) {
  if (typeof val === 'number') return val.toLocaleString('pt-BR')
  return val || '0'
}

function claimHandle() {
  awardCount.value = 0
  isDisabled.value = true
}

function getRec(item) {
  item.canReceive = false
  item.done = true
}

function closeRechargeModal() {
  showRechargeModal.value = false
}
</script>

<style scoped>
.recharge-bonus-page {
  padding: 0 12px 100px;
  background: linear-gradient(180deg, #0a2e1b 0%, #0f172a 40%);
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
  position: relative; border-radius: 16px; padding: 28px 20px;
  background: linear-gradient(135deg, #065f46, #10b981);
  margin-bottom: 16px; overflow: hidden; text-align: center;
}
.hero-glow {
  position: absolute; top: -40px; right: -40px;
  width: 160px; height: 160px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
}
.hero-content { position: relative; }
.hero-label { display: block; font-size: 13px; color: rgba(255,255,255,0.8); margin-bottom: 6px; }
.hero-amount { font-size: 28px; font-weight: 900; color: #fbbf24; }
.hero-amount :deep(strong) { color: #fbbf24; }

.reward-info-card {
  background: rgba(255,255,255,0.06); border-radius: 14px;
  padding: 16px; margin-bottom: 16px;
}
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
.info-item { display: flex; flex-direction: column; gap: 2px; }
.info-label { font-size: 11px; color: rgba(255,255,255,0.5); }
.info-val { font-size: 14px; font-weight: 700; color: #fff; }
.info-val.highlight { color: #22c55e; }
.info-val.accent { color: #fbbf24; }
.info-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 10px 0; }
.info-desc { font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 10px; }
.progress-area { margin-top: 8px; }
.dist-progress {
  height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;
}
.dist-fill { height: 100%; background: linear-gradient(90deg, #22c55e, #10b981); border-radius: 3px; transition: width 0.4s; }
.dist-labels { display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 4px; }
.dist-day { color: #22c55e; font-weight: 600; }

.multiple-section {
  background: rgba(255,255,255,0.04); border-radius: 14px;
  overflow: hidden; margin-bottom: 16px;
}
.mult-header {
  padding: 12px 16px; font-size: 14px; font-weight: 700; color: #fff;
  background: rgba(255,255,255,0.04);
}
.mult-table-head {
  display: grid; grid-template-columns: 1fr 0.8fr 1fr 0.8fr;
  padding: 8px 12px; font-size: 11px; font-weight: 600;
  color: rgba(255,255,255,0.4); text-align: center;
}
.mult-row {
  display: grid; grid-template-columns: 1fr 0.8fr 1fr 0.8fr;
  padding: 10px 12px; font-size: 12px; text-align: center;
  color: rgba(255,255,255,0.7); border-top: 1px solid rgba(255,255,255,0.04);
  align-items: center;
}
.mult-btn {
  padding: 4px 12px; border-radius: 14px; font-size: 11px; font-weight: 600;
  border: none; cursor: pointer;
}
.mult-btn.active { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; }
.mult-btn.disabled { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); cursor: not-allowed; }
.unreceived-bar {
  display: flex; justify-content: space-between; padding: 12px 16px;
  font-size: 13px; color: rgba(255,255,255,0.6);
}
.unreceived-val { font-weight: 700; color: #22c55e; }

.tiers-section { margin-bottom: 16px; }
.tiers-header {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  margin-bottom: 14px;
}
.tiers-header h3 { font-size: 16px; font-weight: 700; color: #fff; }
.deco { font-size: 18px; }
.deco.flip { transform: scaleX(-1); }

.sum-recharge {
  display: flex; justify-content: space-between; padding: 10px 14px;
  background: rgba(255,255,255,0.04); border-radius: 10px;
  font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 10px;
}
.sum-val { font-weight: 700; color: #22c55e; }

.tiers-list { display: flex; flex-direction: column; gap: 6px; }
.tier-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px; background: rgba(255,255,255,0.04);
  border-radius: 12px; transition: transform 0.15s;
}
.tier-item:active { transform: scale(0.98); }
.tier-deposit { font-size: 14px; font-weight: 600; color: #fff; }
.tier-bonus { font-size: 16px; font-weight: 800; color: #22c55e; }

.collectable-row {
  display: flex; justify-content: space-between; padding: 14px;
  background: rgba(34,197,94,0.1); border-radius: 10px;
  font-size: 13px; color: rgba(255,255,255,0.7); margin-top: 10px;
}
.collectable-val { font-weight: 800; font-size: 16px; color: #22c55e; }

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

.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  padding: 12px 16px; background: rgba(15,23,42,0.95);
  backdrop-filter: blur(8px); z-index: 100;
}
.claim-btn {
  width: 100%; padding: 14px; border-radius: 12px;
  font-size: 15px; font-weight: 700; border: none; cursor: pointer;
  background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4);
  position: relative; overflow: hidden;
}
.claim-btn.enabled {
  background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; cursor: pointer;
}
.claim-btn.shiny::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%);
  animation: shine 2s ease-in-out infinite;
}
@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.claim-btn:disabled { cursor: not-allowed; }

.modal-overlay {
  position: fixed; inset: 0; z-index: 10010;
  background: rgba(0,0,0,0.75); display: flex;
  align-items: center; justify-content: center; backdrop-filter: blur(4px);
}
.recharge-modal {
  position: relative; background: linear-gradient(180deg, #0f3d2a, #0f172a);
  border-radius: 20px; padding: 24px; min-width: 300px;
  border: 1px solid rgba(34,197,94,0.3);
}
.recharge-modal h3 { text-align: center; font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 16px; }
.modal-close {
  position: absolute; top: 12px; right: 12px;
  background: none; border: none; color: rgba(255,255,255,0.5); font-size: 18px; cursor: pointer;
}
.modal-info { margin-bottom: 16px; }
.modal-info p { font-size: 13px; color: rgba(255,255,255,0.7); margin: 6px 0; }
.modal-info strong { color: #fff; }
.bonus-text { color: #22c55e !important; }
.modal-deposit-btn {
  width: 100%; padding: 12px; border-radius: 12px;
  background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff;
  font-size: 15px; font-weight: 700; border: none; cursor: pointer;
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
