/**
 * Complete activity type definitions matching the original A73 platform.
 * Each activity type defines its behavior, distribution, reset, and audit rules.
 */

export const ActivityType = Object.freeze({
  RECHARGE: 'Recharge',
  REBATE: 'Rebate',
  ASSISTANCE: 'Assistance',
  SIGN_IN: 'SignIn',
  LUCKY_WHEEL: 'LuckyWheel',
  RED_PACKET: 'RedPacket',
  TELEGRAM_RED_PACKET: 'TelegramRedPacket',
  AGENCY: 'Agency',
  CUSTOM: 'Custom',
  ASSISTANCE_CASH: 'AssistanceCash',
  RECHARGE_REWARD: 'RechargeReward',
  MEMBER_REWARD: 'MemberReward',
  MYSTERY_REWARD: 'MysteryReward',
  COMMISSION_REWARD: 'CommissionReward',
  CPF_ACTIVITY: 'CPFActivity',
  LUCKY_BET: 'LuckyBet',
  SIGN_IN_VOLUME: 'SignInVolume',
  NEW_USER_EXCLUSIVE: 'NewUserExclusive',
  MEMBER_REWARD_MULTI_DAY: 'MemberRewardMultiDay',
  RECHARGE_PROMOTION: 'RechargePromotion',
  WALLET_USER_ACTIVITY: 'WalletUserActivity',
  FIRST_RECHARGE_REBATE: 'FirstRechargeRebate',
  FIRST_WITHDRAW_REBATE: 'FirstWithdrawRebate',
  RECHARGE_BONUS: 'RechargeBonus',
  REFERRAL_REWARDS_NEW: 'ReferralRewardsNew',
  AGENCY_TWO: 'AgencyTwo',
  VALID_BET: 'ValidBet'
})

export const ACTIVITY_TYPES = Object.values(ActivityType)

export const NonConfigurableActivityType = Object.freeze({
  VIP: 'VIP',
  REDEEM_CODE: 'RedeemCode',
  OTHER: 'Other',
  DOMAIN_RESCUE: 'DomainRescue',
  NEWBIE_TASK: 'NewbieTask',
  DAILY_TASK: 'DailyTask',
  INVITE_REWARD: 'InviteReward',
  INVITE_COMMISSION: 'InviteCommission'
})

export const ALL_ACTIVITY_TYPES = [...ACTIVITY_TYPES, ...Object.values(NonConfigurableActivityType)]

