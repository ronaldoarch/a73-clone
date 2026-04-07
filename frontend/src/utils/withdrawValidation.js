/**
 * Withdraw validation and financial amount helpers.
 * Validates withdrawal amounts against user balance and platform limits.
 */

/**
 * Cents to decimal amount conversion.
 * @param {number} cents
 * @returns {number}
 */
export function centsToDecimal(cents) {
  return Number(cents) / 100
}

/**
 * Validate a withdrawal amount against constraints.
 * @param {string|number} amount - The requested withdrawal amount
 * @param {Object} constraints
 * @param {number} constraints.balance - User's current balance (in cents)
 * @param {number} constraints.minAmount - Minimum withdrawal (in cents)
 * @param {number} constraints.maxAmount - Maximum withdrawal (in cents)
 * @returns {{ valid: boolean, errorKey?: string }}
 */
export function validateWithdrawAmount(amount, constraints) {
  const { balance, minAmount, maxAmount } = constraints

  if (!Number.isInteger(Number(amount))) {
    return { valid: false, errorKey: 'toast.0003' }
  }

  const amountCents = centsToDecimal(amount)

  if (!balance || balance < amountCents) {
    return { valid: false, errorKey: 'toast.insufficientAccountBalance' }
  }

  if (amountCents < minAmount) {
    return { valid: false, errorKey: 'toast.withdrawalAmountTooSmall' }
  }

  if (amountCents > maxAmount) {
    return { valid: false, errorKey: 'toast.withdrawalAmountTooLarge' }
  }

  return { valid: true }
}

/**
 * Withdraw tab/view type constants.
 */
export const WithdrawView = Object.freeze({
  WITHDRAW: 1,
  WITHDRAW_RECORD: 2,
  WITHDRAW_AUDIT: 3
})

/**
 * Check if user needs to set an asset password before withdrawing.
 * @param {Object} assets - User assets data
 * @param {Object} tenantInfo - Tenant configuration
 * @returns {{ needsPassword: boolean, route?: string }}
 */
export function checkWithdrawPassword(assets, tenantInfo) {
  if (!assets) return { needsPassword: false }

  const switchOn = !assets.passwordSwitch || assets.passwordSwitch === 'ON'
  if (switchOn && !assets.isAssetPassword) {
    const method = tenantInfo?.withdrawPasswordAuthMethod
    const route = method === 'NONE' ? '/withdrawPW' : '/security/verify/asset'
    return { needsPassword: true, route }
  }

  return { needsPassword: false }
}

/**
 * Format money for display with decimal places.
 * @param {number} value
 * @param {number} [decimals=2]
 * @returns {string}
 */
export function formatMoney(value, decimals = 2) {
  const num = Number(value)
  if (Number.isNaN(num)) return '0.00'
  return num.toFixed(decimals)
}

/**
 * Percentage formatter.
 * @param {number} value - e.g., 0.15 for 15%
 * @param {number} [decimals=2]
 * @returns {string}
 */
export function formatPercent(value, decimals = 2) {
  return `${(Number(value) * 100).toFixed(decimals)}%`
}
