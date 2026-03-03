<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="jogos-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="$router.back()">
            <ion-icon name="chevron-back" />
          </ion-button>
        </ion-buttons>
        <ion-title>Slot</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="jogos-content">
      <!-- Busca -->
      <div class="jogos-search-wrap">
        <input
          v-model="searchQuery"
          type="text"
          class="jogos-search-input"
          placeholder="Pesquisar Jogos"
        />
        <ion-icon name="search" class="jogos-search-icon" />
      </div>

      <!-- Tabs -->
      <div class="jogos-tabs">
        <button
          type="button"
          class="jogos-tab"
          :class="{ active: tabAtivo === 'todos' }"
          @click="tabAtivo = 'todos'"
        >
          Todos
        </button>
        <button
          type="button"
          class="jogos-tab"
          :class="{ active: tabAtivo === 'popular' }"
          @click="tabAtivo = 'popular'"
        >
          Popular
        </button>
        <button
          type="button"
          class="jogos-tab"
          :class="{ active: tabAtivo === 'recente' }"
          @click="tabAtivo = 'recente'"
        >
          Recente
        </button>
        <button
          type="button"
          class="jogos-tab"
          :class="{ active: tabAtivo === 'favoritos' }"
          @click="tabAtivo = 'favoritos'"
        >
          Favoritos
        </button>
      </div>

      <!-- Layout: sidebar + grid -->
      <div class="jogos-layout">
        <!-- Sidebar provedores -->
        <aside class="jogos-sidebar">
          <div
            class="jogos-provider-item"
            :class="{ active: !selectedProvider }"
            @click="selectedProvider = null"
          >
            <div class="jogos-provider-logo">★</div>
            <span class="jogos-provider-name">Todos</span>
          </div>
          <div
            v-for="p in providersForSidebar"
            :key="p.code"
            class="jogos-provider-item"
            :class="{ active: selectedProvider === p.code }"
            @click="selectedProvider = p.code"
          >
            <div class="jogos-provider-logo">{{ p.logo }}</div>
            <span class="jogos-provider-name">{{ p.name }}</span>
          </div>
        </aside>

        <!-- Grid de jogos -->
        <div class="jogos-grid-wrap">
          <div v-if="catalogLoading" class="jogos-loading">Carregando jogos...</div>
          <div v-else-if="!filteredGames.length" class="jogos-empty">
            Nenhum jogo encontrado.
          </div>
          <div v-else class="jogos-grid">
            <div
              v-for="g in filteredGames"
              :key="g.game_code"
              class="jogos-game-card"
              @click="launchGame(g.providerCode, g.game_code)"
            >
              <div class="jogos-game-banner">
                <img v-if="g.banner" :src="g.banner" :alt="g.game_name" loading="lazy" />
                <div v-else class="jogos-game-placeholder">{{ g.game_name?.slice(0, 2) || '?' }}</div>
              </div>
              <span class="jogos-game-name">{{ g.game_name }}</span>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon } from '@ionic/vue'
import { useGamesCatalog } from '@/composables/useGamesCatalog'
import { useToast } from '@/composables/useToast'
import { igamewinApi } from '@/api/igamewin'

const route = useRoute()
const toast = useToast()
const { providers: catalogProviders, gamesByProvider: catalogGamesByProvider, loading: catalogLoading, load: loadCatalog } = useGamesCatalog()

const searchQuery = ref('')
const tabAtivo = ref('todos')
const selectedProvider = ref(null)

const providersForSidebar = computed(() =>
  catalogProviders.value.map(p => ({
    code: p.code,
    name: p.name,
    logo: p.code.length <= 3 ? p.code : p.code.slice(0, 2)
  }))
)

const filteredGames = computed(() => {
  let games = []
  if (selectedProvider.value) {
    games = (catalogGamesByProvider.value[selectedProvider.value] || []).map(g => ({
      ...g,
      providerCode: selectedProvider.value
    }))
  } else {
    for (const [code, list] of Object.entries(catalogGamesByProvider.value)) {
      games = games.concat((list || []).map(g => ({ ...g, providerCode: code })))
    }
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    games = games.filter(g => (g.game_name || '').toLowerCase().includes(q))
  }
  return games
})

