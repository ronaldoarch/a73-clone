<template>
  <div class="lw-page">
    <header class="lw-header">
      <button type="button" class="lw-icon-btn" aria-label="Voltar" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <h1 class="lw-title">{{ pageTitle }}</h1>
      <button type="button" class="lw-icon-btn" aria-label="Histórico" @click="showHistory = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </button>
    </header>

    <div v-if="loadError" class="lw-load-error">{{ loadError }}</div>

    <section v-if="configLoaded" class="lw-stats-card" aria-label="Estado da roleta">
      <p class="lw-spins-row">
        Giros Restantes:
        <strong class="lw-spins-num">{{ ticketCount }}</strong>
      </p>
      <button type="button" class="lw-invite-btn" @click="router.push('/main/indique-amigos')">
        <span class="lw-invite-text">Convide amigos para ajudar com saques</span>
        <span class="lw-invite-share" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </span>
      </button>
      <p v-if="auth.token && stateLoaded" class="lw-bonus-meta">
        Saldo bônus (roleta): <strong>R$ {{ formatMoney(bonusBalance) }}</strong>
        · mín. carteira R$ {{ formatMoney(minWithdraw) }}
      </p>
      <p v-else-if="!auth.token" class="lw-bonus-meta lw-bonus-meta--guest">Faça login para girar.</p>
      <p v-if="novosEligible" class="lw-novos">Próximo giro: bônus exclusivo de novo usuário.</p>
    </section>

    <div class="lw-stage" :class="{ 'lw-stage--busy': spinning }">
      <div class="lw-wheel-slot" :class="{ 'lw-wheel-slot--no-frame': !decorFrameOk }">
        <div v-if="!decorFrameOk" class="lw-pointer-fallback" aria-hidden="true" />
        <div class="lw-wheel-inner">
          <LuckyWheel
            v-if="wheelPrizes.length >= 2"
            :key="wheelKey"
            ref="luckyWheelRef"
            :width="`${wheelPx}px`"
            :height="`${wheelPx}px`"
            :prizes="luckyPrizes"
            :blocks="luckyBlocks"
            :buttons="luckyButtons"
            :default-config="luckyConfig"
            @start="onLuckyStart"
            @end="onLuckyEnd"
          />
          <div v-else class="lw-wheel-fallback">Carregando roleta…</div>
        </div>
        <img
          v-if="decorFrameOk"
          class="lw-frame"
          :src="ASSETS.border"
          alt=""
          width="360"
          height="420"
          decoding="async"
          @error="onFrameError"
        />
        <img
          v-if="decorFingerOk"
          class="lw-finger"
          :src="ASSETS.finger"
          alt=""
          decoding="async"
          @error="onFingerError"
        />
      </div>
    </div>

    <section
      v-if="configLoaded && stateLoaded"
      class="lw-withdraw-panel"
      aria-label="Saldo bônus da roleta e progresso para saque"
    >
      <template v-if="auth.token">
        <p class="lw-withdraw-balance">R$ {{ formatMoney(bonusBalance) }}</p>
        <div
          class="lw-withdraw-bar"
          role="progressbar"
          :aria-valuenow="Math.round(withdrawProgressPercent)"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`Progresso para o mínimo de saque: ${Math.round(withdrawProgressPercent)}%`"
        >
          <div class="lw-withdraw-bar-fill" :style="{ width: `${withdrawProgressPercent}%` }" />
        </div>
        <p v-if="remainingToWithdraw > 0" class="lw-withdraw-hint">
          Você ainda precisa <span class="lw-withdraw-accent">{{ formatMoney(remainingToWithdraw) }}</span> para fazer um saque
        </p>
        <p v-else class="lw-withdraw-hint lw-withdraw-hint--ok">
          Você atingiu o mínimo (R$ {{ formatMoney(minWithdraw) }}). O valor pode ser transferido à carteira conforme as regras do site.
        </p>
      </template>
      <template v-else>
        <p class="lw-withdraw-balance">R$ {{ formatMoney(0) }}</p>
        <div class="lw-withdraw-bar" role="presentation">
          <div class="lw-withdraw-bar-fill" style="width: 0%" />
        </div>
        <p class="lw-withdraw-hint">Faça login para girar e acumular bônus da roleta.</p>
      </template>
    </section>

    <section
      v-if="configLoaded && stateLoaded"
      class="lw-report-card"
      aria-label="Relatório e referência"
    >
      <div class="lw-report-tabs" role="tablist" aria-label="Abas do relatório">
        <button
          type="button"
          role="tab"
          class="lw-report-tab"
          :class="{ 'lw-report-tab--active': reportTab === 'relatorio' }"
          :aria-selected="reportTab === 'relatorio'"
          @click="reportTab = 'relatorio'"
        >
          Relatório
        </button>
        <button
          type="button"
          role="tab"
          class="lw-report-tab"
          :class="{ 'lw-report-tab--active': reportTab === 'referencia' }"
          :aria-selected="reportTab === 'referencia'"
          @click="reportTab = 'referencia'"
        >
          Minha Referência
        </button>
      </div>

      <div
        v-show="reportTab === 'relatorio'"
        class="lw-report-panel"
        role="tabpanel"
        aria-label="Relatório de atividades"
      >
        <div class="lw-report-thead">
          <span class="lw-report-th lw-report-th--id">ID</span>
          <span class="lw-report-th lw-report-th--desc">Descrição</span>
          <span class="lw-report-th lw-report-th--bonus">Bônus</span>
        </div>
        <div v-for="rec in recentWinsFeed" :key="rec.id" class="lw-report-row">
          <span class="lw-report-td lw-report-td--id">{{ rec.userMask }}</span>
          <span class="lw-report-td lw-report-td--desc">{{ rec.descricao }}</span>
          <span class="lw-report-td lw-report-td--bonus">{{ rec.bonus }}</span>
        </div>
        <p v-if="!liveFeedPrimed" class="lw-report-empty lw-report-empty--loading">Carregando ganhadores…</p>
        <p v-else-if="!recentWinsFeed.length" class="lw-report-empty">
          Ninguém ganhou ainda — seja o primeiro a girar!
        </p>
      </div>

      <div
        v-show="reportTab === 'referencia'"
        class="lw-report-panel lw-report-panel--ref"
        role="tabpanel"
        aria-label="Link de indicação"
      >
        <template v-if="auth.token">
          <p class="lw-ref-lead">Compartilhe seu link e ganhe quando amigos se cadastrarem.</p>
          <div class="lw-ref-link-box">
            <span class="lw-ref-url">{{ displayInviteLink }}</span>
          </div>
          <div class="lw-ref-actions">
            <button type="button" class="lw-ref-btn lw-ref-btn--primary" @click="copyInviteLink">Copiar link</button>
            <button type="button" class="lw-ref-btn lw-ref-btn--ghost" @click="router.push('/main/indique-amigos')">
              Ver página completa
            </button>
          </div>
          <div class="lw-ref-list-wrap">
            <h3 class="lw-ref-list-title">Quem entrou pelo seu link</h3>
            <p v-if="!referralsLoaded" class="lw-ref-list-hint">Carregando…</p>
            <template v-else>
              <p class="lw-ref-list-meta">
                Total: <strong>{{ myReferralsTotal }}</strong>
                <span v-if="myReferralsTotal > myReferrals.length" class="lw-ref-list-meta-note">
                  (mostrando os {{ myReferrals.length }} mais recentes)
                </span>
              </p>
              <ul v-if="myReferrals.length" class="lw-ref-list" role="list">
                <li v-for="refRow in myReferrals" :key="refRow.id" class="lw-ref-list-item">
                  <span class="lw-ref-list-account">{{ refRow.accountMask }}</span>
                  <span class="lw-ref-list-when">{{ formatRefRegisteredAt(refRow.registeredAt) }}</span>
                </li>
              </ul>
              <p v-else class="lw-ref-list-empty">Ninguém se cadastrou ainda pelo seu link. Compartilhe acima!</p>
            </template>
          </div>
        </template>
        <p v-else class="lw-report-empty">Faça login para ver sua referência e link de convite.</p>
      </div>
    </section>

    <section v-if="configLoaded" class="lw-event-rules" aria-labelledby="lw-event-rules-title">
      <div class="lw-event-rules-head">
        <span class="lw-event-rules-deco lw-event-rules-deco--left" aria-hidden="true">
          <span class="lw-event-rules-slash" />
          <span class="lw-event-rules-spark lw-event-rules-spark--a">✦</span>
        </span>
        <h2 id="lw-event-rules-title" class="lw-event-rules-title">Regras do evento</h2>
        <span class="lw-event-rules-deco lw-event-rules-deco--right" aria-hidden="true">
          <span class="lw-event-rules-slash lw-event-rules-slash--flip" />
          <span class="lw-event-rules-spark lw-event-rules-spark--b">✦</span>
        </span>
      </div>
      <ol class="lw-event-rules-list">
        <li v-for="(line, idx) in eventRuleItems" :key="idx" class="lw-event-rules-item">
          <span class="lw-event-rules-num">{{ idx + 1 }}.</span>
          <span class="lw-event-rules-text">{{ line }}</span>
        </li>
      </ol>
    </section>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showRewardModal" class="modal-overlay" @click.self="showRewardModal = false">
          <div class="reward-modal">
            <button type="button" class="modal-close" @click="showRewardModal = false">✕</button>
            <div class="reward-light" />
            <h3 class="reward-title">{{ currentPrize.amount > 0 ? 'Você ganhou!' : 'Obrigado!' }}</h3>
            <div v-if="currentPrize.amount > 0" class="gold-prize">
              <span class="gold-icon">🪙</span>
              <span class="gold-amount">R$ {{ formatMoney(currentPrize.amount) }}</span>
              <p class="prize-note">Crédito no saldo bônus da roleta (requisito mínimo para carteira).</p>
            </div>
            <div v-else class="gold-prize">
              <span class="gold-icon">🙂</span>
              <span class="thanks-text">Continue jogando para acumular bônus.</span>
            </div>
            <button type="button" class="confirm-btn" @click="confirmReward">OK</button>
          </div>
        </div>
      </Transition>

      <Transition name="modal-fade">
        <div v-if="showHistory" class="modal-overlay" @click.self="showHistory = false">
          <div class="history-modal">
            <button type="button" class="modal-close" @click="showHistory = false">✕</button>
            <h3>Histórico</h3>
            <div v-if="historyRecords.length" class="history-list">
              <div v-for="rec in historyRecords" :key="rec.id" class="history-item">
                <span>{{ rec.descricao }} — {{ rec.bonus }}</span>
                <span class="history-date">{{ rec.date }}</span>
              </div>
            </div>
            <div v-else class="empty-history">Nenhum registro ainda</div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { LuckyWheel } from '@lucky-canvas/vue'
