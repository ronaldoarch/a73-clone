import { createI18n } from 'vue-i18n'
import ptBR from '../locales/pt-BR'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './constants'
import { deepMerge } from './helpers'

const loadedLocales = {}

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('app-language') || DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    'pt-BR': ptBR
  }
})

loadedLocales['pt-BR'] = ptBR

async function loadLocaleMessages(locale) {
  if (loadedLocales[locale]) return loadedLocales[locale]

  let messages
  switch (locale) {
    case 'en-US':
      messages = (await import('../locales/en-US.js')).default
      break
    case 'en-PH': {
      const enUS = (await import('../locales/en-US.js')).default
      messages = enUS
      break
    }
    default:
      messages = (await import('../locales/en-US.js')).default
  }

  loadedLocales[locale] = messages
  i18n.global.setLocaleMessage(locale, messages)
  return messages
}

export async function setLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    console.warn(`[i18n] Unsupported locale: ${locale}`)
    return
  }

  await loadLocaleMessages(locale)
  i18n.global.locale.value = locale
  localStorage.setItem('app-language', locale)
  document.documentElement.setAttribute('lang', locale.split('-')[0])
}

export function getLocale() {
  return i18n.global.locale.value
}

export function getLocaleShort() {
  return getLocale().split('-')[1]
}

export const t = i18n.global.t

export default i18n
