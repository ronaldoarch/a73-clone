export const DeviceType = Object.freeze({
  Unknown: 0,
  PC: 1,
  Android: 2,
  IOS: 3
})

export const AuthAction = Object.freeze({
  Login: 1,
  Register: 2
})

export const LoginType = Object.freeze({
  Account: 'Account',
  Phone: 'Phone'
})

export const PageName = Object.freeze({
  INICIO: 'inicio',
  PROMO: 'promo',
  ENTRAR: 'entrar',
  SUPPORT: 'suporte',
  WITHDRAW: 'withdraw',
  PERFIL: 'perfil',
  INVITE: 'agency'
})

export const UserStatus = Object.freeze({
  NORMAL: 1,
  OFFLINE: 2,
  FROZEN: 3
})

export const BrowserType = Object.freeze({
  MOBILE_SAFARI: 'Mobile Safari',
  CHROME: 'Chrome',
  EDGE: 'Edge',
  FACEBOOK: 'Facebook',
  CHROME_WEBVIEW: 'Chrome WebView',
  WEBKIT: 'WebKit',
  SAMSUNG_INTERNET: 'Samsung Internet'
})

export const PlatformType = Object.freeze({
  IOS_H5: 'iOSH5',
  ANDROID_H5: 'AndroidH5',
  PWA: 'PWA',
  APK: 'APK',
  IOS_APP: 'iOSApp',
  IOS_BOOKMARK: 'iOSBookmark',
  APK_RELEASE: 'APKRelease',
  DESKTOP_OS: 'DesktopOS'
})

export const OSType = Object.freeze({
  WEB: 'web',
  ANDROID: 'android',
  IOS: 'ios'
})

export const OpenUrlType = Object.freeze({
  KWAI: 'Kwai',
  OPEN_URL: 'OPEN_URL'
})

export const GameType = Object.freeze({
  ELECTRONIC: 'ELECTRONIC',
  CHESS: 'CHESS',
  FISHING: 'FISHING',
  VIDEO: 'VIDEO',
  SPORTS: 'SPORTS',
  LOTTERY: 'LOTTERY'
})

export const GAME_TYPES = Object.values(GameType)

export const GameDisplayMode = Object.freeze({
  GAME_LIST: 'gameList',
  HALL: 'hall'
})

export const GameOwnership = Object.freeze({
  OWN: 'OWN',
  THIRD: 'THIRD',
  OWN_THIRD: 'OWN_THIRD'
})

export const SwitchState = Object.freeze({
  OFF: 'OFF',
  ON: 'ON',
  MAINTAIN: 'MAINTAIN'
})

export const GameSortType = Object.freeze({
  PROFIT: 'PROFIT',
  BET: 'BET',
  MIN_BET_PROFIT: 'MIN_BET_PROFIT',
  DEFAULT: 'DEFAULT'
})

export const ThemeStyle = Object.freeze({
  STYLE1: 'style1',
  STYLE2: 'style2',
  STYLE3: 'style3'
})

export const UserType = Object.freeze({
  NORMAL: 'normal',
  TEST: 'test',
  DEMO: 'demo'
})

export const AdminRole = Object.freeze({
  MASTER_MAIN: 'MasterMainAdmin',
  MASTER_SUB: 'MasterSubAdmin',
  CHILD_MAIN: 'ChildMainAdmin',
  CHILD_SUB: 'ChildSubAdmin',
  COMPANY_MAIN: 'CompanyMainAdmin',
  COMPANY_SUB: 'CompanySubAdmin'
})

export const TenantType = Object.freeze({
  MASTER: 'Master',
  CHILD: 'Child',
  COMPANY: 'Company'
})

export const BetStatus = Object.freeze({
  UNSETTLED: 'UNSETTLED',
  SETTLED: 'SETTLED',
  SYSTEM_CANCEL: 'SYSTEMCANCEL',
  MANUALLY_CANCEL: 'MANUALLYCANCEL'
})

