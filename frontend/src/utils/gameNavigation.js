/**
 * Game navigation and launch utilities.
 * Handles entering games, sports platforms, and lobby navigation.
 */

import { ensureProtocol } from './routes'

/**
 * Navigate back to main page with fallback path.
 * @param {Object} router - Vue Router instance
 * @param {string} [fallback='/main/inicio'] - Fallback path
 */
export function navigateToMain(router, fallback = '/main/inicio') {
  const mainPath = sessionStorage.getItem('mainPath') || '/main/inicio'
  router.push(mainPath).then(() => {
    if (mainPath !== fallback) {
      router.replace(fallback)
    }
  })
}

/**
 * Build the game action route path.
 * @param {string|number} gameId
 * @returns {string}
 */
export function getGameActionPath(gameId) {
  return `/game/action/${gameId}`
}

/**
 * Build the sports game route path.
 * @param {string} gameType
 * @param {string|number} platformId
 * @returns {string}
 */
export function getSportsPath(gameType, platformId) {
  return `/main/gameSports/${gameType}/${platformId}`
}

/**
 * Determine the screen orientation for native bridge.
 * @param {*} horizontalScreen - Value from game data
 * @returns {'landscape'|'portrait'}
 */
export function getGameOrientation(horizontalScreen) {
  const isHorizontal = typeof horizontalScreen === 'string'
    ? Number(horizontalScreen)
    : horizontalScreen
  return isHorizontal ? 'landscape' : 'portrait'
}

/**
 * Open a URL in a new tab/window.
 */
export function openInNewTab(url) {
  window.open(ensureProtocol(url), '_blank')
}

/**
 * Copy text to clipboard with toast feedback.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const result = document.execCommand('copy')
    document.body.removeChild(textarea)
    return result
  } catch {
    return false
  }
}

/**
 * Known sports platform codes that use external browser.
 */
export const EXTERNAL_SPORTS = ['M8SPORTS']

/**
 * Known sports platform codes that use the embedded Betby view.
 */
export const BETBY_SPORTS = ['Betby']

/**
 * Check if a platform code is a sports hall entry.
 */
export function isSportsHall(game) {
  return game?.target === 'hall' &&
    (EXTERNAL_SPORTS.includes(game.code) || BETBY_SPORTS.includes(game.code))
}

/**
 * The lobby URL for game exit redirect.
 */
export function getLobbyUrl() {
  return typeof window !== 'undefined' ? window.location.origin : ''
}

/**
 * Build game login params for API call.
 */
export function buildGameLoginParams(game) {
  return {
    gameId: Number(game.gameId || game.id),
    lobbyUrl: getLobbyUrl()
  }
}

/**
 * Build sports login params for API call.
 */
export function buildSportsLoginParams(game, userId, appType = 1) {
  return {
    gameType: game.gameType,
    lobbyUrl: getLobbyUrl(),
    platformId: game.platformId,
    userId,
    apptype: appType
  }
}
