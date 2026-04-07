/**
 * Complete activity rule generation engine.
 * Generates localized rule text for all 27+ activity types, matching the original platform.
 */

import { formatCurrency } from './formatters'

function normalizeLocale(locale) {
  return locale === 'en-PH' ? 'en-US' : locale
}

function getLocale() {
  return normalizeLocale(localStorage.getItem('app-language') || 'pt-BR')
}

function formatAmount(value, locale) {
  locale = normalizeLocale(locale)
  const localeMap = { 'pt-BR': 'pt-BR', 'en-US': 'en-US', 'zh-CN': 'zh-CN', 'id-ID': 'id-ID', 'hi-IN': 'hi-IN', 'vi-VN': 'vi-VN' }
  return new Intl.NumberFormat(localeMap[locale] || 'en-US', { style: 'decimal' }).format(Number(value))
}

const commonDisclaimer = {
  'pt-BR': {
    5: 'Somente o proprietário da conta pode realizar operações manuais normais, caso contrário, o bônus será cancelado ou deduzido, congelado ou até mesmo colocado na lista negra;\n',
    6: 'Para evitar diferenças na compreensão do texto, a plataforma se reserva o direito final de interpretação desta atividade.\n'
  },
  'en-US': {
    5: 'Only the account owner can perform normal manual operations, otherwise the bonus will be cancelled or deducted, frozen, or even blacklisted;\n',
    6: 'In order to avoid differences in text understanding, the platform reserves the final right of interpretation of this activity.\n'
  },
  'id-ID': {
    5: 'Hanya pemilik akun yang dapat melakukan operasi manual normal, jika tidak bonus akan dibatalkan atau dipotong, dibekukan, atau bahkan dimasukkan ke daftar hitam;\n',
    6: 'Untuk menghindari perbedaan pemahaman teks, platform berhak atas interpretasi akhir dari aktivitas ini.\n'
  },
  'vi-VN': {
    5: 'Chỉ chủ tài khoản mới có thể thực hiện các thao tác thủ công bình thường, nếu không tiền thưởng sẽ bị hủy hoặc khấu trừ, đóng băng hoặc thậm chí bị đưa vào danh sách đen;\n',
    6: 'Để tránh sự khác biệt trong hiểu biết văn bản, nền tảng có quyền giải thích cuối cùng về hoạt động này.\n'
  },
  'hi-IN': {
    5: 'केवल खाता स्वामी ही सामान्य मैन्युअल ऑपरेशन कर सकता है, अन्यथा बोनस रद्द या कटौती, फ्रीज़ या ब्लैकलिस्ट भी किया जा सकता है;\n',
    6: 'पाठ समझ में अंतर से बचने के लिए, प्लेटफ़ॉर्म इस गतिविधि की अंतिम व्याख्या का अधिकार सुरक्षित रखता है।\n'
  }
}

const auditTemplates = {
  'pt-BR': {
    Gift: 'O bônus (excluindo o principal) requer {multiplier} vezes de apostas válidas para sacar;\n',
    GiftAndRecharge: 'O bônus (incluindo o principal) requer {multiplier} vezes de apostas válidas para sacar;\n'
  },
  'en-US': {
    Gift: 'The bonus (excluding principal) requires {multiplier} times of valid bets to withdraw;\n',
    GiftAndRecharge: 'The bonus (including principal) requires {multiplier} times of valid bets to withdraw;\n'
  },
  'id-ID': {
    Gift: 'Bonus (tidak termasuk pokok) memerlukan {multiplier} kali taruhan valid untuk ditarik;\n',
    GiftAndRecharge: 'Bonus (termasuk pokok) memerlukan {multiplier} kali taruhan valid untuk ditarik;\n'
  },
  'vi-VN': {
    Gift: 'Tiền thưởng (không bao gồm tiền gốc) cần {multiplier} lần cược hợp lệ để rút;\n',
    GiftAndRecharge: 'Tiền thưởng (bao gồm tiền gốc) cần {multiplier} lần cược hợp lệ để rút;\n'
  },
  'hi-IN': {
    Gift: 'बोनस (मूल धनराशि को छोड़कर) निकासी के लिए {multiplier} गुना वैध दांव की आवश्यकता है;\n',
    GiftAndRecharge: 'बोनस (मूल धनराशि सहित) निकासी के लिए {multiplier} गुना वैध दांव की आवश्यकता है;\n'
  }
}

