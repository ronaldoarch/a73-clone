<template>
  <div class="app-platform" :class="{ 'admin-fullscreen': isAdminRoute }">
    <IonApp>
      <IonRouterOutlet />
    </IonApp>
  </div>
</template>

<script setup>
import { onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { useAfiliado } from '@/composables/useAfiliado'
import { useSettings } from '@/composables/useSettings'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))

watch(isAdminRoute, (v) => {
  document.body.classList.toggle('admin-fullscreen', v)
}, { immediate: true })

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
