/**
 * Implementação do __vite__mapDeps - mapeamento de dependências do Vite
 * Baseado no bundle vendor_modules do SPA original.
 *
 * Mapeia índices de chunks para os caminhos dos arquivos em public/assets/
 * Usado para carregamento dinâmico de módulos (code-splitting).
 *
 * Assets do SPA original:
 * - vendor_modules-CB8zapD8.js (Vue, Ionic, etc.)
 * - vendor_modules-9b7WOkhW.css (estilos Ionic)
 */
const VENDOR_DEPS = [
  'assets/vendor_modules-CB8zapD8.js',
  'assets/vendor_modules-9b7WOkhW.css'
]

/**
 * Mapeia índices para caminhos de arquivos de dependência.
 * @param {number[]} indices - Array de índices dos chunks
 * @param {object} map - Objeto de mapeamento (opcional)
 * @param {string[]} deps - Array de caminhos (opcional)
 * @returns {string[]} Caminhos dos arquivos
 */
export function mapDeps(indices, map = mapDeps, deps = (map.f ??= VENDOR_DEPS)) {
  return indices.map(i => deps[i])
}

/**
 * Carrega os assets do vendor (JS e CSS) dinamicamente.
 * Útil quando precisar carregar o SPA original em iframe ou para fallback.
 */
export function loadVendorAssets() {
  const base = '/assets/'
  const js = document.createElement('script')
  js.type = 'module'
  js.src = base + 'vendor_modules-CB8zapD8.js'
  js.crossOrigin = 'anonymous'

  const css = document.createElement('link')
  css.rel = 'stylesheet'
  css.href = base + 'vendor_modules-9b7WOkhW.css'
  css.crossOrigin = 'anonymous'

  document.head.appendChild(css)
  document.head.appendChild(js)
}

// Expor globalmente para compatibilidade com bundles que esperam __vite__mapDeps
if (typeof window !== 'undefined') {
  window.__vite__mapDeps = mapDeps
}

export default mapDeps
