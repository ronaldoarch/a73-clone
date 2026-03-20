/**
 * Cyber Payment API - Gateway de pagamentos (PIX, Boleto, Cartão)
 * https://api.escalecyber.com/v1
 * Autenticação: X-API-Key
 */
const CYBER_API = 'https://api.escalecyber.com/v1'

let _prisma = null
function setPrisma(p) { _prisma = p }

async function getCyberConfig() {
  if (!_prisma) return null
  try {
    const s = await _prisma.setting.findUnique({ where: { id: 'cyber' } })
    const v = s?.value
    if (v && typeof v === 'object' && v.apiKey) {
      return {
        apiKey: v.apiKey,
        apiUrl: (v.apiUrl || CYBER_API).replace(/\/$/, '')
      }
    }
  } catch (e) {}
  return null
}

export { setPrisma }

/**
 * Criar transação PIX - retorna QR Code e código copia e cola
 */
export async function cyberCreatePix({ amount, document, name, email, phone, description, metadata = {} }) {
  const cfg = await getCyberConfig()
  if (!cfg) return { ok: false, error: 'Cyber Payment não configurado' }
  const doc = String(document || '').replace(/\D/g, '')
  const docType = doc.length === 11 ? 'cpf' : 'cnpj'
  const phoneFormatted = String(phone || '').replace(/\D/g, '')
  const phoneIntl = phoneFormatted.length >= 10 ? '55' + phoneFormatted : '5511999999999'
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
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': cfg.apiKey
      },
      body: JSON.stringify(body)
    })
    const data = await r.json()
    if (!data?.success || !data?.data) {
      return { ok: false, error: data?.message || data?.error || 'Erro ao criar PIX' }
    }
    const d = data.data
    const pix = d.pix || {}
    const qrCode = pix.qrCode || {}
    const copyPaste = qrCode.emv || ''
    const qrcode = qrCode.image || (typeof qrCode.emv === 'string' ? null : '')
    return {
      ok: true,
      data: {
        id: d.id,
        external_id: d.external_id,
        transactionId: d.id,
        copyPaste,
        qrcode: qrcode ? (qrcode.startsWith('data:') ? qrcode : `data:image/png;base64,${qrcode}`) : null,
        status: d.status
      }
    }
  } catch (e) {
    console.error('Cyber create PIX:', e)
    return { ok: false, error: e.message }
  }
}

/**
 * Buscar transação por ID
 */
export async function cyberGetTransaction(transactionId) {
  const cfg = await getCyberConfig()
  if (!cfg) return { ok: false, error: 'Cyber Payment não configurado' }
  try {
    const r = await fetch(`${cfg.apiUrl}/payments/transactions/${transactionId}`, {
      method: 'GET',
      headers: { 'X-API-Key': cfg.apiKey }
    })
    const data = await r.json()
    if (!data?.success || !data?.data) {
      return { ok: false, error: data?.message || 'Transação não encontrada' }
    }
    return { ok: true, data: data.data }
  } catch (e) {
    console.error('Cyber get transaction:', e)
    return { ok: false, error: e.message }
  }
}

/**
 * Criar saque PIX
 */
export async function cyberWithdraw({ amount, pixKey, pixKeyType, description }) {
  const cfg = await getCyberConfig()
  if (!cfg) return { ok: false, error: 'Cyber Payment não configurado' }
  const typeMap = { cpf: 'CPF', cnpj: 'CNPJ', email: 'EMAIL', phone: 'PHONE', telefone: 'PHONE' }
  const keyType = typeMap[String(pixKeyType || 'cpf').toLowerCase()] || 'CPF'
  try {
    const body = {
      amount: parseFloat(amount),
      pixKey: String(pixKey).trim(),
      pixKeyType: keyType,
      description: String(description || 'Saque').slice(0, 200)
    }
    const r = await fetch(`${cfg.apiUrl}/payments/withdrawals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': cfg.apiKey
      },
      body: JSON.stringify(body)
    })
    const data = await r.json()
    if (!data?.success) {
      return { ok: false, error: data?.message || data?.error || 'Erro ao criar saque' }
    }
    return { ok: true, data: data.data }
  } catch (e) {
    console.error('Cyber withdraw:', e)
    return { ok: false, error: e.message }
  }
}

/**
 * Consultar saldo
 */
export async function cyberBalance() {
  const cfg = await getCyberConfig()
  if (!cfg) return { ok: false, error: 'Cyber Payment não configurado' }
  try {
    const r = await fetch(`${cfg.apiUrl}/organizations/balance`, {
      method: 'GET',
      headers: { 'X-API-Key': cfg.apiKey }
    })
    const data = await r.json()
    if (!data?.success) return { ok: false, error: data?.message || 'Erro ao consultar saldo' }
    return { ok: true, data: data.data }
  } catch (e) {
    console.error('Cyber balance:', e)
    return { ok: false, error: e.message }
  }
}
