/**
 * Validation schemas and utilities.
 * Uses both lightweight custom validators and Zod for typed schema validation.
 */
import { z } from 'zod'

export const zodSchemas = {
  login: z.object({
    phone: z.string().min(10).max(15).regex(/^\d+$/),
    password: z.string().min(6).max(20)
  }),
  register: z.object({
    phone: z.string().min(10).max(15).regex(/^\d+$/),
    password: z.string().min(8).max(16).regex(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z]/),
    confirmPassword: z.string()
  }).refine(d => d.password === d.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword']
  }),
  deposit: z.object({
    valor: z.number().min(10).max(100000),
    cpf: z.string().length(11).regex(/^\d+$/),
    nome: z.string().min(3).max(100)
  }),
  withdraw: z.object({
    amount: z.number().positive(),
    pixKey: z.string().min(1),
    password: z.string().min(6).optional()
  }),
  profile: z.object({
    name: z.string().min(2).max(50).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(10).max(15).regex(/^\d+$/).optional()
  })
}

export function zodValidate(schema, data) {
  const result = schema.safeParse(data)
  if (result.success) return { valid: true, data: result.data, errors: {} }
  const errors = {}
  result.error.issues.forEach(issue => {
    const path = issue.path.join('.')
    errors[path] = issue.message
  })
  return { valid: false, data: null, errors }
}

export class ValidationError extends Error {
  constructor(field, message) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

function required(value, fieldName) {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(fieldName, `${fieldName} é obrigatório`)
  }
  return value
}

function minLength(value, min, fieldName) {
  if (typeof value === 'string' && value.length < min) {
    throw new ValidationError(fieldName, `${fieldName} deve ter pelo menos ${min} caracteres`)
  }
  return value
}

function maxLength(value, max, fieldName) {
  if (typeof value === 'string' && value.length > max) {
    throw new ValidationError(fieldName, `${fieldName} deve ter no máximo ${max} caracteres`)
  }
  return value
}

function minValue(value, min, fieldName) {
  if (typeof value === 'number' && value < min) {
    throw new ValidationError(fieldName, `${fieldName} deve ser no mínimo ${min}`)
  }
  return value
}

function maxValue(value, max, fieldName) {
  if (typeof value === 'number' && value > max) {
    throw new ValidationError(fieldName, `${fieldName} deve ser no máximo ${max}`)
  }
  return value
}

function matchesPattern(value, pattern, fieldName, message) {
  if (typeof value === 'string' && !pattern.test(value)) {
    throw new ValidationError(fieldName, message || `${fieldName} está em formato inválido`)
  }
  return value
}

// --- Common validators ---

export function validateAccount(account) {
  required(account, 'Conta')
  minLength(account, 4, 'Conta')
  maxLength(account, 20, 'Conta')
  matchesPattern(account, /^[a-zA-Z0-9_]+$/, 'Conta', 'Conta deve conter apenas letras, números e _')
  return true
}

export function validatePassword(password) {
  required(password, 'Senha')
  minLength(password, 6, 'Senha')
  maxLength(password, 20, 'Senha')
  return true
}

export function validatePhone(phone) {
  required(phone, 'Telefone')
  const cleaned = phone.replace(/\D/g, '')
  minLength(cleaned, 10, 'Telefone')
  maxLength(cleaned, 15, 'Telefone')
  return true
}

export function validateEmail(email) {
  required(email, 'E-mail')
  matchesPattern(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'E-mail', 'E-mail inválido')
  return true
}

export function validateCPF(cpf) {
  required(cpf, 'CPF')
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) {
    throw new ValidationError('CPF', 'CPF deve ter 11 dígitos')
  }
  if (/^(\d)\1{10}$/.test(cleaned)) {
    throw new ValidationError('CPF', 'CPF inválido')
  }
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i)
  let check = 11 - (sum % 11)
  if (check >= 10) check = 0
  if (parseInt(cleaned[9]) !== check) throw new ValidationError('CPF', 'CPF inválido')

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i)
  check = 11 - (sum % 11)
  if (check >= 10) check = 0
  if (parseInt(cleaned[10]) !== check) throw new ValidationError('CPF', 'CPF inválido')

  return true
}

export function validateCNPJ(cnpj) {
  required(cnpj, 'CNPJ')
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length !== 14) {
    throw new ValidationError('CNPJ', 'CNPJ deve ter 14 dígitos')
  }
  return true
}

export function validateAmount(amount, min = 0, max = Infinity) {
  const num = Number(amount)
  if (isNaN(num)) throw new ValidationError('Valor', 'Valor inválido')
  minValue(num, min, 'Valor')
  maxValue(num, max, 'Valor')
  return true
}

export function validatePixKey(key, type = 'cpf') {
  required(key, 'Chave PIX')
  switch (type) {
    case 'cpf':
      return validateCPF(key)
    case 'cnpj':
      return validateCNPJ(key)
    case 'email':
      return validateEmail(key)
    case 'phone':
      return validatePhone(key)
    case 'random':
      matchesPattern(key, /^[a-zA-Z0-9-]{32,36}$/, 'Chave PIX', 'Chave aleatória inválida')
      return true
    default:
      return true
  }
}

// --- Payment validation schemas ---

export const PaymentLimitSchema = {
  validate(data) {
    const errors = []
    const { limitType, timesType, times, payAmountLimit, minAmount, maxAmount } = data

    if (!['NO_LIMIT', 'ANY_ONE', 'ALL_MATCH'].includes(limitType)) {
      errors.push({ field: 'limitType', message: 'Tipo de limite inválido' })
    }
    if (timesType && !['>', '<'].includes(timesType)) {
      errors.push({ field: 'timesType', message: 'Tipo de comparação inválido' })
    }
    if (times !== undefined && (typeof times !== 'number' || times < 0)) {
      errors.push({ field: 'times', message: 'Número de vezes inválido' })
    }
    if (minAmount !== undefined && maxAmount !== undefined && minAmount > maxAmount) {
      errors.push({ field: 'amount', message: 'Valor mínimo não pode ser maior que o máximo' })
    }

    return { valid: errors.length === 0, errors }
  }
}

