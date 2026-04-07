/**
 * Service Worker registration and management.
 */

const SW_URL = '/sw.js'

let swRegistration = null

/**
 * Register the service worker.
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] Service workers not supported')
    return null
  }

  try {
    swRegistration = await navigator.serviceWorker.register(SW_URL, { scope: '/' })

    swRegistration.addEventListener('updatefound', () => {
      const newWorker = swRegistration.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          onUpdateAvailable()
        }
      })
    })

    navigator.serviceWorker.addEventListener('message', handleSWMessage)

    console.info('[SW] Registered successfully')
    return swRegistration
  } catch (error) {
    console.error('[SW] Registration failed:', error)
    return null
  }
}

/**
 * Unregister the service worker.
 */
export async function unregisterServiceWorker() {
  if (!swRegistration) return
  try {
    await swRegistration.unregister()
    swRegistration = null
    console.info('[SW] Unregistered')
  } catch (error) {
    console.error('[SW] Unregister failed:', error)
  }
}

/**
 * Send a message to the service worker.
 */
export function sendToSW(type, data) {
  if (!navigator.serviceWorker?.controller) return
  navigator.serviceWorker.controller.postMessage({ type, data })
}

/**
 * Save user credentials in SW for domain switching.
 */
export function saveCredentialsToSW(credentials) {
  sendToSW('SAVE_CREDENTIALS', credentials)
}

/**
 * Clear credentials from SW.
 */
export function clearCredentialsFromSW() {
  sendToSW('CLEAR_CREDENTIALS')
}

/**
 * Request the SW to check a domain's availability.
 */
export function checkDomainViaSW(domain) {
  sendToSW('CHECK_DOMAIN', domain)
}

/**
 * Request the SW to find an available domain from a list.
 */
export function findDomainViaSW(domains) {
  sendToSW('FIND_DOMAIN', domains)
}

/**
 * Force the SW to skip waiting and activate immediately.
 */
export function skipWaiting() {
  sendToSW('SKIP_WAITING')
}

const messageHandlers = new Map()

export function onSWMessage(type, handler) {
  if (!messageHandlers.has(type)) {
    messageHandlers.set(type, [])
  }
  messageHandlers.get(type).push(handler)
  return () => {
    const handlers = messageHandlers.get(type)
    if (handlers) {
      const idx = handlers.indexOf(handler)
      if (idx > -1) handlers.splice(idx, 1)
    }
  }
}

function handleSWMessage(event) {
  const { type, data } = event.data || {}
  const handlers = messageHandlers.get(type) || []
  handlers.forEach(fn => {
    try { fn(data) } catch (e) { console.error('[SW Message]', e) }
  })
}

let updateCallback = null

export function onUpdateAvailable(callback) {
  if (callback) {
    updateCallback = callback
    return
  }
  if (updateCallback) updateCallback()
}

/**
 * Request push notification permission.
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  return Notification.permission === 'denied' ? 'denied' : await Notification.requestPermission()
}

/**
 * Subscribe to push notifications.
 */
export async function subscribeToPush(vapidPublicKey) {
  if (!swRegistration) return null

  try {
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    })
    return subscription
  } catch (error) {
    console.error('[Push] Subscription failed:', error)
    return null
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
