/**
 * Regras de negócio do evento Prêmio Misterioso (cliente).
 * Persistência em localStorage + opcional sincronização com activity.detail.
 */

export const MYSTERY_STORAGE_PREFIX = 'mystery_reward_event_v1'

export const DAY_MS = 86400000
export const CYCLE_DAYS = 32
export const CLAIM_WINDOW_MS = 24 * 3600000

/** Depósito mínimo em 2 dias (padrão; pode ser sobrescrito por /api/settings → mysteryBaus) */
export const MIN_DEPOSIT_2D_CENTS = 3000
/** Aposta válida mínima padrão */
export const MIN_VALID_BET_CENTS = 100

const BOX_MIN_DAY_DEFAULT = Object.freeze({
  1: 2,
  2: 3,
  3: 7,
  4: 15,
  5: 30
})

let runtimeMinDeposit2dCents = MIN_DEPOSIT_2D_CENTS
let runtimeMinValidBetCents = MIN_VALID_BET_CENTS
let runtimeBoxMinDay = { ...BOX_MIN_DAY_DEFAULT }

/** Aplica mysteryBaus do GET /api/settings (admin configura em «Baús»). */
export function applyMysteryPublicSettings(s) {
  if (!s || typeof s !== 'object') return
  const md = parseFloat(s.minDeposit2dReais)
  if (Number.isFinite(md)) runtimeMinDeposit2dCents = Math.max(0, Math.round(md * 100))
  const vb = parseFloat(s.minValidBetReais)
  if (Number.isFinite(vb)) runtimeMinValidBetCents = Math.max(0, Math.round(vb * 100))
  if (Array.isArray(s.boxes) && s.boxes.length) {
    const m = { ...BOX_MIN_DAY_DEFAULT }
    s.boxes.forEach((b) => {
      const id = Number(b.id)
      const d = parseInt(b.minDay, 10)
      if (Number.isFinite(id) && Number.isFinite(d) && id >= 1 && id <= 5) m[id] = d
    })
    runtimeBoxMinDay = m
  }
}

export function getMinDeposit2dCents() {
  return runtimeMinDeposit2dCents
}

export function getMinValidBetCents() {
  return runtimeMinValidBetCents
}

function boxMinDayFor(id) {
  return runtimeBoxMinDay[id] ?? BOX_MIN_DAY_DEFAULT[id]
}

export function storageKeyForUser(userId) {
  return `${MYSTERY_STORAGE_PREFIX}:${userId ?? 'guest'}`
}

export function defaultState() {
  return {
    participationAt: null,
    cycleAnchorAt: null,
    deposit2dCents: 0,
    validBetCents: 0,
    openedBoxIds: [],
    /** boxId string -> { prizeLabel, prizeCents, revealedAt, collected } */
    pendingRewards: {},
    headline: { collected: false, revealedAt: null, prizeLabel: '', prizeCents: 0 }
  }
}

export function loadState(userId) {
  try {
    const raw = localStorage.getItem(storageKeyForUser(userId))
    if (!raw) return defaultState()
    const o = JSON.parse(raw)
    return { ...defaultState(), ...o, pendingRewards: o.pendingRewards || {}, headline: { ...defaultState().headline, ...(o.headline || {}) } }
  } catch {
    return defaultState()
  }
}

export function saveState(userId, state) {
  try {
    localStorage.setItem(storageKeyForUser(userId), JSON.stringify(state))
  } catch {
    /* ignore quota */
  }
}

export function formatCentsToBRL(cents) {
  const n = (Number(cents) || 0) / 100
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function parsePrizeLabelToCents(label) {
  if (!label || typeof label !== 'string') return 0
  const m = label.replace(/\./g, '').replace(/\s/g, '').match(/R\$\s*([\d,]+)/i)
  if (!m) return 0
  const num = parseFloat(m[1].replace(',', '.'))
  return Number.isFinite(num) ? Math.round(num * 100) : 0
}

/**
 * Avança o ciclo de 32 dias: zera progressão de caixas e coletas do ciclo anterior.
 */
export function applyCycleRollover(state, now = Date.now()) {
  if (!state.cycleAnchorAt) return state
  const cycleMs = CYCLE_DAYS * DAY_MS
  let anchor = state.cycleAnchorAt
  let changed = false
  while (now - anchor >= cycleMs) {
    anchor += cycleMs
    state.openedBoxIds = []
    state.pendingRewards = {}
    state.headline = { collected: false, revealedAt: null, prizeLabel: state.headline?.prizeLabel || '', prizeCents: state.headline?.prizeCents || 0 }
    changed = true
  }
  if (changed) state.cycleAnchorAt = anchor
  return state
}

export function daysSinceParticipation(state, now = Date.now()) {
  if (!state.participationAt) return 0
  return Math.floor((now - state.participationAt) / DAY_MS)
}

export function cycleEndsAt(state) {
  if (!state.cycleAnchorAt) return null
  return state.cycleAnchorAt + CYCLE_DAYS * DAY_MS
}

export function assertLoggedIn(isLoggedIn) {
  if (!isLoggedIn) {
    return { ok: false, code: 'LOGIN', message: 'Faça login para participar. Apenas o titular da conta pode operar.' }
  }
  return { ok: true }
}

export function assertParticipation(state) {
  if (!state.participationAt) {
    return { ok: false, code: 'PARTICIPATE', message: 'Inscreva-se no evento para desbloquear as caixas.' }
  }
  return { ok: true }
}

export function assertDeposit(state) {
  const minC = getMinDeposit2dCents()
  if ((state.deposit2dCents || 0) < minC) {
    return {
      ok: false,
      code: 'DEPOSIT',
      message: `Depósito total em 2 dias insuficiente (mín. ${formatCentsToBRL(minC)}).`
    }
  }
  return { ok: true }
}

export function assertValidBet(state) {
  const minV = getMinValidBetCents()
  if ((state.validBetCents || 0) < minV) {
    return {
      ok: false,
      code: 'VALID_BET',
      message: `É necessário volume de aposta válida (mín. ${formatCentsToBRL(minV)}).`
    }
  }
  return { ok: true }
}

export function assertBoxDay(state, boxId, now = Date.now()) {
  const minDay = boxMinDayFor(boxId)
  if (minDay == null) return { ok: true }
  const d = daysSinceParticipation(state, now)
  if (d < minDay) {
    return {
      ok: false,
      code: 'DAY',
      message: `Este baú desbloqueia no dia ${minDay} após a inscrição (hoje: dia ${d + 1}).`
    }
  }
  return { ok: true }
}

export function assertCanOpenBox(state, box, boxIndex, boxes, isLoggedIn, now = Date.now()) {
  const a = assertLoggedIn(isLoggedIn)
  if (!a.ok) return a
  const b = assertParticipation(state)
  if (!b.ok) return b
  const c = assertDeposit(state)
  if (!c.ok) return c
  const e = assertValidBet(state)
  if (!e.ok) return e

  const p = firstPlayableIndex(state, boxes, now)
  if (p === -1 || boxes[p]?.id !== box.id) {
    return { ok: false, code: 'ORDER', message: 'Abra as caixas na ordem da trilha.' }
  }

  const dayCheck = assertBoxDay(state, box.id, now)
  if (!dayCheck.ok) return dayCheck

  if (box.locked) {
    return { ok: false, code: 'LOCKED', message: 'Este baú ainda está bloqueado.' }
  }

  return { ok: true }
}

export function firstPlayableIndex(state, boxes, now = Date.now()) {
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i]
    if (box.opened) continue
    if (box.locked) return -1
    const minDay = boxMinDayFor(box.id)
    if (minDay != null && daysSinceParticipation(state, now) < minDay) return -1
    return i
  }
  return -1
}

