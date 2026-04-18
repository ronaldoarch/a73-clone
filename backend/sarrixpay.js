/**
 * SarrixPay Enterprise API — PIX e operações normalizadas.
 * https://apiv1.sarrixpay.com
 */

const DEFAULT_API = 'https://apiv1.sarrixpay.com'

let _prisma = null
let cachedToken = null
let tokenExpiry = 0
let cachedClientId = null

export function setPrisma(p) {
  _prisma = p
}

export function invalidateSarrixpayTokenCache() {
  cachedToken = null
  tokenExpiry = 0
  cachedClientId = null
}

async function getConfig() {
  if (!_prisma) return null
  try {
    const s = await _prisma.setting.findUnique({ where: { id: 'sarrixpay' } })
    let v = s?.value
    if (typeof v === 'string') {
      try { v = JSON.parse(v) } catch { v = null }
    }
    if (!v || typeof v !== 'object') return null
    const clientId = String(v.clientId || v.client_id || '').trim()
    const clientSecret = String(v.clientSecret || v.client_secret || '').trim()
    if (!clientId || !clientSecret) return null
    return {
      apiUrl: String(v.apiUrl || DEFAULT_API).replace(/\/$/, ''),
      clientId,
      clientSecret
    }
  } catch {
    return null
  }
}

async function getAccessToken() {
  const cfg = await getConfig()
  if (!cfg) return null
  if (cachedToken && Date.now() < tokenExpiry && cachedClientId === cfg.clientId) {
    return { token: cachedToken, cfg }
  }
  try {
    const r = await fetch(`${cfg.apiUrl}/auth/integrations/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret
      })
    })
    const data = await r.json().catch(() => ({}))
    if (data?.access_token) {
      cachedToken = data.access_token
      cachedClientId = cfg.clientId
      const sec = Number(data.expires_in) || 3600
      tokenExpiry = Date.now() + Math.max(120, sec - 120) * 1000
      return { token: cachedToken, cfg }
    }
    cachedToken = null
    cachedClientId = null
    return null
  } catch (e) {
    console.error('SarrixPay token:', e)
    cachedToken = null
    return null
  }
}

/**
 * @param {object} opts
 * @param {number} opts.amount
 * @param {string} [opts.currency]
 * @param {string} [opts.description]
 * @param {string} [opts.idempotencyKey]
 * @param {{ name: string, document: string }} opts.payer
 */
export async function sarrixpayCreatePixCharge(opts) {
  const auth = await getAccessToken()
  if (!auth) return { ok: false, error: 'SarrixPay não configurado' }
  const { token, cfg } = auth
  const body = {
    client_id: cfg.clientId,
    amount: Number(opts.amount),
    currency: String(opts.currency || 'BRL').toUpperCase(),
    payer: {
      name: String(opts.payer?.name || '').slice(0, 120),
      document: String(opts.payer?.document || '').replace(/\D/g, '')
    }
  }
  if (opts.description) body.description = String(opts.description).slice(0, 200)
  if (opts.idempotencyKey) body.idempotency_key = String(opts.idempotencyKey)
  try {
    const r = await fetch(`${cfg.apiUrl}/pix/in/charges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok || data?.error) {
      return {
        ok: false,
        error: data?.message || data?.error || `Erro ao criar cobrança PIX [${r.status}]`
      }
    }
    const qr = data.qr_code || {}
    return {
      ok: true,
      data: {
        transactionId: data.transaction_id,
        status: data.status,
        copyPaste: qr.br_code || '',
        qrcode: qr.pay_url || '',
        raw: data
      }
    }
  } catch (e) {
    console.error('SarrixPay createPixCharge:', e)
    return { ok: false, error: e.message }
  }
}

function mapPixKeyType(t) {
  const u = String(t || '').toUpperCase()
  const m = { CPF: 'cpf', CNPJ: 'cnpj', EMAIL: 'email', PHONE: 'phone', RANDOM: 'random' }
  return m[u] || String(t || 'cpf').toLowerCase()
}

/**
 * @param {object} opts
 * @param {number} opts.amount
 * @param {string} [opts.currency]
 * @param {string} [opts.description]
 * @param {string} [opts.idempotencyKey]
 * @param {{ name: string, pix_key: string, pix_key_type: string, document?: string }} opts.beneficiary
 */
export async function sarrixpayPixOut(opts) {
  const auth = await getAccessToken()
  if (!auth) return { ok: false, error: 'SarrixPay não configurado' }
  const { token, cfg } = auth
  const ben = opts.beneficiary || {}
  const body = {
    client_id: cfg.clientId,
    amount: Number(opts.amount),
    currency: String(opts.currency || 'BRL').toUpperCase(),
    beneficiary: {
      name: String(ben.name || '').slice(0, 120),
      pix_key: String(ben.pix_key || '').trim(),
      pix_key_type: mapPixKeyType(ben.pix_key_type)
    }
  }
  if (ben.document) {
    body.beneficiary.document = String(ben.document).replace(/\D/g, '')
  }
  if (opts.description) body.description = String(opts.description).slice(0, 200)
  if (opts.idempotencyKey) body.idempotency_key = String(opts.idempotencyKey)
  try {
    const r = await fetch(`${cfg.apiUrl}/pix/out/transfers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok || data?.error) {
      return {
        ok: false,
        error: data?.message || data?.error || `Erro no saque PIX [${r.status}]`
      }
    }
    return {
      ok: true,
      data: {
        transactionId: data.transaction_id,
        status: data.status,
        raw: data
      }
    }
  } catch (e) {
    console.error('SarrixPay pixOut:', e)
    return { ok: false, error: e.message }
  }
}

export async function sarrixpayGetTransactions({ transactionId }) {
  const auth = await getAccessToken()
  if (!auth) return { ok: false, error: 'SarrixPay não configurado' }
  const { token, cfg } = auth
  const q = new URLSearchParams({
    client_id: cfg.clientId,
    transaction_id: String(transactionId || '')
  })
  try {
    const r = await fetch(`${cfg.apiUrl}/transactions?${q}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok || data?.error) {
      return {
        ok: false,
        error: data?.message || data?.error || `Erro ao consultar transação [${r.status}]`
      }
    }
    const items = Array.isArray(data.items) ? data.items : []
    const tx = items[0]
    if (!tx) return { ok: false, error: 'Transação não encontrada' }
    return { ok: true, data: tx }
  } catch (e) {
    console.error('SarrixPay getTransactions:', e)
    return { ok: false, error: e.message }
  }
}

export async function sarrixpayBalanceSummary() {
  const auth = await getAccessToken()
  if (!auth) return { ok: false, error: 'SarrixPay não configurado' }
  const { token, cfg } = auth
  try {
    const r = await fetch(`${cfg.apiUrl}/clients/${encodeURIComponent(cfg.clientId)}/balance-summary`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok || data?.error) {
      return {
        ok: false,
        error: data?.message || data?.error || `Erro ao consultar saldo [${r.status}]`
      }
    }
    return { ok: true, data }
  } catch (e) {
    console.error('SarrixPay balanceSummary:', e)
    return { ok: false, error: e.message }
  }
}

/** UUID SarrixPay (transaction_id) — distinto de cuid do Prisma */
export function looksLikeSarrixPayTransactionId(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s || '').trim())
}
