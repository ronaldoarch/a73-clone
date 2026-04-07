/**
 * Format seconds into a human-readable countdown string.
 * e.g. 90061 => "1 dias 01:01:01"
 * e.g. 3661 => "01:01:01"
 */
export function formatCountdown(totalSeconds) {
  if (totalSeconds <= 0) return ''

  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const hh = String(hours).padStart(2, '0')
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')

  if (days > 0) {
    return `${days} dias ${hh}:${mm}:${ss}`
  }
  return `${hh}:${mm}:${ss}`
}

/**
 * Format seconds into [days, hours, minutes, seconds] string array.
 */
export function formatCountdownParts(totalSeconds) {
  if (totalSeconds <= 0) return ['0', '00', '00', '00']

  let days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days <= 0) days = 0

  return [
    String(days),
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0')
  ]
}

/**
 * Format a number as currency (BRL by default).
 */
export function formatCurrency(value, currency = 'BRL', locale = 'pt-BR') {
  const num = Number(value) || 0
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  } catch {
    return `R$ ${num.toFixed(2)}`
  }
}

/**
 * Format a number with locale-appropriate separators.
 */
export function formatNumber(value, decimals = 2, locale = 'pt-BR') {
  const num = Number(value) || 0
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

/**
 * Format a number compactly (e.g. 1.2K, 3.4M).
 */
export function formatCompact(value, locale = 'pt-BR') {
  const num = Number(value) || 0
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
  return String(num)
}

/**
 * Format a date string/timestamp.
 */
export function formatDate(date, format = 'short', locale = 'pt-BR') {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  switch (format) {
    case 'short':
      return d.toLocaleDateString(locale)
    case 'full':
      return d.toLocaleDateString(locale, {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    case 'time':
      return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
    case 'datetime':
      return d.toLocaleDateString(locale, {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      })
    case 'relative':
      return formatRelativeTime(d)
    case 'iso':
      return d.toISOString()
    default:
      return d.toLocaleDateString(locale)
  }
}

/**
 * Format relative time (e.g. "2 horas atrás", "há 3 dias").
 */
export function formatRelativeTime(date) {
  const now = Date.now()
  const d = date instanceof Date ? date : new Date(date)
  const diffMs = now - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Agora mesmo'
  if (diffMin < 60) return `${diffMin} min atrás`
  if (diffHour < 24) return `${diffHour}h atrás`
  if (diffDay < 7) return `${diffDay}d atrás`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} sem atrás`
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} meses atrás`
  return `${Math.floor(diffDay / 365)} anos atrás`
}

/**
 * Format a phone number with mask.
 */
export function formatPhone(phone, mask = '(**) *****-****') {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  let result = mask
  for (const digit of digits) {
    result = result.replace('*', digit)
  }
  return result.replace(/\*/g, '')
}

/**
 * Format CPF with mask: 000.000.000-00.
 */
export function formatCPF(cpf) {
  if (!cpf) return ''
  const digits = cpf.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

/**
 * Mask sensitive data (email, phone, etc.).
 */
export function maskString(str, visibleStart = 3, visibleEnd = 3, maskChar = '*') {
  if (!str || str.length <= visibleStart + visibleEnd) return str
  const start = str.slice(0, visibleStart)
  const end = str.slice(-visibleEnd)
  const masked = maskChar.repeat(Math.max(str.length - visibleStart - visibleEnd, 3))
  return `${start}${masked}${end}`
}

/**
 * Format file size.
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

/**
 * Format a percentage.
 */
export function formatPercent(value, decimals = 1) {
  const num = Number(value) || 0
  return `${num.toFixed(decimals)}%`
}

// --- Enhanced number formatting matching original platform ---

/**
 * Convert cents to amount (divide by 100).
 */
export function centsToAmount(cents, decimals = 2) {
  if (typeof cents === 'string') cents = Number(cents)
  const num = cents / 100
  const factor = Math.pow(10, decimals)
  return Number((Math.round(num * factor) / factor).toFixed(decimals))
}

/**
 * Convert amount to cents (multiply by 100).
 */
export function amountToCents(amount, factor = 100) {
  if (typeof amount === 'string') amount = Number(amount)
  return Number((amount * factor).toFixed(0))
}

/**
 * Format cents as display value.
 */
export function formatCents(cents, decimals = 2) {
  return formatNumber(centsToAmount(cents), decimals)
}

/**
 * Format with currency symbol and optional suffix.
 */
export function formatWithCurrency(value, options = {}) {
  const { fixed = 2, showSuffix = false, suffix = '' } = options
  if (typeof value === 'string') return value
  const formatted = formatNumber(value, fixed)
  return showSuffix ? `${formatted}${suffix}` : formatted
}

/**
 * Format cents with currency display.
 */
export function formatCentsWithCurrency(cents, options = {}) {
  const { fixed = 2, showSuffix = false, suffix = '' } = options
  return formatWithCurrency(centsToAmount(cents, fixed), { fixed, showSuffix, suffix })
}

/**
 * Auto-format a number: integers show no decimals, floats show up to `fixed`.
 */
export function formatAuto(value, options = {}) {
  const { fixed = 2, showSuffix = false, suffix = '' } = options
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (isNaN(parsed)) return value
    value = parsed
  }
  const isInt = Number.isInteger(value)
  const decimals = isInt ? 0 : (typeof fixed === 'number' ? fixed : 2)
  if (!isInt) value = Number(value.toFixed(decimals))
  const formatted = formatNumber(value, decimals)
  return showSuffix ? `${formatted}${suffix}` : formatted
}

/**
 * Get currency symbol from currency code.
 */
export function getCurrencySymbol(currencyCode) {
  try {
    const parts = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'narrowSymbol'
    }).formatToParts(0)
    return parts.find(p => p.type === 'currency')?.value || currencyCode
  } catch {
    return currencyCode
  }
}

