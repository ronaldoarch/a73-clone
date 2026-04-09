<template>
  <div class="promo-page">
    <!-- Top Tabs -->
    <div class="promo-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="promo-tab"
        :class="{ active: isTabSelected(tab.id) }"
        @click="selectPromoTab(tab)"
      >
        {{ tab.label }}
        <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
      </button>
    </div>

    <!-- Activities Tab: Side categories + activity cards -->
    <template v-if="activeTab === 'activities'">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Carregando...</p>
      </div>

      <div v-else class="activity-layout">
        <!-- Side Categories -->
        <div class="side-categories">
          <button
            v-for="cat in activityCategories"
            :key="cat.id"
            class="side-cat"
            :class="{ active: sideValue === cat.id }"
            @click="sideValue = cat.id"
          >
            <img v-if="cat.icon" :src="cat.icon" class="side-cat-icon" alt="" />
            <span v-else class="side-cat-svg" v-html="cat.svg"></span>
            <span class="side-cat-label" :style="sideValue === cat.id ? 'color: var(--ep-color-text-selected)' : ''">{{ cat.label }}</span>
          </button>

          <!-- Claim & History buttons -->
          <button class="side-cat side-action shiny" @click="claimRebate" :disabled="rebateAvailable <= 0">
            <span class="side-cat-label">Resgatar</span>
          </button>
          <button class="side-cat side-action" @click="activeTab = 'history'">
            <span class="side-cat-label">Histórico</span>
          </button>
        </div>

        <!-- Activity Cards -->
        <div class="activity-content">
          <div v-if="filteredPromos.length" class="promo-list">
            <div
              v-for="(promo, i) in filteredPromos"
              :key="promo.id || i"
              class="promo-card"
              :style="{ background: `url(${promo.bannerUrl}) no-repeat`, backgroundSize: '100% auto', minHeight: '7.75rem' }"
              @click="onPromoClick(promo)"
            >
              <div class="promo-card-inner" :class="{ shiny: promo.hasRedPoint }">
                <div v-if="promo.title" class="promo-card-left">
                  <p class="promo-name">{{ promo.title }}</p>
                  <p v-for="(line, li) in promo.descLines" :key="li" class="promo-desc-line">{{ line }}</p>
                </div>
                <img v-if="promo.logoUrl" :src="promo.logoUrl" class="promo-card-logo" alt="" />
              </div>
              <div v-if="promo.hasRedPoint" class="red-dot"></div>
            </div>
          </div>
          <div v-else class="empty-state">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--ep-color-text-weakest)" stroke-width="1" opacity=".4"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p>Sem registros</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Rebate/Cashback Tab -->
    <template v-if="activeTab === 'rebate'">
      <div class="rebate-header">
        <div>
          <span class="rebate-label">Disponível Hoje:</span>
          <span class="rebate-value">{{ currency }} {{ fmt(rebateAvailable) }}</span>
        </div>
        <div v-if="rebateTomorrow > 0">
          <span class="rebate-label">Disponível Amanhã:</span>
          <span class="rebate-value">{{ currency }} {{ fmt(rebateTomorrow) }}</span>
        </div>
      </div>
      <div class="rebate-layout">
        <!-- Side tabs: game types -->
        <div class="side-categories rebate-side">
          <button
            v-for="gt in rebateGameTypes"
            :key="gt.id"
            class="side-cat"
            :class="{ active: rebateType === gt.id }"
            @click="rebateType = gt.id"
          >
            <svg v-if="gt.id === 'all'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
            <span class="side-cat-label" :style="rebateType === gt.id ? 'color: var(--ep-color-text-selected)' : ''">{{ gt.label }}</span>
          </button>
          <button class="side-cat side-action shiny" @click="claimRebate" :disabled="rebateAvailable <= 0">
            <span class="side-cat-label">Resgatar</span>
          </button>
          <button class="side-cat side-action" @click="activeTab = 'history'">
            <span class="side-cat-label">Histórico</span>
          </button>
        </div>

        <!-- Rebate items -->
        <div class="rebate-content">
          <div v-if="filteredRebateList.length" class="rebate-list">
            <div v-for="item in filteredRebateList" :key="item.platformId" class="rebate-item">
              <div class="rebate-item-top">
                <div class="rebate-item-left">
                  <img v-if="item.logo" :src="item.logo" class="rebate-platform-logo" alt="" />
                  <span v-else class="rebate-platform-initial">{{ (item.platformName || '?').charAt(0) }}</span>
                  <span class="rebate-label-sm">Apostas Válidas</span>
                  <span class="rebate-val">{{ currency }} {{ fmt(item.validBet) }}</span>
                </div>
                <div class="rebate-item-right">
                  <span class="rebate-label-sm">Taxa</span>
                  <span class="rebate-rate">{{ (item.rebateRate * 100).toFixed(2) }}%</span>
                </div>
              </div>
              <div class="rebate-progress-row">
                <div class="rebate-progress-bar">
                  <div class="rebate-progress-fill" :style="{ width: rebateProgress(item) + '%' }"></div>
                </div>
                <span class="rebate-progress-text">{{ rebateProgressText(item) }}</span>
              </div>
              <div class="rebate-item-bottom">
                <span class="rebate-label-sm">Resgatável</span>
                <span class="rebate-collectable">{{ currency }} {{ fmt(item.availableRebate) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>Sem dados de cashback.</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Claim History Tab -->
    <template v-if="activeTab === 'history'">
      <!-- Date Filter -->
      <div class="history-filter">
        <select v-model="historyDateFilter" class="history-select">
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
        </select>
        <select v-model="historyTypeFilter" class="history-select">
          <option value="all">Todos os Tipos</option>
          <option value="rebate">Cashback</option>
          <option value="reward">Recompensa</option>
          <option value="bonus">Bônus</option>
        </select>
      </div>
      <div v-if="claimRecords.length" class="records-list">
        <div v-for="item in claimRecords" :key="item.id" class="record-item">
          <div class="record-top">
            <span class="record-type">{{ item.activityName || 'Recompensa' }}</span>
            <span class="record-amount green">+{{ currency }} {{ fmt(item.awardCount) }}</span>
          </div>
          <div class="record-bottom">
            <span class="record-date">{{ item.time }}</span>
            <span class="record-source">{{ item.source || '' }}</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--ep-color-text-weakest)" stroke-width="1" opacity=".4"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <p>Nenhum registro de recompensa.</p>
      </div>
    </template>

    <!-- Pendente: bônus a coletar (lista virá da API) -->
    <template v-if="activeTab === 'pending'">
      <div class="pending-toolbar">
        <span class="pending-bonus-label">Bônus:</span>
        <span class="pending-bonus-val">{{ currency }} {{ fmt(pendingBonusCents) }}</span>
      </div>
      <div class="pending-table-head">
        <span>Tempo</span>
        <span>Nome do Evento</span>
        <span>Evento de Recompensa</span>
        <span>Fonte</span>
      </div>
      <div class="empty-state pending-empty">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--ep-color-text-weakest)" stroke-width="1" opacity=".4"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <p>Sem Registros</p>
      </div>
      <button type="button" class="pending-collect-all" :disabled="pendingBonusCents <= 0" @click="claimAllPending">
        Coletar Tudo
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSystemStore } from '../stores/system'
import { trpcQuery, trpcMutation } from '../utils/api'

