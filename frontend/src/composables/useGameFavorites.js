import { ref, computed } from 'vue'
import { trpcQuery, trpcMutation } from '../utils/api'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/user'
import { useGamesStore } from '../stores/games'

export function useGameFavorites() {
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const gamesStore = useGamesStore()

  async function fetchFavoriteList(params) {
    if (!authStore.isLoggedIn) return []

    try {
      const result = await trpcQuery('game.favorites', {
        page: params?.page || 1,
        pageSize: params?.pageSize || 1000
      })

      const list = result?.favortieList || result?.favoriteList || []
      const enriched = list.map(game => ({
        ...game,
        isFavorite: true,
        status: game.status || game.gameStatus,
        gameId: game.gameId || game.id
      }))

      userStore.favoriteList = enriched
      return enriched
    } catch {
      return []
    }
  }

  async function addFavorite(game, platform) {
    const payload = {
      gameId: game.id || game.gameId,
      gameName: game.gameName || game.name,
      gameType: game.gameType,
      platformId: game.platformId
    }

    try {
      await trpcMutation('game.addFavorite', payload)
      userStore.addFavorite(payload)
    } catch (e) {
      console.warn('[Favorites] add error:', e.message)
    }
  }

  async function cancelFavorite(game, platform) {
    const gameId = game.id || game.gameId
    try {
      await trpcMutation('game.removeFavorite', { gameId })
      userStore.removeFavorite(gameId)
    } catch (e) {
      console.warn('[Favorites] cancel error:', e.message)
    }
  }

  function isFavorite(gameId) {
    return userStore.isFavorite(gameId)
  }

  function toggleFavorite(game, platform) {
    if (isFavorite(game.id || game.gameId)) {
      cancelFavorite(game, platform)
      return false
    }
    addFavorite(game, platform)
    return true
  }

  return {
    fetchFavoriteList, addFavorite, cancelFavorite,
    isFavorite, toggleFavorite
  }
}

export function useRecentGames() {
  const gamesStore = useGamesStore()
  const recentGames = ref([])

  async function fetchRecentGames(filter) {
    try {
      const stored = JSON.parse(localStorage.getItem('recentGames') || '[]')
      if (!stored.length) {
        recentGames.value = []
        return []
      }

      if (filter?.gameType === 'SPORTS' && filter?.target === 'hall') {
        recentGames.value = stored.filter(g => g.gameType === 'SPORTS' && g.target === 'hall')
        return recentGames.value
      }

      if (filter?.target === 'hall') {
        recentGames.value = stored.filter(g => g.gameType !== 'SPORTS' && g.target === 'hall')
        return recentGames.value
      }

      const halls = stored.filter(g => g.target === 'hall')
      const games = stored.filter(g => g.target !== 'hall')

      const gameIds = games.map(g => Number(g.gameId || g.id)).filter(Boolean)
      if (gameIds.length) {
        try {
          const result = await trpcQuery('game.list', {
            gameIdList: gameIds, pageSize: 100, page: 1, all: true
          })
          const statusMap = new Map()
          ;(result?.gameList || []).forEach(g => statusMap.set(Number(g.id), g.status))
          games.forEach(g => {
            const id = Number(g.gameId || g.id)
            if (statusMap.has(id)) g.status = statusMap.get(id)
          })
        } catch {}
      }

      const validGames = games.filter(g => g.status !== 'OFF')
      const all = [...halls, ...validGames]
      _saveRecent(all)

      if (filter) {
        recentGames.value = validGames.filter(g =>
          filter.platformId
            ? g.gameType === filter.gameType && (g.platformId === filter.platformId || g.id === filter.platformId)
            : g.gameType === filter.gameType
        )
      } else {
        recentGames.value = validGames
      }

      return recentGames.value
    } catch {
      return []
    }
  }

  function addRecentGame(game) {
    const stored = JSON.parse(localStorage.getItem('recentGames') || '[]')
    const exists = stored.findIndex(g => (g.gameId || g.id) === (game.gameId || game.id))
    if (exists >= 0) stored.splice(exists, 1)
    stored.unshift({ ...game, timestamp: Date.now() })
    if (stored.length > 50) stored.length = 50
    _saveRecent(stored)
  }

  function _saveRecent(list) {
    try { localStorage.setItem('recentGames', JSON.stringify(list)) } catch {}
  }

  return { recentGames, fetchRecentGames, addRecentGame }
}

export function useGameStatus() {
  function forGameStatus(game) {
    const { platformStatus, gameTypeStatus, status } = game
    return [status, gameTypeStatus, platformStatus].some(s => s === 'MAINTAIN') ? 'MAINTAIN' : 'ON'
  }

  return { forGameStatus }
}

export function useGameImageSrc(systemStore) {
  const cardStyle = computed(() => systemStore?.tenantInfo?.gameLogoStyle || 'style1')
  const logoLanguage = computed(() => systemStore?.tenantInfo?.gameLogoLanguage || 'en')

  function getImageSrc(game) {
    const baseUrl = systemStore?.tenantInfo?.gameLogoUrl || ''
    return `${baseUrl}/${cardStyle.value}/${logoLanguage.value}/${game.logoFlag}.jpg`
  }

  return { cardStyle, logoLanguage, getImageSrc }
}
