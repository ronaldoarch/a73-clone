<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="rel-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="$router.back()">
            <ion-icon name="chevron-back" />
          </ion-button>
        </ion-buttons>
        <ion-title>Relatórios</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="rel-content">
      <div class="rel-tabs">
        <button
          type="button"
          class="rel-tab"
          :class="{ active: tabAtivo === 'detalhes' }"
          @click="tabAtivo = 'detalhes'"
        >
          Transações
        </button>
        <button
          type="button"
          class="rel-tab"
          :class="{ active: tabAtivo === 'recordes' }"
          @click="tabAtivo = 'recordes'"
        >
          Jogos
        </button>
        <button
          type="button"
          class="rel-tab"
          :class="{ active: tabAtivo === 'esportiva' }"
          @click="tabAtivo = 'esportiva'"
        >
          Esportiva
        </button>
      </div>

      <div class="rel-filters">
        <button type="button" class="rel-filter-btn" @click="toggleFiltro('periodo')">
          {{ filtroPeriodo }}
          <ion-icon :name="abertoPeriodo ? 'chevron-up' : 'chevron-down'" />
        </button>
        <button
          v-if="tabAtivo === 'detalhes'"
          type="button"
          class="rel-filter-btn"
          :class="{ active: abertoTipos }"
          @click="toggleFiltro('tipos')"
        >
          {{ filtroTipo }}
          <ion-icon :name="abertoTipos ? 'chevron-up' : 'chevron-down'" />
        </button>
      </div>

      <div v-if="abertoPeriodo" class="rel-tipos-grid rel-period-grid">
        <button
          v-for="p in periodos"
          :key="p"
          type="button"
          class="rel-tipo-btn"
          :class="{ active: filtroPeriodo === p }"
          @click="selecionarPeriodo(p)"
        >
          {{ p }}
        </button>
      </div>

      <div v-if="tabAtivo === 'detalhes' && abertoTipos" class="rel-tipos-grid">
        <button
          v-for="t in tiposDetalhes"
          :key="t"
          type="button"
          class="rel-tipo-btn"
          :class="{ active: filtroTipo === t }"
          @click="selecionarTipo(t)"
        >
          {{ t }}
        </button>
      </div>

      <div v-if="!token" class="rel-body">
        <div class="rel-empty">
          <p class="rel-empty-text">Faça login para ver seus relatórios.</p>
        </div>
      </div>

      <div v-else class="rel-body">
        <div v-if="loading" class="rel-loading">Carregando…</div>
        <template v-else>
          <!-- Transações: depósitos + saques -->
          <div v-if="tabAtivo === 'detalhes'">
            <div v-if="transacoesMerged.length === 0" class="rel-empty">
              <div class="rel-empty-icon">📄</div>
              <p class="rel-empty-text">Sem registros neste período</p>
            </div>
            <ul v-else class="rel-list">
              <li v-for="row in transacoesMerged" :key="row.kind + row.id" class="rel-row">
                <div class="rel-row-main">
                  <span class="rel-badge" :class="row.kind === 'dep' ? 'rel-badge-dep' : 'rel-badge-saque'">
                    {{ row.kind === 'dep' ? 'Depósito' : 'Saque' }}
                  </span>
                  <span class="rel-date">{{ formatDateTime(row.createdAt) }}</span>
                </div>
                <div class="rel-row-values">
                  <span class="rel-amount" :class="row.kind === 'dep' ? 'verde' : 'vermelho'">
                    {{ row.kind === 'dep' ? '+' : '−' }} R$ {{ formatMoney(row.valor) }}
                  </span>
                  <span class="rel-status">{{ statusLabel(row) }}</span>
                </div>
              </li>
            </ul>
          </div>

          <!-- Jogos (todas as apostas registradas) -->
          <div v-else-if="tabAtivo === 'recordes'">
            <div v-if="jogosFiltrados.length === 0" class="rel-empty">
              <div class="rel-empty-icon">🎮</div>
              <p class="rel-empty-text">Sem apostas registradas neste período</p>
            </div>
            <ul v-else class="rel-list">
              <li v-for="j in jogosFiltrados" :key="j.id" class="rel-row rel-row-game">
                <div class="rel-row-main">
                  <span class="rel-game-title">{{ gameTitle(j) }}</span>
                  <span class="rel-date">{{ formatDateTime(j.createdAt) }}</span>
                </div>
                <div class="rel-game-meta">
                  Aposta R$ {{ formatMoney(j.betReais) }} · Retorno R$ {{ formatMoney(j.winReais) }}
                  <span class="rel-delta" :class="j.delta >= 0 ? 'verde' : 'vermelho'">
                    ({{ j.delta >= 0 ? '+' : '' }}{{ formatMoney(j.delta) }})
                  </span>
                </div>
                <div class="rel-game-sub">{{ txnTypeLabel(j.txnType) }}</div>
              </li>
            </ul>
          </div>

          <!-- Filtro esportiva -->
          <div v-else>
            <div v-if="jogosEsportiva.length === 0" class="rel-empty">
              <div class="rel-empty-icon">⚽</div>
              <p class="rel-empty-text">Sem apostas esportivas neste período</p>
            </div>
            <ul v-else class="rel-list">
              <li v-for="j in jogosEsportiva" :key="j.id" class="rel-row rel-row-game">
                <div class="rel-row-main">
                  <span class="rel-game-title">{{ gameTitle(j) }}</span>
                  <span class="rel-date">{{ formatDateTime(j.createdAt) }}</span>
                </div>
                <div class="rel-game-meta">
                  Aposta R$ {{ formatMoney(j.betReais) }} · Retorno R$ {{ formatMoney(j.winReais) }}
                  <span class="rel-delta" :class="j.delta >= 0 ? 'verde' : 'vermelho'">
                    ({{ j.delta >= 0 ? '+' : '' }}{{ formatMoney(j.delta) }})
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </template>
      </div>

      <div class="rel-footer">
        <template v-if="tabAtivo === 'detalhes'">
          <div class="rel-footer-item">
            <span>Depósitos (período):</span>
            <span class="rel-valor verde">R$ {{ formatMoney(somaDepositosPeriodo) }}</span>
          </div>
          <div class="rel-footer-item">
            <span>Saques (período):</span>
            <span class="rel-valor vermelho">R$ {{ formatMoney(somaSaquesPeriodo) }}</span>
          </div>
          <div class="rel-footer-item">
            <span>Total bônus / comissão (conta):</span>
            <span class="rel-valor laranja">{{ totalBonus }}</span>
          </div>
        </template>
        <template v-else>
          <div class="rel-footer-item">
            <span>Apostado (período):</span>
            <span class="rel-valor">{{ formatMoney(somaApostadoPeriodo) }}</span>
          </div>
          <div class="rel-footer-item">
            <span>Retorno (período):</span>
            <span class="rel-valor laranja">{{ formatMoney(somaRetornoPeriodo) }}</span>
          </div>
          <div class="rel-footer-item">
            <span>Ganho / perda (período):</span>
            <span class="rel-valor laranja" :class="{ verde: somaDeltaPeriodo > 0, vermelho: somaDeltaPeriodo < 0 }">
              {{ somaDeltaPeriodo >= 0 ? '+' : '' }}R$ {{ formatMoney(somaDeltaPeriodo) }}
            </span>
          </div>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons,
  onIonViewWillEnter
} from '@ionic/vue'
import { useAfiliado } from '@/composables/useAfiliado'
import { afiliadoApi } from '@/api/afiliado'

