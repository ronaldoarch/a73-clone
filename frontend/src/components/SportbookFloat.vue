<template>
  <Teleport to="body">
    <Transition name="sbf-fade">
      <div v-if="visible" class="sbf-float">
        <button type="button" class="sbf-dismiss" aria-label="Fechar atalho apostas esportivas" @click.stop="dismiss">
          ×
        </button>
        <button type="button" class="sbf-hit" @click="openSports">
          <img
            src="/assets/fluantenocanto/sportbook-float.png?v=1"
            alt="Apostas esportivas — Sportbook"
            draggable="false"
            class="sbf-img"
          />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useGamesStore } from '../stores/games'
import { useAuthStore } from '../stores/auth'

const DISMISS_KEY = 'a73_sportbook_float_dismissed'

/**
 * Entrada de apostas esportivas no iGameWin / painel (Sport Betting).
 * Se o catálogo não trouxer o registo, o launch usa mesmo assim estes valores.
 */
const SPORTBOOK_ENTRY = Object.freeze({
  gameCode: '3000',
  providerCode: 'SPORTBOOK'
})

const router = useRouter()
const gamesStore = useGamesStore()
const authStore = useAuthStore()
const { allGames } = storeToRefs(gamesStore)
const visible = ref(false)

function dismiss() {
  visible.value = false
  sessionStorage.setItem(DISMISS_KEY, '1')
}

function normProvider(g) {
  return String(g.providerCode || g.platformCode || g.platformName || '')
    .trim()
    .toUpperCase()
}

function normGameCode(g) {
  return String(g.game_code ?? g.gameCode ?? g.code ?? g.id ?? '').trim()
}

function isSportbookProvider(p) {
  return p === 'SPORTBOOK' || p.includes('SPORTBOOK')
}

function isSportBetMobileCode(c) {
  return c === '3000' || Number(c) === 3000
}

function nameLooksLikeSportBetMobile(g) {
  const n = String(g.name || g.gameName || g.game_name || '')
  return /sport\s*bet/i.test(n) && /mobile/i.test(n)
}

/** Prioridade: SPORTBOOK + 3000 (Sport Bet Mobile) → nome → hall SPORTS → qualquer SPORTS */
function findSportsEntryGame() {
  const list = allGames.value || []
  const isSports = (g) =>
    String(g.gameType || g.game_type || '')
      .toUpperCase() === 'SPORTS'

  const sportbookMobile = list.find((g) => {
    const p = normProvider(g)
    const c = normGameCode(g)
    return isSportbookProvider(p) && isSportBetMobileCode(c)
  })
  if (sportbookMobile) return sportbookMobile

  const byName = list.find((g) => isSports(g) && nameLooksLikeSportBetMobile(g))
  if (byName) return byName

  const sportbookAny = list.find((g) => isSports(g) && isSportbookProvider(normProvider(g)))
  if (sportbookAny) return sportbookAny

  const hall = list.find((g) => isSports(g) && g.target === 'hall')
  if (hall) return hall

  return list.find((g) => isSports(g)) || null
}

function resolveLaunchQuery() {
  const game = findSportsEntryGame()
  if (game) {
    const code = normGameCode(game)
    const provider = String(game.providerCode || game.platformCode || game.platformId || '').trim()
    if (code !== '' && provider !== '') {
      return { game: code, provider }
    }
    if (code !== '') {
      return { game: code, provider: provider || SPORTBOOK_ENTRY.providerCode }
    }
  }
  return {
    game: SPORTBOOK_ENTRY.gameCode,
    provider: SPORTBOOK_ENTRY.providerCode
  }
}

async function openSports() {
  if (!allGames.value?.length) {
    try {
      await gamesStore.fetchCatalog()
    } catch {
      /* continua com SPORTBOOK_ENTRY */
    }
  }
  const { game: gameStr, provider } = resolveLaunchQuery()
  if (!gameStr) {
    router.push('/game/category/SPORTS')
    return
  }
  if (!authStore.isLoggedIn) {
    const redirect = router.resolve({
      path: '/launch',
      query: { game: gameStr, provider }
    }).fullPath
    router.push({ name: 'Login', query: { redirect } })
    return
  }
  router.push({ path: '/launch', query: { game: gameStr, provider } })
}

onMounted(() => {
  if (!sessionStorage.getItem(DISMISS_KEY)) visible.value = true
  gamesStore.fetchCatalog().catch(() => {})
})
</script>

<style scoped>
/*
 * Entre o carrossel de promo (acima) e a mina misteriosa (abaixo).
 * Largura alinhada aos outros flutuantes da direita.
 */
.sbf-float {
  position: fixed;
  top: auto;
  right: calc((100vw - min(100vw, var(--max-width, 480px))) / 2 + 0.5rem + env(safe-area-inset-right, 0px));
  left: auto;
  bottom: calc(12.5rem + env(safe-area-inset-bottom, 0px));
  --sbf-w: 4.15rem;
  width: var(--sbf-w);
  /* Acima do carrossel de promo (10019) para o toque ir ao sportbook, não ao slide de promo */
  z-index: 10025;
  filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.45));
}

.sbf-float:active {
  transform: scale(0.96);
  transition: transform 0.15s ease;
}

.sbf-dismiss {
  position: absolute;
  top: -0.2rem;
  right: -0.15rem;
  z-index: 3;
  width: 1.05rem;
  height: 1.05rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.7rem;
  line-height: 1;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.sbf-hit {
  display: block;
  width: 100%;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 0.4rem;
  overflow: hidden;
  isolation: isolate;
}

.sbf-img {
  width: 100%;
  max-height: 6.5rem;
  height: auto;
  object-fit: cover;
  object-position: center center;
  display: block;
  pointer-events: none;
  user-select: none;
  border-radius: 0.4rem;
}

.sbf-hit:focus-visible {
  outline: 2px solid rgba(255, 228, 77, 0.7);
  outline-offset: 2px;
}

.sbf-fade-enter-active,
.sbf-fade-leave-active {
  transition: opacity 0.28s ease;
}

.sbf-fade-enter-from,
.sbf-fade-leave-to {
  opacity: 0;
}
</style>
