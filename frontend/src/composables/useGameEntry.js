import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { trpcQuery } from '../utils/api'
import { useGamesStore } from '../stores/games'
import { useAuthStore } from '../stores/auth'
import { useSystemStore } from '../stores/system'

export function useGameEntry() {
  const router = useRouter()
  const gamesStore = useGamesStore()
  const authStore = useAuthStore()
  const systemStore = useSystemStore()

  const isLoading = ref(false)

  const lobbyUrl = computed(() => {
    const origin = window.location.origin
    return `${origin}/main/inicio`
  })

  async function enterGame(game) {
    if (!game?.id && !game?.gameId) return

    if (!authStore.isLoggedIn) {
      router.push('/login')
      return
    }

    const gameId = game.gameId || game.id

    if (game.target === 'hall' || game.gameType === 'SPORTS') {
      return enterHallGame(game)
    }

    isLoading.value = true
    try {
      const result = await trpcQuery('game.launch', {
        gameId: Number(gameId),
        lobbyUrl: lobbyUrl.value
      })

      if (result?.gameUrl) {
        gamesStore.setGameUrl(result.gameUrl)
        _addToRecent(game)
        router.push(`/game/action/${gameId}`)
      } else if (result?.gameDoc) {
        gamesStore.setGameDoc(result.gameDoc)
        _addToRecent(game)
        router.push(`/game/action/${gameId}`)
      }
    } catch (e) {
      console.error('[GameEntry] launch error:', e)
    } finally {
      isLoading.value = false
    }
  }

  async function enterHallGame(game) {
    const platformId = game.platformId || game.id

    if (game.gameType === 'SPORTS') {
      router.push(`/game/category/sport`)
      return
    }

    router.push(`/game/category/${game.gameType}/${platformId}`)
  }

  function navigateToPlatformCategory(game) {
    if (game.gameType === 'SPORTS') {
      enterHallGame(game)
      return
    }
    router.push(`/game/category/${game.gameType}/${game.platformId || 0}`)
  }

  function _addToRecent(game) {
    try {
      const stored = JSON.parse(localStorage.getItem('recentGames') || '[]')
      const id = game.gameId || game.id
      const idx = stored.findIndex(g => (g.gameId || g.id) === id)
      if (idx >= 0) stored.splice(idx, 1)

      stored.unshift({
        id: game.id,
        gameId: game.gameId || game.id,
        name: game.name || game.gameName,
        gameName: game.gameName || game.name,
        gameType: game.gameType,
        platformId: game.platformId,
        platformCode: game.platformCode,
        logoFlag: game.logoFlag,
        status: game.status,
        target: game.target || 'game',
        externalGameId: game.externalGameId,
        timestamp: Date.now()
      })

      if (stored.length > 50) stored.length = 50
      localStorage.setItem('recentGames', JSON.stringify(stored))
    } catch {}
  }

  return {
    isLoading,
    enterGame,
    enterHallGame,
    navigateToPlatformCategory
  }
}

export function useGameCategoryPage() {
  const gamesStore = useGamesStore()
  const systemStore = useSystemStore()

  const platformList = computed(() => {
    const games = gamesStore.catalog || []
    const map = new Map()

    games.forEach(category => {
      if (category.platformList) {
        category.platformList.forEach(p => {
          if (!map.has(p.id)) {
            map.set(p.id, { ...p, gameType: category.gameType })
          }
        })
      }
    })

    return map
  })

  const platformLogos = computed(() => {
    const logos = {}
    platformList.value.forEach((val, key) => {
      if (val.logo) logos[key] = val.logo
    })
    return logos
  })

  function getGameImageSrc(game) {
    const baseUrl = systemStore.tenantInfo?.gameLogoUrl || ''
    const style = systemStore.tenantInfo?.gameLogoStyle || 'style1'
    const lang = systemStore.tenantInfo?.gameLogoLanguage || 'en'
    return `${baseUrl}/${style}/${lang}/${game.logoFlag}.jpg`
  }

  function forGameStatus(game) {
    const { platformStatus, gameTypeStatus, status } = game
    return [status, gameTypeStatus, platformStatus].some(s => s === 'MAINTAIN')
      ? 'MAINTAIN'
      : 'ON'
  }

  async function fetchGameList(params) {
    try {
      return await trpcQuery('game.list', params)
    } catch {
      return { gameList: [] }
    }
  }

  async function fetchPopularGames(params = {}) {
    try {
      return await trpcQuery('game.popular', {
        page: params.page || 1,
        pageSize: params.pageSize || 100,
        isHot: true,
        ...params
      })
    } catch {
      return { gameList: [] }
    }
  }

  return {
    platformList, platformLogos,
    getGameImageSrc, forGameStatus,
    fetchGameList, fetchPopularGames
  }
}
