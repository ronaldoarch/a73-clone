/**
 * Activity limit validation and rejection handling.
 * Determines why a user cannot participate in an activity
 * and maps limit codes to user-facing messages.
 */

/**
 * Known activity limit codes (in priority order).
 */
const LIMIT_PRIORITY = [
  'SAME_TYPE_ONLY_ONCE',
  'SAME_REGISTER_IP_ONLY_ONCE',
  'SAME_LOGIN_IP_ONLY_ONCE',
  'BIND_WITHDRAW_METHOD',
  'SAME_NAME_ONLY_ONCE',
  'FIRST_RECHARGE',
  'ONLY_REGISTER_DEVICE',
  'RECHARGE_COUNT_LIMIT',
  'RECHARGE_AMOUNT_LIMIT'
]

/**
 * Rejection types from the activity apply response.
 */
export const RejectType = Object.freeze({
  USER_CONDITION: 'USER_CONDITION',
  NO_REWARD: 'NO_REWARD'
})

/**
 * Determine the highest-priority unmet limit from activity results.
 * @param {Object} response - The activity apply response containing `result` array
 * @returns {string|undefined} The first unmet limit code
 */
export function findUnmetLimit(response) {
  if (!response?.result?.length) return undefined

  for (const limitCode of LIMIT_PRIORITY) {
    const found = response.result.some(r => r.limit === limitCode && !r.mark)
    if (found) return limitCode
  }
  return undefined
}

/**
 * Check if the response indicates an activity limit was hit (not all marks met).
 * @param {Object} response - Activity apply response
 * @returns {boolean}
 */
export function hasActivityLimit(response) {
  return response?.result && !response?.allMark
}

/**
 * Get i18n message key and params for a given limit code.
 * @param {string} limitCode - The limit code
 * @param {Object} response - The full apply response (for extracting shortage values)
 * @param {string} activityName - Display name of the activity
 * @param {Function} formatCurrency - Currency formatting function
 * @returns {{ messageKey: string, params: Object, action?: string }}
 */
export function getLimitMessage(limitCode, response, activityName, formatCurrency) {
  switch (limitCode) {
    case 'SAME_TYPE_ONLY_ONCE':
    case 'SAME_LOGIN_IP_ONLY_ONCE':
    case 'SAME_REGISTER_IP_ONLY_ONCE':
    case 'SAME_NAME_ONLY_ONCE':
      return {
        messageKey: 'popup.activityLimitMsg03',
        params: { activityName }
      }

    case 'BIND_WITHDRAW_METHOD':
      return {
        messageKey: 'popup.activityLimitMsg01',
        params: {},
        action: 'bindWithdraw'
      }

    case 'FIRST_RECHARGE':
      return {
        messageKey: 'popup.activityLimitMsg02',
        params: {},
        action: 'recharge'
      }

    case 'ONLY_REGISTER_DEVICE':
      return {
        messageKey: 'popup.activityLimitMsg08',
        params: {}
      }

    case 'RECHARGE_COUNT_LIMIT': {
      const item = response.result?.find(r => r.limit === 'RECHARGE_COUNT_LIMIT')
      const shortage = item?.shortage || 0
      return {
        messageKey: 'popup.activityLimitMsg09',
        params: { num1: shortage }
      }
    }

    case 'RECHARGE_AMOUNT_LIMIT': {
      const item = response.result?.find(r => r.limit === 'RECHARGE_AMOUNT_LIMIT')
      const shortage = item?.shortage ?? 0
      const formatted = formatCurrency ? formatCurrency(shortage) : shortage
      return {
        messageKey: 'popup.activityLimitMsg10',
        params: { num1: formatted }
      }
    }

    default:
      return {
        messageKey: 'popup.activityLimitMsg03',
        params: { activityName }
      }
  }
}

/**
 * Join type validation helpers.
 */
export const JoinType = Object.freeze({
  ONE: 'ONE',
  ALL: 'ALL',
  RECHARGE: 'RECHARGE'
})

/**
 * Get message key for RED_PACKET join type rejection.
 */
export function getRedPacketJoinMessage(joinType) {
  switch (joinType) {
    case JoinType.ONE: return 'activity.redpack1'
    case JoinType.ALL: return 'activity.redpack2'
    case JoinType.RECHARGE: return 'activity.redpack3'
    default: return 'activity.redpack1'
  }
}

/**
 * Reward status constants.
 */
export const ActivityRewardStatus = Object.freeze({
  RECEIVED: 'RECEIVED',
  DISTRIBUTED: 'DISTRIBUTED',
  EXPIRED: 'EXPIRED'
})

/**
 * Reward type constants.
 */
export const ActivityRewardType = Object.freeze({
  BET_MULTIPLE: 'BET_MULTIPLE',
  FIXED: 'FIXED'
})

/**
 * Win type constants.
 */
export const WinType = Object.freeze({
  TAIL_NUMBER: 'TAIL_NUMBER',
  CONSECUTIVE_NUMBER: 'CONSECUTIVE_NUMBER',
  CONTAINS_ANY_POSITION: 'CONTAINS_ANY_POSITION'
})

/**
 * Receive count type constants.
 */
export const ReceiveCountType = Object.freeze({
  RECHARGE: 'RECHARGE',
  BET: 'BET',
  FIXED_COUNT: 'FIXED_COUNT'
})
