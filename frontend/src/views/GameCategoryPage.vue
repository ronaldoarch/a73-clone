<template>
  <div class="category-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>{{ title }}</h2>
      <span class="game-count">{{ filteredGames.length }} jogos</span>
    </div>

    <!-- Top game type tabs -->
    <div class="type-tabs" v-if="gameTypeTabs.length > 1">
      <button
        v-for="tab in gameTypeTabs"
        :key="tab.id"
        class="type-tab"
        :class="{ active: activeType === tab.id }"
        @click="activeType = tab.id"
      >
        <img v-if="tab.iconUrl" :src="tab.iconUrl" class="type-tab-icon" alt="" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <div class="cat-layout">
      <!-- Side: Platform list -->
      <div class="side-platforms" v-if="providerList.length > 2">
        <button
          v-for="p in providerList"
          :key="p.code"
          class="side-plat"
          :class="{ active: selectedProvider === p.code }"
          @click="selectedProvider = p.code"
        >
          <img v-if="p.logo" :src="p.logo" class="plat-logo" alt="" />
          <span v-else class="plat-initial" :class="{ active: selectedProvider === p.code }">
            {{ (p.name || p.code).charAt(0) }}
          </span>
          <span class="plat-name" :class="{ active: selectedProvider === p.code }">{{ p.name || p.code }}</span>
        </button>
      </div>

      <!-- Main: game grid -->
      <div class="cat-main">
        <div class="cat-line" v-if="providerList.length <= 2 && providerList.length > 1">
          <button
            v-for="p in providerList"
            :key="p.code"
            class="filter-btn"
            :class="{ active: selectedProvider === p.code }"
            @click="selectedProvider = p.code"
          >{{ p.name || p.code }}</button>
        </div>
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
        </div>
        <div v-else-if="filteredGames.length" class="games-grid">
          <GameCard
            v-for="(game, i) in filteredGames"
            :key="game.id || game.game_code || i"
            :game="game"
            :provider-code="game.providerCode || selectedProvider"
          />
        </div>
        <div v-else class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ep-color-text-weakest)" stroke-width="1" opacity=".4"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <p>Sem registros</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useGamesStore } from '../stores/games'
import { storeToRefs } from 'pinia'
import GameCard from '../components/GameCard.vue'

const route = useRoute()
const store = useGamesStore()
const { providers, allGames, gamesByProvider, loading } = storeToRefs(store)

function normalizeCategoryGameTypeParam(val) {
  if (val == null || val === '') return 'all'
  const s = String(val)
  if (s.toLowerCase() === 'sport') return 'SPORTS'
  return s
}

const selectedProvider = ref(route.params.platformId || 'all')
const activeType = ref(normalizeCategoryGameTypeParam(route.params.gameType))

const title = computed(() => {
  const type = route.params.gameType
  const typeNames = { hot: 'Popular', POPULAR: 'Popular', slots: 'Slots', live: 'Ao Vivo', fish: 'Pesca', sport: 'Esporte', all: 'Todos' }
  return typeNames[type] || type || 'Jogos'
})

const gameTypeTabs = computed(() => {
  const tabs = [{ id: 'all', label: 'Todos' }]
  const types = new Set()
  allGames.value.forEach(g => {
    const t = g.gameType || g.game_type
    if (t && !types.has(t)) {
      types.add(t)
      const names = { POPULAR: 'Popular', SLOTS: 'Slots', LIVE: 'Ao Vivo', FISH: 'Pesca', SPORT: 'Esporte' }
      tabs.push({ id: t, label: names[t] || t })
    }
  })
  return tabs
})

const providerList = computed(() => {
  return [{ code: 'all', name: 'Todos' }, ...providers.value]
})

const filteredGames = computed(() => {
  let games = allGames.value
  if (selectedProvider.value && selectedProvider.value !== 'all') {
    games = (gamesByProvider.value[selectedProvider.value] || []).map(g => ({ ...g, providerCode: selectedProvider.value }))
  }
  if (activeType.value && activeType.value !== 'all') {
    games = games.filter(g => (g.gameType || g.game_type) === activeType.value)
  }
  return games
})

