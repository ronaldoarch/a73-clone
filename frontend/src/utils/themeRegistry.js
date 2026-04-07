import { createLayoutBuilder } from './layoutBuilder'

export const ThemeSkin = Object.freeze({
  PHANTOM_BLUE: 'Layout2:PhantomBlue',
  MYST_LIGHT_BLUE: 'Layout2:MystLightBlue',
  MIDNIGHT_PURPLE: 'Layout2:MidnightPurple',
  NEO_BLUE: 'Layout2:NeoBlue',
  GOLDSHINE_GREEN: 'Layout2:GoldshineGreen',
  STELLAR_DUSK: 'Layout2:StellarDusk',
  PROSPERITY_RED: 'Layout2:ProsperityRed',
  ROSE_BLUSH: 'Layout2:RoseBlush',
  SUPREME_GREEN: 'Layout2:SupremeGreen',
  DEEP_SEA_TEAL: 'Layout2:DeepSeaTeal',
  GOLDEN_EMERALD: 'Layout2:GoldenEmerald',
  DARK_ORANGE: 'Layout2:DarkOrange',
  BLUE_VIOLET: 'Layout2:BlueViolet',
  REGAL_BLUE: 'Layout2:RegalBlue',
  PARIS_PURPLE: 'Layout2:ParisPurple',
  BROKEN_ICE_BLUE: 'Layout2:BrokenIceBlue',
  CHALCEDONY_GREEN: 'Layout2:ChalcedonyGreen',
  MALT_GREEN: 'Layout2:MaltGreen',
  LIGHT_APRICOT: 'Layout2:LightApricot',
  ROYAL_AMETHYST: 'Layout2:RoyalAmethyst',
  AURORA_PURPLE: 'Layout2:AuroraPurple',
  RETRO_RED: 'Layout2:RetroRed',
  MINT: 'Layout2:Mint'
})

export const ThemeLayout = Object.freeze({
  DEFAULT: 'default',
  FIRST: 'first',
  SECOND: 'second',
  STYLE_1: 'style_1',
  STYLE_18: 'style_18',
  STYLE_24: 'style_24',
  STYLE_25: 'style_25',
  STYLE_26: 'style_26',
  STYLE_27: 'style_27',
  STYLE_28: 'style_28',
  STYLE_30: 'style_30',
  STYLE_36: 'style_36',
  STYLE_38: 'style_38'
})

const themeOptions = {
  default: {
    hotGameOptions: { logo1: '/first/svg/sort/POPULAR.svg' }
  },
  first: {
    hotGameOptions: { logo1: '/first/svg/sort/POPULAR.svg' }
  },
  second: {
    hotGameOptions: { logo1: '/first/svg/sort/POPULAR.svg' }
  },
  style_18: {
    hotGameOptions: { logo1: '/first/svg/sort/POPULAR.svg' },
    gameSearchProps: { cardSize: 3 }
  },
  style_24: {
    hotGameOptions: { logo1: '/first/svg/sort/POPULAR.svg' },
    gameSearchProps: { cardSize: 3 }
  },
  style_25: {
    hotGameOptions: { logo1: '/icons/hot.svg' },
    gameSearchProps: { cardSize: 3 }
  },
  style_26: {
    hotGameOptions: { logo1: '/icons/hot-26.svg' },
    gameSearchProps: { cardSize: 3 }
  },
  style_27: {
    hotGameOptions: { logo1: '/icons/hot-27.svg' },
    gameSearchProps: { cardSize: 3 }
  },
  style_28: {
    hotGameOptions: { logo1: '/icons/hot-28.svg' },
    gameSearchProps: { cardSize: 3 },
    inicio: { homeNavType: 'Platform' }
  },
  style_30: {
    hotGameOptions: { logo1: '/icons/sort/POPULAR_on1.png' },
    gameSearchProps: { cardSize: 3 }
  },
  style_36: {
    hotGameOptions: { logo1: '/svg/hot-platform-36.svg' },
    gameSearchProps: { cardSize: 3 }
  },
  style_38: {
    hotGameOptions: { logo1: '/img/inicio/POPULAR-38.png' },
    gameSearchProps: { cardSize: 3 },
    inicio: { homeNavType: 'Platform' }
  }
}

export function getThemeOptions(themeKey) {
  return themeOptions[themeKey] || themeOptions.default
}

export function getHotGameLogo(themeKey) {
  const opts = getThemeOptions(themeKey)
  return opts.hotGameOptions?.logo1 || '/first/svg/sort/POPULAR.svg'
}

export function getGameSearchCardSize(themeKey) {
  const opts = getThemeOptions(themeKey)
  return opts.gameSearchProps?.cardSize || 4
}

