<template>
  <div class="app-platform">
    <IonApp>
      <IonRouterOutlet />
    </IonApp>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { useAfiliado } from '@/composables/useAfiliado'
import { useSettings } from '@/composables/useSettings'

onMounted(() => {
  useSettings().load()
  if (localStorage.getItem('token')) {
    useAfiliado().refresh()
  }
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    window.__deferredPrompt = e
  })
})
</script>
