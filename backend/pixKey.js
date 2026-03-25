/**
 * Normalização e tipo de chave PIX para saques (Cyber / Gatebox).
 * CPF e celular podem ter 11 dígitos — o tipo deve ser inferido com validação de CPF.
 */

function isValidCpfDigits(d) {
  if (!/^\d{11}$/.test(d)) return false
  if (/^(\d)\1{10}$/.test(d)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(d[i], 10) * (10 - i)
  let r = (sum * 10) % 11
  if (r === 10) r = 0
  if (r !== parseInt(d[9], 10)) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(d[i], 10) * (11 - i)
  r = (sum * 10) % 11
  if (r === 10) r = 0
  return r === parseInt(d[10], 10)
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * @param {string} raw - Chave como digitada (máscara permitida)
 * @returns {{ normalizedKey: string, pixKeyType: 'CPF'|'CNPJ'|'EMAIL'|'PHONE'|'RANDOM' }}
 */
export function parsePixKeyForWithdrawal(raw) {
  const trimmed = String(raw || '').trim()
  if (!trimmed) {
    const err = new Error('Chave PIX obrigatória')
    err.code = 'EMPTY'
    throw err
  }
  if (trimmed.length > 130) {
    const err = new Error('Chave PIX muito longa')
    err.code = 'LONG'
    throw err
  }

  // E-mail
  if (trimmed.includes('@')) {
    const email = trimmed.replace(/\s/g, '').toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const err = new Error('E-mail PIX inválido')
      err.code = 'BAD_EMAIL'
      throw err
    }
    return { normalizedKey: email, pixKeyType: 'EMAIL' }
  }

  // Chave aleatória (UUID)
  if (UUID_RE.test(trimmed)) {
    return { normalizedKey: trimmed.toLowerCase(), pixKeyType: 'RANDOM' }
  }
  if (/^[0-9a-f]{32}$/i.test(trimmed)) {
    return { normalizedKey: trimmed.toLowerCase(), pixKeyType: 'RANDOM' }
  }

  const digits = trimmed.replace(/\D/g, '')

  // Só dígitos: CPF, CNPJ, telefone
  if (digits.length === 14) {
    return { normalizedKey: digits, pixKeyType: 'CNPJ' }
  }

  if (digits.length === 13 && digits.startsWith('55')) {
    const national = digits.slice(2)
    if (national.length === 11) {
      return { normalizedKey: national, pixKeyType: 'PHONE' }
    }
  }

  if (digits.length === 12 && digits.startsWith('55')) {
    const national = digits.slice(2)
    if (national.length === 10) {
      return { normalizedKey: national, pixKeyType: 'PHONE' }
    }
  }

  if (digits.length === 11) {
    if (isValidCpfDigits(digits)) {
      return { normalizedKey: digits, pixKeyType: 'CPF' }
    }
    return { normalizedKey: digits, pixKeyType: 'PHONE' }
  }

  if (digits.length === 10) {
    return { normalizedKey: digits, pixKeyType: 'PHONE' }
  }

  // Texto alfanumérico (EVP legada ou outro formato)
  if (/^[a-zA-Z0-9._-]{8,64}$/.test(trimmed)) {
    return { normalizedKey: trimmed, pixKeyType: 'RANDOM' }
  }

  const err = new Error('Chave PIX não reconhecida (use CPF, CNPJ, e-mail, telefone com DDD ou chave aleatória)')
  err.code = 'UNKNOWN'
  throw err
}