export function getHomeNavType(themeKey) {
  const opts = getThemeOptions(themeKey)
  return opts.inicio?.homeNavType || 'Category'
}

export class AppConfigReader {
  constructor(config) {
    this.config = config || null
    this.currentKey = null
  }

  use(key) {
    this.currentKey = key
    return this
  }

  get(path, defaultValue) {
    if (!this.config || !this.currentKey) return defaultValue

    const data = this.config[this.currentKey]?.result?.data?.json
    if (!path) return data ?? defaultValue

    const value = path.split('.').reduce((obj, key) => obj?.[key], data)
    return value ?? defaultValue
  }
}

export function readAppConfig() {
  const transform = (raw) => {
    if (!raw) return null

    const config = {
      domainInfo: parseConfigJson(raw.domainInfo),
      channelInfo: parseConfigJson(raw.channelInfo),
      tenantInfo: parseConfigJson(raw.tenantInfo),
      agencyConfig: parseConfigJson(raw.agencyConfig),
      apiUrl: raw.apiUrl,
      version: raw.version
    }

    const testTheme = sessionStorage.getItem('testtheme')
    const tenantData = config.tenantInfo?.result?.data?.json

    if (testTheme && tenantData && typeof tenantData === 'object') {
      try {
        const parsed = JSON.parse(testTheme)
        if (typeof parsed === 'object' && parsed?.themeKey) {
          tenantData.skinTwoType = parsed.themeKey
          if (parsed.homeType) tenantData.homeType = parsed.homeType
        } else if (typeof parsed === 'string') {
          tenantData.skinTwoType = parsed
        } else {
          tenantData.skinTwoType = testTheme
        }
      } catch {
        tenantData.skinTwoType = testTheme
      }
    }

    window.__APP_CONFIG__ = config
    return config
  }

  return window.__APP_CONFIG__ ? transform(window.__APP_CONFIG__) : null
}

function parseConfigJson(str) {
  if (!str || typeof str !== 'string') return str
  try {
    return JSON.parse(str)
  } catch {
    return str
  }
}

export function resolveThemeFromConfig(config) {
  if (!config) return ThemeLayout.DEFAULT

  const reader = new AppConfigReader(config)
  const skinType = reader.use('tenantInfo').get('skinTwoType', '')

  if (!skinType) return ThemeLayout.DEFAULT

  const skinMap = {
    'PhantomBlue': ThemeLayout.DEFAULT,
    'MystLightBlue': ThemeLayout.DEFAULT,
    'MidnightPurple': ThemeLayout.DEFAULT,
    'NeoBlue': ThemeLayout.STYLE_18,
    'GoldshineGreen': ThemeLayout.STYLE_18,
    'StellarDusk': ThemeLayout.STYLE_18,
    'AmberPurple': ThemeLayout.STYLE_18
  }

  for (const [key, layout] of Object.entries(skinMap)) {
    if (skinType.includes(key)) return layout
  }

  const styleMatch = skinType.match(/style_?(\d+)/i)
  if (styleMatch) {
    const num = styleMatch[1]
    if (themeOptions[`style_${num}`]) return `style_${num}`
  }

  return ThemeLayout.DEFAULT
}

export function getGameWrapperOptions(themeKey, screenWidth) {
  const isSmall = screenWidth < 375

  const presets = {
    default: {
      titleType: '1',
      headType: '1',
      style1: { size: 12, row: 3, hotSize: 16, hotRow: 4, isShowAll: true },
      style2: { size: 12, row: 3, hotSize: 16, hotRow: 4, isShowAll: true },
      style3: { size: 12, row: 4, hotSize: 15, hotRow: 5, isShowAll: true }
    },
    compact: {
      titleType: '1',
      headType: '1',
      style1: { size: 9, row: 3, hotSize: 12, hotRow: 4, isShowAll: true },
      style2: { size: 9, row: 3, hotSize: 12, hotRow: 4, isShowAll: true },
      style3: { size: 9, row: 3, hotSize: 9, hotRow: 3, isShowAll: true }
    },
    large: {
      titleType: '1',
      headType: '1',
      style1: { size: 20, row: 5, hotSize: 20, hotRow: 5, isShowAll: true },
      style2: { size: 20, row: 5, hotSize: 20, hotRow: 5, isShowAll: true },
      style3: { size: 12, row: 4, hotSize: 15, hotRow: 5, isShowAll: true }
    }
  }

  if (['style_25', 'style_38'].includes(themeKey)) return presets.large
  if (['style_28'].includes(themeKey)) return presets.compact
  return presets.default
}

