/**
 * Configuração de baús de afiliados e manipulação de indicações (GET /api/settings → mysteryBaus).
 * Alinhado à lógica do admin (preview) e ao normalizeMysteryBaus no backend.
 */

export const DEFAULT_AFILIADO_BAUS = Object.freeze({
  afiliadoBausQtd: 39,
  afiliadoBausValoresCsv: '50,50,50,50,50,300,300,300,500,600,600',
  afiliadoBausPessoasCsv: '1,2,3,4,5,10,15,20,30,40,50,60,70,80,90,100',
  indicacaoManipEnabled: false,
  indicacaoDar: 3,
  indicacaoRoubar: 1,
  cpaNivel1: 0,
  cpaNivel2: 0,
  cpaNivel3: 0,
  cpaWinChancePct: 100,
  minDeposit2dReais: 30,
  minValidBetReais: 1
})

function parseCsvFloats(str) {
  return String(str || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => parseFloat(s.replace(',', '.')))
    .filter((n) => Number.isFinite(n))
}

function parseCsvInts(str) {
  return String(str || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => parseInt(s, 10))
    .filter((n) => Number.isFinite(n))
}

function formatAmountLabel(n) {
  const x = Number(n)
  if (!Number.isFinite(x)) return '0,00'
  return x.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Contagem «efetiva» para desbloquear baús quando a manipulação 3/1 (ou N/M) está ativa.
 * A cada `dar` indicações válidas contabilizadas, `roubar` são descontadas do total efetivo.
 */
export function effectiveInviteCount(rawValid, mb) {
  const r = Math.max(0, Math.floor(Number(rawValid) || 0))
  if (!mb || mb.indicacaoManipEnabled !== true) return r
  const dar = Math.max(1, Math.floor(Number(mb.indicacaoDar) || 3))
  const roubar = Math.max(0, Math.floor(Number(mb.indicacaoRoubar) || 0))
  const cycles = Math.floor(r / dar)
  return Math.max(0, r - cycles * roubar)
}

/**
 * Lista de baús: um item por índice 1..qtd, valores e pessoas por CSV (repete último se faltar).
 * @returns {Array<{ index: number, people: number, amount: string, valueNum: number }>}
 */
export function buildAffiliateChestTiers(mb) {
  const base = mb && typeof mb === 'object' ? { ...DEFAULT_AFILIADO_BAUS, ...mb } : { ...DEFAULT_AFILIADO_BAUS }
  let q = parseInt(base.afiliadoBausQtd, 10)
  if (!Number.isFinite(q) || q < 1) q = DEFAULT_AFILIADO_BAUS.afiliadoBausQtd
  q = Math.min(5000, q)

  const vals = parseCsvFloats(base.afiliadoBausValoresCsv)
  const peopleList = parseCsvInts(base.afiliadoBausPessoasCsv)
  const lastV = vals.length ? vals[vals.length - 1] : 0
  const lastP = peopleList.length ? peopleList[peopleList.length - 1] : 0

  const tiers = []
  for (let i = 1; i <= q; i++) {
    const idx = i - 1
    const valueNum = vals.length ? (idx < vals.length ? vals[idx] : lastV) : 0
    const people = peopleList.length ? (idx < peopleList.length ? peopleList[idx] : lastP) : idx + 1
    tiers.push({
      index: i,
      people,
      amount: formatAmountLabel(valueNum),
      valueNum
    })
  }
  return tiers
}

export function chunkTiers(tiers, size = 4) {
  const rows = []
  for (let i = 0; i < tiers.length; i += size) {
    rows.push(tiers.slice(i, i + size))
  }
  return rows
}
