/** Após registro/login, a Home abre o popup da roleta de novos se `eligible` na API. */
export const PENDING_NOVOS_ROULETTE_WELCOME_KEY = 'pending_novos_roleta_welcome'

export function setPendingNovosRouletteWelcome() {
  try {
    sessionStorage.setItem(PENDING_NOVOS_ROULETTE_WELCOME_KEY, '1')
  } catch {
    /* ignore */
  }
}