const { comissaoRecebida, refresh, fmt } = useAfiliado()

const token = ref(typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)
const loading = ref(false)
const depositos = ref([])
const saques = ref([])
const jogos = ref([])

const tabAtivo = ref('detalhes')
const filtroPeriodo = ref('Últimos 30 dias')
const filtroTipo = ref('Todos Tipos')
const abertoPeriodo = ref(false)
const abertoTipos = ref(false)

const periodos = ['Hoje', 'Ontem', 'Últimos 7 dias', 'Últimos 30 dias', 'Todos os períodos']

const tiposDetalhes = ['Todos Tipos', 'Depósito de Membro', 'Saque']

const totalBonus = computed(() => fmt(comissaoRecebida.value ?? 0))

function inPeriod(iso) {
  if (!iso) return false
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return false
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  if (filtroPeriodo.value === 'Todos os períodos') return true
  if (filtroPeriodo.value === 'Hoje') return t >= startToday
  if (filtroPeriodo.value === 'Ontem') {
    const start = startToday - 86400000
    const end = startToday - 1
    return t >= start && t <= end
  }
  if (filtroPeriodo.value === 'Últimos 7 dias') return t >= now.getTime() - 7 * 86400000
  if (filtroPeriodo.value === 'Últimos 30 dias') return t >= now.getTime() - 30 * 86400000
  return true
}