const awardExpiryRules = {
  'pt-BR': {
    ACTIVITY: {
      AUTO: 'O bônus deve ser coletado manualmente e será distribuído automaticamente após o vencimento;\n',
      ABANDONED: 'O bônus deve ser coletado manualmente e será cancelado após o vencimento;\n',
      RETAIN_DAY_AUTO: 'O bônus deve ser coletado manualmente e será distribuído automaticamente após {awardExpiredDays} dias;\n',
      RETAIN_DAY_ABANDONED: 'O bônus deve ser coletado manualmente e será cancelado após {awardExpiredDays} dias;\n',
      RETAIN_DAY_AUTO_PERMANENT: 'O bônus deve ser coletado manualmente e permanecerá disponível durante o evento;\n',
      RETAIN_DAY_ABANDONED_PERMANENT: 'O bônus deve ser coletado manualmente e permanecerá disponível durante o evento;\n'
    },
    BALANCE: {
      AUTO: 'O bônus é coletado automaticamente e será distribuído automaticamente após o vencimento;\n',
      ABANDONED: 'O bônus é coletado automaticamente e será cancelado após o vencimento;\n',
      RETAIN_DAY_AUTO: 'O bônus é coletado automaticamente e será distribuído automaticamente após {awardExpiredDays} dias;\n',
      RETAIN_DAY_ABANDONED: 'O bônus é coletado automaticamente e será cancelado após {awardExpiredDays} dias;\n',
      RETAIN_DAY_AUTO_PERMANENT: 'O bônus é coletado automaticamente e permanecerá disponível durante o evento;\n',
      RETAIN_DAY_ABANDONED_PERMANENT: 'O bônus é coletado automaticamente e permanecerá disponível durante o evento;\n'
    }
  },
  'en-US': {
    ACTIVITY: {
      AUTO: 'The bonus needs to be claimed manually, and will be automatically distributed after it expires;\n',
      ABANDONED: 'The bonus needs to be claimed manually, and will be invalidated after it expires;\n',
      RETAIN_DAY_AUTO: 'The bonus needs to be claimed manually, and will be automatically distributed after {awardExpiredDays} days of retention;\n',
      RETAIN_DAY_ABANDONED: 'The bonus needs to be claimed manually, and will be invalidated after {awardExpiredDays} days of retention;\n',
      RETAIN_DAY_AUTO_PERMANENT: 'The bonus needs to be claimed manually, and will be retained throughout the event;\n',
      RETAIN_DAY_ABANDONED_PERMANENT: 'The bonus needs to be claimed manually, and will be retained throughout the event;\n'
    },
    BALANCE: {
      AUTO: 'The bonus is automatically claimed, and will be automatically distributed after it expires;\n',
      ABANDONED: 'The bonus is automatically claimed, and will be invalidated after it expires;\n',
      RETAIN_DAY_AUTO: 'The bonus is automatically claimed, and will be automatically distributed after {awardExpiredDays} days of retention;\n',
      RETAIN_DAY_ABANDONED: 'The bonus is automatically claimed, and will be invalidated after {awardExpiredDays} days of retention;\n',
      RETAIN_DAY_AUTO_PERMANENT: 'The bonus is automatically claimed, and will be retained throughout the event;\n',
      RETAIN_DAY_ABANDONED_PERMANENT: 'The bonus is automatically claimed, and will be retained throughout the event;\n'
    }
  }
}

const rechargeRules = {
  'pt-BR': {
    FIRST: 'Os membros podem obter bônus correspondentes para seu primeiro depósito;\n',
    SINGLE: 'Os membros podem obter bônus correspondentes para um único depósito;\n',
    SUM: 'Os membros podem obter bônus correspondentes para depósitos cumulativos;\n',
    MULTIPLE: 'Os membros podem obter bônus correspondentes recarregando várias vezes;\n'
  },
  'en-US': {
    FIRST: 'Members can get corresponding bonuses for their first deposit;\n',
    SINGLE: 'Members can get corresponding bonuses for a single deposit;\n',
    SUM: 'Members can get corresponding bonuses for cumulative deposits;\n',
    MULTIPLE: 'Members can get corresponding bonuses by recharging multiple times;\n'
  }
}