const router = useRouter()
const route = useRoute()
const systemStore = useSystemStore()

const activeTab = ref('activities')
const sideValue = ref('all')
const isLoading = ref(true)
const promos = ref([])
const rebateAvailable = ref(0)
const rebateTomorrow = ref(0)
const rebateType = ref('all')
const rebateList = ref([])
const pendingBonusCents = ref(0)
const claimRecords = ref([])
const historyDateFilter = ref('30')
const historyTypeFilter = ref('all')

const currency = computed(() => systemStore.currency || 'R$')

const tabs = computed(() => [
  { id: 'activities', label: 'Eventos' },
  { id: 'rebate', label: 'Rebate' },
  { id: 'vip', label: 'VIP' },
  { id: 'redeem', label: 'Código de Resgate' },
  { id: 'history', label: 'Histórico' },
  { id: 'pending', label: 'Pendente' }
])

const categoryIcons = {
  all: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  Recharge: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
  SignIn: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><path d="M9 14l2 2 4-4"/></svg>',
  Agency: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
  VIP: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  Rebate: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M16 8l-8 8M8.5 8.5h.01M15.5 15.5h.01"/></svg>'
}

const activityCategories = computed(() => {
  const cats = [{ id: 'all', label: 'Todos', svg: categoryIcons.all }]
  const types = new Set()
  promos.value.forEach(p => { if (p.rawType) types.add(p.rawType) })
  types.forEach(t => {
    cats.push({
      id: t,
      label: typeLabels[t] || t,
      svg: categoryIcons[t] || categoryIcons.all
    })
  })
  return cats
})

