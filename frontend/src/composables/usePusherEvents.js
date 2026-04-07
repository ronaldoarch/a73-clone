import { onMounted, onUnmounted } from 'vue'
import { initPusher, disconnectPusher, PusherEvent } from '../utils/pusher'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/user'
import { useSystemStore } from '../stores/system'
import { useNotificationStore } from '../stores/notification'

export function usePusherEvents() {
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const systemStore = useSystemStore()
  const notifStore = useNotificationStore()

  function getHeaders() {
    const headers = { 'Content-Type': 'application/json' }
    if (authStore.token) headers['Authorization'] = `Bearer ${authStore.token}`
    const tenantId = localStorage.getItem('tenantId')
    if (tenantId) headers['TenantId'] = tenantId
    return headers
  }

  function handleEvent(eventName, data) {
    switch (eventName) {
      case PusherEvent.PAY_SUCCESS:
        userStore.fetchAssets()
        break
      case PusherEvent.WITHDRAW_SUCCESS:
        userStore.fetchAssets()
        break
      case PusherEvent.REWARD_SUCCESS:
        userStore.fetchAssets()
        notifStore.incrementUnread()
        break
      case PusherEvent.RECHARGE_ACTIVITY:
        userStore.fetchAssets()
        break
      case PusherEvent.BET_REFRESH:
        userStore.fetchAssets()
        break
      case PusherEvent.MANUAL_REWARD:
        userStore.fetchAssets()
        notifStore.incrementUnread()
        break
      case PusherEvent.NEWBIE_TASK:
        break
      default:
        console.debug('[Pusher] Unhandled event:', eventName, data)
    }
  }

  async function connect() {
    if (!authStore.isLoggedIn) return

    const tenantInfo = systemStore.tenantInfo || {}
    const pusherConfig = tenantInfo.pusherConfig || {}

    if (!pusherConfig.appKey) {
      console.debug('[Pusher] No app key configured, skipping')
      return
    }

    await initPusher(
      {
        apiUrl: '',
        appKey: pusherConfig.appKey,
        cluster: pusherConfig.cluster || 'mt1',
        tenantId: tenantInfo.tenantId || localStorage.getItem('tenantId')
      },
      getHeaders,
      handleEvent
    )
  }

  onMounted(() => connect())
  onUnmounted(() => disconnectPusher())

  return { connect, disconnect: disconnectPusher }
}