const rebateRules = {
  'pt-BR': { 1: 'Após apostas válidas, o cashback será devolvido proporcionalmente;\n' },
  'en-US': { 1: 'After valid betting, the cashback will be returned in proportion;\n' }
}

const eventDetailsPrefix = {
  'pt-BR': 'Detalhes do Evento: ',
  'en-US': 'Event Details: ',
  'id-ID': 'Detail Acara: ',
  'vi-VN': 'Nội dung hoạt động: ',
  'hi-IN': 'गतिविधि सामग्री: '
}

const luckyBetWinType = {
  'pt-BR': {
    TAIL_NUMBER: 'Valor de aposta única por dia maior ou igual a {validBetAmount}, e o último dígito dos 8 últimos dígitos da aposta contém o número especificado, e o bônus correspondente pode ser obtido;\n',
    CONSECUTIVE_NUMBER: 'Valor de aposta única por dia maior ou igual a {validBetAmount}, e os 8 últimos dígitos da aposta contêm o número especificado em qualquer posição, e o bônus correspondente pode ser obtido;\n',
    CONTAINS_ANY_POSITION: 'Valor de aposta única por dia maior ou igual a {validBetAmount}, e os 8 últimos dígitos da aposta contêm o número especificado em qualquer posição, e o bônus correspondente pode ser obtido;\n'
  },
  'en-US': {
    TAIL_NUMBER: 'Daily single bet amount greater than or equal to {validBetAmount}, and the last digit of the last 8 digits of the bet contains the specified number, and the corresponding bonus can be obtained;\n',
    CONSECUTIVE_NUMBER: 'Daily single bet amount greater than or equal to {validBetAmount}, and the last 8 digits of the bet contain the specified number at any position, and the corresponding bonus can be obtained;\n',
    CONTAINS_ANY_POSITION: 'Daily single bet amount greater than or equal to {validBetAmount}, and the last 8 digits of the bet contain the specified number at any position, and the corresponding bonus can be obtained;\n'
  }
}

const luckyBetPlatformRules = {
  'pt-BR': {
    ALL: {
      FIXED_COUNT: 'Todas as apostas da plataforma são válidas, Você pode resgatar até {dayLimit} vezes por dia',
      RECHARGE: 'Todas as apostas da plataforma são válidas, O número de resgates depende do valor depositado hoje',
      BET: 'Todas as apostas da plataforma são válidas, O número de resgates depende do valor apostado hoje'
    },
    SELECT: {
      FIXED_COUNT: 'As seguintes apostas da plataforma são válidas: {limitLuckyBetData}, Você pode resgatar até {dayLimit} vezes por dia',
      RECHARGE: 'As seguintes apostas da plataforma são válidas: {limitLuckyBetData}, O número de resgates depende do valor depositado hoje',
      BET: 'As seguintes apostas da plataforma são válidas: {limitLuckyBetData}, O número de resgates depende do valor apostado hoje'
    }
  },
  'en-US': {
    ALL: {
      FIXED_COUNT: 'All platform bets are valid, You can claim up to {dayLimit} times per day',
      RECHARGE: 'All platform bets are valid, Number of claims depends on today\'s deposit',
      BET: 'All platform bets are valid, Number of claims depends on today\'s betting'
    },
    SELECT: {
      FIXED_COUNT: 'The following platform bets are valid: {limitLuckyBetData}, You can claim up to {dayLimit} times per day',
      RECHARGE: 'The following platform bets are valid: {limitLuckyBetData}, Number of claims depends on today\'s deposit',
      BET: 'The following platform bets are valid: {limitLuckyBetData}, Number of claims depends on today\'s betting'
    }
  }
}

const maxClaimTemplates = {
  'pt-BR': { 1: 'Máximo de {receiveLimit} resgates durante o evento;\n' },
  'en-US': { 1: 'Maximum {receiveLimit} claims during the event;\n' }
}

const unlimitedClaimTemplates = {
  'pt-BR': { 1: 'Resgates ilimitados durante o evento;\n' },
  'en-US': { 1: 'Unlimited claims during the event;\n' }
}

const signInVolumeRules = {
  'pt-BR': {
    1: 'Este evento é um evento de entrada contínua de 7 dias. Os membros que apostarem até um certo nível podem receber o bônus correspondente;\n',
    2: 'Se a entrada for interrompida, o bônus será recebido novamente a partir do primeiro dia;\n'
  },
  'en-US': {
    1: 'This event is a 7-day continuous sign-in event. Members who bet to a certain level can receive the corresponding bonus;\n',
    2: 'If the sign-in is interrupted, the bonus will be received again from the first day;\n'
  }
}

