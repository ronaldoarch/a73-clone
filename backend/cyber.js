/**
 * Cyber Payment API v1.5.0 - Gateway de pagamentos
 * https://api.escalecyber.com/v1
 * Autenticação: X-API-Key
 */
import crypto from 'crypto'

const CYBER_API = 'https://api.escalecyber.com/v1'

let _prisma = null
function setPrisma(p) { _prisma = p }

/** Cache de config para evitar DB hit a cada request — TTL 60s */
let _cfgCache = null
let _cfgCacheAt = 0

async function getCyberConfig() {
  if (_cfgCache && Date.now() - _cfgCacheAt < 60_000) return _cfgCache
  if (!_prisma) return null
  try {
    const s = await _prisma.setting.findUnique({ where: { id: 'cyber' } })
    const v = s?.value
    if (v && typeof v === 'object' && v.apiKey) {
      _cfgCache = {
        apiKey: v.apiKey,
        apiUrl: (v.apiUrl || CYBER_API).replace(/\/$/, '')
      }
      _cfgCacheAt = Date.now()
      return _cfgCache
    }
  } catch (e) {}
  return null
}

/** Invalida o cache de config (chamar após salvar settings do Cyber) */
export function invalidateCyberConfigCache() {
  _cfgCache = null
  _cfgCacheAt = 0
}

/**
 * Valida assinatura HMAC-SHA256 do webhook
 * O header X-Webhook-Signature contém HMAC-SHA256(rawBody, secret) em hex
 * O secret pode vir com prefixo "whsec_" que é removido antes do cálculo
 */
