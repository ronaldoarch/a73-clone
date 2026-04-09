/**
 * Pinia store for game data, pagination, categories, and favorites.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { trpcQuery } from '../utils/api'

const DEFAULT_PAGE_SIZE = 12
const SWIPER_SIZE = 6

export const useGamesStore = defineStore('games', () => {
  const catalog = ref([])
  const providers = ref([])
  const gamesByProvider = ref({})
  const loading = ref(false)
  const hotGames = ref([])
  const allGames = ref([])
  const recentGames = ref([])
  const gameUrl = ref('')
  const gameSportsUrl = ref('')
  const gameDoc = ref('')
  const categoryStates = ref(new Map())

  const topProviders = computed(() => providers.value.slice(0, 8))
  const isInGame = computed(() => !!(gameUrl.value || gameDoc.value))

  function getProviderGames(code) {
    return (gamesByProvider.value[code] || []).slice(0, 20)
  }

  function getColor(code) {
    const colors = ['#6C5CE7', '#00B894', '#E17055', '#0984E3', '#D63031', '#FDCB6E', '#A29BFE', '#55EFC4']
    let hash = 0
    for (let i = 0; i < (code || '').length; i++) hash = code.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  async function fetchCatalog() {
    if (loading.value) return
    if (allGames.value.length > 0) return

    loading.value = true
    try {
      const data = await trpcQuery('game.catalog', null, { cache: true, cacheTTL: 300000 })

      if (data && typeof data === 'object') {
        const games = data.games || data.gameList || data.list || data
        if (Array.isArray(games)) {
          allGames.value = games
          processGames(games)
        }
      }
    } catch (e) {
      console.warn('[GamesStore] fetchCatalog failed:', e.message)
      allGames.value = []
      providers.value = []
      gamesByProvider.value = {}
      hotGames.value = []
    } finally {
      loading.value = false
    }
  }

  function processGames(games) {
    const provMap = {}
    const hot = []
    const provSet = new Map()

    games.forEach(game => {
      const code = game.providerCode || game.platformId || game.provider || 'unknown'
      const name = game.providerName || game.platformName || code

      if (!provMap[code]) provMap[code] = []
      provMap[code].push(game)

      const gLogo = game.providerLogo || game.platformLogo || game.platformIcon || ''
      if (!provSet.has(code)) {
        provSet.set(code, { code, name, logo: gLogo || '' })
      } else if (gLogo && !provSet.get(code).logo) {
        provSet.get(code).logo = gLogo
      }

      if (game.isHot || game.hot || game.isPopular) {
        hot.push(game)
      }
    })

    gamesByProvider.value = provMap
    providers.value = Array.from(provSet.values())
    hotGames.value = hot.length ? hot : games.slice(0, 30)
  }

  function setGameUrl(url) {
    gameUrl.value = url
  }

  function setGameDoc(doc) {
    gameDoc.value = doc
  }

  function addRecentGame(game) {
    const clone = JSON.parse(JSON.stringify(game))
    const gameId = Number(game.gameId ?? game.id)
    const existingIdx = recentGames.value.findIndex(g => Number(g.gameId ?? g.id) === gameId)

    if (existingIdx === 0) return
    if (existingIdx > 0) recentGames.value.splice(existingIdx, 1)
    recentGames.value = [clone, ...recentGames.value].slice(0, 30)
  }

  function initCategoryState(key, config = {}) {
    if (!categoryStates.value.has(key)) {
      categoryStates.value.set(key, {
        page: 1, hasMore: true, loading: false, data: {},
        total: 0, lastRequestTime: 0, pageSize: config.pageSize || DEFAULT_PAGE_SIZE
      })
    }
  }

  function getCategoryGames(key) {
    const state = categoryStates.value.get(key)
    if (!state) return []
    return Object.keys(state.data).sort((a, b) => Number(a) - Number(b)).flatMap(p => state.data[p])
  }

  function updateCategoryPage(key, page, games, total) {
    const state = categoryStates.value.get(key)
    if (!state) return
    state.data[page] = games
    state.total = total
    state.page = page + 1
    state.loading = false
    state.lastRequestTime = Date.now()
    const loaded = Object.values(state.data).flat().length
    state.hasMore = games.length >= state.pageSize && loaded < total
  }

  function shouldLoadMore(key, currentSwipe) {
    const state = categoryStates.value.get(key)
    if (!state) return false
    const loaded = Object.values(state.data).flat().length
    return state.hasMore && currentSwipe >= Math.ceil(loaded / SWIPER_SIZE) - 2
  }

  function markFavorites(games, favoriteList, gameType) {
    if (!games?.length || !favoriteList?.length) return
    games.forEach(game => {
      game.isFavorite = favoriteList.some(fav =>
        (game.gameId === fav.gameId || game.id === fav.gameId)
      )
    })
  }

  return {
    catalog, providers, gamesByProvider, loading, hotGames, topProviders,
    allGames, recentGames, gameUrl, gameSportsUrl, gameDoc, categoryStates,
    isInGame,
    fetchCatalog, getProviderGames, getColor, processGames,
    setGameUrl, setGameDoc, addRecentGame,
    initCategoryState, getCategoryGames, updateCategoryPage, shouldLoadMore, markFavorites
  }
})