const memberRewardAmountTypes = {
  'pt-BR': {
    RECHARGE: 'Os membros podem obter bônus correspondentes ao depositar;\n',
    PROFIT: 'Os membros podem obter bônus correspondentes ao obter lucros ou perdas;\n',
    UNLIMITED: 'Os membros podem obter bônus fixos;\n',
    BET: 'Os membros podem obter bônus correspondentes ao fazer apostas válidas;\n'
  },
  'en-US': {
    RECHARGE: 'Members can get corresponding bonuses by depositing;\n',
    PROFIT: 'Members can get corresponding bonuses by making profits or losses;\n',
    UNLIMITED: 'Members can get fixed bonuses;\n',
    BET: 'Members can get corresponding bonuses by making valid bets;\n'
  }
}

const memberRewardMultiDayRules = {
  'pt-BR': { 1: 'Evento de bônus para membros (período de vários dias);\n' },
  'en-US': { 1: 'Member reward event (multi-day period);\n' }
}

const mysteryRewardRules = {
  'pt-BR': { 1: 'Os membros podem receber bônus misteriosos aleatórios;\n' },
  'en-US': { 1: 'Members can receive random mystery bonuses;\n' }
}

const mysteryResetTypes = {
  'pt-BR': { NONE: 'Uma vez', PERIODIC: 'Ciclo' },
  'en-US': { NONE: 'Disposable', PERIODIC: 'Cycle' }
}

const cpfActivityRules = {
  'pt-BR': { 1: 'Convide amigos para o jogo e você receberá bônus depois que eles concluírem o registro/depósito/aposta;\n' },
  'en-US': { 1: 'Invite friends to the game, and you will receive bonuses after they complete registration/deposit/bet;\n' }
}

const validBetHighestRewardTemplate = {
  'pt-BR': {
    DAILY: 'Durante o evento, você pode receber diferentes níveis de recompensas para cada dia de apostas válidas acumuladas, sendo a recompensa máxima {highestReward}.\n',
    WEEKLY: 'Durante o evento, você pode receber diferentes níveis de recompensas para cada semana de apostas válidas acumuladas, sendo a recompensa máxima {highestReward}.\n'
  },
  'en-US': {
    DAILY: 'During the event, you can receive different tiers of rewards for each day\'s accumulated valid bets, with the highest reward being {highestReward}.\n',
    WEEKLY: 'During the event, you can receive different tiers of rewards for each week\'s accumulated valid bets, with the highest reward being {highestReward}.\n'
  }
}

const validBetTotalRewardTemplate = {
  'pt-BR': {
    DAILY: 'Durante o evento, você pode receber diferentes níveis de recompensas para cada dia de apostas válidas acumuladas, com uma recompensa total de {totalReward}.\n',
    WEEKLY: 'Durante o evento, você pode receber diferentes níveis de recompensas para cada semana de apostas válidas acumuladas, com uma recompensa total de {totalReward}.\n'
  },
  'en-US': {
    DAILY: 'During the event, you can receive different tiers of rewards for each day\'s accumulated valid bets, with a total reward of {totalReward}.\n',
    WEEKLY: 'During the event, you can receive different tiers of rewards for each week\'s accumulated valid bets, with a total reward of {totalReward}.\n'
  }
}

const validBetReceiveTime = {
  'pt-BR': {
    NEXT_DAY: {
      EACH_LINE: 'Após as apostas válidas acumuladas atenderem às condições, você poderá recebê-las uma a uma no dia seguinte;\n',
      HIGHEST_LEVEL: 'Após as apostas válidas acumuladas atenderem às condições, você poderá receber a recompensa de nível mais alto no dia seguinte;\n'
    },
    NEXT_WEEK: {
      EACH_LINE: 'As recompensas poderão ser resgatadas uma a uma na semana seguinte;\n',
      HIGHEST_LEVEL: 'Você poderá reivindicar o nível de recompensa mais alto na semana seguinte;\n'
    },
    CURRENT_TIME: {
      EACH_LINE: 'Você poderá receber as recompensas uma a uma;\n',
      HIGHEST_LEVEL: 'Você poderá receber o nível mais alto de recompensa;\n'
    }
  },
  'en-US': {
    NEXT_DAY: {
      EACH_LINE: 'After accumulated valid bets meet the conditions, you can receive prizes one by one the next day;\n',
      HIGHEST_LEVEL: 'After accumulated valid bets meet the conditions, you can receive the highest level reward the next day;\n'
    },
    NEXT_WEEK: {
      EACH_LINE: 'Rewards can be claimed one by one in the following week;\n',
      HIGHEST_LEVEL: 'You can claim the highest reward tier the following week;\n'
    },
    CURRENT_TIME: {
      EACH_LINE: 'You can receive prizes one by one;\n',
      HIGHEST_LEVEL: 'You can receive the highest level of rewards;\n'
    }
  }
}

