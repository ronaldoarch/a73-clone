<template>
  <div class="activity-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
      <h2>Atividade</h2>
    </div>
    <div class="custom-content">
      <SafeHtml v-if="htmlContent" :content="htmlContent" />
      <Empty v-else text="Conteúdo da atividade não disponível" />
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { trpcQuery } from '../../utils/api'
import SafeHtml from '../../components/SafeHtml.vue'
import Empty from '../../components/Empty.vue'

const route = useRoute()
const htmlContent = ref('')

onMounted(async () => {
  const id = route.params.id
  if (id) {
    try {
      const data = await trpcQuery('activity.detail', { id: Number(id) })
      if (data?.content) htmlContent.value = data.content
    } catch (e) { console.error(e) }
  }
})
</script>
<style scoped>
.activity-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }
.custom-content { background: var(--bg-card); border-radius: var(--radius-lg); padding: 16px; min-height: 200px; }
</style>