export function registerReveal(state, boxId, prizeLabel) {
  const prizeCents = parsePrizeLabelToCents(prizeLabel)
  state.pendingRewards[String(boxId)] = {
    prizeLabel,
    prizeCents,
    revealedAt: Date.now(),
    collected: false
  }
  if (!state.openedBoxIds.includes(boxId)) state.openedBoxIds.push(boxId)
}

export function assertCanCollectPending(state, boxId, now = Date.now()) {
  const key = String(boxId)
  const pr = state.pendingRewards[key]
  if (!pr || pr.collected) {
    return { ok: false, code: 'NONE', message: 'Nada para coletar.' }
  }
  if (now - pr.revealedAt > CLAIM_WINDOW_MS) {
    return { ok: false, code: 'EXPIRED', message: 'O prazo de 24 horas para coleta manual expirou. O bônus foi cancelado.' }
  }
  return { ok: true, pending: pr }
}

export function finalizeCollect(state, boxId) {
  const key = String(boxId)
  const pr = state.pendingRewards[key]
  if (pr) pr.collected = true
}

export function registerHeadlineReveal(state, prizeLabel, prizeCents) {
  state.headline = {
    collected: false,
    revealedAt: Date.now(),
    prizeLabel,
    prizeCents: prizeCents || parsePrizeLabelToCents(prizeLabel)
  }
}

export function assertCanCollectHeadline(state, now = Date.now()) {
  const h = state.headline
  if (!h?.revealedAt || h.collected) {
    return { ok: false, code: 'NONE', message: 'Nada para coletar no prêmio principal.' }
  }
  if (now - h.revealedAt > CLAIM_WINDOW_MS) {
    return { ok: false, code: 'EXPIRED', message: 'O prazo de 24 horas para coleta do prêmio principal expirou.' }
  }
  return { ok: true, headline: h }
}

export function finalizeHeadlineCollect(state) {
  if (state.headline) state.headline.collected = true
}

export function joinEvent(state, now = Date.now()) {
  state.participationAt = now
  state.cycleAnchorAt = now
  state.openedBoxIds = []
  state.pendingRewards = {}
  state.headline = { collected: false, revealedAt: null, prizeLabel: state.headline?.prizeLabel || '', prizeCents: state.headline?.prizeCents || 0 }
}

/**
 * Tenta extrair métricas do retorno de activity.detail (campos variam por backend).
 */
export function mergeActivityDetailMetrics(state, data) {
  if (!data || typeof data !== 'object') return

  const pickNum = (...keys) => {
    for (const k of keys) {
      if (data[k] != null && Number.isFinite(Number(data[k]))) return Number(data[k])
    }
    return null
  }

  const dep = pickNum(
    'twoDayDepositAmount',
    'twoDayDeposit',
    'depositAmount2d',
    'mysteryDeposit2d',
    'cumulativeRecharge'
  )
  if (dep != null && dep >= 0) state.deposit2dCents = Math.max(state.deposit2dCents, Math.round(dep))

  const vb = pickNum('validBetAmount', 'userValidBet', 'currentValidBet', 'validBetTotal', 'validBet')
  if (vb != null && vb >= 0) state.validBetCents = Math.max(state.validBetCents, Math.round(vb))

  const join = data.joinTime ?? data.userJoinTime ?? data.participationTime
  if (join != null) {
    const t = typeof join === 'number' ? join : new Date(join).getTime()
    if (Number.isFinite(t) && t > 0) {
      if (!state.participationAt) {
        state.participationAt = t
        state.cycleAnchorAt = state.cycleAnchorAt || t
      }
    }
  }
}
