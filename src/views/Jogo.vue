<template>
  <ion-page class="jogo-page">
    <ion-header>
      <ion-toolbar class="jogo-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="$router.back()">
            <ion-icon name="chevron-back" />
          </ion-button>
        </ion-buttons>
        <ion-title class="jogo-title">Jogo</ion-title>
        <ion-buttons slot="end">
          <span class="jogo-balance">R$ {{ balanceFormatted }}</span>
          <ion-button v-if="gameUrl" fill="clear" size="small" @click="abrirNovaAba">
            <ion-icon name="open-outline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="jogo-content" :scroll-y="false">
      <div v-if="!gameUrl" class="jogo-empty">
        <p>Nenhum jogo selecionado.</p>
        <ion-button @click="$router.back()">Voltar</ion-button>
      </div>
      <div v-else class="jogo-iframe-wrap">
        <iframe
          :src="gameUrl"
          class="jogo-iframe"
          frameborder="0"
          allowfullscreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; payment; gamepad"
          referrerpolicy="no-referrer-when-downgrade"
        />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon } from '@ionic/vue'
import { useAfiliado } from '@/composables/useAfiliado'

const route = useRoute()
const { balanceFormatted, refresh } = useAfiliado()

const gameUrl = computed(() => {
  let url = route.query.url
  if (!url || typeof url !== 'string') return ''
  try {
    while (url.includes('%')) {
      const decoded = decodeURIComponent(url)
      if (decoded === url) break
      url = decoded
    }
    return url
  } catch {
    return url
  }
})

function abrirNovaAba() {
  if (gameUrl.value) window.open(gameUrl.value, '_blank')
}

onMounted(() => {
  if (localStorage.getItem('token')) refresh()
  // Nota: o jogo é exibido via iframe no template — não redirecionar com
  // window.location.replace() pois isso destrói o app Vue e elimina a barra
  // de saldo e o botão de voltar.
})
</script>

<style scoped>
.jogo-page {
  --background: #000;
}
.jogo-toolbar {
  --background: var(--color-bg-200);
  --color: var(--text);
  --min-height: 48px;
}
.jogo-title {
  font-size: 1rem;
}
.jogo-balance {
  font-weight: 700;
  color: var(--primary);
  font-size: 0.95rem;
  padding-right: 8px;
}
.jogo-content {
  --background: #000;
  padding: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  --overflow: hidden;
}
.jogo-iframe-wrap {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
}
.jogo-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  pointer-events: auto;
}
.jogo-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 16px;
  color: var(--text-muted);
}
</style>
