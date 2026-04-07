<template>
  <div class="vip-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>VIP</h2>
      <button class="record-btn" @click="claimRecordHandle">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
      </button>
    </div>

    <div class="vip-card" :style="vipCardBg">
      <div class="vip-card-top">
        <div class="vip-current">
          <div class="vip-badge" :style="{ background: getLevelColor(vipLevelInfo.curVipLevel) }">
            <span class="badge-text">VIP</span>
            <span class="badge-level">{{ vipLevelInfo.curVipLevel }}</span>
          </div>
          <span class="level-label">Nível Atual</span>
        </div>
        <div class="vip-actions-top">
          <button
            class="claim-all-btn"
            :class="{ enabled: claimBtnIsEnable }"
            @click="bathReceiveHandle"
          >
            Coletar Tudo
          </button>
        </div>
      </div>

      <div class="vip-progress-area">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          <div v-if="progressPercent > 1 && progressPercent < 99" class="progress-dot" :style="{ left: progressPercent + '%' }"></div>
        </div>
        <div class="progress-ends">
          <span>VIP {{ vipLevelInfo.curVipLevel }}</span>
          <template v-if="vipLevelInfo.nextVipLevel">
            <div class="next-badge" :style="{ background: getLevelColor(vipLevelInfo.curVipLevel + 1) }">
              <span>VIP {{ vipLevelInfo.curVipLevel + 1 }}</span>
            </div>
          </template>
          <span v-else class="max-level">Nível Máximo</span>
        </div>
      </div>

      <div class="vip-conditions" v-if="vipLevelInfo.nextVipLevel">
        <p class="cond-title">Condições para o próximo nível</p>
        <p v-if="vipLevelInfo.rechargeNeed > 0" class="cond-item">
          Recarga: <strong>{{ merchantCy }} {{ formatAmount(vipLevelInfo.curRechargeAmount) }}</strong>
          <span class="cond-total">/ {{ formatAmount(vipLevelInfo.rechargeRequirements) }}</span>
        </p>
        <p v-if="vipLevelInfo.betNeed > 0" class="cond-item">
          Apostas: <strong>{{ merchantCy }} {{ formatAmount(vipLevelInfo.curBetAmount) }}</strong>
          <span class="cond-total">/ {{ formatAmount(vipLevelInfo.betRequirements) }}</span>
        </p>
      </div>
      <p v-else class="max-reached">Parabéns! Você atingiu o nível máximo VIP!</p>

      <div class="current-tag">Nível Atual</div>
    </div>

    <h3 class="section-title">Benefícios VIP</h3>

    <div class="tab-bar">
      <button
        v-for="tab in pageList"
        :key="tab.value"
        v-show="tab.isEnable"
        :class="['tab-btn', { active: curShowPage === tab.value }]"
        @click="curShowPage = tab.value"
      >
        {{ tab.title }}
        <span v-if="vipReceiveList.includes(tab.value)" class="tab-dot"></span>
      </button>
    </div>

    <template v-if="curShowPage !== 'LEVEL'">
      <div class="table-head">
        <span v-for="title in curPageTitles" :key="title" class="head-cell">{{ title }}</span>
      </div>

      <div class="vip-table">
        <div
          v-for="(row, idx) in curPageData"
          :key="row.level"
          class="table-row"
          :class="{ even: idx % 2 === 0, current: row.level === vipLevelInfo.curVipLevel }"
        >
          <div class="row-level">
            <div class="row-badge" :style="{ background: getLevelColor(row.level) }">
              <span>V{{ row.level }}</span>
            </div>
          </div>
          <div v-if="ifShowDeposit" class="row-cell">
            <span class="cell-val">{{ formatAmount(row.showRechargeProgress ? row.realRechargeRequirement : row.rechargeRequirement) }}</span>
            <template v-if="row.showRechargeProgress">
              <div class="cell-progress">
                <div class="cp-fill" :style="{ width: Math.min(100, row.rechargeProgress * 100) + '%' }"></div>
              </div>
              <span class="cell-sub">{{ formatAmount(row.recharge) }}/{{ formatAmount(row.realRechargeRequirement) }}</span>
            </template>
          </div>
          <div v-if="ifShowBet" class="row-cell">
            <span class="cell-val">{{ formatAmount(row.showBetProgress ? row.realBetRequirement : row.betRequirement) }}</span>
            <template v-if="row.showBetProgress">
              <div class="cell-progress">
                <div class="cp-fill" :style="{ width: Math.min(100, row.betProgress * 100) + '%' }"></div>
              </div>
              <span class="cell-sub">{{ formatAmount(row.bet) }}/{{ formatAmount(row.realBetRequirement) }}</span>
            </template>
          </div>
          <div class="row-cell reward-cell">
            <span>{{ formatAmount(row.reward || 0) }}</span>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="retention-section">
        <div class="retention-rules">
          <h4>Manutenção de Nível</h4>
          <p>Para manter seu nível VIP, é necessário atingir as condições de manutenção dentro do período de avaliação.</p>
          <p>Se as condições não forem atendidas, o nível será rebaixado gradualmente.</p>
          <p>O período de avaliação é de 30 dias.</p>
        </div>

        <div v-if="retentionLevel.length" class="retention-table">
          <div class="ret-head">
            <span>Nível</span>
            <span>Recarga Mín.</span>
            <span>Aposta Mín.</span>
          </div>
          <div v-for="row in retentionLevel" :key="row.level" class="ret-row">
            <span>
              <span class="ret-badge" :style="{ background: getLevelColor(row.level) }">{{ row.level }}</span>
            </span>
            <span>{{ formatAmount(row.retentionRecharge) }}</span>
            <span>{{ formatAmount(row.retentionBet) }}</span>
          </div>
        </div>
      </div>
    </template>

    <div class="vip-rules">
      <h4>Regras VIP</h4>
      <ul>
        <li>O nível VIP é atualizado em tempo real conforme recarga e apostas.</li>
        <li v-if="pageStatus.DAILY">Bônus diário disponível a cada dia.</li>
        <li v-if="pageStatus.WEEKLY">Bônus semanal disponível toda semana.</li>
        <li v-if="pageStatus.MONTHLY">Bônus mensal disponível todo mês.</li>
        <li>Bônus VIP devem ser coletados manualmente. Bônus não coletados expiram no final do período.</li>
        <li>O valor do bônus é determinado pelo seu nível VIP no momento da coleta.</li>
        <li>Bônus VIP possuem requisito de aposta antes do saque.</li>
        <li>A plataforma se reserva o direito de modificar os termos desta promoção.</li>
      </ul>
    </div>

    <div v-if="showReceiveBtn" class="bottom-bar">
      <button
        class="receive-btn"
        :class="{ enabled: receiveBtnIsEnable }"
        :disabled="!receiveBtnIsEnable"
        @click="receiveHandle"
      >
        {{ receiveBtnIsEnable ? `Coletar ${curShowPage}` : 'Sem bônus disponível' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useVip } from '../composables/useVip'

const {
  vipLevelInfo,
  curShowPage,
  claimBtnIsEnable,
  showReceiveBtn,
  receiveBtnIsEnable,
  ifShowDeposit,
  ifShowBet,
  pageStatus,
  vipReceiveList,
  pageList,
  curPageTitles,
  curPageData,
  retentionLevel,
  merchantCy,
  bathReceiveHandle,
  receiveHandle,
  claimRecordHandle,
  formatAmount
} = useVip()

const progressPercent = computed(() => {
  const info = vipLevelInfo
  const rechargeP = info.rechargeRequirements ? (info.curRechargeAmount / info.rechargeRequirements) : 0
  const betP = info.betRequirements ? (info.curBetAmount / info.betRequirements) : 0
  return Math.min(100, ((rechargeP + betP) / 2) * 100)
})

const vipCardBg = computed(() => {
  const lvl = vipLevelInfo.curVipLevel
  const gradients = {
    0: 'linear-gradient(135deg, #374151, #4b5563)',
    1: 'linear-gradient(135deg, #065f46, #10b981)',
    2: 'linear-gradient(135deg, #1e40af, #3b82f6)',
    3: 'linear-gradient(135deg, #5b21b6, #8b5cf6)',
    4: 'linear-gradient(135deg, #9d174d, #ec4899)',
    5: 'linear-gradient(135deg, #92400e, #f59e0b)',
  }
  return { background: gradients[Math.min(lvl, 5)] || gradients[5] }
})

const levelColors = ['#6b7280','#22c55e','#3b82f6','#8b5cf6','#ec4899','#f59e0b','#ef4444','#14b8a6','#a855f7','#dc2626','#fbbf24']
function getLevelColor(level) { return levelColors[level] || levelColors[0] }
</script>

<style scoped>
.vip-page {
  padding: 0 12px 100px;
  background: linear-gradient(180deg, #1a0533 0%, #0f172a 40%);
  min-height: 100vh;
}

.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; color: #fff; }
.back-btn, .record-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(255,255,255,0.08); color: #fff; border: none; cursor: pointer;
}

.vip-card {
  position: relative; border-radius: 16px; padding: 20px 16px;
  margin-bottom: 20px; overflow: hidden;
}
.vip-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.vip-current { display: flex; align-items: center; gap: 10px; }
.vip-badge {
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.badge-text { font-size: 8px; font-weight: 700; color: rgba(255,255,255,0.8); }
.badge-level { font-size: 18px; font-weight: 900; color: #fff; line-height: 1; }
.level-label { font-size: 12px; color: rgba(255,255,255,0.7); }
.claim-all-btn {
  padding: 8px 18px; border-radius: 20px; font-size: 12px; font-weight: 700;
  background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.5);
  border: none; cursor: not-allowed;
}
.claim-all-btn.enabled {
  background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000; cursor: pointer;
}

.vip-progress-area { margin-bottom: 14px; }
.progress-track {
  position: relative; height: 8px; background: rgba(255,255,255,0.15);
  border-radius: 4px; overflow: visible;
}
.progress-fill {
  height: 100%; border-radius: 4px;
  background: linear-gradient(90deg, #fde68a, #fbbf24);
  transition: width 0.5s;
}
.progress-dot {
  position: absolute; top: 50%; transform: translate(-50%, -50%);
  width: 14px; height: 14px; border-radius: 50%;
  background: #fbbf24; border: 2px solid #fff;
  box-shadow: 0 0 8px rgba(251,191,36,0.6);
}
.progress-ends {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 6px; font-size: 11px; color: rgba(255,255,255,0.6);
}
.next-badge {
  padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; color: #fff;
}
.max-level { font-weight: 700; color: #fbbf24; }

.vip-conditions { font-size: 12px; }
.cond-title { font-weight: 700; color: rgba(255,255,255,0.8); margin-bottom: 4px; }
.cond-item { color: rgba(255,255,255,0.6); margin: 2px 0; }
.cond-item strong { color: #fff; }
.cond-total { color: rgba(255,255,255,0.4); font-size: 11px; }
.max-reached { font-size: 13px; color: #fbbf24; text-align: center; font-weight: 600; }

.current-tag {
  position: absolute; top: 8px; left: 8px;
  background: #ef4444; color: #fff; font-size: 9px; font-weight: 700;
  padding: 2px 8px; border-radius: 4px;
}

.section-title { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 12px; }

.tab-bar {
  display: flex; gap: 4px; margin-bottom: 12px; overflow-x: auto; padding-bottom: 4px;
}
.tab-btn {
  position: relative; padding: 8px 18px; border-radius: 20px; font-size: 12px; font-weight: 600;
  background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5);
  border: 1px solid rgba(255,255,255,0.08); white-space: nowrap; cursor: pointer;
  transition: all 0.2s;
}
.tab-btn.active {
  background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff;
  border-color: transparent;
}
.tab-dot {
  position: absolute; top: 4px; right: 4px;
  width: 6px; height: 6px; border-radius: 50%; background: #ef4444;
}

.table-head {
  display: grid; grid-template-columns: 50px repeat(3, 1fr);
  padding: 10px 12px; font-size: 11px; font-weight: 600;
  color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.04);
  border-radius: 10px 10px 0 0; text-align: center;
}
.head-cell { white-space: nowrap; }

.vip-table {
  background: rgba(255,255,255,0.02); border-radius: 0 0 10px 10px;
  overflow: hidden; margin-bottom: 16px;
}
.table-row {
  display: grid; grid-template-columns: 50px repeat(3, 1fr);
  padding: 10px 12px; font-size: 11px; text-align: center;
  align-items: center; color: rgba(255,255,255,0.7);
  border-top: 1px solid rgba(255,255,255,0.04);
}
.table-row.even { background: rgba(255,255,255,0.02); }
.table-row.current { background: rgba(168,85,247,0.12); }
.row-level { display: flex; justify-content: center; }
.row-badge {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; color: #fff;
}
.row-cell { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.cell-val { font-size: 11px; }
.cell-progress {
  width: 80%; height: 4px; background: rgba(255,255,255,0.1);
  border-radius: 2px; overflow: hidden;
}
.cp-fill { height: 100%; background: linear-gradient(90deg, #22c55e, #16a34a); border-radius: 2px; }
.cell-sub { font-size: 9px; color: rgba(255,255,255,0.4); }
.reward-cell span { color: #fbbf24; font-weight: 700; }

.retention-section {
  background: rgba(255,255,255,0.04); border-radius: 12px; padding: 16px;
  margin-bottom: 16px;
}
.retention-rules { margin-bottom: 16px; }
.retention-rules h4 { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 8px; }
.retention-rules p { font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.6; margin: 4px 0; }
.retention-table { overflow: hidden; border-radius: 8px; }
.ret-head {
  display: grid; grid-template-columns: 60px 1fr 1fr;
  padding: 10px 12px; font-size: 11px; font-weight: 600;
  color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.06); text-align: center;
}
.ret-row {
  display: grid; grid-template-columns: 60px 1fr 1fr;
  padding: 10px 12px; font-size: 12px; color: rgba(255,255,255,0.7);
  text-align: center; border-top: 1px solid rgba(255,255,255,0.04);
}
.ret-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 50%;
  font-size: 10px; font-weight: 700; color: #fff;
}

.vip-rules {
  background: rgba(255,255,255,0.04); border-radius: 12px; padding: 14px;
  margin-bottom: 16px;
}
.vip-rules h4 { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 10px; }
.vip-rules ul { list-style: none; padding: 0; margin: 0; }
.vip-rules li {
  font-size: 12px; color: rgba(255,255,255,0.5); padding: 4px 0 4px 16px;
  position: relative; line-height: 1.6;
}
.vip-rules li::before {
  content: ''; position: absolute; left: 4px; top: 50%; transform: translateY(-50%);
  width: 4px; height: 4px; border-radius: 50%; background: #a855f7;
}

.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  padding: 12px 16px; background: rgba(15,23,42,0.95);
  backdrop-filter: blur(8px); z-index: 100;
}
.receive-btn {
  width: 100%; padding: 14px; border-radius: 12px;
  font-size: 15px; font-weight: 700; border: none; cursor: pointer;
  background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4);
}
.receive-btn.enabled {
  background: linear-gradient(135deg, #a855f7, #7c3aed); color: #fff;
  cursor: pointer;
}
.receive-btn:disabled { cursor: not-allowed; }
</style>
