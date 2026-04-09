<template>
  <section class="hot-games-section" v-if="hotGames.length">
    <div class="section-head-shell">
      <div class="section-head-rail game-head-bar">
        <div class="head-hex head-hex--popular-3d">
          <div class="head-hex-bg head-hex-bg--3d" aria-hidden="true"></div>
          <img class="head-hex-flame head-hex-flame--3d" src="/assets/hot-platform-36-wytewSgn.svg" alt="" />
        </div>
        <div class="title-wrap">
          <h3 class="section-title">Popular</h3>
          <span class="section-subtitle">Games {{ Math.max(hotGames.length, 100) }}+</span>
        </div>
        <div class="arrow-container">
          <button class="section-more-btn" @click="$router.push('/game/category/all')">
            <span>Todos</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <BonusPool />

    <div class="game-content">
      <GameCard
        v-for="(game, i) in gridGames"
        :key="game.game_code || game.gameCode || game.id || i"
        :game="game"
      />
    </div>

    <div v-if="displayGames.length > gridSize" class="more-wrap" @click="expanded = !expanded">
      <span class="more-info">{{ expanded ? '' : `Mostrando ${gridSize} de ${hotGames.length}` }}</span>
      <span class="more-btn">
        {{ expanded ? 'Recolher' : 'Ver Todos' }}
        <svg :class="{ flipped: expanded }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </span>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGamesStore } from '../stores/games'
import { storeToRefs } from 'pinia'
import BonusPool from './BonusPool.vue'
import GameCard from './GameCard.vue'

const props = defineProps({
  maxGames: { type: Number, default: 20 },
  cardSize: { type: String, default: 'size-md' }
})

const router = useRouter()
const gamesStore = useGamesStore()
const { hotGames } = storeToRefs(gamesStore)

const expanded = ref(false)
const gridSize = 8

const displayGames = computed(() => hotGames.value.slice(0, props.maxGames))
const gridGames = computed(() => expanded.value ? displayGames.value : displayGames.value.slice(0, gridSize))

onMounted(() => {
  if (!hotGames.value.length) {
    gamesStore.fetchCatalog().catch(() => {})
  }
})
</script>

<style scoped>
@import '../styles/section-head-hex.css';

.hot-games-section {
  margin: 0.5rem 0;
  overflow: visible;
}

.game-content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: .375rem;
  padding: .25rem 0 0;
}

.more-wrap {
  display: flex; align-items: center; justify-content: space-between;
  padding: .5rem .75rem .25rem;
  cursor: pointer;
}
.more-info {
  font-size: .6875rem; color: var(--ep-color-text-weakest);
}
.more-btn {
  display: flex; align-items: center; gap: .25rem;
  font-size: .75rem; font-weight: 600;
  color: var(--ep-color-text-brand-primary);
}
.more-btn svg { transition: transform .2s ease; }
.more-btn svg.flipped { transform: rotate(180deg); }
</style>
