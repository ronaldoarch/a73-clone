import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { trpcQuery, trpcMutation } from '../utils/api'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const announcements = ref([])
  const supportMessages = ref([])
  const loading = ref(false)

  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length +
      supportMessages.value.filter(m => !m.read).length
  })

  const unreadNotifications = computed(() => notifications.value.filter(n => !n.read).length)
  const unreadSupport = computed(() => supportMessages.value.filter(m => !m.read).length)

  async function fetchNotifications() {
    loading.value = true
    try {
      const data = await trpcQuery('notification.list', null, { cache: true, cacheTTL: 30000 })
      if (data?.list) notifications.value = data.list
    } catch (e) {
      console.error('Failed to fetch notifications:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchAnnouncements() {
    try {
      const data = await trpcQuery('announcement.list', null, { cache: true, cacheTTL: 60000 })
      if (data?.list) announcements.value = data.list
    } catch (e) {
      console.error('Failed to fetch announcements:', e)
    }
  }

  async function fetchSupport() {
    try {
      const data = await trpcQuery('support.list', null, { cache: true, cacheTTL: 30000 })
      if (data?.list) supportMessages.value = data.list
    } catch (e) {
      console.error('Failed to fetch support messages:', e)
    }
  }

  async function markAllRead() {
    try {
      await trpcMutation('notification.markAllRead', {})
      notifications.value = notifications.value.map(n => ({ ...n, read: true }))
    } catch (e) {
      console.error('Failed to mark all read:', e)
    }
  }

  async function markRead(id) {
    try {
      await trpcMutation('notification.markRead', { id })
      const n = notifications.value.find(n => n.id === id)
      if (n) n.read = true
    } catch (e) {
      console.error('Failed to mark read:', e)
    }
  }

  function reset() {
    notifications.value = []
    announcements.value = []
    supportMessages.value = []
  }

  return {
    notifications, announcements, supportMessages, loading,
    unreadCount, unreadNotifications, unreadSupport,
    fetchNotifications, fetchAnnouncements, fetchSupport,
    markAllRead, markRead, reset
  }
})
