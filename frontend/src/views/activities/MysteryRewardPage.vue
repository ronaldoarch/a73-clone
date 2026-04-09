<template>
  <div class="mystery-page">
    <div class="mystery-bg" aria-hidden="true" />

    <!-- Coluna principal: hero azul + painel (um bloco contínuo) -->
    <div class="mystery-primary-stack">
    <section class="mystery-hero mystery-hero--in-stack" aria-labelledby="mystery-hero-title">
      <div class="mystery-hero-stripes" aria-hidden="true" />
      <div class="mystery-hero-mesh" aria-hidden="true" />
      <div class="mystery-hero-inner">
        <div class="mystery-hero-top">
          <button
            type="button"
            class="mystery-hero-back"
            aria-label="Voltar"
            @click="$router.back()"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="mystery-hero-pill-wrap">
            <span class="mystery-hero-pill">Recompensa Quíntupla</span>
          </div>
          <div class="mystery-hero-top-spacer" aria-hidden="true" />
        </div>
        <h1 id="mystery-hero-title" class="mystery-hero-title">Prêmio Misterioso</h1>
        <div class="mystery-prize-row">
          <div class="mystery-prize-box">
            <div class="mystery-prize-texture" aria-hidden="true" />
            <span class="mystery-prize-value">{{ headlinePrize }}</span>
          </div>
          <div class="mystery-prize-visual">
            <img
              class="mystery-prize-base"
              src="/assets/mystery/circle-bot.png"
              alt=""
            />
            <button
              type="button"
              class="mystery-prize-pill-wrap"
              :disabled="headlineClaimDisabled"
              aria-label="Reclamar prêmio principal"
              @click="onHeadlineClaimClick"
            >
              <img
                class="mystery-prize-pill-cap"
                src="/assets/mystery/btn-disable.png"
                alt=""
              />
              <span class="mystery-prize-pill-label">Reclamar</span>
            </button>
            <img
              class="mystery-prize-chest"
              src="/assets/mystery/b1-DeKMEZ1m.png"
              alt=""
            />
            <img
              class="mystery-prize-ring"
              src="/assets/mystery/circle-D3GNftO2.png"
              alt=""
            />
          </div>
        </div>
      </div>
    </section>

    <div class="mystery-track-panel mystery-track-panel--in-stack">
      <div class="mystery-substrip mystery-substrip--in-panel">
        <p class="mystery-substrip-text">Caixas misteriosas — abra para revelar prêmios. Seu tier:</p>
        <span class="tier-badge" :class="currentTierClass">{{ currentTier }}</span>
      </div>

      <div v-if="!rulesState.participationAt" class="mystery-join-bar">
        <p class="mystery-join-bar-text">Inscreva-se para participar. Depois, cumpra depósito em 2 dias e aposta válida (ver regras abaixo).</p>
        <button type="button" class="mystery-join-btn" @click="onJoinEvent">Participar do evento</button>
      </div>
      <div v-else class="mystery-rules-status" aria-live="polite">
        <span class="mystery-rules-pill" :class="{ 'mystery-rules-pill--ok': depositOk }">Depósito 2 dias</span>
        <span class="mystery-rules-pill" :class="{ 'mystery-rules-pill--ok': validBetOk }">Aposta válida</span>
        <button
          v-if="activityId"
          type="button"
          class="mystery-rules-refresh"
          @click="fetchMysteryDetail(false)"
        >
          Atualizar progresso
        </button>
      </div>

      <div v-if="nextResetTime" class="countdown-bar countdown-bar--in-panel">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>{{ countdownLabel }}: <strong>{{ countdown }}</strong></span>
      </div>

      <div class="boxes-section">
        <h3>Suas caixas <span class="box-count">{{ openedCount }}/{{ boxes.length }}</span></h3>
        <div class="mystery-track" role="region" aria-label="Progressão das recompensas">
          <div class="mystery-track-chests">
            <button
              v-for="(box, idx) in boxes"
              :key="box.id"
              type="button"
              class="mystery-track-slot"
              :class="{
                'mystery-track-slot--current': isTrackPlayable(idx),
                'mystery-track-slot--opened': box.opened,
                'mystery-track-slot--locked': box.locked,
              }"
              :disabled="box.locked || box.opened || box.opening || !isTrackPlayable(idx)"
              @click="openBox(box)"
            >
              <div class="mystery-track-chest-inner">
                <template v-if="box.opening">
                  <div class="mystery-track-opening">
                    <div class="spinner-ring"></div>
                  </div>
                </template>
                <template v-else-if="box.opened">
                  <img class="mystery-track-chest-img mystery-track-chest-img--open" :src="img.chestOpen" alt="" />
                </template>
                <template v-else>
                  <img class="mystery-track-chest-img" :src="trackChestSrc" alt="" />
                  <img
                    v-if="box.locked && img.btnDisable"
                    class="mystery-track-lock"
                    :src="img.btnDisable"
                    alt=""
                  />
                </template>
              </div>
            </button>
          </div>
          <div
            class="mystery-track-bar"
            role="progressbar"
            :aria-valuenow="Math.round(trackProgressPercent)"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Progresso nos dias de recompensa"
          >
            <div class="mystery-track-bar-fill" :style="{ width: trackProgressPercent + '%' }" />
          </div>
          <div class="mystery-track-pills">
            <div
              v-for="(box, idx) in boxes"
              :key="'pill-' + box.id"
              class="mystery-track-pill"
              :class="{
                'mystery-track-pill--active': isTrackPlayable(idx),
                'mystery-track-pill--muted': !isTrackPlayable(idx),
              }"
            >
              <span class="mystery-track-pill-label">{{ box.dayLabel }}</span>
              <span v-if="isTrackPlayable(idx)" class="mystery-track-pill-arrow" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      <div
        class="mystery-card-banner mystery-card-banner--in-panel"
        role="region"
        :aria-label="`Prêmio misterioso ${headlinePrize}, próxima renovação ${nextResetAtText}`"
      >
        <div class="mystery-card-overlay">
          <img
            class="mystery-card-coin mystery-card-coin--1"
            src="/assets/mystery/coin-36.png"
            alt=""
            width="56"
            height="56"
          />
          <img
            class="mystery-card-coin mystery-card-coin--2"
            src="/assets/mystery/coin-36.png"
            alt=""
            width="44"
            height="44"
          />
          <img
            class="mystery-card-coin mystery-card-coin--3"
            src="/assets/mystery/coin-36.png"
            alt=""
            width="36"
            height="36"
          />
          <div class="mystery-card-stack">
            <p class="mystery-card-intro">
              O momento em que os bônus podem ser reclamados:
            </p>
            <p class="mystery-card-time">{{ nextResetAtText }}</p>
            <p class="mystery-card-value">
              <span class="mystery-card-cur">{{ headlineParts.cur }}</span>
              <span class="mystery-card-num">{{ headlineParts.num }}</span>
            </p>
            <div class="mystery-card-badge">Prêmio Misterioso</div>
          </div>
        </div>
      </div>

      <div class="mystery-deposit-block">
        <div class="mystery-deposit-meta">
          <div class="mystery-deposit-meta-row">
            <svg class="mystery-deposit-meta-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span class="mystery-deposit-meta-label">Hora de registo:</span>
            <span class="mystery-deposit-meta-value">{{ registrationTimeText }}</span>
          </div>
          <div class="mystery-deposit-meta-row">
            <svg class="mystery-deposit-meta-icon mystery-deposit-meta-icon--coins" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <ellipse cx="9" cy="14" rx="6" ry="3.5" fill="none"/>
              <ellipse cx="13" cy="10" rx="6" ry="3.5" fill="none"/>
            </svg>
            <span class="mystery-deposit-meta-label">Depósito total de 2 Dias:</span>
            <span class="mystery-deposit-meta-value">{{ twoDayDepositTotal }}</span>
          </div>
        </div>
        <div class="mystery-deposit-table-wrap">
          <table class="mystery-deposit-table">
            <thead>
              <tr>
                <th scope="col">Âmbito do depósito</th>
                <th scope="col">Prêmio Misterioso</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in depositRewardRows" :key="idx">
                <td>{{ row.deposit }}</td>
                <td class="mystery-deposit-table-prize">{{ row.prize }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <section class="mystery-event-rules" aria-labelledby="mystery-event-rules-title">
        <h3 id="mystery-event-rules-title" class="mystery-event-rules-title">
          <span class="mystery-event-rules-deco" aria-hidden="true">
            <svg width="34" height="20" viewBox="0 0 34 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="3" cy="11" r="1.2" fill="currentColor" opacity="0.55" />
              <circle cx="29" cy="5" r="1" fill="currentColor" opacity="0.45" />
              <path d="M6 16 L14 4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" opacity="0.75" />
              <path d="M10 17 L18 5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" opacity="0.85" />
              <path d="M14 18 L22 6" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
            </svg>
          </span>
          <span class="mystery-event-rules-title-text">Regras do evento</span>
          <span class="mystery-event-rules-deco mystery-event-rules-deco--mirror" aria-hidden="true">
            <svg width="34" height="20" viewBox="0 0 34 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="3" cy="11" r="1.2" fill="currentColor" opacity="0.55" />
              <circle cx="29" cy="5" r="1" fill="currentColor" opacity="0.45" />
              <path d="M6 16 L14 4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" opacity="0.75" />
              <path d="M10 17 L18 5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" opacity="0.85" />
              <path d="M14 18 L22 6" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
            </svg>
          </span>
        </h3>
        <ol class="mystery-event-rules-list">
          <li v-for="(rule, i) in eventRules" :key="i">{{ rule }}</li>
        </ol>
      </section>
    </div>
    </div>

    <div v-if="showPrize" class="modal-overlay" @click.self="showPrize = null">
      <div class="prize-modal">
        <button type="button" class="modal-close" @click="showPrize = null">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <img class="prize-chest" :src="img.chestOpen" alt="" />
        <h3>Prêmio Revelado!</h3>
        <p class="prize-value">{{ showPrize.label }}</p>
        <button type="button" class="prize-btn" @click="collectPrize">Coletar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useUserStore } from '../../stores/user'
