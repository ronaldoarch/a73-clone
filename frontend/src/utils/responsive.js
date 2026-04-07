/**
 * Responsive font sizing based on viewport width.
 * The original platform uses 390px as the design reference width
 * with a max width breakpoint.
 */

const DESIGN_WIDTH = 390
const MAX_SCREEN_WIDTH = 500
const BASE_FONT_SIZE = 16

/**
 * Update the root font size based on viewport width.
 * This enables the use of `rem` units that scale with the screen.
 */
export function updateRootFontSize() {
  const width = Math.min(window.innerWidth, MAX_SCREEN_WIDTH)
  const fontSize = (width * BASE_FONT_SIZE) / DESIGN_WIDTH
  document.documentElement.style.fontSize = `${fontSize}px`
}

/**
 * Set up the responsive handler with resize listener.
 * @returns {Function} Cleanup function to remove the listener
 */
export function setupResponsive() {
  updateRootFontSize()
  window.addEventListener('resize', updateRootFontSize)
  return () => window.removeEventListener('resize', updateRootFontSize)
}
