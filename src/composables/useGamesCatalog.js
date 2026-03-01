/**
 * Catálogo de provedores e jogos da iGameWin.
 * Busca do backend GET /api/igamewin/catalog
 */
import { ref } from 'vue'
import { apiUrl } from '@/config/api'

export function useGamesCatalog() {
  const providers = ref([])
  const gamesByProvider = ref({})
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const r = await fetch(apiUrl('/api/igamewin/catalog'))
      const data = await r.json()
      providers.value = data.providers || []
      gamesByProvider.value = data.gamesByProvider || {}
    } catch (e) {
      error.value = e.message || 'Erro ao carregar jogos'
      providers.value = []
      gamesByProvider.value = {}
    } finally {
      loading.value = false
    }
  }

  return { providers, gamesByProvider, loading, error, load }
}