import { trpcQuery, trpcMutation } from '../../utils/api'
import { toastError, toastSuccess } from '../../utils/toast'
import * as mystery from '../../utils/mysteryEventRules'

function formatResetDatetime(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

const route = useRoute()
const auth = useAuthStore()
const userStore = useUserStore()

const img = reactive({
  pageBg: '/assets/mystery/page-bg.png',
  chestOpen: '/assets/mystery/chest-open.png',
  btnDisable: null
})

const headlinePrize = ref('R$ 8.888,00')

const headlineParts = computed(() => {
  const s = headlinePrize.value.trim()
  const i = s.indexOf(' ')
  return i === -1 ? { cur: s, num: '' } : { cur: s.slice(0, i), num: s.slice(i + 1).trim() }
})

const activityId = computed(() => route.params.id)

function persistUserKey() {
  const u = userStore.userDetails
  const id = u?.id ?? u?.userId
  if (id != null) return String(id)
  return auth.token ? 'authed' : 'guest'
}

const rulesState = reactive(mystery.defaultState())

const showPrize = ref(null)
const countdown = ref('--:--:--')
const countdownLabel = ref('Renova em')
const nextResetAtText = ref('')
const nextResetTime = ref(true)
let timer = null

const currentTier = ref('Bronze')
const currentTierClass = computed(() => {
  const m = { Bronze: 'tier-bronze', Prata: 'tier-silver', Ouro: 'tier-gold', Diamante: 'tier-diamond' }
  return m[currentTier.value] || 'tier-bronze'
})

const defaultBoxes = () => [
  { id: 1, dayLabel: 'Dia 2', opened: false, opening: false, prize: 'R$ 2,00', locked: false, requiredLevel: 0 },
  { id: 2, dayLabel: 'Dia 3', opened: false, opening: false, prize: 'R$ 5,00', locked: false, requiredLevel: 0 },
  { id: 3, dayLabel: 'Dia 7', opened: false, opening: false, prize: 'R$ 8,00', locked: false, requiredLevel: 0 },
  { id: 4, dayLabel: 'Dia 15', opened: false, opening: false, prize: 'R$ 15,00', locked: false, requiredLevel: 0 },
  { id: 5, dayLabel: 'Dia 30', opened: false, opening: false, prize: 'R$ 50,00', locked: true, requiredLevel: 3 }
]
const boxes = ref(defaultBoxes())

const trackChestSrc = '/assets/mystery/b1-DeKMEZ1m.png'

const openedCount = computed(() => boxes.value.filter(b => b.opened).length)

const firstPlayableIndex = computed(() => mystery.firstPlayableIndex(rulesState, boxes.value))

const trackProgressPercent = computed(() => {
  const n = boxes.value.length
  const play = firstPlayableIndex.value
  if (boxes.value.every(b => b.opened)) return 100
  if (play !== -1) return ((play + 1) / n) * 100
  return (openedCount.value / n) * 100
})

function isTrackPlayable(idx) {
  const p = firstPlayableIndex.value
  return p !== -1 && idx === p
}

const depositOk = computed(() => (rulesState.deposit2dCents || 0) >= mystery.getMinDeposit2dCents())
const validBetOk = computed(() => (rulesState.validBetCents || 0) >= mystery.getMinValidBetCents())

const registrationTimeText = ref('—')
const twoDayDepositTotal = computed(() => mystery.formatCentsToBRL(rulesState.deposit2dCents || 0))

const allUnlockedBoxesOpened = computed(() =>
  boxes.value.filter(b => !b.locked).every(b => b.opened)
)

const headlineClaimDisabled = computed(() => {
  if (!rulesState.participationAt) return true
  if (rulesState.headline?.collected) return true
  if (!depositOk.value || !validBetOk.value) return true
  if (!allUnlockedBoxesOpened.value) return true
  return false
})

const depositRewardRows = ref([
  { deposit: 'R$ 30,00', prize: 'R$ 0,30~88,00' },
  { deposit: 'R$ 70,00', prize: 'R$ 0,70~188,00' },
  { deposit: 'R$ 150,00', prize: 'R$ 1,00~388,00' },
  { deposit: 'R$ 300,00', prize: 'R$ 3,00~688,00' },
  { deposit: 'R$ 600,00', prize: 'R$ 7,00~888,00' },
  { deposit: 'R$ 1.000,00', prize: 'R$ 10,00~1.888,00' },
  { deposit: 'R$ 2.000,00', prize: 'R$ 24,00~2.888,00' },
  { deposit: 'R$ 5.000,00', prize: 'R$ 61,00~8.888,00' }
])

function formatBRLN(n) {
  return `R$ ${Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function brlPlain(n) {
  return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function applyMysteryBausFromApi(mb) {
  if (!mb || typeof mb !== 'object') return
  mystery.applyMysteryPublicSettings(mb)
  if (mb.headlinePrize && String(mb.headlinePrize).trim()) headlinePrize.value = String(mb.headlinePrize).trim()
  if (Array.isArray(mb.boxes) && mb.boxes.length) {
    const opened = new Set(rulesState.openedBoxIds || [])
    boxes.value = mb.boxes.map((b) => ({
      id: Number(b.id) || 1,
      dayLabel: String(b.dayLabel || ''),
      opened: opened.has(Number(b.id)),
      opening: false,
      prize: String(b.prize || ''),
      locked: !!b.locked,
      requiredLevel: Number(b.requiredLevel) || 0
    }))
  }
  if (Array.isArray(mb.reclamarTabela) && mb.reclamarTabela.length) {
    depositRewardRows.value = mb.reclamarTabela.map((t) => ({
      deposit: formatBRLN(t.minDep),
      prize: `R$ ${brlPlain(t.premioMin)}~${brlPlain(t.premioMax)}`
    }))
  }
}

const eventRules = [
  'Durante o evento, os membros que se inscreverem ativamente para participar do evento, concluírem depósitos e apostas válidas, podem receber bônus correspondentes;',
  'O evento será reiniciado no 32º dia após o registro, o bônus deve ser coletado manualmente e será cancelado após o vencimento;',
  'O bônus (excluindo o principal) requer 1 vezes de apostas válidas para sacar;',
  'Somente o proprietário da conta pode realizar operações manuais normais, caso contrário, o bônus será cancelado ou deduzido, congelado ou até mesmo colocado na lista negra;',
  'Para evitar diferenças na compreensão do texto, a plataforma se reserva o direito final de interpretação desta atividade.',
]

function persistRules() {
  mystery.saveState(persistUserKey(), { ...rulesState, pendingRewards: { ...rulesState.pendingRewards }, headline: { ...rulesState.headline } })
}

function syncBoxesFromRules() {
  const opened = new Set(rulesState.openedBoxIds || [])
  boxes.value.forEach((b) => {
    b.opened = opened.has(b.id)
  })
}

function reloadRulesState() {
  Object.assign(rulesState, mystery.loadState(persistUserKey()))
  mystery.applyCycleRollover(rulesState)
  syncBoxesFromRules()
  updateRegistrationText()
}

function updateRegistrationText() {
  if (rulesState.participationAt) {
    registrationTimeText.value = formatResetDatetime(new Date(rulesState.participationAt))
  } else {
    registrationTimeText.value = '—'
  }
}

async function fetchMysteryDetail(silent = false) {
  if (!activityId.value || !auth.token) return
  try {
    const data = await trpcQuery('activity.detail', {
      id: Number(activityId.value),
      type: 'MysteryReward'
    })
    mystery.mergeActivityDetailMetrics(rulesState, data)
    persistRules()
    updateRegistrationText()
    if (!silent) toastSuccess('Progresso atualizado.')
  } catch (e) {
    console.warn('[MysteryReward] detail', e.message)
    if (!silent) toastError('Não foi possível atualizar o progresso. Tente mais tarde.')
  }
}

function onJoinEvent() {
  const a = mystery.assertLoggedIn(!!auth.token)
  if (!a.ok) {
    toastError(a.message)
    return
  }
  mystery.joinEvent(rulesState)
  updateRegistrationText()
  persistRules()
  syncBoxesFromRules()
  toastSuccess('Inscrição registada. Cumpra depósito e aposta válida para abrir as caixas.')
}

function openBox(box) {
  const chk = mystery.assertCanOpenBox(rulesState, box, firstPlayableIndex.value, boxes.value, !!auth.token)
  if (!chk.ok) {
    toastError(chk.message)
    return
  }
  if (box.opened || box.locked || box.opening) return
  box.opening = true
  setTimeout(() => {
    box.opening = false
    box.opened = true
    mystery.registerReveal(rulesState, box.id, box.prize)
    persistRules()
    showPrize.value = { kind: 'box', boxId: box.id, label: box.prize }
  }, 1200)
}

function onHeadlineClaimClick() {
  const a = mystery.assertLoggedIn(!!auth.token)
  if (!a.ok) {
    toastError(a.message)
    return
  }
  const b = mystery.assertParticipation(rulesState)
  if (!b.ok) {
    toastError(b.message)
    return
  }
  const c = mystery.assertDeposit(rulesState)
  if (!c.ok) {
    toastError(c.message)
    return
  }
  const e = mystery.assertValidBet(rulesState)
  if (!e.ok) {
    toastError(e.message)
    return
  }
  if (rulesState.headline?.collected) {
    toastError('Prêmio principal já coletado neste ciclo.')
    return
  }
  if (!allUnlockedBoxesOpened.value) {
    toastError('Abra todas as caixas disponíveis na trilha antes de reclamar o prêmio principal.')
    return
  }
  if (!rulesState.headline?.revealedAt) {
    const label = headlinePrize.value
    mystery.registerHeadlineReveal(rulesState, label, mystery.parsePrizeLabelToCents(label))
    persistRules()
  }
  showPrize.value = { kind: 'headline', label: headlinePrize.value }
}

async function collectPrize() {
  const sp = showPrize.value
  if (!sp) return

  if (sp.kind === 'headline') {
    const chk = mystery.assertCanCollectHeadline(rulesState)
    if (!chk.ok) {
      toastError(chk.message)
      return
    }
  } else {
    const chk = mystery.assertCanCollectPending(rulesState, sp.boxId)
    if (!chk.ok) {
      toastError(chk.message)
      return
    }
  }

  if (activityId.value && auth.token) {
    try {
      await trpcMutation('activity.apply', {
        id: Number(activityId.value),
        applyInfo: {
          type: 'MysteryReward',
          info: sp.kind === 'headline' ? { claim: 'headline' } : { boxId: sp.boxId }
        }
      })
    } catch (e) {
      console.warn('[MysteryReward] apply', e.message)
    }
  }

  if (sp.kind === 'headline') mystery.finalizeHeadlineCollect(rulesState)
  else mystery.finalizeCollect(rulesState, sp.boxId)
  persistRules()
  toastSuccess('Prêmio coletado. O bônus requer 1x aposta válida para saque (regra 3).')
  showPrize.value = null
}

function tickCountdown() {
  const anchorBefore = rulesState.cycleAnchorAt
  mystery.applyCycleRollover(rulesState)
  if (rulesState.cycleAnchorAt !== anchorBefore) {
    persistRules()
    syncBoxesFromRules()
    toastSuccess('Ciclo de 32 dias renovado. As caixas foram reiniciadas.')
  }

  const now = Date.now()
  const cycleEnd = mystery.cycleEndsAt(rulesState)

  if (rulesState.participationAt && cycleEnd && cycleEnd > now) {
    countdownLabel.value = 'Fim do ciclo (32 dias)'
    nextResetAtText.value = formatResetDatetime(new Date(cycleEnd))
    const diff = cycleEnd - now
    const h = String(Math.floor(diff / 3600000)).padStart(2, '0')
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
    countdown.value = `${h}:${m}:${s}`
    return
  }

  countdownLabel.value = 'Renova em'
  const d = new Date()
  const tomorrow = new Date(d)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  nextResetAtText.value = formatResetDatetime(tomorrow)
  const diff = tomorrow - d
  if (diff <= 0) {
    if (timer) clearInterval(timer)
    return
  }
  const h = String(Math.floor(diff / 3600000)).padStart(2, '0')
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
  countdown.value = `${h}:${m}:${s}`
}

function startCountdown() {
  tickCountdown()
  timer = setInterval(tickCountdown, 1000)
}

watch(
  () => userStore.userDetails?.id ?? userStore.userDetails?.userId,
  () => {
    reloadRulesState()
  }
)

onMounted(async () => {
  reloadRulesState()
  try {
    const d = await fetch('/api/settings').then((r) => r.json())
    if (d.mysteryBaus) applyMysteryBausFromApi(d.mysteryBaus)
    syncBoxesFromRules()
  } catch (e) {
    console.warn('[MysteryReward] settings', e)
  }
  startCountdown()
  fetchMysteryDetail(true)
  fetch('/assets/mystery/btn-disable.png', { method: 'HEAD' })
    .then((r) => {
      if (r.ok) img.btnDisable = '/assets/mystery/btn-disable.png'
    })
    .catch(() => {})
})
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.mystery-page {
  position: relative;
  padding: 0 0.75rem 6rem;
  min-height: 100vh;
  color: #fff;
  overflow-x: hidden;
}

.mystery-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: #1a0d3a url('/assets/mystery/page-bg.png') center top / cover no-repeat;
  pointer-events: none;
}

/* Hero + painel: um cartão; fundo bg-DJEt-Dnt em todo o bloco (contínuo) */
.mystery-primary-stack {
  position: relative;
  z-index: 1;
  margin: 0 -0.75rem 0.75rem;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.32);
  background-color: #050816;
  background-image: url('/assets/mystery/bg-DJEt-Dnt.png');
  background-repeat: no-repeat;
  background-position: center top;
  background-size: 100% auto;
}

.mystery-hero.mystery-hero--in-stack {
  margin: 0;
  border-bottom: none;
  border-radius: 0;
}

/*
 * Painel: tier + countdown + trilha + prêmio.
 */
.mystery-track-panel {
  margin-top: 0.65rem;
  margin-bottom: 0.75rem;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(20, 10, 50, 0.5);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
}

.mystery-track-panel.mystery-track-panel--in-stack {
  margin-top: 0;
  margin-bottom: 0;
  border-radius: 0;
  border: none;
  box-shadow: none;
  background: transparent;
  backdrop-filter: none;
}

.mystery-track-panel .mystery-substrip--in-panel {
  margin: 0;
  padding: 0.55rem 0.85rem;
  border-radius: 0;
  border: none;
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.mystery-track-panel .countdown-bar--in-panel {
  margin: 0;
  padding: 0.5rem 0.85rem;
  border-radius: 0;
  border: none;
  background: transparent;
  backdrop-filter: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.mystery-track-panel .boxes-section {
  background: transparent;
  backdrop-filter: none;
  border: none;
  border-radius: 0;
  margin-bottom: 0;
  box-shadow: none;
}

/*
 * Cartão inferior: fundo desde o topo até cobrir o texto (como no print).
 * Imagem em largura 100%, ancorada ao topo; parte de baixo prolonga com cor sólida.
 */
.mystery-card-banner {
  position: relative;
  margin: 0.5rem 0 0.75rem;
  border-radius: 0.65rem;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #050816;
}

.mystery-card-banner.mystery-card-banner--in-panel {
  margin: 0;
  border-radius: 0;
  border: none;
  box-shadow: none;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;
}

.mystery-card-banner.mystery-card-banner--in-panel::after {
  display: none;
}

.mystery-card-banner::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #c084fc, #9333ea);
  z-index: 3;
  pointer-events: none;
}

.mystery-card-overlay {
  position: relative;
  z-index: 1;
  padding: 0.85rem 0.75rem 1.2rem;
  text-align: center;
  pointer-events: none;
}

.mystery-card-coin {
  position: absolute;
  z-index: 1;
  pointer-events: none;
  object-fit: contain;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.45));
}

.mystery-card-coin--1 {
  left: -2%;
  bottom: 6%;
  width: 3.5rem;
  height: auto;
}

.mystery-card-coin--2 {
  left: 6%;
  bottom: 28%;
  width: 2.65rem;
  height: auto;
  opacity: 0.92;
}

.mystery-card-coin--3 {
  right: 2%;
  top: 38%;
  width: 2.1rem;
  height: auto;
  opacity: 0.88;
}

.mystery-card-stack {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
}

.mystery-card-intro {
  margin: 0;
  max-width: 19rem;
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.88);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.mystery-card-time {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 0.03em;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.55);
}

.mystery-card-value {
  margin: 0.1rem 0 0.25rem;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.35rem;
  line-height: 1;
}

.mystery-card-cur {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fde68a;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.55);
}

.mystery-card-num {
  font-size: 2.35rem;
  font-weight: 800;
  color: #fbbf24;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.55);
}

.mystery-card-badge {
  display: inline-block;
  margin-top: 0.15rem;
  padding: 0.5rem 1.5rem;
  background: #fff;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  border-radius: 0.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.22);
}

.mystery-deposit-block {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.85rem 0.75rem 1rem;
}

.mystery-deposit-meta {
  background: rgba(30, 18, 55, 0.72);
  border-radius: 0.5rem;
  padding: 0.55rem 0.65rem;
  margin-bottom: 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.mystery-deposit-meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem 0.45rem;
  width: 100%;
  font-size: 0.6875rem;
  line-height: 1.35;
}

.mystery-deposit-meta-row + .mystery-deposit-meta-row {
  margin-top: 0.45rem;
  padding-top: 0.45rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.mystery-deposit-meta-icon {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.78);
}

.mystery-deposit-meta-label {
  flex: 1;
  min-width: 8rem;
  color: rgba(255, 255, 255, 0.58);
}

.mystery-deposit-meta-value {
  flex-shrink: 0;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
}

.mystery-deposit-table-wrap {
  border-radius: 0.45rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.mystery-deposit-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.6875rem;
}

.mystery-deposit-table th,
.mystery-deposit-table td {
  padding: 0.45rem 0.4rem;
  text-align: center;
}

.mystery-deposit-table thead th {
  font-weight: 800;
  color: rgba(255, 255, 255, 0.92);
  background: rgba(75, 42, 107, 0.8);
}

.mystery-deposit-table tbody td {
  font-weight: 700;
  color: #fff;
}

.mystery-deposit-table tbody tr:nth-child(odd) {
  background: rgba(35, 20, 58, 0.55);
}

.mystery-deposit-table tbody tr:nth-child(even) {
  background: rgba(50, 30, 85, 0.48);
}

.mystery-deposit-table-prize {
  color: #fcd34d;
}

.mystery-event-rules {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.9rem 0.75rem 1.05rem;
}

.mystery-event-rules-title {
  margin: 0 0 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  font-size: 0.9375rem;
  font-weight: 800;
  color: #fff;
  text-align: center;
  line-height: 1.2;
}

.mystery-event-rules-title-text {
  flex-shrink: 0;
}

.mystery-event-rules-deco {
  display: flex;
  color: rgba(196, 181, 253, 0.85);
  flex-shrink: 0;
}

.mystery-event-rules-deco--mirror {
  transform: scaleX(-1);
}

.mystery-event-rules-list {
  margin: 0;
  padding: 0 0 0 1.15rem;
  font-size: 0.6875rem;
  line-height: 1.55;
  color: rgba(200, 190, 230, 0.92);
}

.mystery-event-rules-list li {
  margin-bottom: 0.5rem;
  padding-left: 0.2rem;
}

.mystery-event-rules-list li:last-child {
  margin-bottom: 0;
}

.mystery-hero {
  position: relative;
  margin: 0 -0.75rem 0.65rem;
  padding: 1.35rem 1rem 1.55rem;
  border-top: 3px solid #2d0a4d;
  border-bottom: 3px solid #2d0a4d;
  overflow: hidden;
  text-align: center;
}

/* Camadas decorativas desligadas: o fundo é bg-DJEt-Dnt no .mystery-primary-stack */
.mystery-hero-stripes {
  position: absolute;
  inset: 0;
  background: transparent;
  pointer-events: none;
}

.mystery-hero-stripes::before {
  display: none;
}

.mystery-hero-mesh {
  display: none;
}

.mystery-hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
}

.mystery-hero-top {
  display: grid;
  grid-template-columns: 2.5rem 1fr 2.5rem;
  align-items: center;
  width: 100%;
  max-width: 100%;
}

.mystery-hero-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: none;
  border-radius: 0.5rem;
  color: #fff;
  background: rgba(45, 10, 77, 0.72);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
  cursor: pointer;
  flex-shrink: 0;
}

.mystery-hero-back:active {
  opacity: 0.88;
}

.mystery-hero-pill-wrap {
  display: flex;
  justify-content: center;
  min-width: 0;
}

.mystery-hero-top-spacer {
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
}

.mystery-hero-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.42rem 1.4rem;
  border-radius: 9999px;
  background: linear-gradient(180deg, #7c3aed 0%, #5b21b6 100%);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  box-shadow:
    0 2px 0 rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.mystery-hero-title {
  margin: 0;
  font-size: clamp(1.85rem, 7.5vw, 2.4rem);
  font-weight: 900;
  color: #fff;
  line-height: 1.08;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.38);
}

.mystery-prize-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 19rem;
  margin-top: 0.2rem;
  padding: 0.5rem 0 0.15rem;
  gap: 0.35rem;
}

.mystery-prize-box {
  position: relative;
  margin: 0 auto;
  padding: 0.55rem 1.35rem;
  border-radius: 0.45rem;
  text-align: center;
  overflow: hidden;
  background: rgba(110, 70, 180, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.mystery-prize-texture {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0.35;
  background: repeating-linear-gradient(
    -28deg,
    transparent 0,
    transparent 5px,
    rgba(255, 255, 255, 0.06) 5px,
    rgba(255, 255, 255, 0.06) 6px
  );
  pointer-events: none;
}

.mystery-prize-value {
  position: relative;
  z-index: 1;
  display: block;
  font-size: clamp(1.2rem, 5vw, 1.45rem);
  font-weight: 900;
  color: #f5d10a;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
}

.mystery-prize-visual {
  position: relative;
  width: min(100%, 17.5rem);
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  min-height: 6.75rem;
  padding-bottom: 0.1rem;
}

/* Base azul — por baixo de tudo; alinha com o anel cinza */
.mystery-prize-base {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(108%, 19rem);
  height: auto;
  z-index: 0;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.35));
}

/* Cápsula (btn-disable) + texto “Reclamar” — à frente da base azul */
.mystery-prize-pill-wrap {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translate(-50%, 0.12rem);
  width: min(68%, 11rem);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font: inherit;
  color: inherit;
}

.mystery-prize-pill-wrap:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  filter: grayscale(0.35);
}

.mystery-join-bar {
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.15);
}

.mystery-join-bar-text {
  margin: 0 0 0.5rem;
  font-size: 0.78rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.88);
}

.mystery-join-btn {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(250, 204, 21, 0.45);
  background: linear-gradient(180deg, #facc15 0%, #ca8a04 100%);
  color: #1a1005;
  font-weight: 800;
  font-size: 0.82rem;
  cursor: pointer;
}

.mystery-rules-status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.mystery-rules-pill {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.25);
  color: #fecaca;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.mystery-rules-pill--ok {
  background: rgba(34, 197, 94, 0.22);
  color: #bbf7d0;
  border-color: rgba(34, 197, 94, 0.45);
}

.mystery-rules-refresh {
  margin-left: auto;
  font-size: 0.68rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.35rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #e8dff5;
  cursor: pointer;
}

.mystery-prize-pill-cap {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
}

.mystery-prize-pill-label {
  position: absolute;
  left: 50%;
  top: 48%;
  transform: translate(-50%, -50%);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #1b1530;
  white-space: nowrap;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
}

.mystery-prize-chest {
  position: absolute;
  left: 50%;
  bottom: 1.15rem;
  transform: translateX(-50%);
  width: min(9.25rem, 58%);
  height: auto;
  z-index: 2;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.4));
}

/* Anel cinza à frente — um pouco menor e ligeiramente mais acima */
.mystery-prize-ring {
  position: relative;
  z-index: 3;
  display: block;
  width: 84%;
  max-width: 14.75rem;
  height: auto;
  margin: 0 auto -0.35rem;
  transform: translateY(-1.65rem);
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35));
}

.mystery-substrip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.65rem;
  background: rgba(20, 10, 50, 0.45);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.mystery-substrip-text {
  margin: 0;
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.72);
  flex: 1;
  min-width: 9rem;
  line-height: 1.35;
}

.tier-badge {
  padding: 0.125rem 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.6875rem;
  font-weight: 700;
}
.tier-bronze { background: #cd7f32; color: #fff; }
.tier-silver { background: #c0c0c0; color: #333; }
.tier-gold { background: linear-gradient(135deg, #ffd700, #ffaa00); color: #333; }
.tier-diamond { background: linear-gradient(135deg, #b9f2ff, #0ea5e9); color: #0c4a6e; }

.countdown-bar {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 0.75rem;
  background: rgba(20, 10, 50, 0.65);
  backdrop-filter: blur(8px);
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.countdown-bar strong { color: #fff; }

.boxes-section {
  background: rgba(20, 10, 50, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.boxes-section h3 {
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}
.box-count { font-size: 0.6875rem; color: rgba(255, 255, 255, 0.55); font-weight: 500; }

/* Trilha horizontal: baús + barra + cápsulas (referência Dia 2 / 3 / 7 / 15 / 30) */
.mystery-track {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mystery-track-chests {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.125rem;
  align-items: flex-end;
}

.mystery-track-slot {
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-height: 4.25rem;
  position: relative;
  -webkit-tap-highlight-color: transparent;
}

.mystery-track-slot:disabled {
  cursor: default;
}

.mystery-track-slot:not(:disabled):active {
  transform: scale(0.96);
}

.mystery-track-slot--current:not(.mystery-track-slot--opened) .mystery-track-chest-inner {
  filter: drop-shadow(0 0 10px rgba(250, 204, 21, 0.85)) drop-shadow(0 0 18px rgba(250, 204, 21, 0.45));
}

.mystery-track-slot--opened .mystery-track-chest-img {
  animation: none;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.35)) saturate(1.05);
}

.mystery-track-slot--locked .mystery-track-chest-img {
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5)) brightness(0.55) saturate(0.85);
  animation: none;
}

.mystery-track-chest-inner {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 3.75rem;
}

.mystery-track-chest-img {
  width: 100%;
  max-width: 3.1rem;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 5px 12px rgba(0, 0, 0, 0.45));
  animation: chest-float 3s ease-in-out infinite;
}

.mystery-track-chest-img--open {
  max-width: 3.25rem;
  animation: prize-pop 0.5s ease;
}

.mystery-track-lock {
  position: absolute;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  width: 72%;
  max-width: 2.25rem;
  opacity: 0.9;
  pointer-events: none;
}

.mystery-track-opening {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
}

.spinner-ring {
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(168, 85, 247, 0.25);
  border-top-color: #e9d5ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.mystery-track-bar {
  height: 0.35rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
}

.mystery-track-bar-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #facc15, #fde047);
  box-shadow: 0 0 8px rgba(250, 204, 21, 0.5);
  transition: width 0.35s ease;
}

.mystery-track-pills {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.25rem;
  align-items: start;
}

.mystery-track-pill {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.35rem 0.15rem 0.5rem;
  border-radius: 999px;
  min-height: 1.85rem;
  justify-content: center;
}

.mystery-track-pill-label {
  font-size: 0.5625rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.1;
  text-align: center;
}

.mystery-track-pill--active {
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
  box-shadow:
    0 2px 0 rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.mystery-track-pill--muted {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.mystery-track-pill-arrow {
  position: absolute;
  bottom: -0.28rem;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 0.28rem solid transparent;
  border-right: 0.28rem solid transparent;
  border-top: 0.32rem solid #facc15;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35));
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.modal-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  background: none;
  border: none;
  cursor: pointer;
}
.prize-modal {
  position: relative;
  width: 100%;
  max-width: 20rem;
  background: linear-gradient(180deg, #2d1b69 0%, #1a1038 100%);
  border-radius: 1rem;
  padding: 1.75rem 1.5rem 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.15);
  animation: modalIn 0.3s ease;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}
.prize-chest {
  width: 70%;
  max-width: 11rem;
  height: auto;
  margin: 0 auto 0.5rem;
  object-fit: contain;
  filter: drop-shadow(0 8px 24px rgba(250, 204, 21, 0.25));
}
.prize-modal h3 { font-size: 1.125rem; font-weight: 800; color: #fff; }
.prize-value {
  font-size: 2rem;
  font-weight: 900;
  color: #e9d5ff;
  margin: 0.5rem 0 1.25rem;
  text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
}
.prize-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(180deg, #788dbf 0%, #5a6fa8 100%);
  color: #0f172a;
  border: none;
  border-radius: 999px;
  font-size: 0.9375rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.35);
}
.prize-btn:active { transform: translateY(2px); box-shadow: 0 2px 0 rgba(0, 0, 0, 0.2); }

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes modalIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes chest-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes prize-pop {
  0% { transform: scale(0.85); }
  70% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style>
