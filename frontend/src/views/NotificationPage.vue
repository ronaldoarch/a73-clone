<template>
  <div class="notif-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Notificações</h2>
      <button class="mark-btn" @click="handleMarkAll">Marcar todas</button>
    </div>

    <div class="notif-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="notif-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
        <span v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</span>
      </button>
    </div>

    <div class="notif-list" v-if="currentList.length">
      <div
        v-for="item in currentList"
        :key="item.id"
        class="notif-item"
        :class="{ unread: !item.read }"
        @click="goDetail(item)"
      >
        <div class="notif-dot" v-if="!item.read"></div>
        <div class="notif-content">
          <h4 class="notif-title">{{ item.title }}</h4>
          <p class="notif-preview">{{ item.preview || item.content?.substring(0, 80) }}...</p>
          <span class="notif-time">{{ formatTime(item.createdAt) }}</span>
        </div>
        <span class="notif-arrow">›</span>
      </div>
    </div>

    <Empty v-else type="notification" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/notification'
import { storeToRefs } from 'pinia'
import Empty from '../components/Empty.vue'

const router = useRouter()
const store = useNotificationStore()
const { notifications, announcements, supportMessages, unreadNotifications, unreadSupport } = storeToRefs(store)

const activeTab = ref('notifications')

const tabs = computed(() => [
  { id: 'support', label: 'Suporte', count: unreadSupport.value },
  { id: 'notifications', label: 'Notificações', count: unreadNotifications.value },
  { id: 'announcements', label: 'Avisos', count: 0 }
])

const currentList = computed(() => {
  if (activeTab.value === 'support') return supportMessages.value
  if (activeTab.value === 'announcements') return announcements.value
  return notifications.value
})

function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  if (diff < 3600000) return Math.floor(diff / 60000) + 'min atrás'
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h atrás'
  return d.toLocaleDateString('pt-BR')
}

function goDetail(item) {
  if (!item.read) store.markRead(item.id)
  router.push(`/notification/detail/${item.id}`)
}

function handleMarkAll() {
  store.markAllRead()
}

onMounted(() => {
  store.fetchNotifications()
  store.fetchAnnouncements()
  store.fetchSupport()
})
</script>

<style scoped>
.notif-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }
.mark-btn { font-size: 13px; color: var(--purple-200); font-weight: 500; }

.notif-tabs { display: flex; gap: 4px; margin-bottom: 12px; }
.notif-tab { flex: 1; padding: 10px; border-radius: var(--radius-md); background: rgba(255,255,255,0.04); font-size: 13px; font-weight: 600; color: var(--text-muted); text-align: center; transition: var(--transition); position: relative; }
.notif-tab.active { background: var(--purple-500); color: #fff; }
.tab-badge { position: absolute; top: 4px; right: 8px; background: var(--accent-red); color: #fff; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 8px; min-width: 14px; }

.notif-list { display: flex; flex-direction: column; gap: 2px; }
.notif-item { display: flex; align-items: flex-start; gap: 10px; padding: 14px; background: var(--bg-card); border-radius: var(--radius-md); cursor: pointer; transition: var(--transition); }
.notif-item.unread { background: rgba(168,85,247,0.08); }
.notif-item:active { opacity: 0.7; }
.notif-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--purple-300); flex-shrink: 0; margin-top: 6px; }
.notif-content { flex: 1; min-width: 0; }
.notif-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.notif-preview { font-size: 12px; color: var(--text-muted); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.notif-time { font-size: 11px; color: var(--text-muted); margin-top: 4px; display: block; }
.notif-arrow { font-size: 20px; color: var(--text-muted); flex-shrink: 0; }
</style>