export const SKIN_DEFINITIONS = Object.freeze({
  'H5Dark:DarkGreen': { skin: 'first', theme: 'green-dark', color: '#22262E', skinNumber: 'Legacy Dark Green' },
  'H5Dark:GoldenYellow': { skin: 'first', theme: 'yellow-dark', color: '#262624', skinNumber: 'Legacy Golden Yellow' },
  'H5Dark:BluePurple': { skin: 'first', theme: 'purple-light', color: '#6526db', skinNumber: 'Legacy Blue Purple' },
  'Layout2:DarkGreen': { skin: 'first', theme: 'green-dark', color: '#22262E', skinNumber: 'Theme #1', homeType: 'GameType' },
  'Layout2:GoldenYellow': { skin: 'first', theme: 'yellow-dark', color: '#262624', skinNumber: 'Theme #2', homeType: 'GameType' },
  'Layout2:BluePurple': { skin: 'first', theme: 'purple-light', color: '#6526db', skinNumber: 'Theme #3', homeType: 'GameType' },
  'Layout3:AmberPurple': { skin: 'second', theme: 'amber-purple', color: '#262346', skinNumber: 'Theme #4', homeType: 'GameType' },
  'Layout1:Blue': { skin: 'default', theme: 'blue-default', color: '#090F1F', skinNumber: 'Theme #5', homeType: 'GameType' },
  'Layout1:Green': { skin: 'default', theme: 'green-default', color: '#2B4F14', skinNumber: 'Theme #6', homeType: 'GameType' },
  'Layout1:BlueV01': { skin: 'default', theme: 'blue-default', color: '#090F1F', skinNumber: 'Theme #7', homeType: 'Platform' },
  'Layout1:GreenV01': { skin: 'default', theme: 'green-default', color: '#2B4F14', skinNumber: 'Theme #8', homeType: 'Platform' },
  'Layout1:GreenV02': { skin: 'default', theme: 'green-default', color: '#2B4F14', skinNumber: 'Theme #9', homeType: 'Platform' },
  'Layout1:Blue_V01': { skin: 'default', theme: 'blue-default', color: '#090F1F', skinNumber: 'Theme #10', homeType: 'GameType' },
  'Layout1:AmberPurple': { skin: 'default', theme: 'amber-purple', color: '#262346', skinNumber: 'Theme #11', homeType: 'GameType' },
  'Layout1:PineGreenV01': { skin: 'default', theme: 'forest-green', color: '#004d37', skinNumber: 'Theme #12', homeType: 'Platform' },
  'Layout1:PineGreenV02': { skin: 'default', theme: 'forest-green', color: '#004d37', skinNumber: 'Theme #13', homeType: 'Platform' },
  'Layout1:BlueV02': { skin: 'default', theme: 'blue-default', color: '#090F1F', skinNumber: 'Theme #14', homeType: 'Platform' },
  'Layout1:AmberPurpleV01': { skin: 'default', theme: 'amber-purple', color: '#262346', skinNumber: 'Theme #15', homeType: 'Platform' },
  'Layout1:AuroraYellow': { skin: 'default', theme: 'auroral-yellow', color: '#24221F', skinNumber: 'Theme #16', homeType: 'Platform' },
  'Layout2:PhantomBlue': { skin: 'first', theme: 'phantom-blue', color: '#1a1f30', skinNumber: 'Theme #17', homeType: 'Platform' },
  'Layout2:NeoBlue': { skin: 'first', theme: 'neo-blue', color: '#1d2a55', skinNumber: 'Theme #18', homeType: 'Platform' },
  'Layout2:MystLightBlue': { skin: 'first', theme: 'mystlight-blue', color: '#dde8ff', skinNumber: 'Theme #19', homeType: 'Platform' },
  'Layout2:MidnightPurple': { skin: 'first', theme: 'midnight-purple', color: '#372380', skinNumber: 'Theme #20', homeType: 'Platform' },
  'Layout2:GoldshineGreen': { skin: 'first', theme: 'goldshine-green', color: '#0B785C', skinNumber: 'Theme #21', homeType: 'Platform' },
  'Layout2:StellarDusk': { skin: 'first', theme: 'stellar-dusk', color: '#E5D4C0', skinNumber: 'Theme #22', homeType: 'Platform' },
  'Layout2:ProsperityRed': { skin: 'first', theme: 'prosperity-red', color: '#E81F24', skinNumber: 'Theme #23', homeType: 'Platform' },
  'Layout2:RoseBlush': { skin: 'first', theme: 'theme-24', color: '#2C333B', skinNumber: 'Theme #24', homeType: 'Platform' },
  'Layout2:SupremeGreen': { skin: 'first', theme: 'supreme-green', color: '#004d37', skinNumber: 'Theme #25', homeType: 'Platform' },
  'Layout2:DeepSeaTeal': { skin: 'first', theme: 'deep-sea-teal', color: '#005556', skinNumber: 'Theme #26', homeType: 'Platform' },
  'Layout2:DarkOrange': { skin: 'first', theme: 'theme-27', color: '#1d2a55', skinNumber: 'Theme #27', homeType: 'Platform' },
  'Layout2:BlueViolet': { skin: 'first', theme: 'theme-28', color: '#1d2a55', skinNumber: 'Theme #28', homeType: 'Platform' },
  'Layout2:GoldenEmerald': { skin: 'first', theme: 'golden-emerald', color: '#3B6700', skinNumber: 'Theme #29', homeType: 'Platform' },
  'Layout2:MaltGreen': { skin: 'first', theme: 'malt-green', color: '#01DA7F', skinNumber: 'Theme #30', homeType: 'Platform' },
  'Layout2:RegalBlue': { skin: 'first', theme: 'theme-31', color: '#808C33', skinNumber: 'Theme #31', homeType: 'Platform' },
  'Layout2:ParisPurple': { skin: 'first', theme: 'theme-32', color: '#1d2a55', skinNumber: 'Theme #32', homeType: 'Platform' },
  'Layout2:BrokenIceBlue': { skin: 'first', theme: 'theme-33', color: '#1d2a55', skinNumber: 'Theme #33', homeType: 'Platform' },
  'Layout2:ChalcedonyGreen': { skin: 'first', theme: 'theme-34', color: '#065807', skinNumber: 'Theme #34', homeType: 'Platform' },
  'Layout2:LightApricot': { skin: 'first', theme: 'theme-35', color: '#8D6D00', skinNumber: 'Theme #35', homeType: 'Platform' },
  'Layout2:RoyalAmethyst': { skin: 'first', theme: 'theme-36', color: '#5B2875', skinNumber: 'Theme #36', homeType: 'Platform' },
  'Layout2:AuroraPurple': { skin: 'first', theme: 'theme-37', color: '#5B2875', skinNumber: 'Theme #37', homeType: 'Platform' },
  'Layout2:RetroRed': { skin: 'first', theme: 'theme-38', color: '#1d2a55', skinNumber: 'Theme #38', homeType: 'Platform' },
  'Layout2:Mint': { skin: 'first', theme: 'theme-39', color: '#B2FFD2', skinNumber: 'Theme #39', homeType: 'Platform' }
})

