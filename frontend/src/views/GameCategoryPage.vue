<template>
  <div class="category-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>{{ title }}</h2>
      <span class="game-count">{{ filteredGames.length }} jogos</span>
    </div>

    <div class="provider-filter" v-if="providerList.length > 1">
      <button
        v-for="p in providerList"
        :key="p.code"
        class="filter-btn"
        :class="{ active: selectedProvider === p.code }"
        @click="selectedProvider = p.code"
      >
        {{ p.name || p.code }}
      </button>
    </div>

    <div v-if="filteredGames.length" class="games-grid">
      <GameCard v-for="(game, i) in filteredGames" :key="i" :game="game" :provider-code="game.providerCode || selectedProvider" />
    </div>
    <Empty v-else type="data" text="Nenhum jogo nesta categoria" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGamesStore } from '../stores/games'
import { storeToRefs } from 'pinia'
import GameCard from '../components/GameCard.vue'
import Empty from '../components/Empty.vue'

const route = useRoute()
const store = useGamesStore()
const { providers, allGames, gamesByProvider } = storeToRefs(store)

const selectedProvider = ref(route.params.platformId || 'all')

const title = computed(() => {
  const type = route.params.gameType
  const typeNames = { hot: 'Popular', slots: 'Slots', live: 'Ao Vivo', fish: 'Pesca', sport: 'Esporte', all: 'Todos' }
  return typeNames[type] || type || 'Jogos'
})

const providerList = computed(() => {
  return [{ code: 'all', name: 'Todos' }, ...providers.value]
})

const filteredGames = computed(() => {
  if (selectedProvider.value && selectedProvider.value !== 'all') {
    return (gamesByProvider.value[selectedProvider.value] || []).map(g => ({ ...g, providerCode: selectedProvider.value }))
  }
  return allGames.value
})

onMounted(() => { store.fetchCatalog() })
</script>

<style scoped>
.category-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }
.game-count { font-size: 13px; color: var(--text-muted); }

.provider-filter { display: flex; gap: 6px; overflow-x: auto; padding: 4px 0 12px; -webkit-overflow-scrolling: touch; }
.provider-filter::-webkit-scrollbar { display: none; }
.filter-btn { padding: 6px 14px; border-radius: 20px; background: rgba(255,255,255,0.06); color: var(--text-muted); font-size: 12px; font-weight: 600; white-space: nowrap; flex-shrink: 0; }
.filter-btn.active { background: var(--purple-500); color: #fff; }

.games-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
</style>