export const TransactionCategory = Object.freeze({
  recharge: ['manual', 'external', 'offlineTransfer', 'externalManual'],
  withdraw: ['manual', 'apply', 'complete', 'reject', 'confiscation'],
  activity: [
    'manualRecharge', 'externalRecharge', 'offlineTransfer', 'rechargeReward',
    'manualGift', 'manualGiftRNR', 'manualGiftFDNR', 'manualGiftTVU',
    'manualGiftMDVU', 'manualGiftAiTVU', 'manualGiftAiMDVU', 'channelGift',
    'firstRecharge', 'sumRecharge', 'singleRecharge', 'multipleRecharge',
    'vip', 'signIn', 'dailyAssistance', 'weeklyAssistance', 'rebate',
    'redPacket', 'telegramRedPacket', 'agency', 'custom', 'luckyWheel',
    'redeemCode', 'assistanceCash', 'installGift', 'memberReward',
    'commissionRankReward', 'registerReward', 'mysteryReward',
    'commissionReward', 'cpfActivity', 'googleDomainReward', 'luckyBet',
    'signInVolumeReward', 'newUserExclusive', 'walletUserActivity',
    'memberRewardMultiDay', 'rechargePromotion', 'firstRechargeRebate',
    'firstWithdrawRebate', 'rechargeBonus', 'referralRewardsNew',
    'thirdGameDiscount', 'agencyTwo', 'inviteCommission', 'validBet'
  ],
  game: ['bet', 'settle', 'cancel', 'rollback'],
  platform: ['in', 'out'],
  safebox: ['in', 'out'],
  commission: ['settle', 'receive', 'inviteReward', 'firstRecharge'],
  task: ['newbieTaskReward'],
  other: ['tip', 'cancelTip']
})

export const TRANSACTION_CATEGORIES = Object.keys(TransactionCategory)

export function getTransactionTypes() {
  return TRANSACTION_CATEGORIES.flatMap(cat =>
    TransactionCategory[cat].map(sub => `${cat}:${sub}`)
  )
}

export const AuthMethod = Object.freeze({
  ACCOUNT: 'account:account',
  PHONE: 'phone:phone',
  EMAIL: 'email:email',
  GITHUB: 'email:github',
  GOOGLE: 'email:google',
  TWITTER: 'email:twitter',
  TG: 'account:tg'
})

export const AuthMethodGroup = Object.freeze({
  account: ['account', 'tg'],
  phone: ['phone'],
  email: ['email', 'github', 'google', 'twitter']
})

export const RegisterMethod = Object.freeze({
  ACCOUNT: 'Account',
  PHONE: 'Phone',
  GOOGLE: 'Google'
})

export const VerifyType = Object.freeze({
  PHONE: 'Phone',
  EMAIL: 'Email',
  NULL: 'Null'
})

export const KYCField = ['', 'PHONE', 'EMAIL', 'CPF', 'CNPJ', 'EVP']

export const VerifyCodeType = Object.freeze({
  SIGNUP: 'signup',
  FORGOT_PASSWORD: 'forgot_password',
  CHANGE_ASSET_PASSWORD: 'change_asset_password',
  CHANGE_PASSWORD: 'change_password',
  BIND_EMAIL: 'bind_email',
  BIND_PHONE: 'bind_phone'
})

export const IdentifierType = Object.freeze({
  PHONE: 'phone',
  EMAIL: 'email',
  PASSWORD: 'password'
})

export const ClientDevice = Object.freeze({
  ANDROID: 'ANDROID',
  IOS: 'IOS',
  WEB: 'WEB'
})

export const PaymentDirection = Object.freeze({
  PAY: 'PAY',
  WITHDRAW: 'WITHDRAW'
})

export const PaymentSource = Object.freeze({
  THREE_PARTY_PAYMENT: 'THREE_PARTY_PAYMENT',
  TRANSFER: 'TRANSFER',
  THREE_PARTY_WALLET: 'THREE_PARTY_WALLET'
})

export const AmountType = Object.freeze({
  FIXED: 'FIXED',
  RANGE: 'RANGE'
})

export const ChannelStatus = Object.freeze({
  TEST: 'TEST',
  ON: 'ON',
  OFF: 'OFF',
  DELETE: 'DELETE'
})

export const RewardType = Object.freeze({
  NOTHING: 'NOTHING',
  GIVE_AWAY: 'GIVE_AWAY',
  RECOMMEND: 'RECOMMEND',
  DISCOUNT: 'DISCOUNT'
})