function launchGame(providerCode, gameCode) {
  const userCode = localStorage.getItem('account') || 'guest'
  // Abre janela em branco imediatamente (síncrono) para preservar gesto do usuário e evitar bloqueio de popup
  const w = window.open('', '_blank')
  if (w) {
    w.document.write('<html><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#0f0f14;color:#fff;font-family:sans-serif;font-size:1.1rem">Carregando jogo...</body></html>')
  }
  igamewinApi.gameLaunch(userCode, providerCode, gameCode).then((data) => {
    if (data?.status === 1 && data?.launch_url) {
      if (w) {
        w.location.href = data.launch_url
      } else {
        window.location.href = data.launch_url
      }
    } else {
      if (w) w.close()
      const msg = data?.msg === 'IGAMEWIN_NOT_CONFIGURED' ? 'Configure as credenciais iGameWin no Admin → API de Jogos' : (data?.msg || 'Não foi possível abrir o jogo')
      toast.error(msg)
    }
  }).catch(() => {
    if (w) w.close()
    toast.error('Erro ao carregar o jogo')
  })
}

watch(() => route.query.provider, (code) => {
  if (code && catalogProviders.value.some(p => p.code === code)) {
    selectedProvider.value = code
  } else if (!code) {
    selectedProvider.value = null
  }
}, { immediate: true })

onMounted(async () => {
  await loadCatalog()
  const code = route.query.provider
  if (code && catalogProviders.value.some(p => p.code === code)) {
    selectedProvider.value = code
  }
})
</script>

<style scoped>
.jogos-toolbar {
  --background: var(--color-bg-200);
  --color: var(--text);
  border-bottom: 1px solid var(--border);
}
.jogos-content {
  --background: var(--color-bg-300);
}
.jogos-search-wrap {
  position: relative;
  margin: 12px 16px;
}
.jogos-search-input {
  width: 100%;
  padding: 12px 44px 12px 16px;
  background: var(--color-bg-100);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  font-size: 0.95rem;
}
.jogos-search-input::placeholder {
  color: var(--text-muted);
}
.jogos-search-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: var(--text-muted);
  pointer-events: none;
}
.jogos-tabs {
  display: flex;
  gap: 8px;
  padding: 0 16px 12px;
  overflow-x: auto;
  scrollbar-width: none;
}
.jogos-tabs::-webkit-scrollbar { display: none; }
.jogos-tab {
  flex: 0 0 auto;
  padding: 8px 16px;
  background: var(--color-bg-100);
  border: 1px solid var(--border);
  border-radius: 20px;
  color: var(--text);
  font-size: 0.85rem;
  white-space: nowrap;
  transition: background 0.2s, border-color 0.2s;
}
.jogos-tab.active {
  background: rgba(168, 85, 247, 0.25);
  border-color: var(--primary);
  color: var(--primary);
}
.jogos-layout {
  display: flex;
  min-height: calc(100vh - 180px);
}
.jogos-sidebar {
  width: 90px;
  flex-shrink: 0;
  padding: 8px 0;
  background: var(--color-bg-200);
  border-right: 1px solid var(--border);
  overflow-y: auto;
}
.jogos-provider-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  cursor: pointer;
  transition: background 0.2s;
  border-left: 3px solid transparent;
}
.jogos-provider-item.active {
  background: rgba(168, 85, 247, 0.2);
  border-left-color: var(--primary);
}
.jogos-provider-logo {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 4px;
}
.jogos-provider-name {
  font-size: 0.6rem;
  color: var(--text);
  text-align: center;
  line-height: 1.2;
}
.jogos-grid-wrap {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}
.jogos-loading,
.jogos-empty {
  text-align: center;
  padding: 40px 16px;
  color: var(--text-muted);
}
.jogos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.jogos-game-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-bg-100);
  border: 1px solid var(--border);
  transition: transform 0.2s, box-shadow 0.2s;
}
.jogos-game-card:active {
  transform: scale(0.97);
}
.jogos-game-banner {
  aspect-ratio: 1;
  background: var(--color-bg-200);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.jogos-game-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.jogos-game-placeholder {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-muted);
}
.jogos-game-name {
  display: block;
  padding: 8px;
  font-size: 0.75rem;
  color: var(--text);
  text-align: center;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
