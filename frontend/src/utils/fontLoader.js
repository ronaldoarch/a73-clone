/**
 * External font loader per theme/skin.
 * Loads Google Fonts stylesheets needed for each visual theme.
 */

const FONT_SETS = {
  common: [
    'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,500;0,700;0,900&display=swap',
    'https://fonts.googleapis.com/css2?family=Share+Tech&display=swap',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500&display=swap',
    'https://fonts.googleapis.com/css2?family=Product+Sans&display=swap'
  ],
  first: [
    'https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap',
    'https://fonts.googleapis.com/css2?family=Saira:wght@400;500;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Sansita+One&display=swap',
    'https://fonts.googleapis.com/css2?family=Changa+One&display=swap',
    'https://fonts.googleapis.com/css2?family=Prompt:wght@400;600;700;900&display=swap',
    'https://fonts.googleapis.com/css2?family=Smooch+Sans:wght@100..900&display=swap',
    'https://fonts.googleapis.com/css2?family=Inter:wght@700;900&display=swap'
  ],
  second: [
    'https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap',
    'https://fonts.googleapis.com/css2?family=Nunito:wght@800;900&display=swap',
    'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800;900&display=swap',
    'https://fonts.googleapis.com/css2?family=Prompt:wght@400;600;700;900&display=swap',
    'https://fonts.googleapis.com/css2?family=Smooch+Sans:wght@100..900&display=swap',
    'https://fonts.googleapis.com/css2?family=Saira:wght@400;500;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Inter:wght@700;900&display=swap'
  ],
  default: [
    'https://fonts.googleapis.com/css2?family=Prompt:wght@400;600;700;900&display=swap',
    'https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=swap',
    'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap',
    'https://fonts.googleapis.com/css2?family=Smooch+Sans:wght@100..900&display=swap',
    'https://fonts.googleapis.com/css2?family=Saira:wght@400;500;700&display=swap'
  ]
}

function loadStylesheet(href) {
  if (document.querySelector(`link[href="${href}"]`)) return
  const link = document.createElement('link')
  link.href = href
  link.rel = 'stylesheet'
  link.crossOrigin = 'anonymous'
  document.head.appendChild(link)
}

/**
 * Load all fonts for a given skin/theme.
 * @param {string} skin - 'default' | 'first' | 'second'
 */
export function loadFonts(skin = 'default') {
  const common = FONT_SETS.common || []
  const themed = FONT_SETS[skin] || FONT_SETS.default || []
  const all = [...common, ...themed]
  all.forEach(loadStylesheet)
}

/**
 * Preload a single font family for performance.
 */
export function preloadFont(href) {
  if (document.querySelector(`link[href="${href}"][rel="preload"]`)) return
  const link = document.createElement('link')
  link.href = href
  link.rel = 'preload'
  link.as = 'style'
  link.crossOrigin = 'anonymous'
  document.head.appendChild(link)
}

export { FONT_SETS }
