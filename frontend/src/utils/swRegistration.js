/**
 * Service Worker registration with automatic retry and status tracking.
 */

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

let attemptCount = 0
let isRegistering = false
let registrationStatus = 'pending'

/**
 * Register the service worker with retry logic.
 * @param {string} [swPath='/sw.js'] - Path to the service worker file
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export async function registerSW(swPath = '/sw.js') {
  if (!('serviceWorker' in navigator)) {
    registrationStatus = 'unsupported'
    console.warn('[SW] Service Worker not supported')
    return null
  }

  if (registrationStatus === 'success') {
    return navigator.serviceWorker.getRegistration()
  }

  if (isRegistering) {
    await new Promise(resolve => {
      const check = setInterval(() => {
        if (!isRegistering) { clearInterval(check); resolve() }
      }, 200)
    })
    return navigator.serviceWorker.getRegistration()
  }

  return attemptRegistration(swPath)
}

async function attemptRegistration(swPath, attempt = 0) {
  isRegistering = true
  attemptCount = attempt + 1

  try {
    const registration = await navigator.serviceWorker.register(swPath, { scope: '/' })
    registrationStatus = 'success'
    isRegistering = false
    attemptCount = 0

    try { sessionStorage.removeItem('sw-page-retried') } catch {}

    registration.onupdatefound = () => {
      const installing = registration.installing
      if (!installing) return
      installing.onstatechange = () => {
        if (installing.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            console.log('[SW] New content available, refresh to update')
          } else {
            console.log('[SW] Content cached for offline use')
          }
        }
      }
    }

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Controller changed')
    })

    registration.update()
    return registration
  } catch (err) {
    console.error(`[SW] Registration failed (attempt ${attemptCount}/${MAX_RETRIES}):`, err)

    if (attemptCount < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
      return attemptRegistration(swPath, attemptCount)
    }

    registrationStatus = 'failed'
    isRegistering = false
    console.error('[SW] Max retries reached, registration failed permanently')
    return null
  }
}

/**
 * Check if a SW is currently registered.
 */
export async function checkSWRegistration() {
  if (!('serviceWorker' in navigator)) {
    registrationStatus = 'unsupported'
    return null
  }

  try {
    const reg = await navigator.serviceWorker.getRegistration()
    if (reg) {
      if (registrationStatus === 'pending') registrationStatus = 'success'
      return reg
    }
    if (registrationStatus === 'success') registrationStatus = 'pending'
    return null
  } catch {
    return null
  }
}

/**
 * Get current SW registration status.
 * @returns {{ status: string, inProgress: boolean, attempts: number }}
 */
export function getSWStatus() {
  return {
    status: registrationStatus,
    inProgress: isRegistering,
    attempts: attemptCount
  }
}

/**
 * Get a human-readable status for display.
 */
export function getSWStatusDisplay() {
  const s = getSWStatus()
  const map = {
    success: { status: 'success', message: 'Service Worker ativo' },
    failed: { status: 'error', message: `Falha no Service Worker (${s.attempts} tentativas)` },
    unsupported: { status: 'warning', message: 'Service Worker não suportado' },
    pending: {
      status: 'info',
      message: s.inProgress ? 'Registrando Service Worker...' : 'Service Worker pendente'
    }
  }
  return map[s.status] || { status: 'info', message: 'Status desconhecido' }
}
