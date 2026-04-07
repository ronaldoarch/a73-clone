/**
 * Complete multilingual activity name translations.
 */

const ACTIVITY_NAMES = {
  Recharge: { 'pt-BR': 'Recarga', 'en-US': 'Recharge' },
  Rebate: { 'pt-BR': 'Cashback de Apostas', 'en-US': 'Wagering Cashback' },
  Assistance: { 'pt-BR': 'Fundo de Resgate', 'en-US': 'Loss Relief Fund' },
  SignIn: { 'pt-BR': 'Entrar', 'en-US': 'Sign in' },
  LuckyWheel: { 'pt-BR': 'Giro da Sorte', 'en-US': 'Lucky Spin' },
  RedPacket: { 'pt-BR': 'Mina Misteriosa', 'en-US': 'Mysterious Mine' },
  TelegramRedPacket: { 'pt-BR': 'Red Packet do Telegram', 'en-US': 'TG Red Packet' },
  Agency: { 'pt-BR': 'Indique amigos para receber bônus', 'en-US': 'Refer friends to receive a bonus' },
  AgencyTwo: { 'pt-BR': 'Indique amigos para receber bônus 2', 'en-US': 'Refer friends to receive a bonus 2' },
  Custom: { 'pt-BR': 'Evento personalizado', 'en-US': 'Custom event' },
  AssistanceCash: { 'pt-BR': 'Ganhe dinheiro convidando amigos', 'en-US': 'Earn cash by inviting friends' },
  RechargeReward: { 'pt-BR': 'Desconto de recarga', 'en-US': 'Recharge discount' },
  MemberReward: { 'pt-BR': 'Apreciação aos Membros', 'en-US': 'Member Appreciation' },
  MysteryReward: { 'pt-BR': 'Evento de Bônus Misterioso', 'en-US': 'Mystery Bonus Event' },
  CommissionReward: { 'pt-BR': 'Recompensa de Comissão Diária', 'en-US': 'Daily Commission Event Reward' },
  CPFActivity: { 'pt-BR': 'Convidar Amigos', 'en-US': 'Invite Friends' },
  LuckyBet: { 'pt-BR': 'Aposta da Sorte', 'en-US': 'Lucky Bet' },
  SignInVolume: { 'pt-BR': 'Recompensa de entrada', 'en-US': 'Sign in reward' },
  NewUserExclusive: { 'pt-BR': 'Recompensa de primeiro depósito para novos membros', 'en-US': 'New member first deposit reward' },
  MemberRewardMultiDay: { 'pt-BR': 'Apreciação aos Membros (Vários Dias)', 'en-US': 'Member Appreciation (Multiple Days)' },
  RechargePromotion: { 'pt-BR': 'Recompensas de depósito', 'en-US': 'Deposit Rewards' },
  WalletUserActivity: { 'pt-BR': 'Convidar Amigos', 'en-US': 'Invite Friends' },
  FirstRechargeRebate: { 'pt-BR': 'Rebate da Primeira Recarga', 'en-US': 'First Recharge Loss Rebate' },
  FirstWithdrawRebate: { 'pt-BR': 'Rebate da Primeira Saque', 'en-US': 'First Withdrawal Rebate' },
  ReferralRewardsNew: { 'pt-BR': 'Compartilhe para Ganhar', 'en-US': 'Share to Earn' },
  RechargeBonus: { 'pt-BR': 'Bônus de Depósito', 'en-US': 'Deposit Bonus' },
  ValidBet: { 'pt-BR': 'Apostas Efetivas', 'en-US': 'Effective Bets' },
  newbieTaskReward: { 'pt-BR': 'Benefícios para iniciantes', 'en-US': 'Newbie benefits' },
  googleDomainReward: { 'pt-BR': 'Bônus de atualização de versão', 'en-US': 'Version Upgrade Bonus' },
  VIP: { 'pt-BR': 'VIP', 'en-US': 'VIP' },
  RedeemCode: { 'pt-BR': 'Código de Resgate', 'en-US': 'Redeem Code' }
}