export const ActivityConfig = Object.freeze({
  [ActivityType.RECHARGE]: {
    distributeType: ['AUTO'],
    resetType: ['NONE', 'DAILY', 'WEEKLY'],
    auditType: ['AUTO'],
    awardType: ['BALANCE', 'ACTIVITY']
  },
  [ActivityType.REBATE]: {
    distributeType: ['MANUAL'],
    resetType: ['NONE', 'DAILY'],
    auditType: ['AUTO'],
    awardType: ['BALANCE', 'ACTIVITY']
  },
  [ActivityType.ASSISTANCE]: {
    distributeType: ['AUTO'],
    resetType: ['DAILY', 'WEEKLY'],
    auditType: ['AUTO'],
    awardType: ['BALANCE', 'ACTIVITY']
  },
  [ActivityType.SIGN_IN]: {
    distributeType: ['AUTO'],
    resetType: ['NONE', 'MONTHLY_DAY'],
    auditType: ['AUTO'],
    awardType: ['BALANCE']
  },
  [ActivityType.LUCKY_WHEEL]: {
    distributeType: ['AUTO'],
    resetType: ['NONE', 'DAILY', 'WEEKLY'],
    auditType: ['AUTO'],
    awardType: ['BALANCE']
  },
  [ActivityType.RED_PACKET]: {
    distributeType: ['AUTO'],
    resetType: ['DAILY'],
    auditType: ['AUTO'],
    awardType: ['BALANCE']
  },
  [ActivityType.AGENCY]: {
    distributeType: ['AUTO'],
    resetType: ['NONE'],
    auditType: ['AUTO'],
    awardType: ['ACTIVITY']
  },
  [ActivityType.CUSTOM]: {
    distributeType: ['MANUAL'],
    resetType: ['NONE'],
    auditType: ['MANUAL'],
    awardType: ['BALANCE']
  },
  [ActivityType.MEMBER_REWARD]: {
    distributeType: ['AUTO'],
    resetType: ['MONTHLY_DAY', 'WEEKLY_DAY', 'DAILY'],
    auditType: ['AUTO'],
    awardType: ['ACTIVITY']
  },
  [ActivityType.MYSTERY_REWARD]: {
    distributeType: ['AUTO'],
    resetType: ['NONE', 'PERIODIC'],
    auditType: ['AUTO'],
    awardType: ['BALANCE', 'ACTIVITY']
  },
  [ActivityType.COMMISSION_REWARD]: {
    distributeType: ['AUTO'],
    resetType: ['DAILY', 'WEEKLY_DAY', 'MONTHLY_DAY'],
    auditType: ['AUTO'],
    awardType: ['ACTIVITY']
  },
  [ActivityType.CPF_ACTIVITY]: {
    distributeType: ['AUTO'],
    resetType: ['NONE', 'WEEKLY_DAY', 'MONTHLY_DAY'],
    auditType: ['AUTO'],
    awardType: ['ACTIVITY']
  },
  [ActivityType.LUCKY_BET]: {
    distributeType: ['AUTO'],
    resetType: ['NONE'],
    auditType: ['AUTO'],
    awardType: ['BALANCE', 'ACTIVITY']
  },
  [ActivityType.RECHARGE_PROMOTION]: {
    distributeType: ['AUTO'],
    resetType: ['WEEKLY'],
    auditType: ['AUTO'],
    awardType: ['BALANCE']
  },
  [ActivityType.FIRST_RECHARGE_REBATE]: {
    distributeType: ['AUTO'],
    resetType: ['NONE'],
    auditType: ['AUTO'],
    awardType: ['ACTIVITY']
  },
  [ActivityType.FIRST_WITHDRAW_REBATE]: {
    distributeType: ['AUTO'],
    resetType: ['NONE'],
    auditType: ['AUTO'],
    awardType: ['ACTIVITY']
  },
  [ActivityType.RECHARGE_BONUS]: {
    distributeType: ['AUTO'],
    resetType: ['NONE'],
    auditType: ['AUTO'],
    awardType: ['BALANCE'],
    frontendType: ['HOME_POPUP']
  },
  [ActivityType.NEW_USER_EXCLUSIVE]: {
    distributeType: ['AUTO'],
    resetType: ['NONE'],
    auditType: ['AUTO'],
    awardType: ['BALANCE'],
    frontendType: ['HOME_POPUP']
  },
  [ActivityType.REFERRAL_REWARDS_NEW]: {
    distributeType: ['AUTO'],
    resetType: ['NONE'],
    auditType: ['AUTO'],
    awardType: ['ACTIVITY']
  },
  [ActivityType.VALID_BET]: {
    distributeType: ['AUTO'],
    resetType: ['DAILY', 'WEEKLY'],
    auditType: ['AUTO'],
    awardType: ['BALANCE', 'ACTIVITY']
  }
})

export const DistributeType = Object.freeze({
  AUTO: 'AUTO',
  MANUAL: 'MANUAL'
})

export const ResetType = Object.freeze({
  NONE: 'NONE',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  WEEKLY_DAY: 'WEEKLY_DAY',
  MONTHLY_DAY: 'MONTHLY_DAY',
  PERIODIC: 'PERIODIC'
})

export const AwardType = Object.freeze({
  BALANCE: 'BALANCE',
  ACTIVITY: 'ACTIVITY',
  LOTTERY_TICKET: 'LOTTERY_TICKET',
  ITEM: 'ITEM'
})

export const RewardStatus = Object.freeze({
  REVIEWING: 'REVIEWING',
  PENDING: 'PENDING',
  DISTRIBUTED: 'DISTRIBUTED',
  RECEIVED: 'RECEIVED',
  EXPIRED: 'EXPIRED',
  REJECTED: 'REJECTED'
})

export const ActivityStatus = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  FINISHED: 'FINISHED',
  CLOSED: 'CLOSED'
})

export const JoinType = Object.freeze({
  ALL: 'ALL',
  ONE: 'ONE',
  NONE: 'NONE',
  RECHARGE: 'RECHARGE'
})

export const AmountSourceType = Object.freeze({
  RECHARGE: 'RECHARGE',
  PROFIT: 'PROFIT',
  UNLIMITED: 'UNLIMITED',
  BET: 'BET'
})