export const AutoUpgradeSchema = {
  validate(data) {
    const errors = []
    const { switch: sw, interval, minSuccessRate, orderMaxTimes, orderSuccessTimes } = data

    if (!['OFF', 'ON'].includes(sw)) {
      errors.push({ field: 'switch', message: 'Status inválido' })
    }
    if (interval !== undefined && (typeof interval !== 'number' || interval < 1)) {
      errors.push({ field: 'interval', message: 'Intervalo deve ser pelo menos 1 minuto' })
    }
    if (minSuccessRate !== undefined && (minSuccessRate < 0 || minSuccessRate > 100)) {
      errors.push({ field: 'minSuccessRate', message: 'Taxa de sucesso deve ser entre 0 e 100' })
    }

    return { valid: errors.length === 0, errors }
  }
}

// --- Form validation helper ---

export function validateForm(fields) {
  const errors = {}
  let isValid = true

  for (const [name, { value, validators }] of Object.entries(fields)) {
    for (const validator of validators) {
      try {
        validator(value)
      } catch (e) {
        if (e instanceof ValidationError) {
          errors[name] = e.message
          isValid = false
          break
        }
        throw e
      }
    }
  }

  return { valid: isValid, errors }
}

/**
 * Create a validator function for a specific field.
 */
export function createValidator(...rules) {
  return (value) => {
    for (const rule of rules) {
      try {
        rule(value)
      } catch (e) {
        if (e instanceof ValidationError) return e.message
        throw e
      }
    }
    return null
  }
}

// --- Country-specific phone validation ---

const PHONE_LENGTH_BY_COUNTRY = {
  IN: [10, 10],
  ID: [9, 12],
  BR: [11, 11],
  PH: [10, 10],
  VN: [9, 9],
  JP: [10, 10],
  KR: [10, 10],
  TH: [9, 9],
  MY: [9, 10],
  SG: [8, 8],
  MM: [8, 10],
  KH: [8, 9],
  LA: [9, 10],
  BD: [10, 10],
  PK: [10, 10],
  NP: [10, 10],
  LK: [9, 9]
}

export function getPhoneLengthForCountry(countryCode) {
  const range = PHONE_LENGTH_BY_COUNTRY[countryCode]
  return range ? { min: range[0], max: range[1] } : { min: 7, max: 15 }
}

export function validatePhoneByCountry(phone, countryCode = 'BR') {
  required(phone, 'Telefone')
  const cleaned = phone.replace(/\D/g, '')
  const { min, max } = getPhoneLengthForCountry(countryCode)
  if (cleaned.length < min || cleaned.length > max) {
    throw new ValidationError('Telefone', `Telefone deve ter entre ${min} e ${max} dígitos`)
  }

  const countryValidators = {
    BR: (p) => /^[1-9]\d{10}$/.test(p),
    PH: (p) => /^9\d{9}$/.test(p)
  }

  const validator = countryValidators[countryCode]
  if (validator && !validator(cleaned)) {
    throw new ValidationError('Telefone', 'Número de telefone inválido para este país')
  }
  return true
}

export function validateAccountName(account) {
  required(account, 'Conta')
  if (!/^[a-zA-Z0-9]{4,19}$/.test(account)) {
    throw new ValidationError('Conta', 'Conta deve ter 4-19 caracteres alfanuméricos')
  }
  return true
}

export function validateLoginPassword(password) {
  required(password, 'Senha')
  if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z][a-zA-Z0-9]{7,15}$/.test(password)) {
    throw new ValidationError('Senha', 'Senha deve ter 8-16 caracteres, começar com letra, conter letras e números')
  }
  return true
}

export function validateAssetPassword(password) {
  required(password, 'Senha de segurança')
  if (password.length < 6 || password.length > 16 || /\s/.test(password)) {
    throw new ValidationError('Senha de segurança', 'Senha de segurança deve ter 6-16 caracteres sem espaços')
  }
  return true
}

export function validateRealName(name) {
  required(name, 'Nome real')
  const trimmed = name.trim()
  if (!trimmed || trimmed.length < 2 || trimmed.length > 50) {
    throw new ValidationError('Nome real', 'Nome deve ter entre 2 e 50 caracteres')
  }
  if (!/^[\p{L}\p{M}\s]*$/u.test(trimmed)) {
    throw new ValidationError('Nome real', 'Nome contém caracteres inválidos')
  }
  // Reject emojis
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B55}]/u.test(trimmed)) {
    throw new ValidationError('Nome real', 'Nome não pode conter emojis')
  }
  return true
}

export function validateIFSC(code) {
  required(code, 'IFSC')
  if (!/^[A-Z]{4}0[a-zA-Z0-9]{6}$/.test(code)) {
    throw new ValidationError('IFSC', 'Código IFSC inválido')
  }
  return true
}

export function validateUPI(upi) {
  required(upi, 'UPI')
  if (!/^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9.\-_]+$/.test(upi)) {
    throw new ValidationError('UPI', 'ID UPI inválido')
  }
  return true
}

export function validateEVP(evp) {
  required(evp, 'EVP')
  if (!/^\d{1,64}$/.test(evp)) {
    throw new ValidationError('EVP', 'Chave EVP inválida')
  }
  return true
}

export function validateUUID(uuid) {
  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid)) {
    throw new ValidationError('UUID', 'UUID inválido')
  }
  return true
}
