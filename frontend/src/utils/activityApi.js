/**
 * Activity API endpoint definitions.
 * Wraps tRPC calls to provide a clean API surface for all activity-related operations.
 * These are structured so they can be used with any API client (tRPC, REST, etc.).
 */

/**
 * Activity type constants (matching tRPC procedure names).
 */
export const ActivityApiType = Object.freeze({
  Recharge: 'Recharge',
  Rebate: 'Rebate',
  Assistance: 'Assistance',
  AssistanceCash: 'AssistanceCash',
  LuckyWheel: 'LuckyWheel',
  Agency: 'Agency',
  AgencyTwo: 'AgencyTwo',
  MemberReward: 'MemberReward',
  MemberRewardMultiDay: 'MemberRewardMultiDay',
  MysteryReward: 'MysteryReward',
  SignIn: 'SignIn',
  SignInVolume: 'SignInVolume',
  RechargePromotion: 'RechargePromotion',
  RedPacket: 'RedPacket',
  RechargeReward: 'RechargeReward',
  LuckyBet: 'LuckyBet',
  Custom: 'Custom',
  CPFActivity: 'CPFActivity',
  WalletUserActivity: 'WalletUserActivity',
  ValidBet: 'ValidBet',
  NewUserExclusive: 'NewUserExclusive',
  CommissionReward: 'CommissionReward'
})

/**
 * API endpoint map for activity operations.
 * Keys are logical names; values describe the tRPC path and params.
 */
export const ActivityEndpoints = {
  list: { path: 'activity.list', auth: true },
  listPublic: { path: 'activity.listPublic', auth: false },
  config: { path: 'activity.config', auth: false },
  detail: { path: 'activity.activityDetail', auth: true },
  detailPublic: { path: 'activity.activityDetailPublic', auth: false },
  apply: { path: 'activity.apply', auth: true },
  validUsers: { path: 'activity.validUsers', auth: true },
  inviteRecords: { path: 'activity.inviteRecords', auth: false },
  sharePhone: { path: 'activity.sharePhone', auth: true },
  recordList: { path: 'activity.recordList', auth: true },
  batchAward: { path: 'activity.batchAward', auth: true },
  redPoint: { path: 'activity.redPoint', auth: true },
  directRechargeList: { path: 'activity.directRechargeList', auth: true },
  googleDomainReward: { path: 'activity.googleDomainReward', auth: true },
  userReceivedList: { path: 'activity.userReceivedList', auth: true },
  homeTop: { path: 'activity.homeTop', auth: false },
  bonusPoolContribution: { path: 'activity.bonusPoolContributionList', auth: true },
  assistanceCashAwards: { path: 'activity.assistanceCashAwards', auth: false },
  assistanceCashHelps: { path: 'activity.assistanceCashHelps', auth: true },
  quickEntryList: { path: 'banner.quickEntryList', auth: false }
}

/**
 * API endpoint map for user operations.
 */
export const UserEndpoints = {
  logout: { path: 'auth.logout', method: 'mutate' },
  details: { path: 'user.details', method: 'query' },
  assets: { path: 'user.assets', method: 'query' },
  bind: { path: 'user.bind', method: 'mutate' },
  updateAvatar: { path: 'user.updateAvatar', method: 'mutate' },
  getHasFirstRechargeAd: { path: 'user.getHasFirstRechargeAd', method: 'query' },
  setHasFirstRechargeAd: { path: 'user.setHasFirstRechargeAd', method: 'mutate' },
  tgUserbindPhone: { path: 'user.tgUserbindPhone', method: 'mutate' }
}

/**
 * API endpoint map for mail operations.
 */
export const MailEndpoints = {
  list: { path: 'mail.list', method: 'query' },
  read: { path: 'mail.read', method: 'query' },
  noRead: { path: 'mail.noRead', method: 'query' },
  update: { path: 'mail.update', method: 'query' }
}

/**
 * API endpoint map for favorites.
 */
export const FavoriteEndpoints = {
  list: { path: 'favorite.list', method: 'query' },
  create: { path: 'favorite.create', method: 'mutate' },
  del: { path: 'favorite.del', method: 'mutate' }
}

/**
 * API endpoint map for records.
 */
export const RecordEndpoints = {
  assetsChange: { path: 'record.assetsChange', method: 'query' },
  gameRecord: { path: 'record.gameRecord', method: 'query' },
  userProfit: { path: 'record.userProfit', method: 'query' }
}

/**
 * API endpoint map for VIP.
 */
export const VipEndpoints = {
  info: { path: 'vip.info', method: 'query' },
  list: { path: 'vip.list', method: 'query' },
  receiveAll: { path: 'vip.receiveAll', method: 'mutate' }
}

/**
 * API endpoint map for rewards.
 */
export const RewardEndpoints = {
  list: { path: 'reward.list', method: 'query' },
  receive: { path: 'reward.receive', method: 'mutate' },
  double: { path: 'reward.double', method: 'mutate' },
  getBePaidPayOrder: { path: 'reward.getBePaidPayOrder', method: 'query' }
}

/**
 * API endpoint map for redeem codes.
 */
export const RedeemEndpoints = {
  getConfig: { path: 'redeemCode.getRedeemCodeConfig', method: 'query' },
  info: { path: 'redeemCode.info', method: 'mutate' }
}

/**
 * API endpoint map for announcements.
 */
export const AnnouncementEndpoints = {
  loginIn: { path: 'announcement.loginIn', method: 'query' }
}

/**
 * Build activity detail params.
 */
export function buildDetailParams(activityId, type) {
  return { activityId, type }
}

/**
 * Build activity apply params.
 */
export function buildApplyParams(activityId, type, info = {}, appType) {
  return {
    id: activityId,
    applyInfo: { type, info: { ...info, ...(appType ? { appType } : {}) } }
  }
}
