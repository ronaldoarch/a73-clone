/**
 * WebSocket/Pusher integration for real-time events.
 * Handles user notifications, payment events, activity updates, etc.
 */

let pusherInstance = null

/**
 * Event types received via WebSocket.
 */
export const PusherEvent = Object.freeze({
  PAY_SUCCESS: 'user/pay-success',
  WITHDRAW_SUCCESS: 'user/withdraw-success',
  REWARD_SUCCESS: 'user/reward-success',
  RECHARGE_ACTIVITY: 'activity/recharge-activity',
  RECHARGE_AD_REPORT: 'user/recharge-ad-report',
  BET_REFRESH: 'betBy/refresh',
  MANUAL_REWARD: 'reward/manual-user-reward',
  NEWBIE_TASK: 'task/newbie_task'
})

/**
 * Initialize Pusher connection with auth headers.
 * @param {Object} config - { apiUrl, appKey, cluster }
 * @param {Function} getHeaders - Returns auth headers object
 * @param {Function} [onEvent] - Global event handler (eventName, data)
 */
export async function initPusher(config, getHeaders, onEvent) {
  if (typeof window === 'undefined') return null

  try {
    const Pusher = (await import('pusher-js')).default
    Pusher.logToConsole = false

    const { apiUrl, appKey, cluster, tenantId } = config

    pusherInstance = new Pusher(appKey, {
      cluster,
      channelAuthorization: {
        endpoint: `${apiUrl}/api/frontend/pusher/channel-auth`,
        transport: 'ajax',
        headersProvider: () => {
          const headers = getHeaders()
          return Object.fromEntries(
            Object.entries(headers).filter(([, v]) => v !== undefined)
          )
        }
      },
      userAuthentication: {
        transport: 'ajax',
        endpoint: `${apiUrl}/api/frontend/pusher/user-auth`,
        customHandler: async (params, callback) => {
          try {
            const headers = getHeaders()
            headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'

            const body = Object.entries(params)
              .map(([k, v]) => [k.replace(/([A-Z])/g, '_$1').toLowerCase(), v])
              .reduce((acc, [k, v]) => { acc.append(k, v); return acc }, new URLSearchParams())
              .toString()

            const cleanHeaders = Object.fromEntries(
              Object.entries(headers).filter(([, v]) => v !== undefined)
            )

            const response = await fetch(
              `${apiUrl}/api/frontend/pusher/user-auth`,
              { method: 'POST', headers: cleanHeaders, body }
            )
            const data = await response.json()

            if (response.status === 403) {
              callback(new Error('Auth failed'), null)
              return
            }
            callback(null, data)
          } catch (err) {
            callback(err, null)
          }
        }
      }
    })

    if (onEvent) {
      bindPusherEvents(pusherInstance, onEvent)
    }

    pusherInstance.signin()
    pusherInstance.subscribe(`private-${tenantId}`)

    return pusherInstance
  } catch (err) {
    console.error('[Pusher] Failed to initialize:', err)
    return null
  }
}

function bindPusherEvents(instance, onEvent) {
  Object.values(PusherEvent).forEach(eventName => {
    instance.bind(eventName, data => onEvent(eventName, data))
  })
}

/**
 * Disconnect current Pusher instance.
 */
export function disconnectPusher() {
  if (pusherInstance) {
    pusherInstance.disconnect()
    pusherInstance = null
  }
}

/**
 * Get the current Pusher instance.
 */
export function getPusherInstance() {
  return pusherInstance
}
