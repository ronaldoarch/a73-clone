/**
 * Activity-specific theme configuration.
 * Maps visual themes to activity styles (colors, borders, shadows, etc.)
 * Used by NewUserExclusive grid, LuckyWheel, and other themed activity components.
 */

/**
 * Default grid cell configuration for NewUserExclusive activity.
 */
const DEFAULT_GRID_STYLE = {
  block_border: 'rgba(36, 43, 66, 1)',
  block_background: 'rgba(16, 18, 29, 1)',
  active_color: '#009dff',
  font_color: '#F5C84C',
  end_font_color: '#F5C84C',
  shadow: '0px 0px 28px #FFF713'
}

/**
 * Theme-specific overrides for grid cells.
 */
const THEME_GRID_OVERRIDES = {
  'forest-green': {
    block_border: '#00694A',
    block_background: '#00422F',
    active_color: '#fff',
    shadow: '0px 0px 28px #fff'
  },
  'auroral-yellow': {
    block_border: '#37352F',
    block_background: '#24221F',
    active_color: '#F7FB43',
    shadow: '0px 0px 28px #FFF713'
  },
  'yellow-dark': {
    block_border: '#2E2D2C',
    block_background: '#181816',
    active_color: '#6691D5',
    font_color: '#FEB805',
    end_font_color: '#FEB805',
    shadow: '0px 0px 28px #6691D5'
  },
  'green-dark': {
    block_border: '#242F42',
    block_background: '#1A1D22',
    active_color: '#3E9B2F',
    shadow: '0px 0px 28px #3E9B2F'
  },
  'amber-purple': {
    block_border: '#5F588C',
    block_background: '#292547',
    active_color: '#98C24F',
    shadow: '0px 0px 28px #98C24F'
  },
  'purple-light': {
    block_border: '#CAB4FD',
    block_background: '#E3D4FC',
    active_color: '#FEB805',
    font_color: '#FC974C',
    end_font_color: '#FC974C',
    shadow: '0px 0px 28px #FEB805'
  },
  'mystlight-blue': {
    shadow: '0px 0px 28px #FE963B'
  }
}

/**
 * Themes that use the style_18 (neo) grid layout.
 */
const NEO_THEMES = [
  'neo-blue', 'goldshine-green', 'stellar-dusk', 'prosperity-red',
  'theme-24', 'supreme-green', 'deep-sea-teal', 'golden-emerald',
  'theme-27', 'theme-28', 'theme-31', 'theme-32', 'theme-33',
  'theme-34', 'malt-green', 'theme-35', 'theme-37', 'theme-39'
]

const NEO_GRID_STYLE = {
  block_border: '#200259',
  block_background: '#200259',
  active_color: 'transparent',
  font_color: '#fff',
  end_font_color: '#E64021',
  shadow: '0px 0px 28px #7B44E4'
}

/**
 * Get grid style configuration for a given theme.
 * @param {string} theme - Theme identifier
 * @returns {Object} Merged grid style
 */
export function getGridStyle(theme) {
  if (NEO_THEMES.includes(theme)) {
    return { ...DEFAULT_GRID_STYLE, ...NEO_GRID_STYLE }
  }

  const override = THEME_GRID_OVERRIDES[theme]
  if (override) {
    return { ...DEFAULT_GRID_STYLE, ...override }
  }

  if (theme === 'green-default') {
    return { ...DEFAULT_GRID_STYLE, ...THEME_GRID_OVERRIDES['forest-green'] }
  }

  return { ...DEFAULT_GRID_STYLE }
}

/**
 * Get info box colors for the LuckyBet activity by theme.
 */
const LUCKY_BET_COLORS = {
  'auroral-yellow': { fill: '#23DB8C', stroke: '#191919' },
  'forest-green': { fill: '#50B388', stroke: '#009F76' },
  'green-default': { fill: '#50B388', stroke: '#009F76' },
  'green-dark': { fill: '#5C82F5', stroke: 'white' },
  'amber-purple': { fill: '#3083E4', stroke: '#5F588C' },
  'purple-light': { fill: '#5C82F5', stroke: 'white' },
  'mystlight-blue': { fill: '#3C68F9', stroke: '#D4D4D4' }
}

/**
 * Get LuckyBet info colors for a theme.
 * @param {string} theme
 * @returns {{ fill: string, stroke: string }}
 */
export function getLuckyBetColors(theme) {
  return LUCKY_BET_COLORS[theme] || {}
}

/**
 * VIP level badge mapping for activity sign-in levels.
 */
export const SIGN_IN_LEVEL_IMAGES = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5']

/**
 * Get rechargePromotion top background image path by theme.
 */
export function getRechargePromotionBg(theme) {
  const map = {
    'amber-purple': '/img/activity/rechargePromotion/amber-purple-topBg.png',
    'auroral-yellow': '/img/activity/rechargePromotion/auroral-yellow-topBg.png',
    'blue-default': '/img/activity/rechargePromotion/blue-default-topBg.png',
    'forest-green': '/img/activity/rechargePromotion/forest-green-topBg.png',
    'green-dark': '/img/activity/rechargePromotion/green-dark-topBg.png',
    'green-default': '/img/activity/rechargePromotion/green-default-topBg.png',
    'phantom-blue': '/img/activity/rechargePromotion/phantom-blue-topBg.png',
    'purple-light': '/img/activity/rechargePromotion/purple-light-topBg.png',
    'yellow-dark': '/img/activity/rechargePromotion/yellow-dark-topBg.png'
  }
  return map[theme] || map['blue-default']
}

/**
 * Reset type display names for member reward schedules.
 */
export const ResetTypeSchedule = Object.freeze({
  DAILY: 'daily',
  WEEKLY_DAY: 'weekly',
  MONTHLY_DAY: 'monthly'
})
