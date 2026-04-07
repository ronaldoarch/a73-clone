<template>
  <section class="game-section">
    <div class="game-head">
      <div class="logo-c">
        <img v-if="name === 'Popular'" class="section-logo" src="/assets/hot-platform-36-wytewSgn.svg" alt="" />
        <div v-else class="section-logo provider-badge" :style="{ background: badgeColor }">
          <span class="provider-letter">{{ providerInitial }}</span>
        </div>
        <svg class="bg-logo" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.364 2.636L14.294 3.353L13.49 4.51L15.353 9L16.67 9.353L18 9C18 6.596 17.064 4.336 15.364 2.636Z" :fill="badgeColor" opacity=".15"/>
          <path d="M24.364 8.636L23.294 9.353L22.49 10.51L24.353 15L25.67 15.353L27 15C27 12.596 26.064 10.336 24.364 8.636Z" :fill="badgeColor" opacity=".12"/>
          <path d="M6.364 8.636L5.294 9.353L4.49 10.51L6.353 15L7.67 15.353L9 15C9 12.596 8.064 10.336 6.364 8.636Z" :fill="badgeColor" opacity=".12"/>
          <circle cx="16.5" cy="16.5" r="15.5" :stroke="badgeColor" stroke-width=".5" opacity=".15"/>
          <circle cx="16.5" cy="16.5" r="12" :stroke="badgeColor" stroke-width=".3" opacity=".1"/>
        </svg>
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

const providerInitial = computed(() => {
  const n = (props.name || '').toUpperCase()
  return n.length > 3 ? n.slice(0, 2) : n.charAt(0)
})

const badgeColors = ['#F5C84C', '#7041F3', '#17C964', '#FA8313', '#F5222D', '#FFC41A', '#14B8A6', '#E879F9']

const badgeColor = computed(() => {
  if (props.name === 'Popular') return '#F5A623'
  let hash = 0
  for (let i = 0; i < props.name.length; i++) hash = props.name.charCodeAt(i) + ((hash << 5) - hash)
  return badgeColors[Math.abs(hash) % badgeColors.length]
})

const displayGames = computed(() => props.games.slice(0, props.maxGames))
const visibleGames = computed(() => expanded.value ? displayGames.value : displayGames.value.slice(0, gridSize.value))
</script>

<style scoped>
.game-section {
  margin-bottom: .75rem;
}

.game-head {
  display: flex; align-items: center;
  padding: .625rem .75rem;
  margin-top: .5rem;
  margin-bottom: .5rem;
  background: linear-gradient(135deg, #2a1753 0%, #1e1048 50%, #2a1753 100%);
  border-radius: .375rem;
  position: relative;
}

.logo-c {
  position: relative;
  width: 2.25rem; height: 2.25rem;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}

.section-logo {
  width: 2rem; height: 2rem;
  position: relative; z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,.3));
}

.provider-badge {
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

.provider-letter {
  font-size: .75rem; font-weight: 900; color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,.3);
}

.bg-logo {
  position: absolute; inset: -4px;
  width: calc(100% + 8px); height: calc(100% + 8px);
  z-index: 1; opacity: .4;
  animation: bg-logo-spin 8s linear infinite;
}
@keyframes bg-logo-spin {
  to { transform: rotate(360deg); }
}

.title-wrap {
  flex: 1; margin-left: .625rem;
  display: flex; flex-direction: column; gap: .0625rem;
}
.section-title {
  font-size: .9375rem; font-weight: 700;
  color: #fff; line-height: 1.2;
}
.section-subtitle {
  font-size: .6875rem; color: rgba(255,255,255,.55);
  font-weight: 500; line-height: 1.2;
}

.arrow-container { flex-shrink: 0; }

.section-more-btn {
  display: flex; align-items: center; gap: .25rem;
  font-size: .75rem; font-weight: 700;
  color: #1a1a2e;
  background: linear-gradient(180deg, #d4f542, #b8e03a);
  padding: .375rem .875rem;
  border-radius: 1rem;
  border: none;
  cursor: pointer;
  transition: transform .15s, box-shadow .15s;
  box-shadow: 0 2px 8px rgba(212,245,66,.3);
  white-space: nowrap;
}
.section-more-btn:active { transform: scale(0.95); }
.section-more-btn svg { stroke: #1a1a2e; }

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