export function verifyWebhookSignature(rawBody, signature, secret) {
  if (!secret || !signature) return false
  try {
    const key = secret.replace(/^whsec_/, '')
    const expected = crypto.createHmac('sha256', key).update(rawBody).digest('hex')
    // Aceita com ou sem prefixo "sha256="
    const sig = signature.replace(/^sha256=/, '')
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

/**
 * Criar transação PIX — retorna QR Code e código copia e cola
 */
export async function cyberCreatePix({ amount, document, name, email, phone, description, metadata = {} }) {
  const cfg = await getCyberConfig()
  if (!cfg) return { ok: false, error: 'Cyber Payment não configurado' }

  const doc = String(document || '').replace(/\D/g, '')
  const docType = doc.length === 14 ? 'cnpj' : 'cpf'
  const phoneRaw = String(phone || '').replace(/\D/g, '')
  const phoneIntl = phoneRaw.length >= 10 ? (phoneRaw.startsWith('55') ? phoneRaw : '55' + phoneRaw) : '5511999999999'

  try {
    const body = {
      amount: parseFloat(amount),
      customerDocument: doc,
      customerDocumentType: docType,
      customerName: String(name || '').slice(0, 100),
      customerEmail: String(email || 'noreply@pix.deposit').slice(0, 100),
      customerPhone: phoneIntl,
      description: String(description || 'Depósito').slice(0, 200),
      metadata
    }
    const r = await fetch(`${cfg.apiUrl}/payments/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': cfg.apiKey },
      body: JSON.stringify(body)
    })
    const data = await r.json()
    // OpenAPI: 201 + { success, data }; erros: { error: true, message }
    if (data?.error === true && data?.message) {
      return { ok: false, error: data.message }
    }
    if (!data?.success || !data?.data) {
      return { ok: false, error: data?.message || (typeof data?.error === 'string' ? data.error : null) || `Erro ao criar PIX [${r.status}]` }
    }
    const d = data.data
    const pix = d.pix || {}
    const qrCode = pix.qrCode || {}
    const copyPaste = qrCode.emv || ''
    const rawImg = qrCode.image || ''
    const qrcode = rawImg ? (rawImg.startsWith('data:') ? rawImg : `data:image/png;base64,${rawImg}`) : null
    return {
      ok: true,
      data: {
        id: d.id,
        externalId: d.external_id,
        transactionId: d.id,
        copyPaste,
        qrcode,
        status: d.status,
        expireAt: pix.expirationDate ? new Date(pix.expirationDate * 1000).toISOString() : null
      }
    }
  } catch (e) {
    console.error('Cyber createPix:', e)
    return { ok: false, error: e.message }
  }
}

/**
 * Buscar transação PIX por ID
 */
export async function cyberGetTransaction(transactionId) {
  const cfg = await getCyberConfig()
  if (!cfg) return { ok: false, error: 'Cyber Payment não configurado' }
  try {
    const r = await fetch(`${cfg.apiUrl}/payments/transactions/${transactionId}`, {
      headers: { 'X-API-Key': cfg.apiKey }
    })
    const data = await r.json()
    if (data?.error === true && data?.message) {
      return { ok: false, error: data.message }
    }
    if (!data?.success || !data?.data) {
      return { ok: false, error: data?.message || 'Transação não encontrada' }
    }
    return { ok: true, data: data.data }
  } catch (e) {
    console.error('Cyber getTransaction:', e)
    return { ok: false, error: e.message }
  }
}

/**
 * Criar solicitação de saque PIX
 * Retorna { ok, data: { withdrawalId, status, ... } }
 */
export async function cyberWithdraw({ amount, pixKey, pixKeyType, description }) {
  const cfg = await getCyberConfig()
  if (!cfg) return { ok: false, error: 'Cyber Payment não configurado' }

  const typeMap = {
    cpf: 'CPF', cnpj: 'CNPJ', email: 'EMAIL',
    phone: 'PHONE', telefone: 'PHONE', random: 'RANDOM', evp: 'RANDOM'
  }
  const keyType = typeMap[String(pixKeyType || '').toLowerCase()] || 'CPF'

  try {
    const body = {
      amount: parseFloat(amount),
      pixKey: String(pixKey).trim(),
      pixKeyType: keyType,
      description: String(description || 'Saque').slice(0, 200)
    }
    const r = await fetch(`${cfg.apiUrl}/payments/withdrawals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': cfg.apiKey },
      body: JSON.stringify(body)
    })
    const data = await r.json()
    if (data?.error === true && data?.message) {
      return { ok: false, error: data.message }
    }
    if (!data?.success || !data?.data) {
      return { ok: false, error: data?.message || (typeof data?.error === 'string' ? data.error : null) || `Erro ao criar saque [${r.status}]` }
    }
    const d = data.data
    return {
      ok: true,
      data: {
        withdrawalId: d.id || d.withdrawal_id,
        transactionId: d.transactionId || d.transaction_id,
        status: d.status,
        amount: d.amount,
        netAmount: d.netAmount || d.net_amount
      }
    }
  } catch (e) {
    console.error('Cyber withdraw:', e)
    return { ok: false, error: e.message }
  }
}

/**
 * Buscar saque por ID (wd_...) — OpenAPI lista com paginação (default limit=10); percorre páginas.
 */
export async function cyberGetWithdrawal(withdrawalId) {
  const cfg = await getCyberConfig()
  if (!cfg) return { ok: false, error: 'Cyber Payment não configurado' }
  const limit = 100
  let page = 1
  try {
    while (page <= 50) {
      const r = await fetch(`${cfg.apiUrl}/payments/withdrawals?limit=${limit}&page=${page}`, {
        headers: { 'X-API-Key': cfg.apiKey }
      })
      const data = await r.json()
      if (data?.error === true && data?.message) {
        return { ok: false, error: data.message }
      }
      if (!data?.success) return { ok: false, error: data?.message || 'Erro ao listar saques' }
      const list = Array.isArray(data.data) ? data.data : []
      const item = list.find(w => (w.id || w.withdrawal_id) === withdrawalId)
      if (item) return { ok: true, data: item }
      if (list.length < limit) break
      page++
    }
    return { ok: false, error: 'Saque não encontrado' }
  } catch (e) {
    console.error('Cyber getWithdrawal:', e)
    return { ok: false, error: e.message }
  }
}

/**
 * Consultar saldo disponível
 */
export async function cyberBalance() {
  const cfg = await getCyberConfig()
  if (!cfg) return { ok: false, error: 'Cyber Payment não configurado' }
  try {
    const r = await fetch(`${cfg.apiUrl}/organizations/balance`, {
      headers: { 'X-API-Key': cfg.apiKey }
    })
    const data = await r.json()
    if (data?.error === true && data?.message) {
      return { ok: false, error: data.message }
    }
    if (!data?.success) return { ok: false, error: data?.message || 'Erro ao consultar saldo' }
    return { ok: true, data: data.data }
  } catch (e) {
    console.error('Cyber balance:', e)
    return { ok: false, error: e.message }
  }
}

export { setPrisma }
