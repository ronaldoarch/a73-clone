/**
 * Server error codes used across auth and API responses.
 */

export const ErrorCode = Object.freeze({
  LOGIN_FREEZE: 1001,
  LOGIN_BLACKLIST: 1002,
  TOKEN_INVALID: 1003,
  CPF_INVALID: 10133,
  REAL_NAME_INVALID: 10134,
  BIRTHDAY_INVALID: 10135,
  HAS_UNLOCK_BONUS: 10136,
  FINGERPRINT_INVALID: 10137,
  FINGERPRINT_LIMIT_HOUR: 10139,
  FINGERPRINT_LIMIT_DAY: 10140,
  FINGERPRINT_LIMIT_WEEK: 10141,
  FINGERPRINT_REQUIRED: 10142
})

export const PUBLIC_ROUTES = [
  'vip.info', 'channel.info', 'auth.info', 'tenant.info',
  'tenant.domainInfo', 'carouselConfig.list', 'home.hot',
  'home.list', 'activity.list', 'activity.config',
  'activity.rebateDetail', 'activity.assistanceCashDetail',
  'agency.config', 'announcement.loginOut', 'announcement.loginIn',
  'withdraw.type', 'withdraw.getRealName', 'user.assets',
  'mail.noRead', 'favorite.list', 'avatarCount.avatarCount', 'game.end'
]

/**
 * Check if an error code indicates a frozen/blacklisted account.
 */
export function isAccountBlocked(code) {
  return [ErrorCode.LOGIN_FREEZE, ErrorCode.LOGIN_BLACKLIST].includes(code)
}

/**
 * Check if an error code indicates an expired/invalid token.
 */
export function isTokenError(code) {
  return code === ErrorCode.TOKEN_INVALID
}

/**
 * Check if an error code is fingerprint-related.
 */
export function isFingerprintError(code) {
  return [
    ErrorCode.FINGERPRINT_INVALID,
    ErrorCode.FINGERPRINT_LIMIT_HOUR,
    ErrorCode.FINGERPRINT_LIMIT_DAY,
    ErrorCode.FINGERPRINT_LIMIT_WEEK,
    ErrorCode.FINGERPRINT_REQUIRED
  ].includes(code)
}

/**
 * Check if an error code is registration field validation.
 */
export function isRegistrationFieldError(code) {
  return [
    ErrorCode.CPF_INVALID,
    ErrorCode.REAL_NAME_INVALID,
    ErrorCode.BIRTHDAY_INVALID
  ].includes(code)
}