import { useAuthStore } from '../../stores/auth'
import { useAgentStore } from '../../stores/agent'
import { toastError, toastSuccess } from '../../utils/toast'
import {
  fetchRoletaConfig,
  fetchRoletaState,
  fetchRoletaNovosStatus,
  fetchRoletaRecentWins,
  fetchRoletaMyReferrals,
  postRoletaSpin,
  postRoletaNovosSpin
} from '../../utils/roletaApi'

/**
 * PNGs em frontend/public/assets/luckwheel/ (cópia de assets.baixados/nova roleta).
 * Se faltarem, a página recua para texto nos setores, botão verde e ponteiro em CSS.
 */
const ASSETS = {
  border: '/assets/luckwheel/wheel-border-nF1pES_C.png?v=2',
  finger: '/assets/luckwheel/wheel-finger-Bsul25rm.png?v=2',
  startBtn: '/assets/luckwheel/wheel-start-btn-BXtKnCbU.png?v=2',
  range1: '/assets/luckwheel/wheel-bonus-range1-CpBsLw1k.png?v=2',
  fixed: '/assets/luckwheel/wheel-bonus-fixed-D8kk2OGg.png?v=2',
  range2: '/assets/luckwheel/wheel-bonus-range2-QLMgxWbv.png?v=2',
  noPrize: '/assets/luckwheel/wheel-no-prize-B0W52EXl.png?v=2',
  bonus: '/assets/luckwheel/wheel-bonus-bonus-DLpxLJ0B.png?v=2',
}