const transacoesMerged = computed(() => {
  const d = depositos.value.map((x) => ({ kind: 'dep', ...x }))
  const s = saques.value.map((x) => ({ kind: 'saque', ...x }))
  let list = [...d, ...s].filter((x) => inPeriod(x.createdAt))
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  if (filtroTipo.value === 'Depósito de Membro') list = list.filter((x) => x.kind === 'dep')
  else if (filtroTipo.value === 'Saque') list = list.filter((x) => x.kind === 'saque')
  return list
})

const jogosFiltrados = computed(() => jogos.value.filter((x) => inPeriod(x.createdAt)))

const jogosEsportiva = computed(() =>
  jogosFiltrados.value.filter((x) => {
    const g = String(x.gameType || '').toLowerCase()
    return g === 'sport' || g === 'sports' || g === 'esportiva' || g === 'esporte'
  })
)

function jogoListAtivo() {
  return tabAtivo.value === 'recordes' ? jogosFiltrados.value : jogosEsportiva.value
}

const somaDepositosPeriodo = computed(() =>
  transacoesMerged.value.filter((x) => x.kind === 'dep' && x.status === 'concluido').reduce((a, x) => a + (Number(x.valor) || 0), 0)
)

const somaSaquesPeriodo = computed(() =>
  transacoesMerged.value.filter((x) => x.kind === 'saque' && x.status === 'concluido').reduce((a, x) => a + (Number(x.valor) || 0), 0)
)

const somaApostadoPeriodo = computed(() => jogoListAtivo().reduce((a, x) => a + (Number(x.betReais) || 0), 0))
const somaRetornoPeriodo = computed(() => jogoListAtivo().reduce((a, x) => a + (Number(x.winReais) || 0), 0))
const somaDeltaPeriodo = computed(() => jogoListAtivo().reduce((a, x) => a + (Number(x.delta) || 0), 0))

