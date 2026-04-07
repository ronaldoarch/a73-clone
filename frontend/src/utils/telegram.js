/**
 * Telegram WebApp SDK Integration
 *
 * Provides reactive access to Telegram.WebApp when running as a Telegram Mini App.
 * The SDK is loaded via script tag from Telegram's CDN (added to index.html when needed).
 *
 * Official docs: https://core.telegram.org/bots/webapps
 */

export function isTelegramWebApp() {
  return !!(window.Telegram?.WebApp?.initData)
}

export function getTelegramWebApp() {
  return window.Telegram?.WebApp || null
}

export function getTelegramInitData() {
  const wa = getTelegramWebApp()
  return wa ? wa.initDataUnsafe : null
}

export function getTelegramUser() {
  const data = getTelegramInitData()
  return data?.user || null
}

export function getTelegramThemeParams() {
  const wa = getTelegramWebApp()
  return wa?.themeParams || {}
}

export function telegramReady() {
  const wa = getTelegramWebApp()
  wa?.ready?.()
}

export function telegramExpand() {
  const wa = getTelegramWebApp()
  wa?.expand?.()
}

export function telegramClose(options) {
  const wa = getTelegramWebApp()
  wa?.close?.(options)
}

export function telegramHaptic(type = 'impact', style = 'light') {
  const wa = getTelegramWebApp()
  if (!wa?.HapticFeedback) return
  if (type === 'impact') wa.HapticFeedback.impactOccurred(style)
  else if (type === 'notification') wa.HapticFeedback.notificationOccurred(style)
  else if (type === 'selection') wa.HapticFeedback.selectionChanged()
}

export function telegramShowAlert(message, callback) {
  const wa = getTelegramWebApp()
  wa?.showAlert?.(message, callback)
}

export function telegramShowConfirm(message, callback) {
  const wa = getTelegramWebApp()
  wa?.showConfirm?.(message, callback)
}

export function telegramOpenLink(url, options) {
  const wa = getTelegramWebApp()
  wa?.openLink?.(url, options)
}

export function telegramSetHeaderColor(color) {
  const wa = getTelegramWebApp()
  if (wa) wa.headerColor = color
}

export function telegramSetBackgroundColor(color) {
  const wa = getTelegramWebApp()
  if (wa) wa.backgroundColor = color
}

export function applyTelegramTheme() {
  if (!isTelegramWebApp()) return false

  const params = getTelegramThemeParams()
  const root = document.documentElement

  if (params.bg_color) {
    root.style.setProperty('--ep-color-background-fill-body-default', params.bg_color)
  }
  if (params.secondary_bg_color) {
    root.style.setProperty('--ep-color-background-fill-surface-raised-L1', params.secondary_bg_color)
  }
  if (params.text_color) {
    root.style.setProperty('--ep-color-text-default', params.text_color)
  }
  if (params.hint_color) {
    root.style.setProperty('--ep-color-text-weaker', params.hint_color)
  }
  if (params.link_color) {
    root.style.setProperty('--ep-color-text-brand-primary', params.link_color)
  }
  if (params.button_color) {
    root.style.setProperty('--ep-color-background-fill-active-primary', params.button_color)
  }
  if (params.button_text_color) {
    root.style.setProperty('--ep-color-text-inverse', params.button_text_color)
  }

  return true
}

/**
 * Parse start_param from Telegram WebApp init data.
 * The original platform encodes JSON as reversed base64.
 */
export function getTelegramStartParams() {
  const wa = getTelegramWebApp()
  if (!wa || !isTelegramWebApp()) return {}

  const startParam = wa.initDataUnsafe?.start_param
  if (!startParam) return {}

  try {
    const reversed = startParam.split('').reverse().join('')
    const decoded = decodeURIComponent(atob(reversed))
    return JSON.parse(decoded)
  } catch {
    return {}
  }
}

/**
 * Close the Telegram WebApp properly (exit fullscreen first if needed).
 */
export function telegramCloseApp() {
  const wa = getTelegramWebApp()
  if (!wa || !isTelegramWebApp()) return

  if (wa.isFullscreen) {
    wa.exitFullscreen?.()
    setTimeout(() => wa.close?.(), 1000)
  } else {
    wa.close?.()
  }
}

/**
 * Get diagnostic info about the Telegram WebApp environment.
 */
export function getTelegramDiagnostics() {
  const wa = getTelegramWebApp()
  if (!wa) return null

  return {
    version: wa.version,
    platform: wa.platform,
    isExpanded: wa.isExpanded,
    isFullscreen: wa.isFullscreen,
    initData: wa.initData ? 'loaded' : 'unloaded',
    supportedMethods: {
      expand: !!wa.expand,
      requestFullscreen: !!wa.requestFullscreen,
      exitFullscreen: !!wa.exitFullscreen,
      disableVerticalSwipes: !!wa.disableVerticalSwipes,
      enableVerticalSwipes: !!wa.enableVerticalSwipes,
      close: !!wa.close
    }
  }
}

export function initTelegramWebApp() {
  if (!isTelegramWebApp()) return false

  applyTelegramTheme()
  telegramReady()
  telegramExpand()

  return true
}
