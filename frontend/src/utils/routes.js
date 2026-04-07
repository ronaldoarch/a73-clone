/**
 * Application route constants and navigation helpers.
 * Centralizes all route paths used across the app.
 */

export const Routes = Object.freeze({
  HOME: '/',
  LAUNCH: '/launch',
  PROMO: '/main/promo',
  PROFILE: '/main/perfil',
  RECHARGE: '/main/entrar',
  RECHARGE_APPLY: '/recharge/apply',
  WITHDRAW: '/main/withdraw',
  WITHDRAW_APPLY: '/withdraw/apply',
  VIP: '/activity/vip',
  SPREAD: '/spread',
  MLM_AGENT: '/mlmAgent',
  REDEEM: '/Redeem',
  LOGIN: '/login',
  REGISTER: '/register',
  SECURITY: '/security',
  GAME_SEARCH: '/game/search',
  DOWNLOAD: '/download',
  NOTIFICATION: '/notification',
  ERROR_405: '/405',
  CPF: '/cpf',
  WITHDRAW_BIND: '/withdrawalBindAccount'
})

/**
 * Map from link target types to internal routes.
 */
const LINK_TARGET_MAP = {
  recharge: Routes.RECHARGE,
  withdraw: Routes.WITHDRAW,
  activity_list: Routes.PROMO,
  promotion: Routes.SPREAD,
  vip: Routes.VIP,
  home: Routes.HOME,
  redeem_code: Routes.REDEEM
}

/**
 * Map from route path to route category (for validation/analytics).
 */
export const ROUTE_CATEGORY_MAP = Object.freeze({
  [Routes.RECHARGE]: 'recharge',
  [Routes.RECHARGE_APPLY]: 'recharge',
  [Routes.WITHDRAW]: 'withdraw',
  [Routes.WITHDRAW_APPLY]: 'withdraw',
  [Routes.VIP]: 'vip',
  [Routes.PROFILE]: 'profile',
  [Routes.PROMO]: 'promo',
  [Routes.SPREAD]: 'agent',
  [Routes.MLM_AGENT]: 'agent'
})

/**
 * Promo page section types.
 */
export const PromoSection = Object.freeze({
  PROMO_DEFAULT: 1,
  REBATE: 2,
  REDEEM: 4
})

/**
 * Link jump type mappings.
 */
export const JumpType = Object.freeze({
  INTERNAL: 'InternalLink',
  EXTERNAL: 'Custom'
})

/**
 * Resolve a link target type to an internal route.
 * @param {string} type - e.g., 'recharge', 'withdraw', 'vip'
 * @returns {string|undefined} The route path
 */
export function resolveRoute(type) {
  return LINK_TARGET_MAP[type]
}

/**
 * Get the route category for a given path.
 * @param {string} path - Route path
 * @returns {string|undefined} Category name
 */
export function getRouteCategory(path) {
  return ROUTE_CATEGORY_MAP[path]
}

/**
 * Determine the jump type label.
 */
export function getJumpTypeLabel(jumpType) {
  return { internal: 'InternalLink', external: 'Custom' }[jumpType] || 'Custom'
}

/**
 * Determine bonus navigation type from activity info.
 */
export function getBonusNavType({ info }) {
  return info?.activityId ? 'ACTIVITY' : 'CODE'
}

/**
 * Ensure a URL has a protocol prefix.
 */
export function ensureProtocol(url) {
  if (!url) return ''
  return ['http://', 'https://'].some(p => url.includes(p)) ? url : `https://${url}`
}

/**
 * Build a unique activity identifier (for routing/caching).
 */
export function getActivityRouteId(activity) {
  if (activity?.hasOwnProperty('activityDetailSelect') && activity.activityDetailSelect != null) {
    return `${activity.id}@${activity.activityDetailSelect}`
  }
  return activity.id
}
