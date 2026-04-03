/**
 * MTpush / Engagelab Web Push SDK Integration
 *
 * This module wraps the MTpush SDK for use in the Vue application.
 * The SDK handles:
 * - WebSocket-based push messaging (MTPush channel)
 * - Web Push API (browser notifications via Service Worker)
 * - Safari Push Notifications
 * - Analytics/event reporting
 */

let MTpushInterface = null
let initialized = false

function loadSDK() {
  return new Promise((resolve, reject) => {
    if (window.MTpushInterface) {
      MTpushInterface = window.MTpushInterface
      resolve(MTpushInterface)
      return
    }

    const script = document.createElement('script')
    script.src = '/js/mtpush.min.js'
    script.async = true
    script.onload = () => {
      MTpushInterface = window.MTpushInterface
      resolve(MTpushInterface)
    }
    script.onerror = (err) => {
      console.warn('[MTpush] Failed to load SDK:', err)
      reject(err)
    }
    document.head.appendChild(script)
  })
}

export async function initMTpush(options = {}) {
  if (initialized) return

  try {
    const sdk = await loadSDK()
    if (!sdk) return

    const config = {
      appkey: options.appkey || '',
      user_str: options.user_str || '',
      is_temporary: options.is_temporary || 'n',
      debugMode: options.debugMode || false,
      swUrl: options.swUrl || '/sw.produce.min.2.1.6.js',
      success: (res) => {
        console.log('[MTpush] Init success:', res)
        options.onSuccess?.(res)
      },
      fail: (err) => {
        console.warn('[MTpush] Init failed:', err)
        options.onFail?.(err)
      },
      canGetInfo: (info) => {
        options.onInfo?.(info)
      },
      webPushcallback: (code, msg) => {
        if (code >= 0) {
          console.log('[MTpush] Web push available:', msg)
        }
      }
    }

    sdk.init(config)
    initialized = true

    sdk.onMsgReceive((data) => {
      options.onMessage?.(data)
    })
  } catch (e) {
    console.warn('[MTpush] Initialization error:', e)
  }
}

export function getRegistrationID() {
  return MTpushInterface?.getRegistrationID?.() || ''
}

export function getPushAuthority() {
  return MTpushInterface?.getPushAuthority?.() || { mtPush: { code: 0 }, webPush: { code: 0 } }
}

export function setTagsAlias(tags = [], alias = '') {
  MTpushInterface?.setTagsAlias?.({ tags, alias })
}

export function displayNotification(title, options = {}, extra = {}) {
  MTpushInterface?.webPush?.displayNotification?.(title, options, extra)
}

export function stopPush() {
  MTpushInterface?.mtPush?.stopPush?.()
}

export function getWebPermission() {
  return MTpushInterface?.getWebPermission?.() || 'default'
}
