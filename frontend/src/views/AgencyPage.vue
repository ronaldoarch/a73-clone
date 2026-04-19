<template>
  <div class="agency-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Centro de Agência</h2>
    </div>

    <!-- Tab Bar -->
    <div class="agency-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="agency-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
        <span v-if="tab.id === 'info' && hasCommission" class="tab-dot"></span>
      </button>
    </div>

    <!-- Tab: My Agency (Referral Info) -->
    <div v-if="activeTab === 'info'" class="tab-content">
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Meu ID:</span>
          <span class="info-val">{{ userId }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Superior ID:</span>
          <span class="info-val">{{ agencyInfo.parentId || 0 }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Comissão Disponível:</span>
          <span class="info-val currency-val">{{ currency }} {{ fmt(userCommission) }}</span>
        </div>
        <div class="info-actions">
          <button class="btn-claim" :disabled="userCommission <= 0" @click="claimCommission">Resgatar</button>
          <button class="btn-history" @click="$router.push('/report')">Histórico</button>
        </div>
      </div>

      <!-- Share Section -->
      <div class="share-section">
        <h3 class="section-title">Seu Link de Convite</h3>
        <div class="share-link-box">
          <span class="share-url">{{ shareUrl || 'Carregando...' }}</span>
          <button class="copy-btn" @click="copyLink">Copiar</button>
        </div>
        <div class="share-buttons">
          <button class="share-btn whatsapp" @click="shareWhatsApp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </button>
          <button class="share-btn telegram" @click="shareTelegram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            Telegram
          </button>
        </div>
      </div>

      <!-- Commission Stats -->
      <div class="stats-card">
        <h3 class="card-title">Comissões</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Comissão Total</span>
            <span class="stat-val currency-val">{{ fmt(agencyInfo.commission) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Resgatada</span>
            <span class="stat-val">{{ fmt(agencyInfo.claimedCommission) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Última Comissão</span>
            <span class="stat-val">{{ fmt(agencyInfo.lastCommission) }}</span>
          </div>
        </div>
      </div>

      <!-- Performance Stats -->
      <div class="stats-card">
        <h3 class="card-title">Desempenho</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Membros Diretos</span>
            <span class="stat-val">{{ agencyInfo.dayDirectAdd || 0 }}/{{ agencyInfo.directCount || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Equipe</span>
            <span class="stat-val">{{ agencyInfo.dayTeamAdd || 0 }}/{{ agencyInfo.teamCount || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Desempenho Total</span>
            <span class="stat-val currency-val">{{ fmt((agencyInfo.directAchievement || 0) + (agencyInfo.teamAchievement || 0)) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Direto</span>
            <span class="stat-val currency-val">{{ fmt(agencyInfo.directAchievement) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Equipe</span>
            <span class="stat-val currency-val">{{ fmt(agencyInfo.teamAchievement) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Performance -->
    <div v-if="activeTab === 'performance'" class="tab-content">
      <div class="search-bar">
        <input v-model="searchId" type="number" placeholder="Buscar por ID" class="search-input" />
        <button class="search-btn-act" @click="searchSubordinates">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
        </button>
      </div>

      <div class="table-header">
        <span class="th-col">ID</span>
        <span class="th-col">Subord.</span>
        <span class="th-col">Apostas</span>
        <span class="th-col">Desemp.</span>
        <span class="th-col">Comissão</span>
      </div>

      <div v-if="performanceList.length" class="table-body">
        <div v-for="(item, i) in performanceList" :key="i" class="table-row" :class="{ odd: i % 2 }">
          <span class="td-col">{{ item.userId }}</span>
          <span class="td-col">{{ item.subAccount }}</span>
          <span class="td-col">{{ fmt(item.totalFlow) }}</span>
          <span class="td-col">{{ fmt(item.achievement) }}</span>
          <span class="td-col currency-val">{{ fmt(item.recharge) }}</span>
        </div>
      </div>
      <div v-else class="empty-state-sm">
        <p>Nenhum dado encontrado</p>
      </div>
    </div>

    <!-- Tab: Commission Detail -->
    <div v-if="activeTab === 'commission'" class="tab-content">
      <div class="filter-row">
        <div class="filter-select" @click="showDatePicker = !showDatePicker">
          <span>{{ commissionDateLabel }}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="filter-select" @click="showGameFilter = !showGameFilter">
          <span>{{ gameFilterLabel }}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      <div v-if="showGameFilter" class="dropdown-menu">
        <button
          v-for="g in gameTypes"
          :key="g"
          class="dropdown-item"
          :class="{ active: gameFilter === g }"
          @click="gameFilter = g; showGameFilter = false; fetchCommissions()"
        >{{ g === 'ALL' ? 'Todos' : g }}</button>
      </div>

      <div class="table-header">
        <span class="th-col">Data</span>
        <span class="th-col">Tipo</span>
        <span class="th-col">Desemp.</span>
        <span class="th-col">Pessoas</span>
        <span class="th-col">Comissão</span>
      </div>

      <div v-if="commissionList.length" class="table-body">
        <div v-for="(item, i) in commissionList" :key="i" class="table-row" :class="{ odd: i % 2 }">
          <span class="td-col">{{ item.time ? formatDateShort(item.time) : '-' }}</span>
          <span class="td-col">{{ item.gameType || 'Todos' }}</span>
          <span class="td-col">{{ fmt(item.directAchievement + item.teamAchievement) }}</span>
          <span class="td-col">{{ item.contributionCount }}</span>
          <span class="td-col currency-val">{{ fmt(item.totalCommission) }}</span>
        </div>
      </div>
      <div v-else class="empty-state-sm">
        <p>Nenhum registro</p>
      </div>
    </div>

    <!-- Tab: Commission Rate -->
    <div v-if="activeTab === 'rate'" class="tab-content">
      <div class="rate-tabs" v-if="rateSortList.length > 1">
        <button
          v-for="rt in rateSortList"
          :key="rt"
          class="rate-tab"
          :class="{ active: rateTab === rt }"
          @click="rateTab = rt"
        >{{ rt }}</button>
      </div>

      <div class="table-header">
        <span class="th-col">Nível</span>
        <span class="th-col">Desempenho Req.</span>
        <span class="th-col">Taxa Comissão</span>
      </div>

      <div v-if="currentRateList.length" class="table-body">
        <div v-for="(item, i) in currentRateList" :key="i" class="table-row" :class="{ odd: i % 2 }">
          <span class="td-col">{{ item.level }}</span>
          <span class="td-col">{{ fmt(item.needFlow) }}+</span>
          <span class="td-col currency-val">{{ (item.rat * 100).toFixed(2) }}%</span>
        </div>
      </div>
    </div>

    <!-- Tab: Tutorial -->
    <div v-if="activeTab === 'tutorial'" class="tab-content">
      <div class="tutorial-card">
        <h3>Como Funciona</h3>
        <div class="tutorial-steps">
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-text">
              <strong>Compartilhe seu link</strong>
              <p>Envie seu link exclusivo para amigos e família.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-text">
              <strong>Amigos se cadastram</strong>
              <p>Seus convidados se registram usando seu link de convite.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-text">
              <strong>Ganhe comissões</strong>
              <p>Receba comissões baseadas nas apostas dos seus subordinados.</p>
            </div>
          </div>
        </div>

        <div class="hierarchy-visual">
          <div class="hierarchy-level level-a">
            <div class="agent-node">
              <div class="agent-avatar a">A</div>
              <span>Você</span>
            </div>
          </div>
          <div class="hierarchy-lines"></div>
          <div class="hierarchy-level level-b">
            <div class="agent-node" v-for="b in ['B1','B2','B3']" :key="b">
              <div class="agent-avatar b">{{ b }}</div>
              <span>Direto</span>
            </div>
          </div>
          <div class="hierarchy-lines"></div>
          <div class="hierarchy-level level-c">
            <div class="agent-node" v-for="c in ['C1','C2','C3']" :key="c">
              <div class="agent-avatar c">{{ c }}</div>
              <span>Equipe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/user'
import { useSystemStore } from '../stores/system'
import { useAgentStore } from '../stores/agent'
import { storeToRefs } from 'pinia'
import { trpcQuery, trpcMutation, apiGet } from '../utils/api'

const auth = useAuthStore()
const userStore = useUserStore()
const systemStore = useSystemStore()
const agentStore = useAgentStore()

const { isLoggedIn } = storeToRefs(auth)
const { userDetails } = storeToRefs(userStore)

const currency = computed(() => systemStore.currency || 'R$')
const userId = computed(() => userDetails.value?.userId || '---')

const activeTab = ref('info')
const tabs = [
  { id: 'info', label: 'Minha Agência' },
  { id: 'performance', label: 'Desempenho' },
  { id: 'commission', label: 'Comissão' },
  { id: 'rate', label: 'Taxa' },
  { id: 'tutorial', label: 'Tutorial' }
]

const agencyInfo = ref({})
const shareUrl = ref('')
const userCommission = ref(0)
const hasCommission = ref(false)

const searchId = ref('')
const performanceList = ref([])

const commissionList = ref([])
const gameFilter = ref('ALL')
const showGameFilter = ref(false)
const showDatePicker = ref(false)
const commissionStartDate = ref('')
const commissionEndDate = ref('')
const gameTypes = ['ALL', 'ELECTRONIC', 'CHESS', 'FISHING', 'VIDEO', 'SPORTS', 'LOTTERY']

const rateSortList = ref([])
const rateData = ref({})
const rateTab = ref('')

const commissionDateLabel = computed(() => {
  if (commissionStartDate.value && commissionEndDate.value)
    return `${commissionStartDate.value} ~ ${commissionEndDate.value}`
  return 'Selecionar Data'
})

const gameFilterLabel = computed(() => gameFilter.value === 'ALL' ? 'Todos os Jogos' : gameFilter.value)
const currentRateList = computed(() => rateData.value[rateTab.value] || [])

function fmt(val) {
  return Number(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDateShort(d) {
  try {
    return new Date(d).toLocaleDateString('pt-BR')
  } catch { return d }
}

function copyLink() {
  if (shareUrl.value) navigator.clipboard?.writeText(shareUrl.value).catch(() => {})
}

function shareWhatsApp() {
  window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl.value)}`, '_blank')
}

function shareTelegram() {
  window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl.value)}`, '_blank')
}

async function claimCommission() {
  if (userCommission.value <= 0) return
  try {
    await trpcMutation('agent.claimCommission', {})
    userCommission.value = 0
    fetchAgencyInfo()
  } catch {}
}

async function fetchAgencyInfo() {
  try {
    const data = await trpcQuery('agent.myAgentInfo', {})
    if (data) {
      agencyInfo.value = data
      userCommission.value = Number(data.commission || 0) / 100
      hasCommission.value = userCommission.value > 0
    }
  } catch {}
}

async function fetchShareUrl() {
  try {
    const data = await trpcQuery('agent.shareUrl', {})
    if (data?.url) shareUrl.value = data.url
    else if (data?.shareUrl) shareUrl.value = data.shareUrl
    else if (typeof data === 'string') shareUrl.value = data
  } catch {}
}

async function searchSubordinates() {
  try {
    const params = { page: 1, pageSize: 50 }
    if (searchId.value) params.userId = Number(searchId.value)
    const data = await apiGet('/api/agent/subordinates', params)
    if (data?.info?.directList) performanceList.value = data.info.directList
    else if (Array.isArray(data)) performanceList.value = data
    else performanceList.value = []
  } catch {
    performanceList.value = []
  }
}

async function fetchCommissions() {
  try {
    const params = {}
    if (commissionStartDate.value) params.startTime = commissionStartDate.value
    if (commissionEndDate.value) params.endTime = commissionEndDate.value
    if (gameFilter.value !== 'ALL') params.gameType = gameFilter.value
    const data = await apiGet('/api/agent/commission', params)
    if (data?.info?.returnData) commissionList.value = data.info.returnData
    else if (Array.isArray(data)) commissionList.value = data
    else commissionList.value = []
  } catch {
    commissionList.value = []
  }
}

async function fetchRateList() {
  try {
    const data = await apiGet('/api/agent/rate')
    if (data?.info) {
      const parsed = typeof data.info === 'string' ? JSON.parse(data.info) : data.info
      if (Array.isArray(parsed)) {
        const sorts = []
        const map = {}
        parsed.forEach(item => {
          const gt = item.gameType || 'ALL'
          if (!sorts.includes(gt)) {
            sorts.push(gt)
            map[gt] = []
          }
          map[gt].push({
            level: item.level,
            needFlow: Number(item.needFlow || 0) / 100,
            rat: Number(item.rat || item.rewardAmount || 0)
          })
        })
        rateSortList.value = sorts
        rateData.value = map
        if (sorts.length) rateTab.value = sorts[0]
      }
    }
  } catch {}
}

onMounted(async () => {
  if (isLoggedIn.value) {
    await Promise.all([
      fetchAgencyInfo(),
      fetchShareUrl(),
      fetchRateList(),
      userStore.fetchDetails().catch(() => {}),
      userStore.fetchAssets().catch(() => {})
    ])
    searchSubordinates()
    fetchCommissions()
  }
})
</script>

<style scoped>
.agency-page {
  padding: .75rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100%;
}

.page-header {
  display: flex; align-items: center; gap: .75rem;
  margin-bottom: 1rem; padding: .25rem 0;
}
.page-header h2 { font-size: 1.125rem; font-weight: 700; color: var(--ep-color-text-default); }
.back-btn { color: var(--ep-color-text-default); padding: .25rem; }

.agency-tabs {
  display: flex; overflow-x: auto; gap: .25rem;
  margin-bottom: 1rem; -webkit-overflow-scrolling: touch;
}
.agency-tabs::-webkit-scrollbar { display: none; }
.agency-tab {
  flex-shrink: 0; padding: .5rem .875rem; border-radius: .5rem;
  font-size: .8125rem; font-weight: 600; white-space: nowrap;
  background: var(--ep-color-background-fill-surface-raised-L1);
  color: var(--ep-color-text-weaker); border: 1px solid var(--ep-color-border-default);
  position: relative; transition: all .15s;
}
.agency-tab.active {
  background: var(--gradient-primary); color: var(--ep-color-text-inverse, #0E1E3D);
  border-color: transparent;
}
.tab-dot {
  position: absolute; top: .25rem; right: .25rem;
  width: .375rem; height: .375rem; border-radius: 50%;
  background: #F44336;
}

.tab-content { margin-top: .5rem; }

.info-card, .stats-card, .share-section, .tutorial-card {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border: 1px solid var(--ep-color-border-default);
  border-radius: .5rem; padding: 1rem; margin-bottom: .75rem;
}
.info-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: .375rem 0; font-size: .8125rem;
}
.info-label { color: var(--ep-color-text-weakest); }
.info-val { color: var(--ep-color-text-default); font-weight: 600; }
.currency-val { color: var(--color-currency, #FBA531); }

.info-actions { display: flex; gap: .5rem; margin-top: .75rem; }
.btn-claim {
  flex: 1; padding: .5rem; border-radius: .5rem;
  background: var(--gradient-primary); color: #fff; font-weight: 700; font-size: .8125rem;
}
.btn-claim:disabled { opacity: .4; }
.btn-history {
  flex: 1; padding: .5rem; border-radius: .5rem;
  background: var(--ep-color-background-fill-surface-lowered);
  color: var(--ep-color-text-default); font-weight: 600; font-size: .8125rem;
  border: 1px solid var(--ep-color-border-default);
}

.section-title, .card-title {
  font-size: .875rem; font-weight: 700;
  color: var(--ep-color-text-default); margin-bottom: .75rem;
}

.share-link-box {
  display: flex; gap: .5rem; margin-bottom: .75rem;
}
.share-url {
  flex: 1; padding: .5rem .625rem; border-radius: .375rem;
  background: var(--ep-color-background-fill-surface-lowered);
  font-size: .75rem; color: var(--ep-color-text-weaker);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  border: 1px solid var(--ep-color-border-default);
}
.copy-btn {
  padding: .5rem .875rem; border-radius: .375rem;
  background: var(--gradient-primary); color: #fff;
  font-size: .75rem; font-weight: 700; white-space: nowrap;
}
.share-buttons { display: flex; gap: .5rem; }
.share-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: .375rem;
  padding: .5rem; border-radius: .375rem; font-size: .75rem; font-weight: 600;
}
.share-btn.whatsapp { background: #25D366; color: #fff; }
.share-btn.telegram { background: #0088cc; color: #fff; }

.stats-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: .5rem;
}
.stat-item {
  padding: .5rem; border-radius: .375rem;
  background: var(--ep-color-background-fill-surface-lowered);
}
.stat-label { display: block; font-size: .6875rem; color: var(--ep-color-text-weakest); margin-bottom: .125rem; }
.stat-val { display: block; font-size: .875rem; font-weight: 700; color: var(--ep-color-text-default); }

/* Search */
.search-bar { display: flex; gap: .5rem; margin-bottom: .75rem; }
.search-input {
  flex: 1; padding: .5rem .625rem; border-radius: .375rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border: 1px solid var(--ep-color-border-default);
  color: var(--ep-color-text-default); font-size: .8125rem;
}
.search-btn-act {
  padding: .5rem .75rem; border-radius: .375rem;
  background: var(--gradient-primary); color: #fff;
}

/* Table */
.table-header {
  display: flex; padding: .5rem .375rem; border-radius: .375rem .375rem 0 0;
  background: var(--ep-color-background-fill-surface-raised-L2);
  border: 1px solid var(--ep-color-border-default);
}
.th-col {
  flex: 1; text-align: center; font-size: .6875rem;
  font-weight: 700; color: var(--ep-color-text-weaker);
}
.table-body {
  border: 1px solid var(--ep-color-border-default); border-top: none;
  border-radius: 0 0 .375rem .375rem; overflow: hidden;
}
.table-row {
  display: flex; padding: .5rem .375rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
}
.table-row.odd { background: rgba(255,255,255,.02); }
.td-col {
  flex: 1; text-align: center; font-size: .75rem;
  color: var(--ep-color-text-default);
}

.empty-state-sm {
  text-align: center; padding: 2rem; color: var(--ep-color-text-weakest);
  font-size: .8125rem;
}

/* Filters */
.filter-row { display: flex; gap: .5rem; margin-bottom: .75rem; }
.filter-select {
  flex: 1; display: flex; align-items: center; justify-content: space-between;
  padding: .5rem .625rem; border-radius: .375rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border: 1px solid var(--ep-color-border-default);
  font-size: .75rem; color: var(--ep-color-text-default); cursor: pointer;
}
.dropdown-menu {
  display: flex; flex-wrap: wrap; gap: .375rem; margin-bottom: .75rem;
  padding: .5rem; border-radius: .375rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border: 1px solid var(--ep-color-border-default);
}
.dropdown-item {
  padding: .375rem .625rem; border-radius: .25rem;
  font-size: .75rem; color: var(--ep-color-text-weaker);
  background: var(--ep-color-background-fill-surface-lowered);
}
.dropdown-item.active {
  background: var(--gradient-primary); color: #fff;
}

/* Rate tabs */
.rate-tabs { display: flex; gap: .375rem; margin-bottom: .75rem; overflow-x: auto; }
.rate-tabs::-webkit-scrollbar { display: none; }
.rate-tab {
  padding: .375rem .75rem; border-radius: .375rem;
  font-size: .75rem; font-weight: 600; white-space: nowrap;
  background: var(--ep-color-background-fill-surface-raised-L1);
  color: var(--ep-color-text-weaker); border: 1px solid var(--ep-color-border-default);
}
.rate-tab.active {
  background: var(--gradient-primary); color: #fff; border-color: transparent;
}

/* Tutorial */
.tutorial-steps { display: flex; flex-direction: column; gap: .75rem; margin-bottom: 1.5rem; }
.step { display: flex; gap: .75rem; align-items: flex-start; }
.step-num {
  width: 1.75rem; height: 1.75rem; border-radius: 50%;
  background: var(--gradient-primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: .8125rem; flex-shrink: 0;
}
.step-text strong { display: block; font-size: .8125rem; color: var(--ep-color-text-default); margin-bottom: .125rem; }
.step-text p { font-size: .75rem; color: var(--ep-color-text-weakest); }

.hierarchy-visual {
  display: flex; flex-direction: column; align-items: center; gap: .25rem;
  padding: 1rem 0;
}
.hierarchy-level { display: flex; gap: 1rem; justify-content: center; }
.hierarchy-lines {
  width: 2px; height: 1.5rem; background: var(--ep-color-border-default);
}
.agent-node { display: flex; flex-direction: column; align-items: center; gap: .25rem; }
.agent-avatar {
  width: 2.25rem; height: 2.25rem; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: .75rem; font-weight: 800; color: #fff;
}
.agent-avatar.a { background: #f59e0b; border: 2px solid #fbbf24; }
.agent-avatar.b { background: #3b82f6; border: 2px solid #60a5fa; }
.agent-avatar.c { background: #10b981; border: 2px solid #34d399; }
.agent-node span { font-size: .625rem; color: var(--ep-color-text-weakest); }
</style>
