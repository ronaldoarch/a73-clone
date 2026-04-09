/**
 * Ícones de instalação PWA no SO (iOS “Adicionar à Tela de Início”, etc.):
 * o manifest vem de /api/manifest; estes links no <head> também precisam refletir a logo do admin.
 */
export function applyBrandingIcons(logoUrl) {
  const raw = typeof logoUrl === 'string' ? logoUrl.trim() : ''
  if (!raw) return
  const abs =
    raw.startsWith('http://') || raw.startsWith('https://')
      ? raw
      : `${window.location.origin}${raw.startsWith('/') ? '' : '/'}${raw}`

  const sel = [
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]',
    'link[rel="shortcut icon"]',
    'link[rel="icon"]'
  ].join(',')

  document.querySelectorAll(sel).forEach((link) => {
    try {
      link.href = abs
    } catch (_) {
      /* ignore */
    }
  })
}
