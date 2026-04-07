<template>
  <div class="notif-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Central de Mensagens</h2>
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
        <span v-if="tab.count > 0" class="tab-badge">{{ tab.count > 99 ? '99+' : tab.count }}</span>
      </button>
    </div>

    <!-- Support Tab -->
    <template v-if="activeTab === 'support'">
      <div class="support-card">
        <div class="support-header">
          <div class="support-avatar">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <div class="support-info">
            <h3>Atendimento Online</h3>
            <p>Disponível 24h por dia</p>
          </div>
        </div>
        <p class="support-tip">Entre em contato com nosso suporte para tirar dúvidas ou resolver problemas.</p>
        <button class="support-btn" @click="openSupport">Falar com Suporte</button>
      </div>
    </template>

    <!-- Notifications Tab -->
    <template v-if="activeTab === 'notifications'">
      <div class="read-all-row" v-if="unreadNotifications > 0">
        <button class="read-all-btn" @click="handleMarkAll">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Marcar todas como lidas
        </button>
      </div>
      <div class="notif-list" v-if="groupedNotifications.length">
        <template v-for="group in groupedNotifications" :key="group.date">
          <p class="notif-date-label">{{ group.date }}</p>
          <div
            v-for="item in group.items"
            :key="item.id"
            class="notif-item"
            :class="{ unread: !item.read }"
            @click="goDetail(item)"
          >
            <div class="notif-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              <span v-if="!item.read" class="notif-dot"></span>
            </div>
            <div class="notif-content">
              <h4 class="notif-title">{{ item.title }}</h4>
              <p class="notif-preview">{{ stripHtml(item.content || '').substring(0, 80) }}</p>
              <span class="notif-time">{{ formatTime(item.createdAt) }}</span>
            </div>
            <svg class="notif-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </template>
      </div>
      <Empty v-else type="notification" />
    </template>

    <!-- Announcements Tab -->
    <template v-if="activeTab === 'announcements'">
      <div class="read-all-row" v-if="unreadAnnouncements > 0">
        <button class="read-all-btn" @click="markAllAnnouncements">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Marcar todas como lidas
        </button>
      </div>
      <div class="notif-list" v-if="announcements.length">
        <div
          v-for="item in announcements"
          :key="item.id"
          class="notif-item"
          :class="{ unread: !item.read }"
          @click="goDetail(item)"
        >
          <div class="notif-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 17H2a3 3 0 003-3V9a7 7 0 0114 0v5a3 3 0 003 3zm-8.27 4a2 2 0 01-3.46 0"/>
            </svg>
            <span v-if="!item.read" class="notif-dot"></span>
          </div>
          <div class="notif-content">
            <div class="notif-top">
              <h4 class="notif-title">{{ item.title }}</h4>
            </div>
            <p class="notif-preview">{{ stripHtml(item.content || '').substring(0, 80) }}</p>
            <span class="notif-time">{{ formatTime(item.createdAt || item.createTime) }}</span>
          </div>
          <svg class="notif-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
      <Empty v-else type="notification" />
    </template>
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

const activeTab = ref('support')
const unreadAnnouncements = computed(() => announcements.value.filter(a => !a.read).length)

const tabs = computed(() => [
  { id: 'support', label: 'Suporte', count: unreadSupport.value },
  { id: 'notifications', label: 'Notificações', count: unreadNotifications.value },
  { id: 'announcements', label: 'Anúncios', count: unreadAnnouncements.value }
])

const groupedNotifications = computed(() => {
  const groups = {}
  notifications.value.forEach(item => {
    const d = item.createdAt ? new Date(item.createdAt) : new Date()
    const key = d.toLocaleDateString('pt-BR')
    if (!groups[key]) groups[key] = { date: key, items: [] }
    groups[key].items.push(item)
  })
  return Object.values(groups)
})

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  const diff = now - d
  if (diff < 3600000) return Math.max(1, Math.floor(diff / 60000)) + 'min atrás'
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h atrás'
  return d.toLocaleDateString('pt-BR')
}

function goDetail(item) {
  if (!item.read) store.markRead(item.id)
  router.push(`/notification/detail/${item.id}`)
}

function handleMarkAll() { store.markAllRead() }
function markAllAnnouncements() {
  announcements.value.forEach(a => { a.read = true })
}

function openSupport() {
  router.push('/notification')
}