const filteredPromos = computed(() => {
  if (sideValue.value === 'all') return promos.value
  return promos.value.filter(p => p.rawType === sideValue.value || p.category === sideValue.value)
})

const rebateGameTypes = computed(() => {
  const types = [{ id: 'all', label: 'Todos' }]
  const seen = new Set()
  rebateList.value.forEach(r => {
    if (r.gameType && !seen.has(r.gameType)) {
      seen.add(r.gameType)
      types.push({ id: r.gameType, label: r.gameType })
    }
  })
  return types
})

const filteredRebateList = computed(() => {
  if (rebateType.value === 'all') return rebateList.value
  return rebateList.value.filter(r => r.gameType === rebateType.value)
})

function rebateProgress(item) {
  if (!item.upgrade || item.upgrade <= 0) return 100
  return Math.min(100, (item.validBet / item.upgrade) * 100)
}

function rebateProgressText(item) {
  if (!item.upgrade || item.upgrade <= 0) return 'Máximo'
  return `${fmt(item.validBet)} / ${fmt(item.upgrade)}`
}

const gradients = [
  'linear-gradient(135deg, #4c1d95, #7c3aed)',
  'linear-gradient(135deg, #1e3a5f, #3b82f6)',
  'linear-gradient(135deg, #5b2145, #ec4899)',
  'linear-gradient(135deg, #1a4731, #22c55e)',
  'linear-gradient(135deg, #78350f, #f59e0b)',
  'linear-gradient(135deg, #7041F3, #9B6DFF)',
  'linear-gradient(135deg, #b71c1c, #e53935)',
  'linear-gradient(135deg, #004d40, #00796b)',
]

const typeLabels = {
  Agency: 'Convite', Recharge: 'Depósito', SignIn: 'Check-in',
  Rebate: 'Cashback', VIP: 'VIP', RedPacket: 'Envelope',
  LuckyWheel: 'Roleta', Custom: 'Evento',
  RechargeBonus: 'Bônus Depósito', ValidBet: 'Aposta Válida',
  MysteryReward: 'Mistério', CommissionReward: 'Comissão'
}

const fallbackPromos = [
  { id: 1, badge: 'Bônus', title: 'Bônus de Primeiro Depósito', description: 'Faça seu primeiro depósito e ganhe bônus!', bonus: 'Até R$ 99', bg: gradients[0], route: '/main/deposito', rawType: 'Recharge' },
  { id: 2, badge: 'Diário', title: 'Check-in Diário', description: 'Faça check-in todos os dias!', bonus: 'Diário', bg: gradients[1], rawType: 'SignIn' },
  { id: 3, badge: 'Cashback', title: 'Cashback Semanal', description: 'Até 10% de cashback.', bonus: 'Até 10%', bg: gradients[2], rawType: 'Rebate' },
  { id: 4, badge: 'Convite', title: 'Convide Amigos', description: 'Ganhe por cada amigo!', bonus: 'R$ 5', bg: gradients[3], route: '/spread', rawType: 'Agency' },
  { id: 5, badge: 'VIP', title: 'Recompensas VIP', description: 'Bônus exclusivos.', bonus: 'Exclusivo', bg: gradients[4], rawType: 'VIP' },
]