const RECHARGE_SUBTYPE_NAMES = {
  'pt-BR': {
    NONE: { FIRST: 'Recompensa Extra para Primeiro Depósito', SINGLE: 'Bônus adicional para cada recarga', SUM: 'Recompensa adicional de recarga acumulativa', MULTIPLE: 'Bônus de depósito múltiplo' },
    DAILY: { FIRST: 'Recompensa Extra de Primeiro Depósito Diário', SINGLE: 'Bônus adicional diário para cada recarga', SUM: 'Recompensa adicional diária por recarga acumulada' },
    WEEKLY: { FIRST: 'Recompensa Extra de Primeiro Depósito Semanal', SINGLE: 'Bônus adicional semanal para cada recarga', SUM: 'Bônus Semanal de Recarga Cumulativa', MULTIPLE: 'Bônus de depósito múltiplo semanalmente' }
  },
  'en-US': {
    NONE: { FIRST: 'First Deposit Extra Reward', SINGLE: 'Additional bonus for every recharge', SUM: 'Cumulative recharge additional reward', MULTIPLE: 'Multiple deposit bonus' },
    DAILY: { FIRST: 'Daily First Deposit Extra Reward', SINGLE: 'Daily Additional bonus for every recharge', SUM: 'Daily Cumulative recharge additional reward' },
    WEEKLY: { FIRST: 'Weekly First Deposit Extra Reward', SINGLE: 'Weekly Additional bonus for every recharge', SUM: 'Weekly Cumulative recharge additional reward', MULTIPLE: 'Multiple deposit bonuses every week' }
  }
}

const RESET_TYPE_NAMES = {
  'pt-BR': { NONE: 'Sem reinício', DAILY: 'Reinício diário', WEEKLY: 'Reinício semanal', WEEKLY_DAY: 'Reinício semanal', MONTHLY_DAY: 'Reinício mensal', PERIODIC: 'Atividade seguinte' },
  'en-US': { NONE: 'No reset', DAILY: 'Reset daily', WEEKLY: 'Reset weekly', WEEKLY_DAY: 'Reset weekly', MONTHLY_DAY: 'Reset monthly', PERIODIC: 'Following activity' }
}

const EXPIRED_AWARD_NAMES = {
  'pt-BR': { ABANDONED: 'Nulo se não reclamado', AUTO: 'Pagamento automático ao expirar', RETAIN_DAY_AUTO: 'Pagamento automático após o período de retenção da recompensa', RETAIN_DAY_ABANDONED: 'Nulo após o período de retenção da recompensa' },
  'en-US': { ABANDONED: 'Void if not claimed', AUTO: 'Auto-payout upon expiration', RETAIN_DAY_AUTO: 'Auto-payout after reward retention period', RETAIN_DAY_ABANDONED: 'Void after reward retention period' }
}

const MAX_REWARD_TEMPLATES = {
  'pt-BR': { OTHER: 'Bônus máximo {maximum}', REBATE: 'Taxa máxima de cashback {maximum}%', OTHER_RANGE: 'Bônus máximo {maximum}%' },
  'en-US': { OTHER: 'Maximum bonus {maximum}', REBATE: 'Maximum rebate rate {maximum}%', OTHER_RANGE: 'Maximum bonus {maximum}%' }
}

function getLocale() {
  return localStorage.getItem('app-language') || 'pt-BR'
}

function normalizeLocale(locale) {
  return locale === 'en-PH' ? 'en-US' : locale
}

export function getActivityName(activityType) {
  const lang = normalizeLocale(getLocale())
  const entry = ACTIVITY_NAMES[activityType]
  return entry?.[lang] || entry?.['en-US'] || activityType
}

export function getActivityDisplayName(activity, activityType) {
  if (activity.nameType === 'CUSTOM') return activity.name
  try {
    const params = JSON.parse(activity.nameParams || '{}')
    return getActivityVariableName(activityType, params.variablesValue) || getActivityName(activityType)
  } catch {
    return getActivityName(activityType)
  }
}

export function getActivityVariableName(activityType, variables) {
  const lang = normalizeLocale(getLocale())

  if (activityType === 'Recharge' && variables?.resetType && variables?.rechargeType) {
    return RECHARGE_SUBTYPE_NAMES[lang]?.[variables.resetType]?.[variables.rechargeType] || getActivityName(activityType)
  }

  return getActivityName(activityType)
}

export function getResetTypeName(resetType) {
  const lang = normalizeLocale(getLocale())
  return RESET_TYPE_NAMES[lang]?.[resetType] || RESET_TYPE_NAMES['en-US']?.[resetType] || resetType
}

export function getExpiredAwardName(expiredType) {
  const lang = normalizeLocale(getLocale())
  return EXPIRED_AWARD_NAMES[lang]?.[expiredType] || EXPIRED_AWARD_NAMES['en-US']?.[expiredType] || expiredType
}

export function getMaxRewardText(type, maximum) {
  const lang = normalizeLocale(getLocale())
  const template = MAX_REWARD_TEMPLATES[lang]?.[type] || MAX_REWARD_TEMPLATES['en-US']?.[type] || ''
  return template.replace('{maximum}', String(maximum))
}

export { ACTIVITY_NAMES, RECHARGE_SUBTYPE_NAMES, RESET_TYPE_NAMES, EXPIRED_AWARD_NAMES }
