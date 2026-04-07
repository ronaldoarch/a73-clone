/**
 * Push notification initialization (MTpush / Engagelab / JPush).
 * Manages permission requests, subscription, and SDK integration.
 */

/**
 * Request notification permission with timeout.
 * @returns {Promise<string>} 'granted', 'denied', or 'default'
 */
export async function requestPermission() {
  if (!('Notification' in window)) return 'denied'

  const current = Notification.permission
  if (current !== 'default') return current

  return Notification.requestPermission()
}

/**
 * Check if push notifications are supported and the environment is suitable.
 */
export function canInitPush() {
  return 'Notification' in window && 'serviceWorker' in navigator
}

/**
 * Check if the current environment is a PWA (standalone display mode).
 */
function isPwa() {
  return window.matchMedia?.('(display-mode: standalone)')?.matches ||
    window.navigator?.standalone === true
}

/**
 * Initialize MTpush/Engagelab SDK if available.
 * @param {Object} config
 * @param {string} config.appKey - JPush app key
 * @param {string} config.deviceId - Device identifier
 * @param {string} [config.swUrl] - Service Worker URL for push
 * @param {Function} [config.onSuccess] - Called on successful init
 * @param {Function} [config.onFail] - Called on failed init
 * @param {Function} [config.onRegId] - Called with registration ID
 * @param {Function} [config.onCustomPermission] - Custom permission UI callback
 */
export function initMTPush(config = {}) {
  if (!('MTpushInterface' in window)) {
    console.warn('[Push] MTpushInterface not available')
    return false
  }

  const sdk = window.MTpushInterface
  const { appKey, deviceId, swUrl, onSuccess, onFail, onRegId, onCustomPermission } = config

  if (!appKey) {
    console.warn('[Push] No JPush app key provided')
    return false
  }

  sdk.mtPush?.onDisconnect?.(() => {
    console.log('[Push] Disconnected')
  })

  sdk.onMsgReceive?.((msg) => {
    console.log('[Push] Message received:', msg)
  })

  try {
    sdk.init({
      appkey: appKey,
      user_str: deviceId,
      swUrl: swUrl || '/sw.js',
      fail(err) {
        console.warn('[Push] Init failed:', err)
        onFail?.(err)
      },
      success(result) {
        console.log('[Push] Init success:', result)
        onSuccess?.(result)
      },
      webPushcallback(code, tip) {
        if (code !== 1) {
          console.log('[Push] User did not grant permission')
          sdk.unSubscribe?.()
        }
        if (code === 2) {
          localStorage.setItem('samsungPermission', 'false')
        }
      },
      canGetInfo() {
        const regId = sdk.getRegistrationID?.()
        console.log('[Push] Got RegId:', regId)
        onRegId?.(regId)
      },
      custom: onCustomPermission
    })
    return true
  } catch (err) {
    console.warn('[Push] Exception:', err)
    return false
  }
}

/**
 * Orchestrate push notification initialization based on current environment.
 * @param {Object} options
 * @param {string} options.appKey
 * @param {string} options.deviceId
 * @param {string} options.browser - Browser type identifier
 * @param {boolean} options.isStandalone - Whether running as PWA
 * @param {boolean} options.isFromPwa - Whether sd=2 param is present
 */
export async function initPushNotifications(options = {}) {
  const { appKey, deviceId, browser, isStandalone, isFromPwa } = options

  if (!canInitPush()) return

  const permission = Notification.permission

  if (isFromPwa) {
    if (!isPwa()) return

    if (permission === 'default') {
      if (browser === 'MobileSafari' && localStorage.getItem('iosPermission') === 'false') return

      setTimeout(() => {
        if (sessionStorage.isInitPush !== 'true') {
          requestPermission()
        }
      }, 2500)
    } else if (permission === 'granted') {
      initMTPush({ appKey, deviceId })
    }
  } else if (isStandalone && permission !== 'denied') {
    if (browser === 'SamsungInternet' && localStorage.getItem('samsungPermission') === 'false') return
    initMTPush({ appKey, deviceId })
  }
}
