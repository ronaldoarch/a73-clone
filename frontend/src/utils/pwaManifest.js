/**
 * PWA manifest generation and dynamic updating.
 * Creates/updates the web app manifest at runtime for installable PWA support.
 */

/**
 * Create an icon entry for the manifest.
 */
function createIconEntry(src, size = 0, type = 'image/png') {
  return size
    ? { sizes: `${size}x${size}`, src, type }
    : { sizes: 'any', src, type }
}

/**
 * Create a protocol handler entry for PWA deep linking.
 */
function createProtocolHandler(appName, url) {
  const cleanName = appName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const protocol = `web+pwa${cleanName}`
  const separator = url.includes('?') ? '&' : '?'
  return { protocol, url: `${url}${separator}pwaprotocolredirect=%s` }
}

/**
 * Generate a complete PWA manifest object.
 * @param {Object} options
 * @param {string} options.name - App display name
 * @param {string} options.icon192 - 192px icon URL
 * @param {string} options.icon512 - 512px icon URL
 * @param {string} options.startUrl - Start URL
 * @param {string} [options.tenantId] - Tenant identifier
 * @returns {Object} manifest
 */
export function generateManifest({ name, icon192, icon512, startUrl, tenantId }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  return {
    theme_color: 'black',
    background_color: 'black',
    display: 'standalone',
    prefer_related_applications: false,
    related_applications: [],
    id: `${origin}/${tenantId || ''}`,
    name,
    scope: `${origin}/`,
    short_name: name,
    start_url: startUrl,
    icons: [
      createIconEntry(icon192),
      createIconEntry(icon512, 512)
    ],
    protocol_handlers: [
      createProtocolHandler(name, startUrl)
    ]
  }
}

/**
 * Apply the manifest to the page by creating/updating a <link rel="manifest">.
 * Uses a Blob URL so the manifest is dynamically generated.
 */
export function applyManifest(manifest) {
  let link = document.querySelector('link[rel="manifest"]')
  if (link) link.remove()

  const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' })
  link = document.createElement('link')
  link.rel = 'manifest'
  link.href = URL.createObjectURL(blob)
  document.head.appendChild(link)
}

/**
 * Build the start URL with query parameters for the PWA.
 */
export function buildStartUrl(params = {}) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

/**
 * Set up the beforeinstallprompt event listener for PWA install.
 * @param {Function} onPrompt - Called with the deferred prompt event
 * @returns {Function} cleanup function
 */
export function setupInstallPrompt(onPrompt) {
  const handler = (e) => {
    e.preventDefault()
    if (onPrompt) onPrompt(e)
  }
  window.addEventListener('beforeinstallprompt', handler)
  return () => window.removeEventListener('beforeinstallprompt', handler)
}
