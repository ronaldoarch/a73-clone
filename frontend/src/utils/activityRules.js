/**
 * Multilingual activity rule templates.
 * Each activity type has localized rule text in pt-BR (primary) and en-US (fallback).
 */

const locale = () => localStorage.getItem('app-language') || 'pt-BR'

function getText(templates, key) {
  const lang = locale()
  return templates[lang]?.[key] || templates['en-US']?.[key] || templates['pt-BR']?.[key] || ''
}

export const ActivityRuleTemplates = {
  Recharge: {
    'pt-BR': {
      FIRST: 'Os membros podem obter bônus correspondentes para seu primeiro depósito;\n',
      SINGLE: 'Os membros podem obter bônus correspondentes para um único depósito;\n',
      SUM: 'Os membros podem obter bônus correspondentes para depósitos cumulativos;\n',
      MULTIPLE: 'Os membros podem obter bônus correspondentes recarregando várias vezes;'
    },
    'en-US': {
      FIRST: 'Members can get corresponding bonuses for their first deposit;\n',
      SINGLE: 'Members can get corresponding bonuses for a single deposit;\n',
      SUM: 'Members can get corresponding bonuses for cumulative deposits;\n',
      MULTIPLE: 'Members can get corresponding bonuses by recharging multiple times;'
    }
  },
  Assistance: {
    'pt-BR': {
      DAILY: 'Este evento é um evento de fundo de alívio diário. Os membros que perderam dinheiro ontem podem obter fundos de alívio;\n',
      WEEKLY: 'Este evento é um evento de fundo de alívio semanal. Os membros que perderam dinheiro na semana passada podem obter fundos de alívio;\n',
      CUMULATIVE_LOSS: 'Este evento é um evento de fundo de alívio diário. Os membros que acumularam perdas podem obter fundos de alívio;\n'
    },
    'en-US': {
      DAILY: 'This event is a daily relief fund event. Members who lost money yesterday can get relief funds;\n',
      WEEKLY: 'This event is a weekly relief fund event. Members who lost money last week can get relief funds;\n',
      CUMULATIVE_LOSS: 'This event is a daily relief fund event. Members who have accumulated losses can get relief funds;\n'
    }
  },
  SignIn: {
    'pt-BR': {
      CONTINUOUS: 'Este evento é um evento de entrada. Os membros que se inscreverem consecutivamente podem obter bônus correspondentes;\n',
      CUMULATIVE: 'Este evento é um evento de entrada. Os membros que se inscreverem cumulativamente podem obter bônus correspondentes;\n'
    },
    'en-US': {
      CONTINUOUS: 'This event is a sign-in event. Members who sign in consecutively can get corresponding bonuses;\n',
      CUMULATIVE: 'This event is a sign-in event. Members who sign in cumulatively can get corresponding bonuses;\n'
    }
  },
  RedPacket: {
    'pt-BR': {
      1: 'Esta atividade está programada para começar {times} vezes por dia, e cada vez dura {duration} minutos. Os cristais minerados são automaticamente convertidos em bônus;\n',
      2: 'Os bônus precisam ser coletados manualmente e serão inválidos após a expiração;\n'
    },
    'en-US': {
      1: 'This activity is scheduled to start {times} times a day, and each time lasts {duration} minutes. The mined crystals are automatically converted into bonuses;\n',
      2: 'Bonuses need to be collected manually, and will be invalid after expiration;\n'
    }
  },
  Rebate: {
    'pt-BR': {
      1: 'Após apostas válidas, o bônus será devolvido proporcionalmente, e as apostas válidas acumuladas serão compensadas após o recebimento do bônus;\n'
    },
    'en-US': {
      1: 'After valid betting, the bonus will be returned in proportion, and the accumulated valid bets will be cleared after the bonus is received;\n'
    }
  },
  MemberReward: {
    'pt-BR': {
      RECHARGE: 'Esta atividade é uma atividade de "apreciação de membros". Os membros podem obter bônus correspondentes ao depositar;\n',
      PROFIT: 'Esta atividade é uma atividade de "apreciação de membros". Os membros podem obter bônus correspondentes ao obter lucros ou perdas;\n',
      UNLIMITED: 'Esta atividade é uma atividade de "apreciação de membros". Os membros podem obter bônus fixos;\n',
      BET: 'Esta atividade é uma atividade de "apreciação de membros". Os membros podem obter bônus correspondentes ao fazer apostas válidas;\n'
    },
    'en-US': {
      RECHARGE: 'This activity is a "member appreciation" activity. Members can get corresponding bonuses by depositing;\n',
      PROFIT: 'This activity is a "member appreciation" activity. Members can get corresponding bonuses by making profits or losses;\n',
      UNLIMITED: 'This activity is a "member appreciation" activity. Members can get fixed bonuses;\n',
      BET: 'This activity is a "member appreciation" activity. Members can get corresponding bonuses by making valid bets;\n'
    }
  },
  Agency: {
    'pt-BR': {
      1: 'Convide amigos para reivindicar bônus. Quanto mais pessoas você convidar, mais bônus você receberá;\n',
      2: 'Os bônus precisam ser reivindicados manualmente. Após a expiração, os bônus serão distribuídos automaticamente;\n',
      3: 'Os bônus (excluindo o principal) exigem {multiplier} vezes de apostas válidas para serem sacados;\n'
    },
    'en-US': {
      1: 'Invite friends to claim bonuses. The more people you invite, the more bonuses you will get;\n',
      2: 'Bonuses need to be claimed manually. After expiration, the bonuses will be automatically distributed;\n',
      3: 'Bonuses (excluding principal) require {multiplier} times of valid bets to be withdrawn;\n'
    }
  },
  CPFActivity: {
    'pt-BR': {
      1: 'Convide amigos para o jogo e você receberá bônus depois que eles concluírem o registro/depósito/aposta;\n'
    },
    'en-US': {
      1: 'Invite friends to the game, and you will receive bonuses after they complete registration/deposit/bet;\n'
    }
  },
  LuckyWheel: {
    'pt-BR': {
      1: 'Os membros podem obter bilhetes de rifa depositando ou apostando. Os adereços coletados podem ser trocados por bônus correspondentes;\n',
      2: 'Durante o evento, os bilhetes não utilizados no dia serão retidos no dia seguinte;\n',
      3: 'O bônus (excluindo o principal) requer {multiplier} vezes de apostas válidas para ser sacado;\n'
    },
    'en-US': {
      1: 'Members can get raffle tickets by depositing or betting. Collecting props can be exchanged for bonuses;\n',
      2: 'During the event, raffle tickets not used on the day will be retained the next day;\n',
      3: 'The bonus (excluding the principal) requires {multiplier} times of valid bets to be withdrawn;\n'
    }
  },
  ReferralRewardsNew: {
    'pt-BR': {
      1: 'Convide afiliados para se registrarem e ganhe grandes bônus! Quanto mais amigos convidar, maiores serão seus bônus diários;\n',
      2: 'Os bônus são acumulados com base no seu crescimento de rede. Todos os dias, entre 00:00 e 04:00, a plataforma calcula os bônus elegíveis;\n',
      3: 'Esta promoção é válida apenas para operações reais e legítimas. É proibido usar bots, scripts, APIs ou métodos técnicos;\n'
    },
    'en-US': {
      1: 'Invite referrals to register and earn generous bonuses. The more friends you invite, the higher your daily bonus;\n',
      2: 'Bonuses are accumulated based on your network growth. Every day between 00:00 and 04:00, the system calculates eligible bonuses;\n',
      3: 'This promotion is for genuine activity only. Using bots, scripts, APIs, or any technical cheating is prohibited;\n'
    }
  },
  common: {
    'pt-BR': {
      auditON: 'O bônus (excluindo o principal) concedido por esta atividade requer {multiplier} vez o valor em apostas válidas para serem retiradas, (A aposta está limitada a {limitData});\n',
      auditOFF: 'O bônus (excluindo o principal) concedido por esta atividade requer {multiplier} vez o valor em apostas válidas para serem retiradas, (A aposta não está limitada a qualquer plataforma ou jogo);\n',
      auditGift: 'O bônus (excluindo o principal) requer {multiplier} vezes de apostas válidas para sacar;\n',
      auditGiftAndRecharge: 'O bônus (incluindo o principal) requer {multiplier} vezes de apostas válidas para sacar;\n',
      disclaimer1: 'Somente o proprietário da conta pode realizar operações manuais normais, caso contrário, o bônus será cancelado ou deduzido, congelado ou até mesmo colocado na lista negra;\n',
      disclaimer2: 'Para evitar diferenças na compreensão do texto, a plataforma se reserva o direito final de interpretação desta atividade.\n'
    },
    'en-US': {
      auditON: 'The bonus (excluding principal) of this event requires {multiplier} times of valid bets for withdrawal, (betting is limited to {limitData});\n',
      auditOFF: 'The bonus (excluding principal) of this event requires {multiplier} times of valid bets for withdrawal, (betting is not limited to game platform);\n',
      auditGift: 'The bonus (excluding the principal) requires {multiplier} times of valid bets to withdraw;\n',
      auditGiftAndRecharge: 'The bonus (including the principal) requires {multiplier} times of valid bets to withdraw;\n',
      disclaimer1: 'Only the account owner can perform normal manual operations, otherwise the bonus will be cancelled or deducted, frozen, or even blacklisted;\n',
      disclaimer2: 'In order to avoid differences in text understanding, the platform will reserve the final right of interpretation of this activity.\n'
    }
  },
  awardExpiry: {
    'pt-BR': {
      AUTO: 'O bônus precisa ser coletado manualmente e será distribuído automaticamente após o vencimento;\n',
      ABANDONED: 'O bônus deve ser coletado manualmente e será cancelado após o vencimento;\n',
      RETAIN_DAY_AUTO: 'O bônus deve ser coletado manualmente e será distribuído automaticamente após {awardExpiredDays} dias;\n',
      RETAIN_DAY_ABANDONED: 'O bônus deve ser coletado manualmente e será cancelado após {awardExpiredDays} dias;\n',
      ACTIVITY: 'O bônus deve ser coletado manualmente e permanecerá disponível durante o evento;\n',
      AUTO_BALANCE: 'O bônus é coletado automaticamente e será distribuído automaticamente após o vencimento;\n',
      ABANDONED_BALANCE: 'O bônus é coletado automaticamente e será inválido após o vencimento;\n'
    },
    'en-US': {
      AUTO: 'The bonus needs to be collected manually, and will be automatically distributed after expiration;\n',
      ABANDONED: 'The bonus needs to be claimed manually, and will be invalidated after it expires;\n',
      RETAIN_DAY_AUTO: 'The bonus needs to be collected manually, and will be automatically distributed after {awardExpiredDays} days;\n',
      RETAIN_DAY_ABANDONED: 'The bonus needs to be collected manually, and will be invalid after {awardExpiredDays} days;\n',
      ACTIVITY: 'The bonus needs to be claimed manually, and will be retained throughout the event;\n',
      AUTO_BALANCE: 'The bonus is automatically collected, and will be automatically distributed after expiration;\n',
      ABANDONED_BALANCE: 'The bonus is automatically collected, and will be invalid after expiration;\n'
    }
  },
  weekdays: {
    'pt-BR': { 1: 'Segunda-feira', 2: 'Terça-feira', 3: 'Quarta-feira', 4: 'Quinta-feira', 5: 'Sexta-feira', 6: 'Sábado', 7: 'Domingo' },
    'en-US': { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday' }
  }
}

/**
 * Get a rule template text, replacing placeholders.
 */
export function getRuleText(activityType, key, replacements = {}) {
  const templates = ActivityRuleTemplates[activityType]
  if (!templates) return ''
  let text = getText(templates, key)
  for (const [placeholder, value] of Object.entries(replacements)) {
    text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(value))
  }
  return text
}

export function getCommonRuleText(key, replacements = {}) {
  return getRuleText('common', key, replacements)
}

export function getAwardExpiryText(key, replacements = {}) {
  return getRuleText('awardExpiry', key, replacements)
}

export function getWeekdayName(dayNumber) {
  return getText(ActivityRuleTemplates.weekdays, dayNumber)
}
