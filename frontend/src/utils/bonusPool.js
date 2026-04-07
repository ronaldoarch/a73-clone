import { ref } from 'vue'
import { trpcQuery } from './api'

export function useBonusPool(options = {}) {
  const money = ref(0)
  const isActive = ref(true)

  const POLL_INTERVAL = 60 * 1000
  const RETRY_DELAY = 60 * 1000

  let pollTimer = null
  let animFrame = null

  function animateTo(target) {
    cancelAnimationFrame(animFrame)
    const start = money.value
    const diff = target - start
    const duration = 120
    let step = 0

    const tick = () => {
      step++
      money.value = start + (diff * step / duration)
      if (step < duration) {
        animFrame = requestAnimationFrame(tick)
      }
    }
    requestAnimationFrame(tick)
  }

  async function fetchPool() {
    try {
      const data = await trpcQuery('system.bonusPool', null)
      if (!data?.length) {
        scheduleRetry()
        return
      }

      const sorted = data.sort((a, b) => a.time - b.time)
      const now = Date.now()
      const future = sorted.filter(item => item.time * 1000 > now)

      for (const item of future) {
        await new Promise(resolve => {
          setTimeout(() => {
            animateTo(item.prizePoolValue)
            resolve()
          }, 3000)
        })
      }

      scheduleRetry()
    } catch {
      scheduleRetry()
    }
  }

  function scheduleRetry() {
    if (!isActive.value) return
    pollTimer = setTimeout(fetchPool, POLL_INTERVAL)
  }

  function start() {
    isActive.value = true
    fetchPool()
  }

  function stop() {
    isActive.value = false
    if (pollTimer) clearTimeout(pollTimer)
    cancelAnimationFrame(animFrame)
  }

  function pause() {
    isActive.value = false
    cancelAnimationFrame(animFrame)
  }

  function resume() {
    isActive.value = true
    fetchPool()
  }

  return { money, start, stop, pause, resume }
}
