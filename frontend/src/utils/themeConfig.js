/**
 * Theme and layout configuration matching the original A73 platform.
 */

export const Layout = Object.freeze({
  LAYOUT1: 'Layout1',
  LAYOUT2: 'Layout2',
  LAYOUT3: 'Layout3',
  LAYOUT4: 'Layout4'
})

export const ThemesByLayout = Object.freeze({
  Layout1: [
    'Blue', 'Green', 'AmberPurple', 'Blue_V01', 'BlueV01', 'BlueV02',
    'GreenV01', 'GreenV02', 'PineGreenV01', 'PineGreenV02',
    'AmberPurpleV01', 'AuroraYellow'
  ],
  Layout2: [
    'DarkGreen', 'GoldenYellow', 'BluePurple', 'PhantomBlue', 'NeoBlue',
    'MystLightBlue', 'MidnightPurple', 'GoldshineGreen', 'StellarDusk',
    'ProsperityRed', 'RoseBlush', 'SupremeGreen', 'DeepSeaTeal',
    'GoldenEmerald', 'MaltGreen', 'RegalBlue', 'ParisPurple',
    'BrokenIceBlue', 'ChalcedonyGreen', 'LightApricot', 'RoyalAmethyst',
    'RetroRed', 'DarkOrange', 'BlueViolet', 'Mint', 'AuroraPurple'
  ],
  Layout3: ['AmberPurple'],
  Layout4: ['Highlight']
})

export function getLayoutThemes(layout) {
  return ThemesByLayout[layout] || []
}

export function getThemeKey(layout, theme) {
  return `${layout}:${theme}`
}

export function getAllThemeKeys() {
  const keys = []
  for (const [layout, themes] of Object.entries(ThemesByLayout)) {
    for (const theme of themes) {
      keys.push(`${layout}:${theme}`)
    }
  }
  return keys
}

export const ChannelType = Object.freeze({
  NORMAL: 'Normal',
  FACEBOOK: 'Facebook',
  TIKTOK: 'TikTok',
  KWAI: 'Kwai',
  KWAI_MORE_DAY: 'KwaiMoreDay',
  SHELF_PACKAGE: 'ShelfPackage',
  APK: 'APK',
  TIKTOK_API: 'TikTokAPI',
  GTM: 'GTM',
  FACEBOOK_API: 'FacebookAPI',
  KWAI_API: 'KwaiAPI',
  AF_API: 'AFAPI',
  MG_SKY_ADS: 'MgSkyAds',
  OK_SPIN: 'OKSpin',
  IOS_SHELF_PACKAGE: 'IOSShelfPackage',
  AD_API: 'ADAPI',
  KWAI_API_MORE_DAYS: 'KwaiAPIMoreDays',
  OKS_API: 'OKSAPI',
  BIGO: 'Bigo',
  BIGO_API: 'BigoAPI',
  OPERA: 'Opera',
  OPERA_API: 'OperaAPI',
  MEGO: 'MEGO',
  PE_MEDIA_API: 'PEMediaAPI'
})

export const CHANNEL_TYPES = Object.values(ChannelType)

export const ReportType = Object.freeze({
  RECHARGE: 'recharge',
  WITHDRAWAL: 'withdrawal',
  WINS_LOSE: 'winsLose',
  RECHARGE_WITHDRAWAL: 'rechargeWithdrawal',
  VALID_BETTING: 'validBetting',
  GAME_ROUNDS: 'gameRounds',
  REWARD: 'reward',
  SETTLE: 'settle',
  GAME_REWARD_MULTIPLE: 'gameRewardMultiple',
  HISTORICAL_PAY: 'historicalPay',
  HISTORY_WITHDRAWALS: 'historyWithdrawals',
  HISTORICAL_REWARD: 'historicalReward'
})

export const REPORT_TYPES = Object.values(ReportType)

export const HomeSectionType = Object.freeze({
  GAME_TYPE: 'GameType',
  PLATFORM: 'Platform'
})

export const PopupShowTime = Object.freeze({
  HOME: 'HOME',
  RECHARGE: 'RECHARGE',
  FIRST_WITHDRAWAL: 'FIRST_WITHDRAWAL'
})

export const InstallType = Object.freeze({
  PWA: 'PWA',
  APK: 'APK',
  PWA_APK: 'PWA+APK',
  DESK: 'DESK',
  APPSTORE: 'APPSTORE'
})

export const ExportType = Object.freeze({
  EXPORTING: 'Exporting',
  SUCCESS: 'ExportSuccess',
  FAIL: 'ExportFail'
})

export const DoubleRewardType = Object.freeze({
  FIXED: 'FIXED',
  RECHARGE: 'RECHARGE'
})

export const ThemeDecorationType = Object.freeze({
  DEFAULT: 'DEFAULT',
  CHRISTMAS: 'CHRISTMAS'
})

export const SlideStyle = Object.freeze({
  SLIDE: 'Slide',
  TILE: 'Tile'
})

export const HomeMenuStyle = Object.freeze({
  DEFAULT: 'Default',
  CUSTOM: 'Custom'
})

export const QuickEntry = Object.freeze({
  GAME: 'game',
  RECHARGE: 'recharge',
  WITHDRAW: 'withdraw',
  INVITE: 'invite',
  CUSTOMER: 'customer',
  DOWNLOAD: 'download',
  BACK: 'back'
})

export const RiskControl = Object.freeze({
  MALICIOUS_AUDIT: 'MaliciousAudit',
  RISK_CONTROL: 'RiskControl',
  RELEASE: 'Release'
})

export const LimitType = Object.freeze({
  USERS_LOGIN: 'USERS:LOGIN',
  IP_LOGIN: 'IP:LOGIN',
  IP_REGISTER: 'IP:REGISTER',
  IP_LOGIN_REGISTER: 'IP:LOGIN_REGISTER',
  DEVICE_LOGIN: 'DEVICE:LOGIN',
  DEVICE_REGISTER: 'DEVICE:REGISTER',
  DEVICE_LOGIN_REGISTER: 'DEVICE:LOGIN_REGISTER',
  RECHARGE_RECHARGE: 'RECHARGE:RECHARGE',
  RECHARGE_TRANSFER: 'RECHARGE:TRANSFER',
  RECHARGE_TRANSFER_RECHARGE: 'RECHARGE:TRANSFER_RECHARGE',
  WITHDRAW_WITHDRAW: 'WITHDRAW:WITHDRAW'
})

export const GAME_TYPE_SORT = ['ELECTRONIC', 'CHESS', 'FISHING', 'LOTTERY', 'VIDEO', 'SPORTS']

export const PAGE_SIZE = 32

export const STATUS_SUCCESS = ['success', 'SUCCESS', 'PAID', 'HAVE_ARRIVED']
export const STATUS_FAIL = ['refuse', 'confiscate', 'autoError', 'MANUALLY-END', 'TIMEOUT', 'CANCEL', 'LIMIT_EXCEEED']

export function isSuccessStatus(status) {
  return STATUS_SUCCESS.includes(status)
}

export function isFailStatus(status) {
  return STATUS_FAIL.includes(status)
}
