<template>
  <div class="launch-page">
    <div v-if="loading" class="launch-loading">
      <div class="spinner"></div>
      <p>Abrindo jogo...</p>
    </div>

    <div v-if="error" class="launch-error">
      <span class="error-icon">⚠️</span>
      <h3>Erro ao abrir jogo</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="launchGame">Tentar novamente</button>
      <button class="back-btn" @click="$router.push('/main/inicio')">Voltar ao Início</button>
    </div>

    <iframe
      v-if="gameUrl"
      :src="gameUrl"
      class="game-frame"
      allow="fullscreen; autoplay"
      allowfullscreen
    ></iframe>

    <button v-if="gameUrl" class="close-btn" @click="$router.push('/main/inicio')">
      ✕
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const auth = useAuthStore()

const loading = ref(true)
const error = ref('')
const gameUrl = ref('')

async function launchGame() {
  const gameCode = route.query.game
  const provider = route.query.provider

  if (!gameCode) {
    error.value = 'Código do jogo não informado'
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await fetch('/api/igamewin/launch-game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {})
      },
      body: JSON.stringify({
        game_code: gameCode,
        provider_code: provider,
        user_code: auth.isLoggedIn ? (auth.account || 'guest') : 'guest',
        lang: 'pt'
      })
    })

    const data = await res.json()

    if (data.launch_url || data.url || data.game_url) {
      gameUrl.value = data.launch_url || data.url || data.game_url
    } else if (data.error) {
      error.value = data.error
    } else {
      error.value = 'Não foi possível obter a URL do jogo'
    }
  } catch (e) {
    error.value = 'Erro de conexão. Tente novamente.'
  } finally {
    loading.value = false
  }
}

onMounted(launchGame)
</script>

<style scoped>
.launch-page {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 9999;
}

.game-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.close-btn {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 10000;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0,0,0,0.7);
  color: #fff;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.launch-loading,
.launch-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: #fff;
  padding: 40px;
  text-align: center;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255,255,255,0.2);
  border-top-color: var(--purple-300);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-icon { font-size: 40px; }
.launch-error h3 { font-size: 18px; font-weight: 700; }
.launch-error p { font-size: 13px; color: rgba(255,255,255,0.6); }

.retry-btn {
  padding: 10px 24px;
  border-radius: var(--radius-md);
  background: var(--purple-400);
  color: #fff;
  font-weight: 600;
  margin-top: 8px;
}

.back-btn {
  padding: 10px 24px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.7);
  font-weight: 500;
}
</style>
