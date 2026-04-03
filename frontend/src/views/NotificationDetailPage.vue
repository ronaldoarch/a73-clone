<template>
  <div class="notif-detail">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Detalhes</h2>
    </div>

    <div v-if="item" class="detail-card">
      <h3 class="detail-title">{{ item.title }}</h3>
      <span class="detail-time">{{ formatTime(item.createdAt) }}</span>
      <SafeHtml :content="item.content || item.body || ''" class="detail-body" />
    </div>
    <Empty v-else text="Notificação não encontrada" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNotificationStore } from '../stores/notification'
import { storeToRefs } from 'pinia'
import SafeHtml from '../components/SafeHtml.vue'
import Empty from '../components/Empty.vue'

const route = useRoute()
const store = useNotificationStore()
const { notifications, announcements } = storeToRefs(store)

const item = computed(() => {
  const id = Number(route.params.id) || route.params.id
  return [...notifications.value, ...announcements.value].find(n => n.id == id)
})

function formatTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  if (!notifications.value.length) store.fetchNotifications()
})
</script>

<style scoped>
.notif-detail { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }
.detail-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 20px 16px; }
.detail-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.detail-time { font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 16px; }
.detail-body { font-size: 14px; color: var(--text-secondary); line-height: 1.7; }
</style>
