<template>
  <div class="game-card" @click="launchGame">
    <div class="game-thumb">
      <img
        :src="imgSrc"
        :alt="gameName"
        loading="lazy"
        @error="onImgError"
      />
      <div v-if="imgError" class="thumb-fallback">
        <span>{{ gameName.charAt(0) }}</span>
      </div>
    </div>
    <div class="game-name">{{ gameName }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  game: { type: Object, required: true },
  providerCode: { type: String, default: '' }
})

const router = useRouter()
const imgError = ref(false)

const gameName = computed(() => props.game.game_name || props.game.gameName || props.game.name || '?')

const imgSrc = computed(() => {
  return props.game.banner || props.game.imageUrl || props.game.logo || props.game.icon || ''
})

function onImgError() {
  imgError.value = true
}

function launchGame() {
  const code = props.game.game_code || props.game.gameCode || props.game.id || ''
  const provider = props.providerCode || props.game.providerCode || props.game.platformCode || ''
  if (code) {
    router.push({ path: '/launch', query: { game: code, provider } })
  }
}
</script>

<style scoped>
.game-card {
  cursor: pointer;
  transition: all .2s ease;
  min-width: 0;
}

.game-card:active {
  transform: scale(0.95);
  opacity: 0.8;
}

.game-thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: var(--ep-border-radius-l, var(--rounded-card-game, .5rem));
  overflow: hidden;
  background: var(--ep-color-background-fill-surface-raised-L2);
}

.game-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
}

.thumb-fallback span {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--ep-color-text-inverse, #0E1E3D);
  font-family: var(--font-display);
}

.game-name {
  font-size: var(--ep-font-size-xs, .6875rem);
  color: var(--ep-color-text-weak, rgba(213,224,245,.8));
  margin-top: .375rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
  text-align: center;
}
</style>
