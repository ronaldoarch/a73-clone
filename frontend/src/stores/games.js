import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGamesStore = defineStore('games', () => {
  const providers = ref([])
  const gamesByProvider = ref({})
  const loading = ref(false)
  const loaded = ref(false)

  const allGames = computed(() => {
    const all = []
    for (const code in gamesByProvider.value) {
      const games = gamesByProvider.value[code] || []
      games.forEach(g => all.push({ ...g, providerCode: code }))
    }
    return all
  })

  const hotGames = computed(() => {
    const hot = []
    providers.value.slice(0, 5).forEach(p => {
      const games = gamesByProvider.value[p.code] || []
      games.slice(0, 4).forEach(g => hot.push({ ...g, providerCode: p.code }))
    })
    return hot
  })

  const topProviders = computed(() => providers.value.slice(0, 5))

  async function fetchCatalog() {
    if (loaded.value || loading.value) return
    loading.value = true
    try {
      const res = await fetch('/api/igamewin/catalog')
      const data = await res.json()
      if (data.providers) {
        providers.value = data.providers.filter(p => p.status === 1)
      }
      if (data.gamesByProvider) {
        gamesByProvider.value = data.gamesByProvider
      }
      loaded.value = true
    } catch (e) {
      console.error('Failed to fetch catalog:', e)
    } finally {
      loading.value = false
    }
  }

  function getProviderGames(code, limit = 20) {
    return (gamesByProvider.value[code] || []).slice(0, limit)
  }

  return {
    providers, gamesByProvider, loading, loaded,
    allGames, hotGames, topProviders,
    fetchCatalog, getProviderGames
  }
})