export const RechargeCondition = Object.freeze({
  NO_LIMIT: 'NO_LIMIT',
  FIRST_RECHARGE: 'FIRST_RECHARGE',
  RECHARGE_2: 'RECHARGE_2',
  RECHARGE_3: 'RECHARGE_3',
  CPF_FIRST_WITHDRAW: 'CPF_FIRST_WITHDRAW',
  CUMULATIVE_RECHARGE: 'CUMULATIVE_RECHARGE'
})

export const DepositStatus = Object.freeze({
  BE_PAID: 'BE_PAID',
  PAID: 'PAID',
  MANUAL_COMPLETION: 'MANUAL_COMPLETTION',
  CANCEL: 'CANCEL',
  TIMEOUT: 'TIMEOUT'
})

export const WithdrawStatus = Object.freeze({
  BE_PAID: 'BE_PAID',
  TO_BE_REVIEW: 'TO-BE-REVIEW',
  UNDER_REVIEW: 'UNDER-REVIEW',
  SUCCESS: 'SUCCESS',
  MANUALLY_END: 'MANUALLY-END',
  TIMEOUT: 'TIMEOUT',
  CANCEL: 'CANCEL'
})

export const WithdrawProcessStatus = Object.freeze({
  APPLY: 'apply',
  LOCK: 'lock',
  REFUSE: 'refuse',
  CONFISCATE: 'confiscate',
  INPROG: 'inprog',
  FAIL: 'fail',
  ERROR: 'error',
  SUCCESS: 'success'
})

export const CommissionType = Object.freeze({
  UNLIMITED_LEVEL: 'unlimitedLevel',
  MULTIPLE_LEVEL: 'multipleLevel'
})

export const CommissionCalcType = Object.freeze({
  GAME_TYPE: 'gameType',
  NO_GAME_TYPE: 'noGameType'
})

export const CommissionBasis = Object.freeze({
  VALID_BET: 'validBet',
  RECHARGE: 'recharge'
})

export const CommissionRate = Object.freeze({
  RATIO: 'ratio',
  FIXED: 'fixed'
})

export const AgentType = Object.freeze({
  AGENT: 'agent',
  NOT_AGENT: 'notAgent'
})

export const AgentLevel = Object.freeze({
  DEFAULT: 'DEFAULT',
  FORMAL: 'FORMAL',
  CUSTOMIZE: 'CUSTOMIZE'
})

export const TimePeriod = Object.freeze({
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month'
})

export const PaymentNavType = Object.freeze({
  NATIVE: 'NATIVE',
  WAKE: 'WAKE',
  MIXED: 'MIXED',
  SCAN: 'SCAN'
})

export const RedirectType = Object.freeze({
  DEFAULT: 'DEFAULT',
  REDIRECT: 'REDIRECT'
})

export const UserSearchField = Object.freeze({
  USER_ID: 'userId',
  ACCOUNT: 'account',
  REGISTER_IP: 'registerIp',
  PHONE: 'phone',
  EMAIL: 'email',
  PARENT_ID: 'parentId',
  TOP_ID: 'topId',
  AGENT_ID: 'agentId',
  RECOMMENDED_ID: 'recommendedId',
  CPF: 'CPF',
  WITHDRAW_PHONE: 'withdrawPhone',
  MAYA: 'MAYA',
  GCASH: 'GCASH',
  REAL_NAME: 'realName',
  EVP: 'EVP',
  CNPJ: 'CNPJ',
  IFSC: 'IFSC',
  UPI: 'UPI'
})

export const NotificationStatus = Object.freeze({
  PENDING: 'pending',
  SENDING: 'sending',
  TERMINATE: 'terminate',
  SUCCESS: 'success',
  DELETE: 'delete'
})

export const OnlineStatus = Object.freeze({
  ALL: 'all',
  ONLINE: 'online',
  OFFLINE: 'offline'
})

export const MessageType = Object.freeze({
  TEXT: 'TEXT',
  IMAGE: 'IMAGE'
})

export const ScheduleType = Object.freeze({
  IMMEDIATE: 'immediate',
  SCHEDULED: 'scheduled'
})

export const Locales = Object.freeze({
  'en-US': 'English',
  'zh-CN': '中文',
  'pt-BR': 'Português',
  'id-ID': 'bahasa Indonesia',
  'hi-IN': 'हिंदी',
  'en-PH': 'English',
  'vi-VN': 'Tiếng Việt'
})

export const DEFAULT_LOCALE = 'pt-BR'

export const SUPPORTED_LOCALES = Object.keys(Locales)
