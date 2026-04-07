import { computed } from 'vue'
import { useSystemStore } from '../stores/system'
import { getSkinDefinition } from './themeRegistry'

export function useThemeConfig() {
  const systemStore = useSystemStore()

  const themeConfig = computed(() => systemStore.themeConfig || {})

  const themeHomeType = computed(() => {
    const { theme, home, homeType } = themeConfig.value || {}
    return `${theme || 'blue-default'}-${home ? home + '-' : ''}${homeType || 'GameType'}`
  })

  function loadComponent(componentMap) {
    const loader = componentMap[themeHomeType.value] || componentMap['blue-default-GameType'] || null
    return loader || null
  }

  return { themeConfig, themeHomeType, loadComponent }
}

export function useHeaderConfig(languageList) {
  const { themeHomeType } = useThemeConfig()

  const searchHiddenThemes = ['auroral-yellow-Platform']
  const languageHiddenThemes = [
    'green-default-v02-Platform',
    'forest-green-v02-Platform',
    'auroral-yellow-Platform'
  ]

  function hideButton(buttonType) {
    if (buttonType === 'search') {
      return !searchHiddenThemes.includes(themeHomeType.value)
    }
    if (buttonType === 'language') {
      const count = languageList?.value?.length ?? 0
      return count > 1 && !languageHiddenThemes.includes(themeHomeType.value)
    }
    return true
  }

  const showAssetsIcon = computed(() => {
    const hidden = ['amber-purple-GameType', 'auroral-yellow-Platform']
    return !hidden.includes(themeHomeType.value)
  })

  const menuIcon = computed(() => {
    const map = {
      '/svg/menu.svg': ['blue-default-v01-Platform'],
      '/svg/menu2.svg': ['auroral-yellow-Platform']
    }
    for (const [icon, themes] of Object.entries(map)) {
      if (themes.includes(themeHomeType.value)) return icon
    }
    return '/svg/menu1.svg'
  })

  return { hideButton, showAssetsIcon, menuIcon }
}

export function useGameWrapperConfig() {
  const { themeHomeType } = useThemeConfig()

  const configMap = {
    'blue-default-GameType': { titleType: '2', headType: '1', size: 6, row: 2, hotSize: 9, hotRow: 3 },
    'blue-default-v01-Platform': { titleType: '1', headType: '3', isShowAll: true, size: 12, row: 3, hotSize: 16, hotRow: 4 },
    'blue-default-v01-GameType': { titleType: '1', headType: '6', size: 16, row: 4, hotSize: 16, hotRow: 4 },
    'green-default-v01-GameType': { titleType: '1', headType: '1', size: 12, row: 3, hotSize: 16, hotRow: 4 },
    'green-default-v01-Platform': { titleType: '1', headType: '4', isShowAll: true, size: 12, row: 3, hotSize: 16, hotRow: 4 },
    'amber-purple-v01-Platform': { titleType: '1', headType: '4', isShowAll: true, size: 12, row: 3, hotSize: 16, hotRow: 4 },
    'blue-default-v02-Platform': { titleType: '1', headType: '4', isShowAll: true, size: 12, row: 3, hotSize: 16, hotRow: 4 },
    'green-default-v02-Platform': { titleType: '1', headType: '5', isShowAll: true, size: 9, row: 3, hotSize: 12, hotRow: 4 },
    'forest-green-v01-Platform': { titleType: '1', headType: '4', isShowAll: true, size: 12, row: 3, hotSize: 16, hotRow: 4 },
    'forest-green-v02-Platform': { titleType: '1', headType: '5', isShowAll: true, size: 9, row: 3, hotSize: 12, hotRow: 4 },
    'auroral-yellow-Platform': { titleType: '1', headType: '7', isShowAll: true, size: 16, row: 4, hotSize: 16, hotRow: 4 },
    'theme-28-Platform': { titleType: '1', headType: '28', isShowAll: true, size: 12, row: 4, hotSize: 12, hotRow: 4 },
    'theme-33-Platform': { titleType: '1', headType: '28', isShowAll: true, size: 12, row: 4, hotSize: 12, hotRow: 4 }
  }

  const gameWrapperOptions = computed(() => {
    return (configMap[themeHomeType.value] || configMap['blue-default-GameType'])
  })

  return { gameWrapperOptions }
}

export function useBonusPoolConfig() {
  const { themeHomeType } = useThemeConfig()

  const bonusPoolThemes = {
    1: [
      'forest-green-v02-Platform', 'green-default-v02-Platform',
      'blue-default-v01-GameType', 'auroral-yellow-Platform'
    ],
    2: [
      'forest-green-v01-Platform', 'green-default-v01-Platform',
      'amber-purple-v01-Platform', 'blue-default-v02-Platform'
    ]
  }

  function showBonusPool(poolId) {
    return bonusPoolThemes[poolId]?.includes(themeHomeType.value) ?? false
  }

  return { showBonusPool }
}

export function usePwaModalConfig() {
  const { themeHomeType } = useThemeConfig()

  const giftImgUrl = computed(() => {
    const map = {
      '/images/money2.png': ['blue-default-v01-GameType', 'auroral-yellow-Platform']
    }
    for (const [url, themes] of Object.entries(map)) {
      if (themes.includes(themeHomeType.value)) return url
    }
    return '/images/pwa-prize.png'
  })

  const closeButtonPosition = computed(() => {
    const startThemes = [
      'amber-purple-v01-Platform', 'blue-default-v02-Platform',
      'green-default-v01-Platform', 'green-default-v02-Platform',
      'forest-green-v01-Platform', 'forest-green-v02-Platform'
    ]
    return startThemes.includes(themeHomeType.value) ? 'start' : 'end'
  })

  return { giftImgUrl, closeButtonPosition }
}
