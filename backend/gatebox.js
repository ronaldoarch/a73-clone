/**
 * Gatebox API - Gateway de pagamento PIX
 * https://api.gatebox.com.br
 */
const GATEBOX_API = 'https://api.gatebox.com.br'

let cachedToken = null
let tokenExpiry = 0

let _prisma = null
function setPrisma(p) { _prisma = p }

async function getGateboxConfig() {
  if (!_prisma) return null
  try {
    const s = await _prisma.setting.findUnique({ where: { id: 'gatebox' } })
    const v = s?.value
    if (v && typeof v === 'object' && v.username && v.password) {
      return {
        apiUrl: (v.apiUrl || GATEBOX_API).replace(/\/$/, ''),
        username: v.username,
        password: v.password
      }
    }
  } catch (e) {}
  return null
}

export { setPrisma }

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken
  const cfg = await getGateboxConfig()
  if (!cfg) return null
  try {
    const r = await fetch(`${cfg.apiUrl}/v1/customers/auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cfg.username, password: cfg.password })
    })
    const data = await r.json()
    if (data?.access_token) {
      cachedToken = data.access_token
      tokenExpiry = Date.now() + 50 * 60 * 1000 // 50 min
      return cachedToken
    }
  } catch (e) {
    console.error('Gatebox auth:', e)
  }
  return null
}

export async function gateboxCreatePix({ externalId, amount, document, name, email, phone, identification, description, expire = 3600 }) {
  const token = await getToken()
  if (!token) return { ok: false, error: 'Gatebox não configurado' }
  const cfg = await getGateboxConfig()
  try {
    const body = {
      externalId: String(externalId),
      amount: parseFloat(amount),
      expire: Math.min(expire, 86400)
    }
    if (document && name) {
      const doc = String(document).replace(/\D/g, '')
      if (doc.length >= 11) {
        body.document = doc
        body.name = String(name).slice(0, 100)
      }
    }
    if (email) body.email = String(email)
    if (phone) body.phone = String(phone)
    if (identification) body.identification = String(identification)
    if (description) body.description = String(description)
    const r = await fetch(`${cfg.apiUrl}/v1/customers/pix/create-immediate-qrcode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    })
    const data = await r.json()
    if (!r.ok) return { ok: false, error: data?.message || data?.error || 'Erro ao criar PIX' }
    return { ok: true, data }
  } catch (e) {
    console.error('Gatebox create PIX:', e)
    return { ok: false, error: e.message }
  }
}

export async function gateboxPixStatus({ transactionId, externalId, endToEnd }) {
  const token = await getToken()
  if (!token) return { ok: false, error: 'Gatebox não configurado' }
  const cfg = await getGateboxConfig()
  const params = new URLSearchParams()
  if (transactionId) params.set('transactionId', transactionId)
  if (externalId) params.set('externalId', externalId)
  if (endToEnd) params.set('endToEnd', endToEnd)
  try {
    const r = await fetch(`${cfg.apiUrl}/v1/customers/pix/status?${params}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await r.json()
    if (!r.ok) return { ok: false, error: data?.message || 'Erro ao consultar' }
    return { ok: true, data }
  } catch (e) {
    console.error('Gatebox status:', e)
    return { ok: false, error: e.message }
  }
}

export async function gateboxWithdraw({ externalId, key, name, amount, documentNumber, description }) {
  const token = await getToken()
  if (!token) return { ok: false, error: 'Gatebox não configurado' }
  const cfg = await getGateboxConfig()
  try {
    const body = {
      externalId: String(externalId),
      key: String(key).trim(),
      name: String(name),
      amount: parseFloat(amount)
    }
    if (documentNumber) body.documentNumber = String(documentNumber).replace(/\D/g, '')
    if (description) body.description = String(description)
    const r = await fetch(`${cfg.apiUrl}/v1/customers/pix/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    })
    const data = await r.json()
    if (!r.ok) return { ok: false, error: data?.message || data?.error || 'Erro no saque' }
    return { ok: true, data }
  } catch (e) {
    console.error('Gatebox withdraw:', e)
    return { ok: false, error: e.message }
  }
}

export async function gateboxBalance() {
  const token = await getToken()
  if (!token) return { ok: false, error: 'Gatebox não configurado' }
  const cfg = await getGateboxConfig()
  try {
    const r = await fetch(`${cfg.apiUrl}/v1/customers/account/balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    })
    const data = await r.json()
    if (!r.ok) return { ok: false, error: data?.message || 'Erro ao consultar saldo' }
    return { ok: true, data }
  } catch (e) {
    console.error('Gatebox balance:', e)
    return { ok: false, error: e.message }
  }
}
