/**
 * Tenant configuration schema definitions.
 * Defines all configurable categories and their default values,
 * matching the admin panel configuration structure.
 */

export const ConfigCategory = Object.freeze({
  PAYMENT: 'PAYMENT',
  SYSTEM: 'SYSTEM',
  WITHDRAW: 'WITHDRAW',
  LOGIN: 'LOGIN',
  AGENCY: 'AGENCY',
  ACTIVITY: 'ACTIVITY',
  CHANNEL: 'CHANNEL',
  REDEEMCODE: 'REDEEMCODE',
  TEST: 'TEST',
  EXPORT: 'EXPORT',
  AGENCY_SETTINGS: 'AGENCY_SETTINGS',
  AGENCY_RANK: 'AGENCY_RANK',
  QUERY_CONDITION: 'QUERY_CONDITION',
  REGION: 'REGION',
  NEWBIE_TASK: 'NewbieTask',
  REGISTER_REWARD: 'REGISTER_REWARD',
  DOMAIN: 'DOMAIN',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  SECURITY: 'SECURITY',
  COMPANY: 'COMPANY',
  TG_BOT: 'TG_BOT',
  INVITE_SETTINGS: 'INVITE_SETTINGS'
})

export const SystemConfigDefaults = Object.freeze({
  siteName: '',
  siteLogo: '',
  appIcon: '',
  trialPlay: false,
  trialPlayAmount: 0,
  onlineService: false,
  isSeo: true,
  seoSiteName: '',
  seoSiteDesc: '',
  footerText: '',
  appLanguage: ['en-US'],
  appDefaultLanguage: 'en-US',
  gameSortRule: 'default',
  hotGameSortRule: 'default',
  pwaInstallType: 'own',
  reportTimeRange: 1,
  homeNavType: 'Platform',
  sidebarBannerStyle: 'style2',
  gameLogoStyle: 'style1',
  homeVideoSwitch: 'OFF',
  homeAppDownloadGuideSwitch: true,
  quickEntryCloseType: 'all'
})

export const LoginConfigDefaults = Object.freeze({
  registerTypes: ['Phone'],
  loginTypes: ['Phone'],
  registerType: 'Phone',
  accountRegisterSwitch: false,
  accountRegisterShowPhone: false,
  accountRegisterPhoneRequired: false,
  accountRegisterPhoneValidate: false,
  phoneRegisterSwitch: true,
  phoneRegisterPhoneValidate: false,
  googleRegisterSwitch: false,
  registerIpLimit: 100,
  registerIpLimitHour: 100,
  registerIpLimitWeek: 100,
  passwordErrorFreeze: 3,
  allowEmailPhoneLogin: true,
  allowUserChangePassword: true,
  allowChangeAssetPassword: true,
  allowChangePhone: true,
  allowChangeEmail: true,
  registerRewardSwitch: 'OFF',
  registerRewardAmount: 0,
  rewardAuditMultiple: 1,
  captchaSwitch: 'OFF',
  imageCaptchaSwitch: 'OFF',
  loginCaptcha: 'OFF',
  needCpf: false,
  needRealName: false,
  needBirthday: false,
  needRealNameInput: false,
  needAge: false,
  findPasswordValidate: false,
  fingerprintVerifySwitch: 'OFF',
  fingerprintPublicKey: ''
})

export const PaymentConfigDefaults = Object.freeze({
  paymentSwitch: true,
  callbackFloatAmount: 100,
  threeMaxUnpaidOrder: 1000,
  transferMaxUnpaidOrder: 1000,
  transferOrderExpireTime: 3600,
  channelSwitchInterval: 1,
  showTransferVoucher: 'OFF',
  showTransferName: 'OFF',
  transferNameRequired: 'OFF',
  channelDiscountSwitch: 'OFF'
})

export const WithdrawConfigDefaults = Object.freeze({
  withdrawSwitch: false,
  rechargeMultiple: 2,
  rewardMultiple: 2,
  autoWithdrawalSwitch: false,
  autoWithdrawalAmountMix: 0,
  autoWithdrawalAmountMax: 0,
  auditAutoRelieve: 500,
  autoRefuseSwitch: 'ON',
  autoWithdrawalLimitSwitch: 'ON',
  autoWithdrawalLimitType: 'validBet',
  autoWithdrawalPollingSwitch: 'ON',
  successRateType: 'Number',
  minSuccessRate: 80,
  auditAutoRelieveType: 'recharge'
})

export const ActivityConfigDefaults = Object.freeze({
  tabSort: [
    { title: 'all', sort: 1, isOpen: true },
    { title: 'ELECTRONIC', sort: 2, isOpen: true },
    { title: 'CHESS', sort: 3, isOpen: true },
    { title: 'FISHING', sort: 4, isOpen: true },
    { title: 'VIDEO', sort: 5, isOpen: true },
    { title: 'SPORTS', sort: 6, isOpen: true },
    { title: 'LOTTERY', sort: 7, isOpen: true }
  ]
})

export const AgencyConfigDefaults = Object.freeze({
  agencyMode: 'unlimitedLevel',
  commissionType: 'gameType',
  achievementType: 'validBet',
  jumpType: 'home',
  shareTextType: 'Default'
})

export const RegisterRewardDefaults = Object.freeze({
  rewardSwitch: false,
  awardType: 'FIXED',
  rewardAmountMin: 0,
  rewardAmountMax: 0,
  expectRewardAmount: 0,
  auditMultiple: 1,
  buttonShowAmount: '',
  virtualRewardRate: 0
})

export const AnnouncementConfigDefaults = Object.freeze({
  announcementPopupWay: 'one',
  announcementLabelStyle: 'bottom'
})

/**
 * Get default config values for a category.
 */
export function getConfigDefaults(category) {
  const map = {
    [ConfigCategory.SYSTEM]: SystemConfigDefaults,
    [ConfigCategory.LOGIN]: LoginConfigDefaults,
    [ConfigCategory.PAYMENT]: PaymentConfigDefaults,
    [ConfigCategory.WITHDRAW]: WithdrawConfigDefaults,
    [ConfigCategory.ACTIVITY]: ActivityConfigDefaults,
    [ConfigCategory.AGENCY]: AgencyConfigDefaults,
    [ConfigCategory.REGISTER_REWARD]: RegisterRewardDefaults,
    [ConfigCategory.ANNOUNCEMENT]: AnnouncementConfigDefaults
  }
  return map[category] || {}
}
