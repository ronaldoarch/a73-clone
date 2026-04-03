<template>
  <section class="game-section">
    <div class="section-header">
      <div class="section-left">
        <div class="provider-badge" :style="{ background: badgeColor }">
          {{ name.charAt(0) }}
        </div>
        <h3 class="section-title">{{ name }}</h3>
        <span class="section-count">{{ totalCount }}+</span>
      </div>
      <button class="section-more" @click="$emit('viewAll')">Todos &gt;</button>
    </div>
    <div class="games-scroll">
      <GameCard
        v-for="(game, i) in displayGames"
        :key="game.game_code || game.gameCode || i"
        :game="game"
        :provider-code="providerCode"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import GameCard from './GameCard.vue'

const props = defineProps({
  name: { type: String, required: true },
  games: { type: Array, default: () => [] },
  providerCode: { type: String, default: '' },
  maxGames: { type: Number, default: 20 },
  totalCount: { type: Number, default: 0 }
})

defineEmits(['viewAll'])

const badgeColors = ['#18AAFF', '#AB63FF', '#17C964', '#FA8313', '#F5222D', '#FFC41A', '#14B8A6', '#E879F9']

const badgeColor = computed(() => {
  let hash = 0
  for (let i = 0; i < props.name.length; i++) hash = props.name.charCodeAt(i) + ((hash << 5) - hash)
  return badgeColors[Math.abs(hash) % badgeColors.length]
})

const displayGames = computed(() => props.games.slice(0, props.maxGames))
</script>

<style scoped>
.game-section {
  margin-bottom: 1.125rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .375rem 0 .625rem;
}

.section-left {
  display: flex;
  align-items: center;
  gap: .5rem;
}

.provider-badge {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--ep-font-size-s, .75rem);
  font-weight: var(--ep-font-weight-bold, 700);
  color: #fff;
  flex-shrink: 0;
}

.section-title {
  font-size: var(--ep-font-size-m, .875rem);
  font-weight: var(--ep-font-weight-bold, 700);
  color: var(--ep-color-text-default);
}

.section-count {
  font-size: var(--ep-font-size-s, .75rem);
  color: var(--ep-color-text-weakest);
}

.section-more {
  font-size: var(--ep-font-size-s, .8125rem);
  color: var(--ep-color-text-brand-primary);
  font-weight: var(--ep-font-weight-medium, 500);
  padding: .25rem 0;
}

.games-scroll {
  display: flex;
  gap: .625rem;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding-bottom: .25rem;
}

.games-scroll::-webkit-scrollbar {
  display: none;
}

.games-scroll > :deep(.game-card) {
  flex: 0 0 6.25rem;
  scroll-snap-align: start;
}
</style>
