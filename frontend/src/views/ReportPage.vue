<template>
  <div class="report-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Relatórios</h2>
    </div>

    <div class="report-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="report-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="filters-row">
      <button
        v-for="d in dateOptions"
        :key="d.id"
        class="date-btn"
        :class="{ active: dateRange === d.id }"
        @click="selectDate(d.id)"
      >
        {{ d.label }}
      </button>
    </div>

    <!-- Statement (Extrato) -->
    <template v-if="activeTab === 'statement'">
      <div class="report-summary">
        <div class="summary-item">
          <span class="s-label">Depósitos</span>
          <span class="s-value green">{{ currency }} {{ fmt(summaryData.totalRecharge) }}</span>
        </div>
        <div class="summary-item">
          <span class="s-label">Saques</span>
          <span class="s-value red">{{ currency }} {{ fmt(summaryData.totalWithdraw) }}</span>
        </div>
        <div class="summary-item">
          <span class="s-label">Recompensas</span>
          <span class="s-value green">{{ currency }} {{ fmt(summaryData.totalReward) }}</span>
        </div>
      </div>

      <div v-if="records.length" class="records-list">
        <div v-for="item in records" :key="item.id" class="record-item">
          <div class="record-top">
            <span class="record-type">{{ getChangeLabel(item.changeTwoType) }}</span>
            <span class="record-amount" :class="amountClass(item)">
              {{ item.amountChange > 0 ? '+' : '' }}{{ currency }} {{ fmt(item.amountChange) }}
            </span>
          </div>
          <div class="record-bottom">
            <span class="record-date">{{ formatDate(item.createTime) }}</span>
            <span v-if="item.externalRelated" class="record-ref" @click="copyText(item.externalRelated)">
              {{ item.externalRelated }} 📋
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- Betting (Apostas) -->
    <template v-if="activeTab === 'betting'">
      <div class="report-summary" v-if="bettingSummary.totalRounds > 0">
        <div class="summary-item">
          <span class="s-label">Total Rodadas</span>
          <span class="s-value">{{ bettingSummary.totalRounds }}</span>
        </div>
        <div class="summary-item">
          <span class="s-label">Apostas Válidas</span>
          <span class="s-value">{{ currency }} {{ fmt(bettingSummary.totalBet) }}</span>
        </div>
        <div class="summary-item full">
          <span class="s-label">Ganhos/Perdas</span>
          <span class="s-value" :class="bettingSummary.totalProfit >= 0 ? 'green' : 'red'">
            {{ bettingSummary.totalProfit > 0 ? '+' : '' }}{{ currency }} {{ fmt(bettingSummary.totalProfit) }}
          </span>
        </div>
      </div>

      <div v-if="bettingRecords.length" class="records-list">
        <div v-for="item in bettingRecords" :key="item.id || item.roundNo" class="record-item">
          <div class="record-top">
            <span class="record-type">{{ item.platformName }} {{ item.gameName }}</span>
            <span class="record-amount" :class="item.profitAmount >= 0 ? 'green' : 'red'">
              {{ item.profitAmount > 0 ? '+' : '' }}{{ currency }} {{ fmt(item.profitAmount) }}
            </span>
          </div>
          <div class="record-bottom">
            <span class="record-date">{{ formatDate(item.createTime) }}</span>
            <span class="record-status" :class="item.status === 'SETTLED' ? 'green' : ''">
              {{ statusLabel(item.status) }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- Personal (Pessoal) -->
    <template v-if="activeTab === 'personal'">
      <div class="report-summary" v-if="personalSummary.totalRounds > 0">
        <div class="summary-item">
          <span class="s-label">Apostas Acumuladas</span>
          <span class="s-value">{{ personalSummary.totalRounds }}</span>
        </div>
        <div class="summary-item">
          <span class="s-label">Apostas Válidas</span>
          <span class="s-value">{{ currency }} {{ fmt(personalSummary.totalBet) }}</span>
        </div>
        <div class="summary-item full">
          <span class="s-label">Ganho/Perda Acumulado</span>
          <span class="s-value" :class="personalSummary.totalProfit >= 0 ? 'green' : 'red'">
            {{ personalSummary.totalProfit > 0 ? '+' : '' }}{{ currency }} {{ fmt(personalSummary.totalProfit) }}
          </span>
        </div>
      </div>

      <div v-if="personalRecords.length" class="records-list">
        <div v-for="item in personalRecords" :key="item.dayDate" class="record-item">
          <div class="record-top">
            <span class="record-type">{{ item.platformName }} {{ item.gameName }}</span>
            <span class="record-amount" :class="item.profitAmount >= 0 ? 'green' : 'red'">
              {{ item.profitAmount > 0 ? '+' : '' }}{{ currency }} {{ fmt(item.profitAmount) }}
            </span>
          </div>
          <div class="record-bottom">
            <span class="record-date">Rodadas: {{ item.gameRounds }} | {{ item.dayDate }}</span>
            <span class="record-bet">Aposta: {{ currency }} {{ fmt(item.validBetAmount) }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Sports (Esportes) -->
    <template v-if="activeTab === 'sports'">
      <div v-if="sportsRecords.length" class="records-list">
        <div v-for="item in sportsRecords" :key="item.id || item.roundNo" class="record-item">
          <div class="record-top">
            <span class="record-type">{{ item.platformName }} {{ item.gameName }}</span>
            <span class="record-amount" :class="item.profitAmount >= 0 ? 'green' : 'red'">
              {{ item.profitAmount > 0 ? '+' : '' }}{{ currency }} {{ fmt(item.profitAmount) }}
            </span>
          </div>
          <div class="record-bottom">
            <span class="record-date">{{ formatDate(item.createTime) }}</span>
            <span class="record-status" :class="item.status === 'SETTLED' ? 'green' : ''">
              {{ statusLabel(item.status) }}
            </span>
          </div>
          <div v-if="item.roundNo" class="record-ref-row">
            <span class="record-ref" @click="copyText(item.roundNo)">
              {{ item.roundNo }} 📋
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- Other (Outros) -->
    <template v-if="activeTab === 'other'">
      <div v-if="otherRecords.length" class="records-list">
        <div v-for="item in otherRecords" :key="item.id" class="record-item">
          <div class="record-top">
            <span class="record-type">{{ getChangeLabel(item.changeTwoType) }}</span>
            <span class="record-amount" :class="amountClass(item)">
              {{ item.amountChange > 0 ? '+' : '' }}{{ currency }} {{ fmt(item.amountChange) }}
            </span>
          </div>
          <div class="record-bottom">
            <span class="record-date">{{ formatDate(item.createTime) }}</span>
            <span v-if="item.externalRelated" class="record-ref" @click="copyText(item.externalRelated)">
              {{ item.externalRelated }} 📋
            </span>
          </div>
        </div>
      </div>
    </template>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <span>Carregando...</span>
    </div>

    <Empty
      v-if="!isLoading && currentRecords.length === 0"
      type="data"
      text="Nenhum registro encontrado"
    />

    <button
      v-if="hasMore && currentRecords.length > 0"
      class="load-more-btn"
      @click="loadMore"
      :disabled="isLoading"
    >
      {{ isLoading ? 'Carregando...' : 'Carregar mais' }}
    </button>

    <!-- Footer Summary -->
    <div v-if="activeTab === 'statement'" class="report-footer-summary">
      <div class="footer-row">
        <span class="footer-label">Recarga Acumulada:</span>
        <span class="footer-val green">{{ currency }} {{ fmt(summaryData.totalRecharge) }}</span>
      </div>
      <div class="footer-row">
        <span class="footer-label">Saque Acumulado:</span>
        <span class="footer-val red">{{ currency }} {{ fmt(summaryData.totalWithdraw) }}</span>
      </div>
      <div class="footer-row">
        <span class="footer-label">Descontos Acumulados:</span>
        <span class="footer-val">{{ currency }} {{ fmt(summaryData.totalReward) }}</span>
      </div>
    </div>

    <div v-if="activeTab === 'personal'" class="report-footer-summary">
      <div class="footer-row">
        <span class="footer-label">Apostas Acumuladas:</span>
        <span class="footer-val">{{ personalSummary.totalRounds }}</span>
      </div>
      <div class="footer-row">
        <span class="footer-label">Apostas Válidas Acumuladas:</span>
        <span class="footer-val">{{ currency }} {{ fmt(personalSummary.totalBet) }}</span>
      </div>
      <div class="footer-row">
        <span class="footer-label">Ganho/Perda Acumulado:</span>
        <span class="footer-val" :class="personalSummary.totalProfit >= 0 ? 'green' : 'red'">
          {{ personalSummary.totalProfit > 0 ? '+' : '' }}{{ currency }} {{ fmt(personalSummary.totalProfit) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useSystemStore } from '../stores/system'
import { trpcQuery } from '../utils/api'
import Empty from '../components/Empty.vue'

const auth = useAuthStore()
const systemStore = useSystemStore()

const activeTab = ref('statement')
const dateRange = ref('today')
const isLoading = ref(false)
const page = ref(1)
const pageSize = 15
const hasMore = ref(false)

const records = ref([])
const bettingRecords = ref([])
const personalRecords = ref([])
const sportsRecords = ref([])
const otherRecords = ref([])

const summaryData = ref({ totalRecharge: 0, totalWithdraw: 0, totalReward: 0 })
const bettingSummary = ref({ totalRounds: 0, totalBet: 0, totalProfit: 0 })
const personalSummary = ref({ totalRounds: 0, totalBet: 0, totalProfit: 0 })

const currency = computed(() => systemStore.currency || 'R$')

const tabs = [
  { id: 'statement', label: 'Extrato' },
  { id: 'betting', label: 'Apostas' },
  { id: 'sports', label: 'Esportes' },
  { id: 'personal', label: 'Pessoal' },
  { id: 'other', label: 'Outros' }
]

const dateOptions = [
  { id: 'today', label: 'Hoje' },
  { id: 'yesterday', label: 'Ontem' },
  { id: 'week', label: '7 dias' },
  { id: 'month', label: '30 dias' }
]

const currentRecords = computed(() => {
  if (activeTab.value === 'statement') return records.value
  if (activeTab.value === 'betting') return bettingRecords.value
  if (activeTab.value === 'personal') return personalRecords.value
  if (activeTab.value === 'sports') return sportsRecords.value
  if (activeTab.value === 'other') return otherRecords.value
  return []
})

function getDateRange(range) {
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  if (range === 'yesterday') {
    start.setDate(start.getDate() - 1)
    const end = new Date(start)
    end.setHours(23, 59, 59, 999)
    return { startTime: start.toISOString(), endTime: end.toISOString() }
  }
  if (range === 'week') start.setDate(start.getDate() - 7)
  if (range === 'month') start.setDate(start.getDate() - 30)

  return { startTime: start.toISOString(), endTime: now.toISOString() }
}

function selectDate(id) {
  dateRange.value = id
}

function fmt(val) {
  const num = Number(val) / 100
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function copyText(text) {
  navigator.clipboard?.writeText(text).catch(() => {})
}

const changeLabels = {
  'recharge:complete': 'Depósito',
  'withdraw:complete': 'Saque',
  'withdraw:confiscation': 'Saque Cancelado',
  'reward:activity': 'Recompensa Atividade',
  'reward:register': 'Recompensa Registro',
  'reward:vip': 'Recompensa VIP',
  'game:bet': 'Aposta',
  'game:win': 'Ganho Jogo',
  'commission': 'Comissão',
  'adjustment': 'Ajuste'
}
function getChangeLabel(type) {
  return changeLabels[type] || type || 'Outro'
}

function statusLabel(s) {
  const map = { SETTLED: 'Liquidado', UNSETTLED: 'Pendente', CANCELLED: 'Cancelado' }
  return map[s] || s || ''
}

function amountClass(item) {
  if (!item.amountChange) return ''
  if (['withdraw:complete', 'withdraw:confiscation'].includes(item.changeTwoType) || item.amountChange < 0) return 'red'
  return 'green'
}

async function fetchData(append = false) {
  if (!auth.isLoggedIn) return
  isLoading.value = true

  const { startTime, endTime } = getDateRange(dateRange.value)
  const params = { page: page.value, pageSize, startTime, endTime }

  try {
    if (activeTab.value === 'statement') {
      const data = await trpcQuery('user.assetsChangeList', params).catch(() => null)
      if (data) {
        summaryData.value = {
          totalRecharge: data.totalRechargeAmountChange || 0,
          totalWithdraw: Math.abs(data.totalWithdrawAmountChange || 0),
          totalReward: data.totalRewardAmountChange || 0
        }
        const list = data.assetsChangeList || []
        records.value = append ? records.value.concat(list) : list
        hasMore.value = list.length >= pageSize
      }
    } else if (activeTab.value === 'betting') {
      const data = await trpcQuery('user.gameRecordList', params).catch(() => null)
      if (data) {
        const list = data.gameRecordList || []
        bettingRecords.value = append ? bettingRecords.value.concat(list) : list
        hasMore.value = list.length >= pageSize
      }
    } else if (activeTab.value === 'personal') {
      const data = await trpcQuery('user.profitList', params).catch(() => null)
      if (data) {
        personalSummary.value = {
          totalRounds: data.totalGameRounds || 0,
          totalBet: data.totalValidBetAmount || 0,
          totalProfit: data.totalProfitAmount || 0
        }
        const list = data.userDayProfitList || []
        personalRecords.value = append ? personalRecords.value.concat(list) : list
        hasMore.value = list.length >= pageSize
      }
    } else if (activeTab.value === 'sports') {
      const data = await trpcQuery('user.gameRecordList', { ...params, gameType: 'SPORTS' }).catch(() => null)
      if (data) {
        const list = data.gameRecordList || []
        sportsRecords.value = append ? sportsRecords.value.concat(list) : list
        hasMore.value = list.length >= pageSize
      }
    } else if (activeTab.value === 'other') {
      const otherTypes = ['reward:activity', 'reward:register', 'reward:vip', 'commission', 'adjustment']
      const data = await trpcQuery('user.assetsChangeList', { ...params, changeTypes: otherTypes }).catch(() => null)
      if (data) {
        const list = data.assetsChangeList || []
        otherRecords.value = append ? otherRecords.value.concat(list) : list
        hasMore.value = list.length >= pageSize
      }
    }
  } catch (e) {
    hasMore.value = false
  } finally {
    isLoading.value = false
  }
}

function loadMore() {
  page.value++
  fetchData(true)
}

watch([activeTab, dateRange], () => {
  page.value = 1
  hasMore.value = false
  records.value = []
  bettingRecords.value = []
  personalRecords.value = []
  sportsRecords.value = []
  otherRecords.value = []
  fetchData()
})

onMounted(() => { fetchData() })
</script>

<style scoped>
.report-page {
  padding: 0 .75rem 1.5rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100%;
}
.page-header { display: flex; align-items: center; padding: .75rem 0; gap: .75rem; }
.page-header h2 { flex: 1; font-size: 1.125rem; font-weight: 700; color: var(--ep-color-text-default); }
.back-btn { color: var(--ep-color-text-default); padding: 4px; }

.report-tabs { display: flex; gap: 4px; margin-bottom: .75rem; }
.report-tab {
  flex: 1; padding: .625rem; border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--ep-color-background-fill-surface-raised-L1);
  font-size: .8125rem; font-weight: 600;
  color: var(--ep-color-text-weak); text-align: center;
  border: 1px solid var(--ep-color-border-default); transition: all .2s;
}
.report-tab.active {
  background: var(--gradient-primary);
  color: var(--ep-color-text-inverse, #0E1E3D);
  border-color: transparent;
}

.filters-row { display: flex; gap: .375rem; margin-bottom: 1rem; overflow-x: auto; }
.date-btn {
  padding: .4375rem .875rem; border-radius: 1.25rem; white-space: nowrap;
  background: var(--ep-color-background-fill-surface-raised-L1);
  color: var(--ep-color-text-weak); font-size: .75rem; font-weight: 600;
  border: 1px solid var(--ep-color-border-default); transition: all .2s;
}
.date-btn.active {
  background: var(--ep-dynamic-primary, rgba(24,170,255,.15));
  color: var(--ep-color-text-selected);
  border-color: var(--ep-color-border-brand, var(--ep-color-text-selected));
}

.report-summary {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: .5rem; margin-bottom: 1rem;
}
.summary-item {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: var(--ep-border-radius-l, .5rem);
  padding: .875rem; border: 1px solid var(--ep-color-border-default);
}
.summary-item.full { grid-column: 1 / -1; }
.s-label { display: block; font-size: .75rem; color: var(--ep-color-text-weakest); margin-bottom: .25rem; }
.s-value { font-size: 1rem; font-weight: 700; color: var(--ep-color-text-default); }
.s-value.green { color: var(--ep-accent-green, #17C964); }
.s-value.red { color: var(--ep-light-accent-color-red, #F5222D); }

.records-list { display: flex; flex-direction: column; gap: .5rem; }
.record-item {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: var(--ep-border-radius-l, .5rem);
  padding: .75rem; border: 1px solid var(--ep-color-border-default);
}
.record-top {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: .375rem;
}
.record-type { font-size: .8125rem; font-weight: 500; color: var(--ep-color-text-default); }
.record-amount { font-size: .875rem; font-weight: 700; }
.record-amount.green { color: var(--ep-accent-green, #17C964); }
.record-amount.red { color: var(--ep-light-accent-color-red, #F5222D); }
.record-bottom {
  display: flex; justify-content: space-between; align-items: center;
  font-size: .6875rem; color: var(--ep-color-text-weakest);
}
.record-ref { cursor: pointer; }
.record-status { font-weight: 600; }
.record-status.green { color: var(--ep-accent-green, #17C964); }
.record-bet { font-size: .6875rem; }

.loading-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 2rem; gap: .5rem; color: var(--ep-color-text-weakest);
}
.spinner {
  width: 1.5rem; height: 1.5rem;
  border: 2px solid var(--ep-color-border-default);
  border-top-color: var(--ep-color-text-selected);
  border-radius: 50%; animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.load-more-btn {
  display: block; width: 100%; margin-top: 1rem;
  padding: .75rem; border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--ep-color-background-fill-surface-raised-L1);
  color: var(--ep-color-text-weak); font-size: .8125rem; font-weight: 600;
  border: 1px solid var(--ep-color-border-default);
}
.load-more-btn:disabled { opacity: .5; }

.record-ref-row {
  margin-top: .25rem; display: flex; justify-content: flex-end;
}
.record-ref-row .record-ref {
  font-size: .6875rem; color: var(--ep-color-text-weakest); cursor: pointer;
}

.report-footer-summary {
  margin-top: 1rem; padding: .75rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border: 1px solid var(--ep-color-border-default);
  border-radius: var(--ep-border-radius-l, .5rem);
}
.footer-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: .375rem 0;
}
.footer-label { font-size: .75rem; color: var(--ep-color-text-weakest); }
.footer-val { font-size: .8125rem; font-weight: 600; color: var(--ep-color-text-default); }
.footer-val.green { color: var(--ep-accent-green, #17C964); }
.footer-val.red { color: var(--ep-light-accent-color-red, #F5222D); }

.report-tabs {
  overflow-x: auto; -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.report-tabs::-webkit-scrollbar { display: none; }
</style>