onMounted(() => {
  store.fetchNotifications()
  store.fetchAnnouncements()
  store.fetchSupport()
})
</script>

<style scoped>
.notif-page {
  padding: 0 .75rem 1.5rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100%;
}
.page-header {
  display: flex; align-items: center; padding: .75rem 0; gap: .75rem;
}
.page-header h2 {
  flex: 1; font-size: 1.125rem;
  font-weight: var(--ep-font-weight-bold, 700);
  color: var(--ep-color-text-default);
}
.back-btn { color: var(--ep-color-text-default); padding: .25rem; }

/* Tabs */
.notif-tabs {
  display: flex; gap: .25rem; margin-bottom: 1rem;
}
.notif-tab {
  flex: 1; padding: .625rem; border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--ep-color-background-fill-surface-raised-L1);
  font-size: .8125rem; font-weight: 600;
  color: var(--ep-color-text-weak); text-align: center;
  transition: all .2s; position: relative;
  border: 1px solid var(--ep-color-border-default);
}
.notif-tab.active {
  background: var(--gradient-primary);
  color: var(--ep-color-text-inverse, #0E1E3D);
  border-color: transparent;
}
.tab-badge {
  position: absolute; top: -.25rem; right: .25rem;
  background: #F44336; color: #fff; font-size: .5rem; font-weight: 700;
  padding: 1px 4px; border-radius: .5rem; min-width: .75rem;
}

/* Support card */
.support-card {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: var(--ep-border-radius-surface-large, 1rem);
  padding: 1.25rem; border: 1px solid var(--ep-color-border-default);
}
.support-header { display: flex; align-items: center; gap: .75rem; margin-bottom: .75rem; }
.support-avatar {
  width: 3rem; height: 3rem; border-radius: 50%;
  background: var(--gradient-primary); display: flex;
  align-items: center; justify-content: center;
  color: var(--ep-color-text-inverse, #0E1E3D);
}
.support-info h3 { font-size: 1rem; font-weight: 700; color: var(--ep-color-text-default); }
.support-info p { font-size: .75rem; color: var(--ep-accent-green, #17C964); }
.support-tip {
  font-size: .8125rem; color: var(--ep-color-text-weakest);
  margin-bottom: 1rem; line-height: 1.5;
}
.support-btn {
  width: 100%; padding: .75rem; border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--gradient-primary); color: var(--ep-color-text-inverse, #0E1E3D);
  font-size: .875rem; font-weight: 700;
}

/* Read all */
.read-all-row { margin-bottom: .75rem; }
.read-all-btn {
  display: flex; align-items: center; gap: .375rem;
  font-size: .75rem; color: var(--ep-color-text-selected);
  font-weight: 500; padding: .25rem 0;
}

/* Notification List */
.notif-date-label {
  font-size: .6875rem; color: var(--ep-color-text-weakest);
  padding: .625rem 0 .25rem; font-weight: 500;
}
.notif-list { display: flex; flex-direction: column; gap: .375rem; }
.notif-item {
  display: flex; align-items: flex-start; gap: .625rem;
  padding: .875rem; cursor: pointer; transition: all .2s;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: var(--ep-border-radius-l, .5rem);
  border: 1px solid var(--ep-color-border-default);
}
.notif-item.unread {
  border-left: 3px solid var(--ep-color-text-selected);
}
.notif-item:active { opacity: .7; }
.notif-icon-wrap {
  position: relative; flex-shrink: 0;
  color: var(--ep-color-icon-brand-primary);
  padding-top: .125rem;
}
.notif-dot {
  position: absolute; top: 0; right: -2px;
  width: .5rem; height: .5rem; border-radius: 50%;
  background: #F44336;
}
.notif-content { flex: 1; min-width: 0; }
.notif-top { display: flex; justify-content: space-between; align-items: center; }
.notif-title {
  font-size: .875rem; font-weight: 600;
  color: var(--ep-color-text-default);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.notif-preview {
  font-size: .75rem; color: var(--ep-color-text-weakest);
  line-height: 1.4; margin-top: .25rem;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.notif-time {
  font-size: .6875rem; color: var(--ep-color-text-weakest);
  margin-top: .25rem; display: block;
}
.notif-arrow { color: var(--ep-color-text-weakest); flex-shrink: 0; margin-top: .25rem; }
</style>
