export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (obj instanceof Object) {
    const copy = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) copy[key] = deepClone(obj[key])
    }
    return copy
  }
  return obj
}

export function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return source
  Object.keys(source).forEach(key => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {}
      deepMerge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  })
  return target
}

function parsePath(pathStr) {
  const parts = []
  let current = ''
  let inBracket = false
  for (let i = 0; i < pathStr.length; i++) {
    const ch = pathStr[i]
    if (ch === '[') {
      if (current) { parts.push(current); current = '' }
      inBracket = true
    } else if (ch === ']') {
      if (inBracket && current) { parts.push(parseInt(current, 10)); current = '' }
      inBracket = false
    } else if (ch === '.' && !inBracket) {
      if (current) { parts.push(current); current = '' }
    } else {
      current += ch
    }
  }
  if (current) parts.push(inBracket ? parseInt(current, 10) : current)
  return parts
}

function setByPath(obj, pathStr, value) {
  const parts = parsePath(pathStr)
  let current = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    const nextKey = parts[i + 1]
    if (current[key] === undefined || current[key] === null) {
      current[key] = typeof nextKey === 'number' ? [] : {}
    }
    current = current[key]
  }
  current[parts[parts.length - 1]] = value
}

function findComponents(tree, componentName, componentId) {
  const results = []
  const search = (node) => {
    if (!node || typeof node !== 'object') return
    if (node.componentName === componentName) {
      if (componentId !== undefined ? node.componentId === componentId : true) {
        results.push(node)
      }
    }
    if (Array.isArray(node)) {
      node.forEach(item => search(item))
    } else {
      Object.values(node).forEach(val => search(val))
    }
  }
  search(tree)
  return results
}

export function createLayoutBuilder(config) {
  const data = deepClone(config)

  const builder = {
    modify(componentName, ...args) {
      let componentId, property, value
      if (typeof args[0] === 'number') {
        componentId = args[0]
        property = args[1]
        value = args[2]
      } else {
        property = args[0]
        value = args[1]
      }

      const found = findComponents(data, componentName, componentId)
      if (!found.length) {
        console.warn(`Component "${componentName}" not found`)
        return builder
      }

      found.forEach(node => {
        if (typeof property === 'string') {
          setByPath(node, property, value)
        } else {
          deepMerge(node, property)
        }
      })

      return builder
    },

    batchModify(modifications) {
      modifications.forEach(mod => {
        if ('component' in mod) {
          if (mod.componentId !== undefined) {
            builder.modify(mod.component, mod.componentId, mod.property, mod.value)
          } else {
            builder.modify(mod.component, mod.property, mod.value)
          }
        } else if ('path' in mod) {
          builder.modifyPath(mod.path, mod.value)
        }
      })
      return builder
    },

    modifyPath(pathStr, value) {
      setByPath(data, pathStr, value)
      return builder
    },

    modifyComponent(componentName, componentIdOrProps, props) {
      let componentId, mergeProps
      if (typeof componentIdOrProps === 'number') {
        componentId = componentIdOrProps
        mergeProps = props
      } else {
        mergeProps = componentIdOrProps
      }

      const found = findComponents(data, componentName, componentId)
      if (!found.length) return builder

      found.forEach(node => Object.assign(node, mergeProps))
      return builder
    },

    findAndModify(predicate, transform) {
      const walk = (node) => {
        if (Array.isArray(node)) {
          node.forEach((item, idx) => {
            if (predicate(item)) node[idx] = transform(item)
            else if (typeof item === 'object' && item !== null) walk(item)
          })
        } else if (node && typeof node === 'object') {
          Object.keys(node).forEach(key => {
            if (predicate(node[key])) node[key] = transform(node[key])
            else if (typeof node[key] === 'object' && node[key] !== null) walk(node[key])
          })
        }
      }
      walk(data)
      return builder
    },

    getComponent(componentName, componentId) {
      const found = findComponents(data, componentName, componentId)
      return found.length > 0 ? found[0] : null
    },

    build() {
      return deepClone(data)
    }
  }

  return builder
}

export const ActivityType = Object.freeze({
  RedPacket: 'RedPacket',
  AssistanceCash: 'AssistanceCash',
  luckyBet: 'luckyBet',
  SignIn: 'SignIn',
  SignInVolume: 'SignInVolume',
  memberReward: 'memberReward',
  mysteryReward: 'mysteryReward',
  CommissionReward: 'CommissionReward',
  MemberRewardMultiDay: 'MemberRewardMultiDay',
  Assistance: 'Assistance',
  CPFActivity: 'CPFActivity',
  WalletUserActivity: 'WalletUserActivity',
  RechargePromotion: 'RechargePromotion',
  NewUserExclusive: 'NewUserExclusive',
  ReferralRewardsNew: 'ReferralRewardsNew',
  LuckyWheel: 'LuckyWheel',
  Recharge: 'Recharge',
  RechargeBonus: 'RechargeBonus',
  Vip: 'Vip',
  Agency: 'Agency',
  ValidBet: 'ValidBet'
})

export const DEFAULT_ACTIVITY_TEMPLATES = Object.freeze({
  [ActivityType.AssistanceCash]: { template: 'style_18' },
  [ActivityType.LuckyWheel]: { template: 'style_1' },
  [ActivityType.NewUserExclusive]: { template: 'style_18' },
  [ActivityType.RedPacket]: { template: 'style_18' },
  [ActivityType.Recharge]: { template: 'style_18' },
  [ActivityType.memberReward]: { template: 'style_18' },
  [ActivityType.MemberRewardMultiDay]: { template: 'style_18' },
  [ActivityType.Assistance]: { template: 'style_18' },
  [ActivityType.SignInVolume]: { template: 'style_18' },
  [ActivityType.mysteryReward]: { template: 'style_18' },
  [ActivityType.Agency]: { template: 'style_18' },
  [ActivityType.ReferralRewardsNew]: { template: 'style_18' }
})

export function getActivityRoutes() {
  return Object.values(ActivityType)
    .filter(type => type !== 'Vip')
    .map(type => ({
      path: `/activity/${type}/:id`,
      name: `Activity${type}`,
      component: type,
      meta: { isActivity: true }
    }))
}