/**
 * Generate a random number in range [min, max].
 */
export function randomInRange(min, max) {
  if (min === max) return min
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Break dots in a domain for display (insert zero-width space).
 */
export function breakDomain(domain) {
  const dotPositions = [...domain.matchAll(/\./g)].map(m => m.index)
  let result = domain
  for (let i = dotPositions.length - 1; i >= 0; i--) {
    result = result.slice(0, dotPositions[i] + 1) + '\u200B' + result.slice(dotPositions[i] + 1)
  }
  return result
}

/**
 * Check if a URL has a specific parameter.
 */
export function urlHasParam(url, param) {
  try {
    return new URL(url).searchParams.has(param)
  } catch {
    return false
  }
}

/**
 * Add query parameters to a URL.
 */
export function addUrlParams(url, params) {
  try {
    const urlObj = new URL(url)
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value)
    })
    return urlObj.toString()
  } catch {
    return url
  }
}

/**
 * Get the display name for a language code.
 */
export function getLanguageName(langCode, displayLang) {
  const locale = displayLang ? displayLang.split('-')[0] : 'pt'
  try {
    return new Intl.DisplayNames([locale], { type: 'language' }).of(langCode) || 'Unknown'
  } catch {
    return langCode
  }
}

/**
 * Check if running on mobile device.
 */
export function isMobileUserAgent() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Check if in an in-app browser (Facebook, TikTok, Instagram, etc.).
 */
export function isInAppBrowser() {
  try {
    const ua = navigator.userAgent
    return ['Line/', 'FBAN', 'FBBV', 'FBAV', 'FB_IAB', 'FB4A', 'FBSV',
      'Instagram', 'MicroMessenger', 'Twitter', 'Kakao', 'KAKAO',
      'Tiktok', 'TikTokWebView', 'Kwai', 'KwaiWebView', 'Telegram'
    ].some(token => ua.includes(token))
  } catch {
    return false
  }
}