/** Cores dos 8 setores (sentido horário, alinhadas ao visual original). */
const SEGMENT_BG = [
  '#6b3fa0',
  '#2563eb',
  '#ea580c',
  '#dc2626',
  '#6b7280',
  '#7c3aed',
  '#16a34a',
  '#f59e0b',
]

const SEGMENT_ICONS = [
  ASSETS.range1,
  ASSETS.fixed,
  ASSETS.range2,
  ASSETS.range1,
  ASSETS.noPrize,
  ASSETS.bonus,
  ASSETS.range2,
  ASSETS.bonus,
]

const router = useRouter()
const auth = useAuthStore()
const agentStore = useAgentStore()
const { inviteLink } = storeToRefs(agentStore)

const reportTab = ref('relatorio')
const referenciaTabPrimed = ref(false)
const myReferrals = ref([])
const myReferralsTotal = ref(0)
const referralsLoaded = ref(false)

const luckyWheelRef = ref(null)
const pageTitle = ref('Ganhe R$ 100,00 grátis')
const spinning = ref(false)
const showRewardModal = ref(false)
const showHistory = ref(false)
const currentPrize = ref({ amount: 0 })
const configLoaded = ref(false)
const stateLoaded = ref(false)
const loadError = ref('')
const wheelPrizes = ref([])
const bonusBalance = ref(0)
const minWithdraw = ref(100)
const spinsRemaining = ref(0)
const novosEligible = ref(false)
const historyRecords = ref([])
/** Ganhos recentes de todos os usuários (atualizado por polling). */
const recentWinsFeed = ref([])
const recentWinsPollId = ref(null)
const liveFeedPrimed = ref(false)
const LIVE_FEED_POLL_MS = 4000
const wheelKey = ref(0)
/** Só mostra moldura/dedo PNG depois de confirmar que o ficheiro existe. */
const decorFrameOk = ref(false)
const decorFingerOk = ref(false)
/** Ícones nos setores só se os PNG existirem (senão o canvas mostrava imagens partidas). */
const segmentPngsOk = ref(false)
/** Textos das regras do evento (sincronizados com /api/roleta/config quando possível). */
const roletaRuleDailySpins = ref(1)
const roletaRuleBonusDays = ref(3)
const roletaRuleRollover = ref(0)