function getAuditText(locale, params, lineNumber) {
  const templates = auditTemplates[locale] || auditTemplates['en-US']
  const type = params.rewardAuditType || 'Gift'
  const template = templates[type]
  if (!template) return ''
  return `\n${lineNumber}. ` + template.replace('{multiplier}', String(params.multiplier || 1))
}

function getAwardExpiryText(locale, awardType, expiredAwardType, awardExpiredDays) {
  const rules = awardExpiryRules[locale] || awardExpiryRules['en-US']
  const awardRules = rules?.[awardType]
  if (!awardRules) return ''

  if ((expiredAwardType === 'RETAIN_DAY_AUTO' || expiredAwardType === 'RETAIN_DAY_ABANDONED') &&
      (!awardExpiredDays || awardExpiredDays === '0' || awardExpiredDays === 0)) {
    return awardRules[awardType] || awardRules[expiredAwardType + '_PERMANENT'] || ''
  }

  let text = awardRules[expiredAwardType] || ''
  if (awardExpiredDays) {
    text = text.replace('{awardExpiredDays}', String(awardExpiredDays))
  }
  return text
}

function getDisclaimer(locale) {
  const disc = commonDisclaimer[locale] || commonDisclaimer['en-US']
  return disc ? `${disc[5]}${disc[6]}` : ''
}

function appendDisclaimer(text, locale, startLine) {
  const disc = commonDisclaimer[locale] || commonDisclaimer['en-US']
  if (!disc) return text
  return text + `\n${startLine}. ${disc[5]}\n${startLine + 1}. ${disc[6]}`
}

function getEventDetailsPrefix(locale) {
  return eventDetailsPrefix[locale] || eventDetailsPrefix['en-US'] || 'Event Details: '
}

const skipPrefixActivities = [
  'LuckyBet', 'ReferralRewardsNew', 'RechargeBonus', 'SignInVolume',
  'LuckyWheel', 'NewUserExclusive', 'RechargePromotion', 'MemberReward',
  'MemberRewardMultiDay', 'CPFActivity', 'Recharge', 'RedPacket',
  'Assistance', 'MysteryReward', 'ValidBet', 'Agency', 'AssistanceCash',
  'WalletUserActivity', 'AgencyTwo', 'NewbieTask'
]

// --- Individual rule generators ---

function generateRechargeRules(locale, params) {
  const rules = rechargeRules[locale] || rechargeRules['en-US']
  let result = '1. ' + (rules[params.rechargeType] || rules.FIRST)

  const expiryText = getAwardExpiryText(locale, params.awardType, params.expiredAwardType, params.awardExpiredDays)
  if (expiryText) result += '\n2. ' + expiryText

  params.rewardAuditType = params.rewardAuditType || 'Gift'
  result += getAuditText(locale, params, 3)
  return appendDisclaimer(result, locale, 4)
}

function generateRebateRules(locale, params) {
  const rules = rebateRules[locale] || rebateRules['en-US']
  let result = '1. ' + rules[1]

  const balanceTemplate = (auditTemplates[locale] || auditTemplates['en-US'])?.BALANCE ||
    (auditTemplates[locale] || auditTemplates['en-US'])?.Gift
  if (balanceTemplate) {
    result += '\n2. ' + balanceTemplate.replace('{multiplier}', String(params.multiplier || 1))
  }

  const disc = commonDisclaimer[locale] || commonDisclaimer['en-US']
  if (disc) result += `\n3. ${disc[5]}\n4. ${disc[6]}`
  return result
}

