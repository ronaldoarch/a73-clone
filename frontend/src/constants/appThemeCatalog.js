/**
 * Temas com bloco completo em src/styles/themes.css ([data-theme="…"]).
 * ids inválidos caem no :root / herança e podem ficar inconsistentes.
 */
export const APP_UI_THEMES = Object.freeze([
  { id: 'amber-purple', label: 'Âmbar e roxo' },
  { id: 'blue-default', label: 'Azul clássico' },
  { id: 'green-default', label: 'Verde vivo' },
  { id: 'green-dark', label: 'Verde escuro' },
  { id: 'phantom-blue', label: 'Phantom blue' },
  { id: 'neo-blue', label: 'Neo blue' },
  { id: 'midnight-purple', label: 'Roxo meia-noite' },
  { id: 'mystlight-blue', label: 'Azul claro' },
  { id: 'goldshine-green', label: 'Verde dourado' },
  { id: 'golden-emerald', label: 'Esmeralda' },
  { id: 'deep-sea-teal', label: 'Azul-petróleo' },
  { id: 'stellar-dusk', label: 'Crepúsculo' },
  { id: 'prosperity-red', label: 'Vermelho prosperidade' },
  { id: 'yellow-dark', label: 'Dourado escuro' },
  { id: 'purple-light', label: 'Roxo claro' },
  { id: 'forest-green', label: 'Verde floresta' },
  { id: 'supreme-green', label: 'Verde supremo' },
  { id: 'auroral-yellow', label: 'Amarelo aurora' },
  { id: 'malt-green', label: 'Verde malte' }
])

export const APP_UI_THEME_IDS = new Set(APP_UI_THEMES.map((t) => t.id))

export function isValidAppUiTheme(id) {
  return typeof id === 'string' && APP_UI_THEME_IDS.has(id)
}