function fmt(val) {
  const num = Number(val) / 100
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Destino do card: rota SPA ou URL externa (admin /api/promocoes). */
function parsePromoDestination(rawUrl) {
  const u = String(rawUrl || '').trim()
  if (!u) return { href: null, isExternal: false }
  const lower = u.toLowerCase()
  if (lower.startsWith('javascript:') || lower.startsWith('data:')) return { href: null, isExternal: false }
  if (/^https?:\/\//i.test(u)) return { href: u, isExternal: true }
  if (u.startsWith('//')) return { href: `https:${u}`, isExternal: true }
  const path = u.startsWith('/') ? u : `/${u}`
  return { href: path, isExternal: false }
}

function mapPromo(item, index) {
  const type = item.type || item.category || 'Custom'
  const desc =
    item.previewText || item.description || item.descricao || ''
  const title = item.name || item.title || item.titulo || 'Promoção'
  const commissionRoute = '/main/promo?tab=rebate'
  const adminUrl = item.url || item.link || ''
  const dest = parsePromoDestination(adminUrl)

  let route = null
  let linkHref = null
  let linkIsExternal = false

  if (dest.href) {
    linkHref = dest.href
    linkIsExternal = dest.isExternal
  } else if (type === 'CommissionReward') {
    route = commissionRoute
  } else if (item.type) {
    route = `/activity/${item.type}/${item.id}`
  }

  return {
    id: item.id || index,
    badge: typeLabels[type] || type,
    title,
    description: desc,
    descLines: desc ? desc.split(/\r?\n/) : [],
    bonus: '',
    bannerUrl: item.bannerBackground || item.bannerUrl || '',
    logoUrl: item.bannerLogo || '',
    bg: gradients[index % gradients.length],
    route,
    linkHref,
    linkIsExternal,
    openInNewTab: item.openInNewTab !== false,
    rawType: type,
    category: type,
    hasRedPoint: false
  }
}

function onPromoClick(promo) {
  if (promo.linkHref) {
    if (promo.linkIsExternal) {
      if (promo.openInNewTab !== false) {
        window.open(promo.linkHref, '_blank', 'noopener,noreferrer')
      } else {
        window.location.href = promo.linkHref
      }
    } else {
      router.push(promo.linkHref)
    }
    return
  }
  if (promo.route) router.push(promo.route)
}

async function fetchPromos() {
  isLoading.value = true
  try {
    try {
      const data = await trpcQuery('activity.listPublic', null, { cache: true, cacheTTL: 120000 })
      if (data?.list?.length) {
        promos.value = data.list.map(mapPromo)
        return
      }
    } catch { /* usa API local */ }
    try {
      const res = await fetch('/api/promocoes')
      const list = await res.json()
      if (Array.isArray(list) && list.length) {
        promos.value = list.map(mapPromo)
        return
      }
    } catch { /* fallback */ }
    promos.value = fallbackPromos
  } finally {
    isLoading.value = false
  }
}

async function claimRebate() {
  if (rebateAvailable.value <= 0) return
  try {
    await trpcQuery('activity.claimRebate', {})
    rebateAvailable.value = 0
    await fetchRebateData()
  } catch {}
}

async function fetchRebateData() {
  try {
    const data = await trpcQuery('activity.rebateInfo', null, { cache: true, cacheTTL: 60000 })
    if (data) {
      rebateAvailable.value = data.availableAmount || 0
      rebateTomorrow.value = data.tomorrowAmount || data.nextDayAmount || 0
      rebateList.value = (data.gameRebateList || []).map((r, i) => {
        const rateRaw = r.rebateRate ?? r.rate ?? 0
        const rebateRate = rateRaw > 1 ? rateRaw / 100 : Number(rateRaw) || 0
        return {
          platformId: r.platformId ?? r.id ?? i,
          platformName: r.platformName || r.name || r.gameType || 'Provedor',
          logo: r.logo || r.logoUrl || '',
          gameType: r.gameType || r.gameTypeName || '',
          rebateRate,
          validBet: r.validBetAmount || r.validBet || 0,
          upgrade: r.upgradeAmount || r.upgrade || 0,
          availableRebate: r.availableRebateAmount || r.availableRebate || r.rebateAmount || 0
        }
      })
    }
  } catch {}
}

const validPromoTabs = ['activities', 'rebate', 'vip', 'redeem', 'history', 'pending']

function applyTabFromQuery() {
  const q = route.query.tab
  if (typeof q !== 'string') return
  if (q === 'vip') {
    router.replace({ path: '/activity/vip' })
    return
  }
  if (q === 'redeem') {
    router.replace({ path: '/Redeem' })
    return
  }
  if (validPromoTabs.includes(q)) {
    activeTab.value = q
  }
}

function selectPromoTab(tab) {
  if (tab.id === 'vip') {
    router.push('/activity/vip')
    return
  }
  if (tab.id === 'redeem') {
    router.push('/Redeem')
    return
  }
  activeTab.value = tab.id
}

function isTabSelected(id) {
  return activeTab.value === id
}

async function fetchPendingBonus() {
  try {
    const data = await trpcQuery('user.pendingRewardTotal', null, { cache: true, cacheTTL: 30000 })
    if (data != null) pendingBonusCents.value = Number(data.totalAmount || data.amount || 0)
  } catch {
    pendingBonusCents.value = 0
  }
}

async function claimAllPending() {
  if (pendingBonusCents.value <= 0) return
  try {
    await trpcMutation('user.claimAllPendingRewards', {})
    pendingBonusCents.value = 0
    await fetchPendingBonus()
  } catch {
    /* endpoint pode não existir ainda */
  }
}

async function fetchClaimHistory() {
  try {
    const data = await trpcQuery('user.rewardRecordList', { page: 1, pageSize: 30 })
    claimRecords.value = (data?.recordList || []).map(r => ({
      ...r,
      time: r.time ? new Date(r.time).toLocaleDateString('pt-BR') : '',
      activityName: r.activityName || 'Recompensa',
      source: r.activityType || ''
    }))
  } catch {
    claimRecords.value = []
  }
}

watch(activeTab, (tab) => {
  if (tab === 'history' && !claimRecords.value.length) fetchClaimHistory()
  if (tab === 'pending') fetchPendingBonus()
})

watch(
  () => route.query.tab,
  () => applyTabFromQuery()
)

onMounted(async () => {
  applyTabFromQuery()
  await fetchPromos()
  fetchRebateData()
  isLoading.value = false
})
</script>

<style scoped>
.promo-page {
  padding: 0 .75rem 1.5rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100%;
}

/* ── Top Tabs ── */
.promo-tabs {
  display: flex; gap: .25rem; margin-bottom: 1rem;
  overflow-x: auto; padding: .75rem 0;
  -webkit-overflow-scrolling: touch;
}
.promo-tabs::-webkit-scrollbar { display: none; }
.promo-tab {
  position: relative; white-space: nowrap;
  padding: .5rem .875rem; border-radius: 1.25rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  color: var(--ep-color-text-weak); font-size: .8125rem; font-weight: 600;
  border: 1px solid var(--ep-color-border-default); transition: all .2s;
  flex-shrink: 0;
}
.promo-tab.active {
  background: var(--gradient-primary);
  color: var(--ep-color-text-inverse, #0E1E3D);
  border-color: transparent;
}
.tab-badge {
  position: absolute; top: -4px; right: -4px;
  background: #F44336; color: #fff; font-size: .5rem; font-weight: 700;
  padding: 1px 4px; border-radius: .5rem; min-width: .75rem; text-align: center;
}

/* ── Loading / Empty ── */
.loading-state, .empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 3rem 1rem; gap: .5rem; color: var(--ep-color-text-weakest);
}
.loading-spinner {
  width: 1.5rem; height: 1.5rem;
  border: 2px solid var(--ep-color-border-default);
  border-top-color: var(--ep-color-text-selected);
  border-radius: 50%; animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Activity Layout: Side + Content ── */
.activity-layout {
  display: flex; gap: .625rem; min-height: 60vh;
}
.side-categories {
  width: 5.3125rem; display: flex; flex-direction: column;
  overflow-y: auto; flex-shrink: 0;
}
.side-cat {
  display: flex; flex-direction: column; align-items: center;
  padding: .625rem .25rem; gap: .25rem; cursor: pointer;
  border-radius: .5rem; transition: background .2s;
}
.side-cat.active { background: var(--ep-color-background-fill-surface-raised-L2); }
.side-cat-icon { width: 2.25rem; height: 2.25rem; object-fit: contain; }
.side-cat-svg { display: flex; align-items: center; justify-content: center; color: var(--ep-color-text-weakest); }
.side-cat.active .side-cat-svg { color: var(--ep-color-text-selected); }
.side-cat-label {
  font-size: .625rem; font-weight: 600;
  color: var(--ep-color-text-weakest); text-align: center;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 100%;
}
.side-action {
  margin-top: .25rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border: 1px solid var(--ep-color-border-default);
}
.side-action.shiny {
  background: var(--gradient-primary);
}
.side-action.shiny .side-cat-label { color: var(--ep-color-text-inverse, #0E1E3D); }
.side-action:disabled { opacity: .5; }

.activity-content { flex: 1; overflow-y: auto; }

/* ── Promo Cards ── */
.promo-list { display: flex; flex-direction: column; gap: .625rem; }
.promo-card {
  border-radius: .625rem; cursor: pointer; transition: transform .2s;
  position: relative; overflow: hidden;
}
.promo-card:active { transform: scale(.98); }
.promo-card-inner {
  display: flex; align-items: center; justify-content: space-between;
  padding: .75rem; min-height: 5rem;
}
.promo-card-left {
  color: #fff; flex: 1; padding-right: .5rem;
}
.promo-name {
  font-size: 1rem; font-weight: 700; color: #fff;
  margin-bottom: .375rem; line-height: 1.3;
}
.promo-desc-line {
  font-size: .75rem; color: rgba(255,255,255,.8); line-height: 1.4;
}
.promo-card-logo {
  width: 16rem; height: 5.33rem; object-fit: contain; margin-top: .625rem;
}
.red-dot {
  position: absolute; top: 0; right: 0;
  width: .875rem; height: .875rem; border-radius: 50%;
  background: #F44336; transform: translate(25%, -25%);
}

/* ── Rebate ── */
.rebate-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: .625rem 0; font-size: .75rem; gap: .5rem;
}
.rebate-label { color: var(--ep-color-text-default); }
.rebate-value { color: var(--ep-color-text-selected); font-weight: 700; }

.rebate-layout { display: flex; gap: .625rem; min-height: 50vh; }
.rebate-side { width: 5.3125rem; }
.rebate-content { flex: 1; overflow-y: auto; }
.rebate-list { display: flex; flex-direction: column; gap: .625rem; }
.rebate-item {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .625rem; padding: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.rebate-item-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: .5rem; }
.rebate-item-left { display: flex; align-items: center; gap: .5rem; }
.rebate-platform-logo { width: 2rem; height: 2rem; border-radius: .375rem; object-fit: contain; }
.rebate-platform-initial {
  width: 2rem; height: 2rem; border-radius: .375rem;
  background: var(--gradient-primary); color: #fff; font-weight: 800;
  display: flex; align-items: center; justify-content: center; font-size: .875rem;
}
.rebate-label-sm { font-size: .625rem; color: var(--ep-color-text-weakest); }
.rebate-val { font-size: .625rem; color: var(--ep-color-text-default); font-weight: 600; }
.rebate-item-right { text-align: right; }
.rebate-rate { font-size: .625rem; color: var(--ep-color-text-default); font-weight: 600; }
.rebate-progress-row { display: flex; align-items: center; gap: .5rem; margin-bottom: .375rem; }
.rebate-progress-bar {
  flex: 1; height: .625rem; border-radius: .3125rem; overflow: hidden;
  background: var(--ep-color-background-fill-surface-lowered);
}
.rebate-progress-fill {
  height: 100%; border-radius: .3125rem;
  background: var(--gradient-primary); transition: width .5s ease;
}
.rebate-progress-text { font-size: .5625rem; color: var(--ep-color-text-weakest); white-space: nowrap; }
.rebate-item-bottom { display: flex; justify-content: space-between; align-items: center; }
.rebate-collectable { font-size: .625rem; color: var(--ep-color-text-selected); font-weight: 700; }

/* ── Section Card (VIP/Redeem) ── */
.section-card {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: var(--ep-border-radius-surface-large, 1rem);
  padding: 1.25rem; border: 1px solid var(--ep-color-border-default);
}
.section-title { font-size: 1rem; font-weight: 700; color: var(--ep-color-text-default); }
.section-title.mb { margin-bottom: .75rem; }

.vip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: .75rem; }
.vip-level { font-size: 1.25rem; font-weight: 800; color: var(--color-currency, #FE963B); }
.vip-next { font-size: .75rem; color: var(--ep-color-text-weakest); }
.vip-progress-bar {
  height: .5rem; background: var(--ep-color-background-fill-surface-lowered);
  border-radius: .25rem; overflow: hidden; margin-bottom: .75rem;
}
.vip-progress-fill {
  height: 100%; background: var(--gradient-primary);
  border-radius: .25rem; transition: width .5s ease;
}
.vip-info-text { font-size: .75rem; color: var(--ep-color-text-weakest); margin-bottom: 1rem; }
.promo-btn {
  padding: .375rem 1rem; border-radius: 1.25rem;
  background: rgba(255,255,255,.2); color: #fff;
  font-size: .75rem; font-weight: 700;
  border: 1px solid rgba(255,255,255,.3);
}
.promo-btn.full {
  width: 100%; text-align: center; display: block;
  background: var(--gradient-primary);
  color: var(--ep-color-text-inverse, #0E1E3D);
  border: none; padding: .75rem;
}

/* ── Redeem ── */
.redeem-banner {
  text-align: center; margin-bottom: 1rem;
}
.redeem-form { display: flex; flex-direction: column; gap: .75rem; }
.redeem-input {
  width: 100%; padding: .75rem; border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--ep-color-background-fill-surface-lowered);
  color: var(--ep-color-text-default); font-size: .875rem;
  border: 1px solid var(--ep-color-border-default);
}
.claim-btn {
  width: 100%; padding: .75rem; border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--gradient-primary); color: var(--ep-color-text-inverse, #0E1E3D);
  font-size: .875rem; font-weight: 700;
}
.claim-btn:disabled { opacity: .5; }
.redeem-msg { font-size: .75rem; margin-top: .5rem; }
.redeem-msg.green { color: var(--ep-accent-green, #17C964); }
.redeem-msg.red { color: var(--ep-light-accent-color-red, #F5222D); }
.redeem-desc { font-size: .75rem; color: var(--ep-color-text-weakest); margin-top: 1.5rem; white-space: pre-wrap; }

/* ── History ── */
.history-filter {
  display: flex; gap: .5rem; margin-bottom: .75rem;
}
.history-select {
  flex: 1; padding: .5rem .625rem; border-radius: .5rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  color: var(--ep-color-text-default); font-size: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.records-list { display: flex; flex-direction: column; gap: .5rem; }
.record-item {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: var(--ep-border-radius-l, .5rem);
  padding: .75rem; border: 1px solid var(--ep-color-border-default);
}
.record-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: .25rem; }
.record-type { font-size: .8125rem; font-weight: 500; color: var(--ep-color-text-default); }
.record-amount { font-size: .875rem; font-weight: 700; }
.record-amount.green { color: var(--ep-accent-green, #17C964); }
.record-bottom { display: flex; justify-content: space-between; font-size: .6875rem; color: var(--ep-color-text-weakest); }

/* ── Pendente ── */
.pending-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.65rem;
}
.pending-bonus-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ep-color-text-weak);
}
.pending-bonus-val {
  font-size: 0.875rem;
  font-weight: 800;
  color: #fb923c;
}
.pending-table-head {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr 1fr 0.7fr;
  gap: 0.25rem;
  padding: 0.5rem 0.35rem;
  font-size: 0.58rem;
  font-weight: 700;
  color: var(--ep-color-text-weakest);
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: 0.35rem;
  border: 1px solid var(--ep-color-border-default);
  margin-bottom: 0.5rem;
}
.pending-empty {
  padding: 2rem 1rem;
}
.pending-collect-all {
  width: 100%;
  margin-top: 1rem;
  padding: 0.85rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(180deg, #9aad3f 0%, #6b7a2e 100%);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.2);
  cursor: pointer;
}
.pending-collect-all:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