export const AwardAmountType = Object.freeze({
  FIXED_AMOUNT: 'FIXED_AMOUNT',
  RANDOM_AMOUNT: 'RANDOM_AMOUNT',
  FIXED_RATIO: 'FIXED_RATIO',
  RANDOM_RATIO: 'RANDOM_RATIO'
})

export const TimeRangeType = Object.freeze({
  HISTORY: 'HISTORY',
  TODAY: 'TODAY',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  YESTERDAY: 'YESTERDAY',
  LAST_WEEK: 'LAST_WEEK',
  LAST_MONTH: 'LAST_MONTH',
  RECENT_SEVEN_DAYS: 'RECENT_SEVEN_DAYS',
  RECENT_THIRTY_DAYS: 'RECENT_THIRTY_DAYS'
})

export const AssistanceType = Object.freeze({
  NORMAL: 'NORMAL',
  EXCLUDE_GIFT: 'EXCLUDE_GIFT',
  CUMULATIVE_LOSS: 'CUMULATIVE_LOSS'
})

export const SignInType = Object.freeze({
  CONTINUOUS: 'CONTINUOUS',
  CUMULATIVE: 'CUMULATIVE'
})

export const CycleType = Object.freeze({
  ONCE: 'ONCE',
  CYCLE: 'CYCLE'
})

export const WheelPrizeType = Object.freeze({
  PROP_H: 'prop_H',
  PROP_A: 'prop_A',
  PROP_P: 'prop_P',
  PROP_Y: 'prop_Y',
  GOLD_COINS: 'goldCoins',
  NOTHING: 'nothing'
})

export const TicketGetType = Object.freeze({
  FIRST_LOGIN: 'firstLogin',
  FIRST_RECHARGE: 'firstRecharge',
  EVERY_DAY_FIRST_RECHARGE: 'everyDayFirstRecharge',
  RECHARGE: 'recharge',
  CUMULATIVE_RECHARGE: 'cumulativeRecharge',
  VALID_BET: 'validBet',
  CUMULATIVE_VALID_BET: 'cumulativeValidBet'
})

export const BonusSource = Object.freeze({
  RECHARGE: 'RECHARGE',
  ACTIVITY: 'ACTIVITY',
  SYSTEM: 'SYSTEM',
  TASK: 'TASK'
})

export const RewardAuditType = Object.freeze({
  GIFT: 'Gift',
  GIFT_AND_RECHARGE: 'GiftAndRecharge'
})

export const SchedulePeriod = Object.freeze({
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  PROMOTION: 'PROMOTION'
})

export const TaskCategory = Object.freeze({
  NEWBIE: 'NewbieTask',
  DAILY: 'DailyTask'
})

export const NewbieTaskType = Object.freeze({
  INSTALL_APK: 'InstallAPK',
  REGISTER_ACCOUNT: 'RegisterAccount',
  INSTALL_PWA: 'InstallPWA',
  BIND_CPF: 'BindCPF',
  SET_ASSETS_PASSWORD: 'SetAssetsPassword',
  BIND_PHONE: 'BindPhone',
  BIND_EMAIL: 'BindEmail',
  FIRST_WITHDRAWAL: 'FirstWithdrawal',
  FIRST_RECHARGE: 'FirstRecharge'
})

export const TASK_TYPES = {
  NewbieTask: Object.values(NewbieTaskType),
  DailyTask: []
}

export const NavigationTarget = Object.freeze({
  ACTIVITY: 'activity',
  RECHARGE: 'recharge',
  WITHDRAW: 'withdraw',
  PROMOTION: 'promotion',
  ACTIVITY_LIST: 'activity_list',
  VIP: 'vip',
  REDEEM_CODE: 'redeem_code',
  HOME: 'home',
  GAME: 'game'
})

export const CardLinkType = Object.freeze({
  NONE: 'none',
  INTERNAL: 'internal',
  EXTERNAL: 'external',
  GAME_PLATFORM: 'gamePlatform',
  GAME: 'game'
})

export const CardSectionType = Object.freeze({
  HOT_PLATFORM_CARD: 'HotPlatformCard',
  CUSTOM_CARD: 'CustomCard'
})

export const LeaderboardType = Object.freeze({
  BET: 'bet',
  COMMISSION: 'commission',
  PROFIT: 'profit',
  BONUS: 'bonus'
})

export const LeaderboardTime = Object.freeze({
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month'
})
