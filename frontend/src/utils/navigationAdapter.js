const INTERNAL_LINK_MAP = {
  activity_list: '/main/promo',
  recharge: '/recharge/apply',
  withdraw: '/withdraw/apply',
  vip: '/activity/vip',
  agent: '/spread',
  game_hall: '/main/inicio',
  customer_service: null,
  download: '/download',
  notification: '/notification',
  profile: '/main/perfil',
  security: '/security',
  report: '/report',
  redeem: '/Redeem'
}

function mapTargetType(type) {
  if (!type) return 'none'
  const map = {
    internal: 'activity',
    InternalLink: 'activity',
    Custom: 'url',
    external: 'url',
    None: 'none',
    none: 'none'
  }
  return map[type] || 'none'
}

function parseInternalTarget(targetValue) {
  try {
    const parsed = JSON.parse(targetValue)
    if (parsed.type && INTERNAL_LINK_MAP[parsed.type]) {
      return INTERNAL_LINK_MAP[parsed.type]
    }
    if (parsed.type === 'activity_detail' && parsed.info) {
      const { activityType, activityId } = parsed.info
      if (activityType && activityId) {
        return `/activity/${activityType}/${activityId}`
      }
    }
    if (parsed.type === 'game_hall' && parsed.info?.gameType) {
      return `/game/category/${parsed.info.gameType}`
    }
    return parsed.type ? (INTERNAL_LINK_MAP[parsed.type] || '/main/inicio') : targetValue
  } catch {
    return targetValue
  }
}

export function adaptBannerNavigation(config) {
  if (!config) return { linkType: 'none', linkValue: '' }

  if ('targetType' in config && 'targetValue' in config) {
    const linkType = mapTargetType(config.targetType)
    const linkValue = config.targetType === 'internal'
      ? parseInternalTarget(config.targetValue)
      : String(config.targetValue || '')
    return { linkType, linkValue }
  }

  if ('type' in config && 'value' in config && !('targetType' in config)) {
    const linkType = mapTargetType(config.type)
    return { linkType, linkValue: String(config.value || '') }
  }

  if ('announcementLinkType' in config && 'announcementLink' in config) {
    const linkType = mapTargetType(config.announcementLinkType)
    return { linkType, linkValue: config.announcementLink || '' }
  }

  return { linkType: 'none', linkValue: '' }
}

export function navigateByConfig(router, config) {
  const { linkType, linkValue } = adaptBannerNavigation(config)

  if (linkType === 'none' || !linkValue) return false

  if (linkType === 'url') {
    if (linkValue.startsWith('http')) {
      window.open(linkValue, '_blank')
    } else {
      router.push(linkValue)
    }
    return true
  }

  if (linkType === 'activity') {
    router.push(linkValue)
    return true
  }

  return false
}

export function ensureProtocol(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}