function generateMemberRewardRules(locale, params) {
  const rules = memberRewardAmountTypes[locale] || memberRewardAmountTypes['en-US']
  let result = '1. ' + (rules[params.amountType] || rules.RECHARGE)

  params.awardType = 'ACTIVITY'
  const expiryText = getAwardExpiryText(locale, params.awardType, params.expiredAwardType, params.awardExpiredDays)
  if (expiryText) result += '\n2. ' + expiryText

  params.rewardAuditType = 'Gift'
  result += getAuditText(locale, params, 3)
  return appendDisclaimer(result, locale, 4)
}

function generateLuckyBetRules(locale, params) {
  const winRules = luckyBetWinType[locale] || luckyBetWinType['en-US']
  const winTemplate = winRules[params.winType]
  if (!winTemplate) return 'Unsupported win type'

  let result = '1. ' + winTemplate.replace('{validBetAmount}', formatAmount(params.validBetAmount, locale)) + '\n'

  const platformRules = luckyBetPlatformRules[locale] || luckyBetPlatformRules['en-US']
  const platformRule = platformRules[params.limitLuckyBetType]?.[params.receiveCountType] || ''

  let claimRule
  if (!params.receiveLimit || params.receiveLimit === 0) {
    claimRule = platformRule + (unlimitedClaimTemplates[locale]?.[1] || unlimitedClaimTemplates['en-US'][1])
  } else {
    claimRule = platformRule + (maxClaimTemplates[locale]?.[1] || maxClaimTemplates['en-US'][1])
  }

  if (claimRule) {
    claimRule = claimRule.replace(/{(\w+)}/g, (_, key) => params[key]?.toString?.() || '')
    result += '2. ' + claimRule
  }

  params.rewardAuditType = 'Gift'
  result += getAuditText(locale, params, 3)
  return appendDisclaimer(result, locale, 4).trim()
}

function generateSignInVolumeRules(locale, params) {
  const rules = signInVolumeRules[locale] || signInVolumeRules['en-US']
  let result = ''
  Object.entries(rules).forEach(([key, text]) => {
    if (key === '2') result += '\n'
    result += `${key}. ${text}`
  })

  params.rewardAuditType = 'Gift'
  result += getAuditText(locale, params, 3)
  return appendDisclaimer(result, locale, 4)
}

function generateCpfActivityRules(locale, params) {
  const rules = cpfActivityRules[locale] || cpfActivityRules['en-US']
  let result = '1. ' + rules[1]

  params.awardType = 'ACTIVITY'
  params.expiredAwardType = params.expiredAwardType || 'ABANDONED'
  const expiryText = getAwardExpiryText(locale, params.awardType, params.expiredAwardType, params.awardExpiredDays)
  if (expiryText) result += '\n2. ' + expiryText

  params.rewardAuditType = 'Gift'
  result += getAuditText(locale, params, 3)
  return appendDisclaimer(result, locale, 4)
}

function generateMysteryRewardRules(locale, params) {
  const rules = mysteryRewardRules[locale] || mysteryRewardRules['en-US']
  let result = '1. ' + rules[1]

  const resetText = (mysteryResetTypes[locale] || mysteryResetTypes['en-US'])[params.resetType]
  const expiryText = getAwardExpiryText(locale, params.awardType, params.expiredAwardType, params.awardExpiredDays)
  if (resetText || expiryText) {
    result += '2. '
    if (resetText) result += resetText
    if (expiryText) result += expiryText
  }

  params.rewardAuditType = 'Gift'
  result += getAuditText(locale, params, 3)
  return appendDisclaimer(result, locale, 4)
}

function generateMemberRewardMultiDayRules(locale, params) {
  const rules = memberRewardMultiDayRules[locale] || memberRewardMultiDayRules['en-US']
  let result = '1. ' + rules[1]

  params.awardType = 'ACTIVITY'
  const expiryText = getAwardExpiryText(locale, params.awardType, params.expiredAwardType, params.awardExpiredDays)
  if (expiryText) result += '2. ' + expiryText

  params.rewardAuditType = 'Gift'
  result += getAuditText(locale, params, 3)
  return appendDisclaimer(result, locale, 4)
}

