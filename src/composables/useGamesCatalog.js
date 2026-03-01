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

  async function load(forceRefresh = false) {
    loading.value = true
    error.value = ''
    try {
      const url = apiUrl('/api/igamewin/catalog') + (forceRefresh ? '?refresh=1' : '')
      const r = await fetch(url)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      providers.value = data.providers || []
      gamesByProvider.value = data.gamesByProvider || {}
    } catch (e) {
      const msg = e.message || 'Erro ao carregar jogos'
      error.value = msg.includes('fetch') || msg.includes('Failed') ? 'Verifique o proxy (BACKEND_URL) e VITE_API_URL vazio no build' : msg
      providers.value = []
      gamesByProvider.value = {}
    } finally {
      loading.value = false
    }
  }

  return { providers, gamesByProvider, loading, error, load }
}
