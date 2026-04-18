<template>
  <div class="game-card" @click="launchGame">
    <div class="game-thumb">
      <img
        v-if="!imgError"
        :src="imgSrc"
        :alt="gameName"
        loading="lazy"
        @error="onImgError"
      />
      <div v-if="imgError || !imgSrc" class="thumb-fallback" :style="{ background: fallbackBg }">
        <span class="fallback-letter">{{ gameName.charAt(0) }}</span>
      </div>

      <div v-if="game.isHot || game.hot" class="hot-badge">
        <span>🔥</span>
      </div>

      <div v-if="game.isFeatured" class="featured-badge">Destaque</div>

      <div v-if="game.isNew" class="new-badge">NEW</div>

      <div class="thumb-overlay">
        <div class="play-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>

      <div class="thumb-provider" v-if="providerLabel">
        <span>{{ providerLabel }}</span>
      </div>
    </div>
    <div class="game-name">{{ gameName }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGamesStore } from '../stores/games'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  game: { type: Object, required: true },
  providerCode: { type: String, default: '' }
})

const router = useRouter()
const gamesStore = useGamesStore()
const authStore = useAuthStore()
const imgError = ref(false)

const gameName = computed(() =>
  props.game.game_name || props.game.gameName || props.game.name || '?'
)

const imgSrc = computed(() =>
  props.game.banner || props.game.imageUrl || props.game.logo || props.game.icon || ''
)

const providerLabel = computed(() =>
  props.providerCode || props.game.providerCode || props.game.platformCode || props.game.gameType || ''
)

const fallbackColors = ['#6C5CE7', '#00B894', '#E17055', '#0984E3', '#D63031', '#FDCB6E', '#A29BFE']
const fallbackBg = computed(() => {
  const name = gameName.value
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  const base = fallbackColors[Math.abs(h) % fallbackColors.length]
  return `linear-gradient(135deg, ${base}, ${base}99)`
})

function onImgError() { imgError.value = true }

function launchGame() {
  const code = props.game.game_code || props.game.gameCode || props.game.code || props.game.id || ''
  const provider = props.providerCode || props.game.providerCode || props.game.platformCode || ''

  if (!code) return

  gamesStore.addRecentGame(props.game)

  router.push({ path: '/launch', query: { game: code, provider } })
}
</script>

<style scoped>
.game-card {
  cursor: pointer; transition: transform .2s ease; min-width: 0;
}
.game-card:active { transform: scale(0.95); }

.game-thumb {
  position: relative; width: 100%; aspect-ratio: 3 / 4;
  border-radius: .625rem; overflow: hidden;
  background: var(--ep-color-background-fill-surface-raised-L2);
  box-shadow: 0 2px 8px rgba(0,0,0,.2);
}
.game-thumb img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform .3s ease;
}
.game-card:active .game-thumb img { transform: scale(1.05); }

.thumb-fallback {
  position: absolute; inset: 0; display: flex;
  align-items: center; justify-content: center;
}
.fallback-letter {
  font-size: 2rem; font-weight: 800; color: #fff;
  font-family: var(--font-display); text-shadow: 0 2px 4px rgba(0,0,0,.3);
}

.thumb-overlay {
  position: absolute; inset: 0; display: flex;
  align-items: center; justify-content: center;
  background: rgba(0,0,0,0); transition: background .2s;
  opacity: 0; transition: opacity .2s;
}
.game-card:active .thumb-overlay {
  opacity: 1; background: rgba(0,0,0,0.3);
}
.play-icon {
  width: 2.5rem; height: 2.5rem; border-radius: 50%;
  background: rgba(168,85,247,0.8); display: flex;
  align-items: center; justify-content: center;
  box-shadow: 0 2px 12px rgba(168,85,247,0.4);
}

.hot-badge {
  position: absolute; top: .25rem; left: .25rem;
  font-size: .75rem; z-index: 2;
}
.new-badge {
  position: absolute; top: .25rem; right: .25rem;
  background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff;
  font-size: .5rem; font-weight: 800; padding: 2px 6px;
  border-radius: .25rem; z-index: 2; letter-spacing: .5px;
}

.featured-badge {
  position: absolute; bottom: 1.85rem; left: 50%; transform: translateX(-50%);
  max-width: calc(100% - 0.5rem);
  background: linear-gradient(90deg, #f59e0b, #d97706);
  color: #1a0a0a;
  font-size: .5rem; font-weight: 800; padding: 2px 6px;
  border-radius: .25rem; z-index: 2; letter-spacing: .02em;
  white-space: nowrap; text-overflow: ellipsis; overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
}

.thumb-provider {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,.7));
  padding: 1.5rem .375rem .25rem;
}
.thumb-provider span {
  font-size: .5rem; font-weight: 700; color: rgba(255,255,255,.8);
  text-transform: uppercase; letter-spacing: .03em;
}

.game-name {
  font-size: .6875rem; color: var(--ep-color-text-weak, rgba(232,223,245,.8));
  margin-top: .375rem; overflow: hidden; text-overflow: ellipsis;
  white-space: nowrap; line-height: 1.2; text-align: center;
}
</style>
