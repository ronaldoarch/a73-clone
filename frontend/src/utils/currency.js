import Decimal from 'decimal.js'
import { useSystemStore } from '../stores/system'

export function formatCurrencyDisplay(amountInCents) {
  const system = useSystemStore()
  const { tenantInfo } = system
  const amount = centsToAmount(amountInCents)
  const formatted = formatAmount(amount)

  if (tenantInfo?.isVirtualCurrency && tenantInfo?.currencyConfig) {
    const config = parseCurrencyConfig(tenantInfo.currencyConfig)
    if (config.currentType === 'prefixIcon' && config.prefixIcon) {
      return `<img src="${config.prefixIcon}" style="width:0.875rem;height:0.875rem;vertical-align:middle;margin-right:0.125rem" />${formatted}`
    }
    if (config.currentType === 'suffixSymbol' && config.suffixSymbol) {
      return `${formatted} ${config.suffixSymbol}`
    }
  }

  const symbol = tenantInfo?.merchantCy || tenantInfo?.currencySymbol || 'R$'
  return `${symbol} ${formatted}`
}

export function formatAmountWithSymbol(amount, symbol) {
  const sym = symbol || getMerchantCurrency()
  return `${sym} ${formatAmount(amount)}`
}

export function getMerchantCurrency() {
  try {
    const system = useSystemStore()
    return system.tenantInfo?.merchantCy || system.tenantInfo?.currencySymbol || 'R$'
  } catch {
    return 'R$'
  }
}

export function centsToAmount(cents) {
  if (cents == null || isNaN(cents)) return 0
  return new Decimal(cents).div(100).toNumber()
}

export function amountToCents(amount) {
  if (amount == null || isNaN(amount)) return 0
  return new Decimal(amount).mul(100).round().toNumber()
}

export function safeAdd(...values) {
  return values.reduce((acc, v) => acc.plus(new Decimal(v || 0)), new Decimal(0)).toNumber()
}

export function safeMul(a, b) {
  return new Decimal(a || 0).mul(new Decimal(b || 0)).toNumber()
}

export function safeDiv(a, b) {
  if (!b) return 0
  return new Decimal(a || 0).div(new Decimal(b)).toNumber()
}

export function formatAmount(value) {
  const num = Number(value) || 0
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export function formatCompactAmount(value) {
  const num = Number(value) || 0
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
  return formatAmount(num)
}

export function parseCurrencyConfig(configStr) {
  const defaults = { currentType: '', suffixSymbol: '', prefixIcon: '' }
  try {
    if (!configStr) return defaults
    const parsed = JSON.parse(configStr)
    return {
      currentType: parsed.currentType || '',
      prefixIcon: parsed.currentType === 'prefixIcon' ? (parsed.prefixIcon || '') : '',
      suffixSymbol: parsed.currentType === 'suffixSymbol' ? (parsed.suffixSymbol || '') : ''
    }
  } catch {
    return defaults
  }
}

export function formatPercent(value, decimals = 0) {
  return `${(Number(value) || 0).toFixed(decimals)}%`
}

export function ratioToPercent(ratio) {
  return (Number(ratio) || 0) / 100
}
