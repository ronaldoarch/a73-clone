/**
 * Application initialization orchestrator.
 * Coordinates the boot sequence: device detection, auth, tenant config,
 * theme application, responsive layout, PWA, push notifications, and routing.
 */

import { ref } from 'vue'
import { setupResponsive } from './responsive'
import { loadFonts } from './fontLoader'
import { detectTracker, persistTrackerParams } from './tracker'
import { registerServiceWorker } from './serviceWorker'
import { platformInfo } from './platform'
import { throttle } from './helpers'

const isLoaded = ref(false)

/**
 * Apply theme classes to <html> and <body>.
 */
function applyThemeClasses({ skin, theme, newSkin }) {
  const html = document.documentElement
  const body = document.body
  ;[theme, newSkin].filter(Boolean).forEach(cls => html.classList.add(cls))
  if (skin) body.classList.add(skin)
}

/**
 * Load theme-specific fonts and apply dynamic routes.
 * @param {string} skin - The skin identifier (e.g., 'first', 'second', 'default')
 */
async function loadSkinResources(skin) {
  loadFonts(skin)
}

/**
 * Initialize the web app (for browser-based entry).
 * This is the main boot function, throttled to prevent double-init.
 */
export const webAppInit = throttle(async (route, { systemStore, authStore, channelStore }) => {
  const channelId = route?.query?.ch || ''

  await Promise.all([
    systemStore.resetTenantInfo?.(),
  ])

  const tenantInfo = systemStore.tenantInfo
  if (tenantInfo) {
    document.title = tenantInfo.name || ''

    if (!authStore.locale) {
      authStore.setLocale?.(tenantInfo.appDefaultLanguage || tenantInfo.language || 'pt-BR')
    }
  }

  isLoaded.value = true
}, 300, { leading: true })

/**
 * Initialize the full app (for PWA/standalone entry).
 */
export async function appInit(route, stores) {
  const { systemStore, authStore } = stores

  systemStore.setDeviceInfo?.()
  systemStore.setAppInfo?.(route)

  const acc = route?.query?.acc
  const pass = route?.query?.pass

  await Promise.all([
    authStore.getToken?.(route),
    authStore.setAccount?.(acc, pass, false)
  ])

  detectTracker()
  persistTrackerParams()

  isLoaded.value = true
}

/**
 * Set up global event listeners.
 * @returns {Function} Cleanup function
 */
export function setupGlobalListeners() {
  const cleanupResize = setupResponsive()

  return () => {
    cleanupResize()
  }
}

/**
 * Run background initialization tasks (non-blocking).
 */
export function runBackgroundTasks() {
  registerServiceWorker().catch(() => {})
}

export { isLoaded }