function formatMoney(v) {
  const n = Number(v) || 0
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function statusLabel(row) {
  if (row.kind === 'dep') {
    const m = {
      concluido: 'Concluído',
      pendente: 'Pendente',
      processando: 'Processando',
      expirado: 'Expirado',
      erro: 'Erro',
      estornado: 'Estornado',
      reembolsando: 'Reembolsando'
    }
    return m[row.status] || row.status || '—'
  }
  const m = {
    concluido: 'Concluído',
    pendente: 'Pendente',
    processando: 'Processando',
    recusado: 'Recusado'
  }
  return m[row.status] || row.status || '—'
}

function gameTitle(j) {
  const p = j.provider || 'Jogo'
  const c = j.gameCode || ''
  const gt = j.gameType || ''
  return [gt, p, c].filter(Boolean).join(' · ') || 'Aposta'
}

function txnTypeLabel(t) {
  if (t === 'debit') return 'Aposta'
  if (t === 'credit') return 'Crédito'
  return 'Aposta / resultado'
}

function toggleFiltro(qual) {
  abertoPeriodo.value = qual === 'periodo' ? !abertoPeriodo.value : false
  abertoTipos.value = qual === 'tipos' ? !abertoTipos.value : false
}

function selecionarPeriodo(p) {
  filtroPeriodo.value = p
  abertoPeriodo.value = false
}

function selecionarTipo(t) {
  filtroTipo.value = t
  abertoTipos.value = false
}

async function loadRelatorios() {
  token.value = localStorage.getItem('token')
  if (!token.value) {
    depositos.value = []
    saques.value = []
    jogos.value = []
    return
  }
  loading.value = true
  try {
    const data = await afiliadoApi.getRelatorios(280)
    depositos.value = Array.isArray(data?.depositos) ? data.depositos : []
    saques.value = Array.isArray(data?.saques) ? data.saques : []
    jogos.value = Array.isArray(data?.jogos) ? data.jogos : []
  } catch {
    depositos.value = []
    saques.value = []
    jogos.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (localStorage.getItem('token')) refresh()
  loadRelatorios()
})
onIonViewWillEnter(() => {
  token.value = localStorage.getItem('token')
  if (token.value) refresh()
  loadRelatorios()
})
</script>

<style scoped>
.rel-toolbar {
  --background: #2d1f4e;
  --color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.rel-toolbar ion-button {
  --color: #fff;
}
.rel-content {
  --background: #2d1f4e;
}
.rel-tabs {
  display: flex;
  background: #3d2f5c;
  padding: 0 8px;
  overflow-x: auto;
}
.rel-tab {
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  color: #fff;
  font-size: 0.8rem;
  padding: 12px 6px;
  cursor: pointer;
  position: relative;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
}
.rel-tab.active {
  color: #fbbf24;
  border-bottom-color: #fbbf24;
}
.rel-filters {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  flex-wrap: wrap;
}
.rel-filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #3d2f5c;
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
}
.rel-filter-btn.active {
  background: #5e2b87;
  color: #fbbf24;
}
.rel-filter-btn ion-icon {
  font-size: 0.9rem;
}
.rel-tipos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 0 16px 16px;
}
.rel-period-grid {
  grid-template-columns: 1fr;
}
@media (min-width: 400px) {
  .rel-period-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.rel-tipo-btn {
  background: #3d2f5c;
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
}
.rel-tipo-btn.active {
  background: #5e2b87;
  color: #fbbf24;
}
.rel-body {
  padding: 12px 16px 20px;
  min-height: 160px;
}
.rel-loading {
  color: #9ca3af;
  text-align: center;
  padding: 24px;
}
.rel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
.rel-empty-icon {
  font-size: 3rem;
  opacity: 0.5;
  margin-bottom: 12px;
}
.rel-empty-text {
  color: #9ca3af;
  font-size: 1rem;
  margin: 0;
  text-align: center;
}
.rel-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.rel-row {
  background: #3d2f5c;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 10px;
  color: #fff;
}
.rel-row-main {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.rel-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
}
.rel-badge-dep {
  background: rgba(34, 197, 94, 0.25);
  color: #4ade80;
}
.rel-badge-saque {
  background: rgba(239, 68, 68, 0.25);
  color: #f87171;
}
.rel-date {
  font-size: 0.8rem;
  color: #9ca3af;
}
.rel-row-values {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.rel-amount {
  font-weight: 700;
  font-size: 1rem;
}
.rel-amount.verde {
  color: #4ade80;
}
.rel-amount.vermelho {
  color: #f87171;
}
.rel-status {
  font-size: 0.8rem;
  color: #d1d5db;
}
.rel-row-game .rel-game-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: #e5e7eb;
  word-break: break-word;
}
.rel-game-meta {
  font-size: 0.82rem;
  color: #9ca3af;
  margin-top: 4px;
}
.rel-delta {
  font-weight: 600;
  margin-left: 4px;
}
.rel-delta.verde {
  color: #4ade80;
}
.rel-delta.vermelho {
  color: #f87171;
}
.rel-game-sub {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 4px;
}
.rel-footer {
  padding: 20px 16px 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.rel-footer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: #fff;
  font-size: 0.85rem;
}
.rel-footer-item:last-child {
  margin-bottom: 0;
}
.rel-valor {
  font-weight: 700;
}
.rel-valor.verde {
  color: #22c55e;
}
.rel-valor.vermelho {
  color: #ef4444;
}
.rel-valor.laranja {
  color: #f59e0b;
}
</style>
