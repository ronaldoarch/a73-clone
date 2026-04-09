<template>
  <section class="game-section">
    <div class="section-head-shell">
      <div class="section-head-rail game-head-bar">
        <div class="head-hex head-hex--popular-3d">
          <div class="head-hex-bg head-hex-bg--3d" aria-hidden="true"></div>
          <img
            v-if="name === 'Popular'"
            class="head-hex-flame head-hex-flame--3d"
            src="/assets/hot-platform-36-wytewSgn.svg"
            alt=""
          />
          <span v-else class="head-hex-letters">{{ sectionHexLetters }}</span>
        </div>
        <div class="title-wrap">
          <h3 class="section-title">{{ name }}</h3>
          <span v-if="totalCount" class="section-subtitle">Games {{ Math.max(totalCount, 100) }}+</span>
        </div>
        <div class="arrow-container">
          <button class="section-more-btn" @click="$emit('viewAll')">
            <span>Todos</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="game-content">
      <GameCard
        v-for="(game, i) in visibleGames"
        :key="game.game_code || game.gameCode || i"
        :game="game"
        :provider-code="providerCode"
      />
    </div>

    <div v-if="displayGames.length > gridSize" class="more-wrap" @click="expanded = !expanded">
      <span class="more-info">{{ expanded ? '' : `Mostrando ${gridSize} de ${totalCount || displayGames.length}` }}</span>
      <span class="more-btn">
        {{ expanded ? 'Recolher' : 'Ver Todos' }}
        <svg :class="{ flipped: expanded }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </span>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import GameCard from './GameCard.vue'

const props = defineProps({
  name: { type: String, required: true },
  games: { type: Array, default: () => [] },
  providerCode: { type: String, default: '' },
  maxGames: { type: Number, default: 30 },
  totalCount: { type: Number, default: 0 },
  columns: { type: Number, default: 4 },
  rows: { type: Number, default: 2 }
})

defineEmits(['viewAll'])

const expanded = ref(false)
const gridSize = computed(() => props.columns * props.rows)

const providerLogos = {
  pg: 'PG', pgsoft: 'PG',
  pp: 'PP', pragmatic: 'PP', pragmaticplay: 'PP',
  jili: 'JL', jl: 'JL',
  cq9: 'CQ',
  fc: 'FC', fachai: 'FC',
  mg: 'MG', microgaming: 'MG',
  evo: 'EV', evolution: 'EV',
  sg: 'SG', spadegaming: 'SG',
  live22: 'L2',
  joker: 'JK',
  ka: 'KA', kagaming: 'KA',
  rt: 'RT', redtiger: 'RT',
  habanero: 'HB', hb: 'HB',
  booongo: 'BG', bg: 'BG',
  netent: 'NE', ne: 'NE',
  playtech: 'PT', pt: 'PT',
}

function twoLetters(code, displayName) {
  const c = (code || '').toLowerCase().trim()
  const mapped = providerLogos[c]
  const base = (mapped || displayName || code || '').toString().toUpperCase()
  const compact = base.replace(/[^A-Z0-9]/g, '')
  if (compact.length >= 2) return compact.slice(0, 2)
  if (compact.length === 1) return (compact + compact).slice(0, 2)
  return '??'
}

const sectionHexLetters = computed(() => {
  if (props.name === 'Popular') return ''
  return twoLetters(props.providerCode, props.name)
})

const displayGames = computed(() => props.games.slice(0, props.maxGames))
const visibleGames = computed(() => expanded.value ? displayGames.value : displayGames.value.slice(0, gridSize.value))
</script>

<style scoped>
@import '../styles/section-head-hex.css';

.game-section {
  margin-bottom: 0.75rem;
  overflow: visible;
}

.game-section .section-head-shell {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
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