export function getSkinDefinition(skinTwoType) {
  return SKIN_DEFINITIONS[skinTwoType] || { skin: 'default', theme: 'blue-default', color: '#090F1F' }
}

export function getSkinTheme(skinTwoType) {
  const def = getSkinDefinition(skinTwoType)
  return def.theme
}

export function getSkinColor(skinTwoType) {
  const def = getSkinDefinition(skinTwoType)
  return def.color
}

export function getSkinHomeType(skinTwoType) {
  const def = getSkinDefinition(skinTwoType)
  return def.homeType || 'GameType'
}

export const SKIN_STYLE_MAP = Object.freeze({
  PhantomBlue: 'style_17',
  MystLightBlue: 'style_17',
  MidnightPurple: 'style_17',
  NeoBlue: 'style_18',
  GoldshineGreen: 'style_18',
  StellarDusk: 'style_18',
  ProsperityRed: 'style_18',
  RoseBlush: 'style_18',
  SupremeGreen: 'style_18',
  DeepSeaTeal: 'style_18',
  GoldenEmerald: 'style_18',
  DarkOrange: 'style_18',
  BlueViolet: 'style_18',
  RegalBlue: 'style_18',
  ParisPurple: 'style_18',
  BrokenIceBlue: 'style_18',
  ChalcedonyGreen: 'style_18',
  MaltGreen: 'style_18',
  LightApricot: 'style_18',
  RoyalAmethyst: 'style_18',
  AuroraPurple: 'style_18',
  RetroRed: 'style_18',
  Mint: 'style_18'
})

export const PAGE_SIZE = Object.freeze({
  DEFAULT: 12,
  SWIPER: 6,
  HOT: 16,
  LARGE: 20,
  COMPACT: 9
})

export const GAME_TYPE_SORT = Object.freeze({
  POPULAR: 'POPULAR',
  SPORTS: 'SPORTS',
  SLOTS: 'SLOTS',
  LIVE: 'LIVE',
  FISHING: 'FISHING',
  TABLE: 'TABLE',
  LOTTERY: 'LOTTERY',
  CRASH: 'CRASH',
  ARCADE: 'ARCADE',
  BINGO: 'BINGO',
  POKER: 'POKER'
})