const wheelPx = 286

function onFrameError() {
  decorFrameOk.value = false
}

function onFingerError() {
  decorFingerOk.value = false
}

function probeImage(url) {
  return new Promise((resolve) => {
    const im = new Image()
    im.onload = () => resolve(true)
    im.onerror = () => resolve(false)
    im.src = url
  })
}

const eventRuleItems = computed(() => {
  const ds = Math.max(1, Number(roletaRuleDailySpins.value) || 1)
  const bd = Math.max(1, Number(roletaRuleBonusDays.value) || 3)
  const rv = Math.max(0, Number(roletaRuleRollover.value) || 0)
  const chanceWord = ds === 1 ? 'chance' : 'chances'
  return [
    `Você terá ${ds} ${chanceWord} de ganhar um prêmio todos os dias. Você pode retirar o prêmio quando o valor do prêmio atingir o valor da recompensa. Convide amigos para ter mais chances de ganhar um prêmio;`,
    `Cada atividade é válida por ${bd} dias. Você pode participar várias vezes. O prêmio em dinheiro será coletado automaticamente. Após o vencimento, o prêmio em dinheiro será inválido`,
    `O bônus da roleta (excluindo o principal) requer ${rv} vezes de apostas válidas para sacar;`,
    'Somente o proprietário da conta pode realizar operações manuais normais, caso contrário, o bônus será cancelado ou deduzido, congelado ou até mesmo colocado na lista negra;',
    'Para evitar diferenças na compreensão do texto, a plataforma se reserva o direito final de interpretação desta atividade.',
  ]
})

const ticketCount = computed(() => {
  let n = spinsRemaining.value
  if (novosEligible.value) n += 1
  return n
})

const withdrawProgressPercent = computed(() => {
  const min = Number(minWithdraw.value) || 100
  const bal = Number(bonusBalance.value) || 0
  if (min <= 0) return 0
  return Math.min(100, Math.round((bal / min) * 1000) / 10)
})

const remainingToWithdraw = computed(() => {
  const min = Number(minWithdraw.value) || 100
  const bal = Number(bonusBalance.value) || 0
  return Math.max(0, min - bal)
})

const displayInviteLink = computed(() => inviteLink.value || `${window.location.origin}/`)

