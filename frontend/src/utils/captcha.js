/**
 * Captcha integration module.
 * Supports Cloudflare Turnstile and Aliyun image captcha.
 */

import { ref } from 'vue'

const TOKEN_EXPIRY_MS = 5 * 60 * 1000

// --- Cloudflare Turnstile ---

const turnstileEnabled = ref(false)
const turnstileToken = ref(null)
let turnstileWidgetId = null
let turnstileConfig = null

export function initTurnstile(containerSelector, options = {}) {
  return new Promise((resolve, reject) => {
    if (!window.turnstile) {
      const check = () => {
        if (window.turnstile) resolve()
        else setTimeout(check, 100)
      }
      check()
      setTimeout(() => {
        if (!window.turnstile) reject(new Error('Turnstile script timeout'))
      }, 10000)
    } else {
      resolve()
    }
  }).then(() => {
    if (turnstileWidgetId) {
      try { window.turnstile.remove(turnstileWidgetId) } catch {}
    }

    turnstileConfig = {
      sitekey: options.sitekey || '0x4AAAAAAAiHEkDee-yqSdMj',
      action: options.action || 'default',
      size: 'flexible',
      ...options
    }

    try {
      turnstileWidgetId = window.turnstile.render(containerSelector, {
        ...turnstileConfig,
        callback: (token) => {
          turnstileToken.value = {
            token,
            timestamp: Date.now(),
            expiresIn: TOKEN_EXPIRY_MS
          }
        },
        'error-callback': (err) => {
          console.error('[Turnstile] Error:', err)
          turnstileToken.value = null
        },
        'expired-callback': () => {
          turnstileToken.value = null
        }
      })
    } catch (err) {
      console.error('[Turnstile] Failed to render:', err)
    }
  })
}

export function resetTurnstile() {
  if (turnstileWidgetId && window.turnstile) {
    try { window.turnstile.reset(turnstileWidgetId) } catch {}
  }
}

export function getTurnstileToken() {
  return turnstileToken.value?.token || null
}

export function clearTurnstileToken() {
  turnstileToken.value = null
  resetTurnstile()
}

export function destroyTurnstile() {
  if (turnstileWidgetId && window.turnstile) {
    try { window.turnstile.remove(turnstileWidgetId) } catch {}
  }
  turnstileToken.value = null
  turnstileWidgetId = null
  turnstileConfig = null
}

export function setTurnstileEnabled(val) {
  turnstileEnabled.value = val
}

export { turnstileEnabled, turnstileToken }

// --- Aliyun Image Captcha ---

const ALIYUN_SUPPORTED_LANGS = ['cn', 'tw', 'en', 'ar', 'de', 'es', 'fr', 'in', 'it', 'ja', 'ko', 'pt', 'ru', 'ms', 'th', 'tr', 'vi']

function getAliyunLang() {
  const locale = localStorage.getItem('app-language') || 'en-US'
  const lang = locale.split('-')[0]
  return ALIYUN_SUPPORTED_LANGS.includes(lang) ? lang : 'en'
}

/**
 * Initialize Aliyun image captcha.
 * @param {string} sceneId - Captcha scene ID
 * @param {Function} verifyCallback - Called with verify params, must return {captchaResult, bizResult}
 * @returns {Object} - { verify, destroyCaptcha }
 */
export function initAliyunCaptcha(sceneId, verifyCallback) {
  let instance = null

  const init = async (prefix = '1hgzra4') => {
    if (!window.initAliyunCaptcha) return

    const rem = Math.floor(Math.min(window.innerWidth, 486) / 360 * 10) / 10

    window.initAliyunCaptcha({
      SceneId: sceneId,
      prefix,
      mode: 'popup',
      element: '#captcha-element',
      button: '#captcha-button',
      captchaVerifyCallback: async (params) => {
        try {
          const result = await verifyCallback(params)
          return {
            captchaResult: result?.verified || false,
            bizResult: result?.verified || false
          }
        } catch (err) {
          console.error('[Captcha] Verify failed:', err)
          return { captchaResult: false, bizResult: false }
        }
      },
      onBizResultCallback: () => {},
      getInstance: (inst) => { instance = inst },
      slideStyle: { width: 320, height: 40 },
      rem,
      region: 'sgp',
      language: getAliyunLang()
    })
  }

  const verify = () => {
    const btn = document.getElementById('captcha-button')
    btn?.click()
  }

  const destroyCaptcha = () => {
    instance?.destroyCaptcha?.()
    instance = null
  }

  return { init, verify, destroyCaptcha }
}

/**
 * Load captcha-related external scripts.
 */
export function loadCaptchaScript(src, version) {
  const script = document.createElement('script')
  script.src = `${src}?v=${version || Date.now()}`
  document.head.appendChild(script)
  return script
}

export function loadCaptchaStylesheet(href) {
  const link = document.createElement('link')
  link.href = href
  link.rel = 'stylesheet'
  document.head.appendChild(link)
}
