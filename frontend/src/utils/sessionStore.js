/**
 * Typed session storage helpers with JSON serialization.
 */

export const SessionKey = Object.freeze({
  AUDIT_DETAIL: 'auditDetail',
  LIMIT_GAME: 'limitGame',
  WITHDRAW_MAIN: 'withdrawMain',
  AGENT_ROUTER_TYPE: 'agentRouterType',
  REPORT_TYPE: 'reportType',
  VERIFY_TYPE: 'verifyType',
  REBATE_RECORD: 'rebateRecord',
  IS_TAB_WITHDRAW: 'isTabWithdraw',
  LOGOUT_HEIGHT: 'logoutHeight',
  LOGOUT_WIDTH: 'logoutWidth',
  RED_PACKET_MODEL: 'redPacketModel',
  RECORD_BACK_REBATE: 'recordBackRebate'
})

/**
 * Set a value in session storage (JSON-serialized).
 */
export function setSession(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ value }))
  } catch {}
}

/**
 * Get a value from session storage (JSON-deserialized).
 * @returns {*} The stored value, or null if not found
 */
export function getSession(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.value ?? null
  } catch {
    return null
  }
}

/**
 * Remove a value from session storage.
 */
export function removeSession(key) {
  sessionStorage.removeItem(key)
}

/**
 * Clear all session storage.
 */
export function clearSession() {
  sessionStorage.clear()
}
