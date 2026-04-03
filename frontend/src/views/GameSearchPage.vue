<template>
  <div class="search-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <SearchInput v-model="query" placeholder="Nome do jogo ou provedor" @search="doSearch" />
    </div>

    <div v-if="!query && !results.length" class="search-suggestions">
      <h3>Categorias populares</h3>
      <div class="cat-chips">
        <button v-for="cat in categories" :key="cat" class="cat-chip" @click="query = cat; doSearch()">{{ cat }}</button>
      </div>
    </div>

    <div v-if="results.length" class="results-grid">
      <GameCard v-for="(game, i) in results" :key="i" :game="game" :provider-code="game.providerCode" />
    </div>

    <Empty v-else-if="query && searched" type="search" text="Nenhum jogo encontrado" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useGamesStore } from '../stores/games'
import { storeToRefs } from 'pinia'
import SearchInput from '../components/SearchInput.vue'
import GameCard from '../components/GameCard.vue'
import Empty from '../components/Empty.vue'

const store = useGamesStore()
const { allGames } = storeToRefs(store)

const query = ref('')
const results = ref([])
const searched = ref(false)
const categories = ['Slots', 'Ao Vivo', 'Pesca', 'Crash', 'Roleta', 'Blackjack', 'Baccarat']

let searchTimeout = null

function doSearch() {
  searched.value = true
  const q = query.value.toLowerCase().trim()
  if (!q) { results.value = []; return }
  results.value = allGames.value.filter(g => {
    const name = (g.game_name || g.gameName || g.name || '').toLowerCase()
    const code = (g.providerCode || '').toLowerCase()
    return name.includes(q) || code.includes(q)
  }).slice(0, 60)
}

watch(query, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(doSearch, 300)
})

store.fetchCatalog()
</script>

<style scoped>
.search-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; gap: 8px; padding: 12px 0; }
.back-btn { color: var(--text-primary); padding: 4px; flex-shrink: 0; }
.search-suggestions { margin-top: 16px; }
.search-suggestions h3 { font-size: 14px; font-weight: 600; color: var(--text-muted); margin-bottom: 10px; }
.cat-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.cat-chip { padding: 8px 16px; border-radius: 20px; background: rgba(255,255,255,0.06); color: var(--text-secondary); font-size: 13px; font-weight: 500; }
.cat-chip:active { background: var(--purple-500); color: #fff; }
.results-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 12px; }
</style>
