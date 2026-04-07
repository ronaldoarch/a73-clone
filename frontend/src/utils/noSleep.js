import NoSleep from 'nosleep.js'

let noSleepInstance = null

function getInstance() {
  if (!noSleepInstance) {
    noSleepInstance = new NoSleep()
  }
  return noSleepInstance
}

export function enableNoSleep() {
  try {
    getInstance().enable()
  } catch (e) {
    console.warn('[NoSleep] Failed to enable:', e.message)
  }
}

export function disableNoSleep() {
  try {
    getInstance().disable()
  } catch (e) {
    console.warn('[NoSleep] Failed to disable:', e.message)
  }
}

export function useNoSleep() {
  return {
    enable: enableNoSleep,
    disable: disableNoSleep,
    get isEnabled() {
      return noSleepInstance?.isEnabled ?? false
    }
  }
}