function generateValidBetRules(locale, params) {
  let template, result

  if (params.rewardType === 'EACH_LINE') {
    template = validBetTotalRewardTemplate[locale]?.[params.resetType] ||
      validBetTotalRewardTemplate['en-US']?.[params.resetType]
    if (!template) return 'Unsupported language or resetType'
    const totalReward = params.validBetRuleTotalReward || params.highestReward
    result = '1. ' + template.replace('{totalReward}', formatAmount(totalReward, locale))
  } else {
    template = validBetHighestRewardTemplate[locale]?.[params.resetType] ||
      validBetHighestRewardTemplate['en-US']?.[params.resetType]
    if (!template) return 'Unsupported language or resetType'
    result = '1. ' + template.replace('{highestReward}', formatAmount(params.highestReward, locale))
  }

  let receiveTime = params.receiveTime
  if (receiveTime === 'NEXT_DAY' && params.resetType === 'WEEKLY') receiveTime = 'NEXT_WEEK'
  const receiveTimeRules = validBetReceiveTime[locale]?.[receiveTime] || validBetReceiveTime['en-US']?.[receiveTime]
  const receiveTimeText = receiveTimeRules?.[params.rewardType]
  if (receiveTimeText) result += '\n2. ' + receiveTimeText

  const expiryRules = awardExpiryRules[locale] || awardExpiryRules['en-US']
  let expiryText = expiryRules?.[params.awardType]?.[params.expiredAwardType]
  if (expiryText) {
    if ((params.expiredAwardType === 'RETAIN_DAY_AUTO' || params.expiredAwardType === 'RETAIN_DAY_ABANDONED') &&
        (!params.awardExpiredDays || params.awardExpiredDays === 0)) {
      const permanentKey = params.expiredAwardType + '_PERMANENT'
      expiryText = expiryRules?.[params.awardType]?.[permanentKey] || expiryText
    } else if (params.awardExpiredDays && Number(params.awardExpiredDays) > 0) {
      expiryText = expiryText.replace('{awardExpiredDays}', String(params.awardExpiredDays))
    }
    result += '\n3. ' + expiryText
  }

  params.rewardAuditType = 'Gift'
  result += getAuditText(locale, params, 4)

  const disc = commonDisclaimer[locale] || commonDisclaimer['en-US']
  if (disc) result += `\n5. ${disc[5]}\n6. ${disc[6]}`
  return result
}

/**
 * Generate the complete rule text for an activity.
 * @param {string} activityType - The activity type string
 * @param {Object} params - Activity configuration parameters
 * @param {string} [locale] - Override locale
 * @returns {string} The formatted rule text
 */
export function generateActivityRules(activityType, params = {}, locale) {
  locale = normalizeLocale(locale || getLocale())
  let result = ''

  if (!skipPrefixActivities.includes(activityType)) {
    result = getEventDetailsPrefix(locale) + '\n'
  }

  const generators = {
    Recharge: () => generateRechargeRules(locale, params),
    Rebate: () => generateRebateRules(locale, params),
    MemberReward: () => generateMemberRewardRules(locale, params),
    MemberRewardMultiDay: () => generateMemberRewardMultiDayRules(locale, params),
    LuckyBet: () => generateLuckyBetRules(locale, params),
    SignInVolume: () => generateSignInVolumeRules(locale, params),
    CPFActivity: () => generateCpfActivityRules(locale, params),
    WalletUserActivity: () => generateCpfActivityRules(locale, params),
    MysteryReward: () => generateMysteryRewardRules(locale, params),
    ValidBet: () => generateValidBetRules(locale, params),
  }

  const generator = generators[activityType]
  if (generator) {
    result += generator()
  }

  return result
}

/**
 * Parse activity preview text (the summary shown in lists).
 */
export function parsePreviewText(previewTextJson, locale) {
  locale = normalizeLocale(locale || getLocale())
  try {
    const parsed = JSON.parse(previewTextJson)
    const vars = parsed.variablesValue

    const templates = {
      'pt-BR': { OTHER: 'Bônus máximo {maximum}', REBATE: 'Taxa máxima de cashback {maximum}%', OTHER_RANGE: 'Bônus máximo {maximum}%' },
      'en-US': { OTHER: 'Maximum bonus {maximum}', REBATE: 'Maximum rebate rate {maximum}%', OTHER_RANGE: 'Maximum bonus {maximum}%' }
    }

    const t = templates[locale] || templates['en-US']
    const template = t[vars.highestType]
    if (!template) return ''
    return template.replace('{maximum}', formatAmount(Number(vars.highestReward), locale))
  } catch {
    return previewTextJson || ''
  }
}
