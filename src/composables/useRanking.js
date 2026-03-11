/**
 * Ranking de lucro (lucro real nos jogos) - busca do backend GET /api/ranking
 */
import { ref } from 'vue'
import { apiUrl } from '@/config/api'

export function useRanking() {
  const top3 = ref([])
  const list = ref([])
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const r = await fetch(apiUrl('/api/ranking'))
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      top3.value = data.top3 || []
      list.value = data.list || []
    } catch (e) {
      error.value = e.message || 'Erro ao carregar ranking'
      top3.value = []
      list.value = []
    } finally {
      loading.value = false
    }
  }

  return { top3, list, loading, error, load }
}