watch(() => route.params.platformId, (val) => {
  if (val) selectedProvider.value = val
})

watch(
  () => route.params.gameType,
  (val) => {
    activeType.value = normalizeCategoryGameTypeParam(val)
  }
)

onMounted(() => { store.fetchCatalog() })
</script>

<style scoped>
.category-page {
  padding: 0 .75rem 1.5rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100%;
}
.page-header {
  display: flex; align-items: center; padding: .75rem 0; gap: .75rem;
}
.page-header h2 {
  flex: 1; font-size: 1.125rem;
  font-weight: var(--ep-font-weight-bold, 700);
  color: var(--ep-color-text-default);
}
.back-btn { color: var(--ep-color-text-default); padding: .25rem; }
.game-count { font-size: .8125rem; color: var(--ep-color-text-weakest); }

/* Type Tabs (top) */
.type-tabs {
  display: flex; gap: .25rem; overflow-x: auto; padding: .25rem 0 .625rem;
  -webkit-overflow-scrolling: touch;
}
.type-tabs::-webkit-scrollbar { display: none; }
.type-tab {
  display: flex; flex-direction: column; align-items: center; gap: .25rem;
  padding: .5rem .625rem; border-radius: .5rem; flex-shrink: 0;
  background: var(--ep-color-background-fill-surface-raised-L1);
  color: var(--ep-color-text-weak); font-size: .6875rem; font-weight: 600;
  border: 1px solid var(--ep-color-border-default); transition: all .2s;
}
.type-tab.active {
  background: var(--gradient-primary); color: var(--ep-color-text-inverse, #0E1E3D);
  border-color: transparent;
}
.type-tab-icon { width: 2.25rem; height: 2.25rem; object-fit: contain; }

/* Category Layout */
.cat-layout { display: flex; gap: .625rem; }

/* Side Platforms */
.side-platforms {
  width: 4.5rem; display: flex; flex-direction: column;
  overflow-y: auto; flex-shrink: 0;
  max-height: calc(100vh - 10rem);
}
.side-plat {
  display: flex; flex-direction: column; align-items: center;
  padding: .5rem .25rem; gap: .25rem; cursor: pointer;
  border-radius: .375rem; transition: background .2s;
}
.side-plat.active { background: var(--ep-color-background-fill-surface-raised-L2); }
.plat-logo {
  width: 2.25rem; height: 2.25rem; border-radius: .375rem; object-fit: contain;
}
.plat-initial {
  width: 2.25rem; height: 2.25rem; border-radius: .375rem;
  background: var(--ep-color-background-fill-surface-lowered);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; font-weight: 800; color: var(--ep-color-text-weakest);
}
.plat-initial.active { color: var(--ep-color-text-selected); }
.plat-name {
  font-size: .5625rem; font-weight: 600;
  color: var(--ep-color-text-weakest); text-align: center;
  max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.plat-name.active { color: var(--ep-color-text-selected); }

/* Main */
.cat-main { flex: 1; min-width: 0; }

.cat-line {
  display: flex; gap: .375rem; overflow-x: auto; padding: .25rem 0 .625rem;
  -webkit-overflow-scrolling: touch;
}
.cat-line::-webkit-scrollbar { display: none; }
.filter-btn {
  padding: .375rem .75rem; border-radius: 1.25rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  color: var(--ep-color-text-weak); font-size: .75rem; font-weight: 600;
  white-space: nowrap; flex-shrink: 0;
  border: 1px solid var(--ep-color-border-default); transition: all .2s;
}
.filter-btn.active {
  background: var(--gradient-primary); color: var(--ep-color-text-inverse, #0E1E3D);
  border-color: transparent;
}

.games-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; }

.loading-state {
  display: flex; align-items: center; justify-content: center;
  padding: 3rem 0;
}
.loading-spinner {
  width: 1.5rem; height: 1.5rem;
  border: 2px solid var(--ep-color-border-default);
  border-top-color: var(--ep-color-text-selected);
  border-radius: 50%; animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 3rem 1rem; gap: .5rem; color: var(--ep-color-text-weakest);
  font-size: .8125rem;
}
</style>