function formatRefRegisteredAt(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

async function loadMyReferrals() {
  if (!auth.token) {
    myReferrals.value = []
    myReferralsTotal.value = 0
    referralsLoaded.value = true
    return
  }
  referralsLoaded.value = false
  try {
    const data = await fetchRoletaMyReferrals(auth.token)
    myReferrals.value = Array.isArray(data?.referrals) ? data.referrals : []
    myReferralsTotal.value = Number(data?.total) || myReferrals.value.length
  } catch {
    myReferrals.value = []
    myReferralsTotal.value = 0
  } finally {
    referralsLoaded.value = true
  }
}

async function refreshRecentWinsFeed() {
  try {
    const data = await fetchRoletaRecentWins(20)
    if (Array.isArray(data?.wins)) recentWinsFeed.value = data.wins
  } catch {
    /* mantém lista anterior em falha de rede */
  } finally {
    liveFeedPrimed.value = true
  }
}

async function ensureInviteLink() {
  if (!auth.token || referenciaTabPrimed.value) return
  referenciaTabPrimed.value = true
  try {
    await agentStore.fetchAgentInfo()
  } catch {
    referenciaTabPrimed.value = false
  }
}

function copyInviteLink() {
  const url = displayInviteLink.value
  navigator.clipboard.writeText(url).then(
    () => toastSuccess('Link copiado'),
    () => toastError('Não foi possível copiar')
  )
}

watch(reportTab, (t) => {
  if (t === 'referencia') {
    ensureInviteLink()
    loadMyReferrals()
  }
})

watch(
  () => auth.token,
  () => {
    referenciaTabPrimed.value = false
    myReferrals.value = []
    myReferralsTotal.value = 0
    referralsLoaded.value = false
    if (reportTab.value === 'referencia' && auth.token) {
      loadMyReferrals()
    } else if (!auth.token) {
      referralsLoaded.value = true
    }
  }
)

function formatMoney(v) {
  const n = Number(v) || 0
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function segmentLabel(seg) {
  const raw = String(seg?.label ?? '').trim()
  if (raw) {
    if (/^\?+$/.test(raw)) return raw
    if (/[\u{1F300}-\u{1FAFF}]/u.test(raw)) return raw
    return raw.replace(/^r\$\s*/i, '').trim() || raw
  }
  const val = Number(seg?.value)
  if (val > 0) return formatMoney(val).replace(/\s*R\$\s*/i, '').trim()
  return '…'
}

const luckyPrizes = computed(() =>
  wheelPrizes.value.map((seg, i) => {
    const base = {
      background: SEGMENT_BG[i % SEGMENT_BG.length],
      fonts: [
        {
          text: segmentLabel(seg),
          top: '14%',
          fontSize: '12px',
          fontColor: '#fff',
          fontWeight: '800',
          lineClamp: 1,
        },
      ],
    }
    if (!segmentPngsOk.value) return base
    return {
      ...base,
      imgs: [
        {
          src: SEGMENT_ICONS[i % SEGMENT_ICONS.length],
          width: '38%',
          top: '44%',
        },
      ],
    }
  })
)

const luckyBlocks = [{ padding: '5px', background: 'linear-gradient(145deg, #1e3a8a 0%, #2563eb 55%, #1d4ed8 100%)' }]

const useStartPng = ref(false)

const luckyButtons = computed(() => {
  const can = ticketCount.value > 0 && !spinning.value
  const green = can
    ? 'linear-gradient(180deg, #4ade80 0%, #16a34a 45%, #15803d 100%)'
    : 'linear-gradient(180deg, #9ca3af 0%, #6b7280 100%)'
  const btn = {
    radius: '26%',
    pointer: can,
    background: green,
    fonts: [
      {
        text: String(ticketCount.value),
        top: '-44px',
        fontSize: '20px',
        fontColor: '#ffffff',
        fontWeight: '800',
      },
    ],
  }
  if (useStartPng.value) {
    return [
      {
        ...btn,
        background: 'rgba(0,0,0,0.12)',
        imgs: [
          {
            src: ASSETS.startBtn,
            width: '118%',
            top: '-104%',
            left: '-9%',
          },
        ],
        fonts: [
          {
            text: String(ticketCount.value),
            top: '-84%',
            fontSize: '17px',
            fontColor: '#ffffff',
            fontWeight: '800',
          },
        ],
      },
    ]
  }
  return [btn]
})

const luckyConfig = {
  speed: 20,
  accelerationTime: 2500,
  decelerationTime: 2500,
  offsetDegree: 0,
}

async function loadConfig() {
  loadError.value = ''
  try {
    const cfg = await fetchRoletaConfig()
    const segs = Array.isArray(cfg.segments) ? cfg.segments : []
    wheelPrizes.value = segs.length >= 2 ? segs : defaultSegmentsFallback()
    roletaRuleDailySpins.value = Math.max(1, Number(cfg.dailySpins) || 1)
    roletaRuleBonusDays.value = Math.max(1, Number(cfg.bonusDays) || 3)
    roletaRuleRollover.value = Math.max(0, Number(cfg.bonusRolloverTimes) || 0)
    wheelKey.value++
    configLoaded.value = true
  } catch (e) {
    loadError.value = e.message || 'Erro ao carregar roleta'
    wheelPrizes.value = defaultSegmentsFallback()
    roletaRuleDailySpins.value = 1
    roletaRuleBonusDays.value = 3
    roletaRuleRollover.value = 0
    wheelKey.value++
    configLoaded.value = true
  }
}

function defaultSegmentsFallback() {
  return [
    { label: '30,00', value: 30 },
    { label: '100,00', value: 100 },
    { label: '50,00', value: 50 },
    { label: '???', value: 0 },
    { label: '😊', value: 0 },
    { label: '1.000,00', value: 1000 },
    { label: '????', value: 0 },
    { label: '??', value: 0 },
  ]
}

function mapHistory(report) {
  if (!Array.isArray(report)) return []
  return report.map((row) => {
    let date = ''
    if (row.createdAt) {
      try {
        date = new Date(row.createdAt).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      } catch {
        /* ignore */
      }
    }
    return {
      id: row.id,
      descricao: row.descricao || '',
      bonus: row.bonus || '',
      date,
    }
  })
}

async function loadUserState() {
  stateLoaded.value = false
  if (!auth.token) {
    spinsRemaining.value = 0
    novosEligible.value = false
    bonusBalance.value = 0
    historyRecords.value = []
    stateLoaded.value = true
    return
  }
  try {
    const [st, novos] = await Promise.all([fetchRoletaState(auth.token), fetchRoletaNovosStatus(auth.token)])
    if (st) {
      bonusBalance.value = st.bonusBalance ?? 0
      minWithdraw.value = st.minWithdraw ?? 100
      spinsRemaining.value = st.spinsRemaining ?? 0
      historyRecords.value = mapHistory(st.report)
    } else {
      bonusBalance.value = 0
      spinsRemaining.value = 0
      historyRecords.value = []
    }
    novosEligible.value = !!novos?.eligible
  } catch (e) {
    console.warn('[LuckyWheel] loadUserState:', e)
    toastError('Não foi possível atualizar seus giros.')
  } finally {
    stateLoaded.value = true
  }
}

async function onLuckyStart() {
  if (spinning.value || ticketCount.value <= 0) return
  if (!auth.token) {
    toastError('Faça login para girar.')
    router.push('/login')
    return
  }

  spinning.value = true

  let res
  try {
    if (novosEligible.value) res = await postRoletaNovosSpin(auth.token)
    else res = await postRoletaSpin(auth.token)
  } catch {
    spinning.value = false
    toastError('Falha de conexão. Tente de novo.')
    return
  }

  if (!res?.ok) {
    spinning.value = false
    toastError(res?.error || 'Não foi possível girar.')
    return
  }

  const n = wheelPrizes.value.length
  let idx = Number(res.prizeIndex)
  if (!Number.isFinite(idx) || idx < 0 || idx >= n) idx = 0

  currentPrize.value = { amount: Number(res.prize) || 0 }
  if (res.bonusBalance != null) bonusBalance.value = res.bonusBalance

  luckyWheelRef.value?.play()
  setTimeout(() => {
    luckyWheelRef.value?.stop(idx)
  }, 2800)
}

function onLuckyEnd() {
  spinning.value = false
  showRewardModal.value = true
  loadUserState()
  refreshRecentWinsFeed()
}

function confirmReward() {
  showRewardModal.value = false
}

watch(
  () => auth.token,
  () => {
    loadUserState()
  }
)

onMounted(async () => {
  await loadConfig()
  await loadUserState()
  const [borderOk, fingerOk, segOk, startOk] = await Promise.all([
    probeImage(ASSETS.border),
    probeImage(ASSETS.finger),
    probeImage(ASSETS.range1),
    probeImage(ASSETS.startBtn),
  ])
  decorFrameOk.value = borderOk
  decorFingerOk.value = fingerOk
  segmentPngsOk.value = segOk
  useStartPng.value = startOk
  wheelKey.value++
  refreshRecentWinsFeed()
  recentWinsPollId.value = window.setInterval(refreshRecentWinsFeed, LIVE_FEED_POLL_MS)
})

onBeforeUnmount(() => {
  if (recentWinsPollId.value != null) {
    clearInterval(recentWinsPollId.value)
    recentWinsPollId.value = null
  }
})
</script>

<style scoped>
.lw-page {
  min-height: 100vh;
  padding: 0 12px 28px;
  background: linear-gradient(180deg, #2e005c 0%, #1f0a3d 45%, #150828 100%);
  color: #fff;
}

.lw-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0 14px;
}

.lw-title {
  flex: 1;
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.25;
  text-align: center;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.lw-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
}

.lw-load-error {
  background: rgba(239, 68, 68, 0.18);
  color: #fecaca;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  margin-bottom: 12px;
}

.lw-stats-card {
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 14px 16px 12px;
  margin-bottom: 16px;
  backdrop-filter: blur(6px);
}

.lw-spins-row {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  color: rgba(255, 255, 255, 0.92);
}

.lw-spins-num {
  color: #fbbf24;
  font-size: 1.15em;
  margin-left: 4px;
}

.lw-invite-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 14px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #34d399 0%, #059669 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.45);
}

.lw-invite-btn:active {
  transform: scale(0.98);
}

.lw-invite-text {
  flex: 1;
  text-align: left;
  line-height: 1.35;
}

.lw-invite-share {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lw-bonus-meta {
  margin: 10px 0 0;
  font-size: 11px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.55);
  text-align: center;
}

.lw-bonus-meta strong {
  color: #fde68a;
}

.lw-bonus-meta--guest {
  margin-top: 8px;
}

.lw-novos {
  margin: 8px 0 0;
  font-size: 11px;
  color: #86efac;
  text-align: center;
}

.lw-stage {
  position: relative;
  display: flex;
  justify-content: center;
  margin: 0 auto 8px;
  max-width: 380px;
  overflow: visible;
}

.lw-wheel-slot {
  position: relative;
  width: 100%;
  max-width: 360px;
  overflow: visible;
}

/* Ponteiro dourado quando não há PNG da moldura (original traz seta no frame). */
.lw-pointer-fallback {
  position: absolute;
  left: 50%;
  top: 8%;
  z-index: 4;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 14px solid transparent;
  border-right: 14px solid transparent;
  border-top: 22px solid #d4a20c;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.45));
  pointer-events: none;
}

.lw-pointer-fallback::after {
  content: '';
  position: absolute;
  left: -10px;
  top: -26px;
  width: 20px;
  height: 20px;
  background: linear-gradient(145deg, #fde68a, #b45309);
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.lw-wheel-inner {
  position: absolute;
  left: 50%;
  top: 47%;
  transform: translate(-50%, -50%);
  width: 286px;
  height: 286px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lw-wheel-fallback {
  width: 286px;
  height: 286px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.45);
  font-size: 14px;
}

.lw-frame {
  position: relative;
  z-index: 2;
  width: 100%;
  height: auto;
  display: block;
  pointer-events: none;
  user-select: none;
  transform: translateY(-3.65rem) scale(1.09);
  transform-origin: 50% 44%;
}

.lw-finger {
  position: absolute;
  right: -2%;
  bottom: 18%;
  width: 22%;
  max-width: 72px;
  height: auto;
  z-index: 3;
  pointer-events: none;
  user-select: none;
  animation: lw-finger-nudge 1.6s ease-in-out infinite;
}

@keyframes lw-finger-nudge {
  0%,
  100% {
    transform: translate(0, 0) rotate(-6deg);
  }
  50% {
    transform: translate(-4px, 3px) rotate(-2deg);
  }
}

.lw-stage--busy .lw-finger {
  animation: none;
  opacity: 0.65;
}

.lw-withdraw-panel {
  margin: 14px auto 0;
  max-width: 380px;
  padding: 16px 18px 14px;
  border-radius: 14px;
  text-align: center;
  background: linear-gradient(180deg, rgba(55, 32, 92, 0.96) 0%, rgba(38, 22, 72, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.lw-withdraw-balance {
  margin: 0 0 12px;
  font-size: 1.65rem;
  font-weight: 800;
  line-height: 1.2;
  color: #4ade80;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.lw-withdraw-bar {
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  overflow: hidden;
  margin: 0 0 12px;
}

.lw-withdraw-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #22c55e 0%, #4ade80 100%);
  transition: width 0.35s ease;
}

.lw-withdraw-hint {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.82);
}

.lw-withdraw-accent {
  color: #fb923c;
  font-weight: 700;
}

.lw-withdraw-hint--ok {
  color: rgba(255, 255, 255, 0.88);
}

.lw-report-card {
  margin: 14px auto 0;
  max-width: 380px;
  padding: 12px 12px 14px;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(72, 48, 118, 0.92) 0%, rgba(48, 30, 88, 0.96) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22);
}

.lw-report-tabs {
  display: flex;
  gap: 0;
  padding: 4px;
  margin-bottom: 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
}

.lw-report-tab {
  flex: 1;
  margin: 0;
  padding: 10px 8px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.45);
  background: transparent;
  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.lw-report-tab--active {
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
}

.lw-report-panel {
  min-height: 120px;
}

.lw-report-thead {
  display: grid;
  grid-template-columns: 0.85fr 1.35fr 1fr;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  margin-bottom: 4px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.22);
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
  text-transform: none;
}

.lw-report-th--id {
  text-align: left;
}

.lw-report-th--desc {
  text-align: center;
}

.lw-report-th--bonus {
  text-align: right;
}

.lw-report-row {
  display: grid;
  grid-template-columns: 0.85fr 1.35fr 1fr;
  gap: 8px;
  align-items: center;
  padding: 10px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 12px;
}

.lw-report-row:last-of-type {
  border-bottom: none;
}

.lw-report-td--id {
  color: #fff;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: left;
}

.lw-report-td--desc {
  color: #fff;
  line-height: 1.35;
  word-break: break-word;
  text-align: center;
}

.lw-report-td--bonus {
  color: #4ade80;
  font-weight: 700;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.lw-report-empty {
  margin: 20px 10px;
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.45;
}

.lw-report-empty--loading {
  color: rgba(255, 255, 255, 0.35);
}

.lw-report-panel--ref .lw-ref-lead {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.78);
  text-align: center;
}

.lw-ref-link-box {
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 12px;
  word-break: break-all;
}

.lw-ref-url {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
}

.lw-ref-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lw-ref-btn {
  width: 100%;
  padding: 11px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}

.lw-ref-btn--primary {
  background: linear-gradient(180deg, #34d399 0%, #059669 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);
}

.lw-ref-btn--ghost {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.lw-ref-list-wrap {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.lw-ref-list-title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
  text-align: center;
}

.lw-ref-list-hint,
.lw-ref-list-meta,
.lw-ref-list-empty {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.lw-ref-list-meta {
  color: rgba(255, 255, 255, 0.65);
}

.lw-ref-list-meta strong {
  color: #fde68a;
}

.lw-ref-list-meta-note {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.lw-ref-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 220px;
  overflow-y: auto;
}

.lw-ref-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 12px;
}

.lw-ref-list-item:last-child {
  border-bottom: none;
}

.lw-ref-list-account {
  font-weight: 700;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.lw-ref-list-when {
  flex-shrink: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
}

.lw-event-rules {
  margin-top: 20px;
  padding: 18px 16px 20px;
  border-radius: 16px;
  background: rgba(12, 6, 28, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.lw-event-rules-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 18px;
}

.lw-event-rules-title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #fff;
  text-align: center;
  letter-spacing: 0.02em;
}

.lw-event-rules-deco {
  position: relative;
  display: flex;
  align-items: center;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
}

.lw-event-rules-slash {
  display: block;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    -52deg,
    #f0abfc 0px,
    #f0abfc 2px,
    #e9d5ff 2px,
    #e9d5ff 4px,
    rgba(167, 139, 250, 0.5) 4px,
    rgba(167, 139, 250, 0.5) 6px,
    transparent 6px,
    transparent 9px
  );
  border-radius: 3px;
  opacity: 0.9;
  box-shadow: 0 0 10px rgba(232, 121, 249, 0.25);
}

.lw-event-rules-slash--flip {
  transform: scaleX(-1);
}

.lw-event-rules-spark {
  position: absolute;
  font-size: 8px;
  line-height: 1;
  color: #fde047;
  text-shadow: 0 0 6px rgba(250, 204, 21, 0.7);
  pointer-events: none;
}

.lw-event-rules-spark--a {
  top: -2px;
  right: -4px;
}

.lw-event-rules-spark--b {
  top: -2px;
  left: -4px;
}

.lw-event-rules-deco--right .lw-event-rules-spark--b {
  left: auto;
  right: -4px;
}

.lw-event-rules-list {
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: lw-rule;
}

.lw-event-rules-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 14px;
  font-size: 12px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.72);
  text-align: left;
}

.lw-event-rules-item:last-child {
  margin-bottom: 0;
}

.lw-event-rules-num {
  flex-shrink: 0;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.88);
  min-width: 1.1em;
}

.lw-event-rules-text {
  flex: 1;
  min-width: 0;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10010;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
  cursor: pointer;
}

.reward-modal {
  position: relative;
  background: linear-gradient(180deg, #2d1b69, #1a0533);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  min-width: 280px;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.reward-light {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%);
  z-index: -1;
}

.reward-title {
  font-size: 18px;
  font-weight: 700;
  color: #fbbf24;
  margin-bottom: 16px;
}

.gold-prize {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.gold-icon {
  font-size: 64px;
}

.gold-amount {
  font-size: 24px;
  font-weight: 800;
  color: #fbbf24;
}

.thanks-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
}

.prize-note {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  max-width: 240px;
  line-height: 1.4;
  margin: 0;
}

.confirm-btn {
  padding: 12px 40px;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 700;
  background: linear-gradient(135deg, #a855f7, #7c3aed);
  color: #fff;
  border: none;
  cursor: pointer;
  width: 100%;
}

.history-modal {
  position: relative;
  background: linear-gradient(180deg, #2d1b69, #1a0533);
  border-radius: 20px;
  padding: 24px;
  min-width: 300px;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.history-modal h3 {
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  font-size: 13px;
  color: #fff;
}

.history-date {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.empty-history {
  text-align: center;
  padding: 30px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
