let pollingWorker = null
let pollingInterval = null

export function initVersionPolling(options = {}) {
  const {
    versionUrl = '/version.json',
    interval = 5 * 60 * 1000,
    applicationKey = '__APP_VERSION_KEY__',
    onVersionUpdate
  } = options

  if (typeof Worker !== 'undefined') {
    try {
      return _initWithWorker({ versionUrl, applicationKey, interval, onVersionUpdate })
    } catch {
      return _initWithInterval({ versionUrl, applicationKey, interval, onVersionUpdate })
    }
  }
  return _initWithInterval({ versionUrl, applicationKey, interval, onVersionUpdate })
}

function _initWithWorker({ versionUrl, applicationKey, interval, onVersionUpdate }) {
  const workerCode = `
    self.onmessage = async function(e) {
      const { versionUrl, applicationKey, isFirstTime } = e.data;
      try {
        const url = new URL(versionUrl, self.location.origin).href;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        const { version } = data;
        if (version) {
          self.postMessage({ version, applicationKey, isFirstTime });
        }
      } catch (err) {
        // silently fail
      }
    };
  `
  const blob = new Blob([workerCode], { type: 'application/javascript' })
  pollingWorker = new Worker(URL.createObjectURL(blob))

  pollingWorker.onmessage = (e) => {
    const { version, applicationKey: key, isFirstTime } = e.data
    const stored = localStorage.getItem(key)
    localStorage.setItem(key, version)
    if (stored && version !== stored && !isFirstTime) {
      onVersionUpdate?.(version)
    }
  }

  pollingWorker.postMessage({ versionUrl, applicationKey, isFirstTime: true })

  const check = () => {
    if (document.visibilityState === 'visible') {
      pollingWorker.postMessage({ versionUrl, applicationKey })
    }
  }

  pollingInterval = setInterval(check, interval)
  document.addEventListener('visibilitychange', check)

  return {
    stop() {
      if (pollingInterval) clearInterval(pollingInterval)
      document.removeEventListener('visibilitychange', check)
      pollingWorker?.terminate()
    }
  }
}

function _initWithInterval({ versionUrl, applicationKey, interval, onVersionUpdate }) {
  let isFirstTime = true

  async function check() {
    if (document.visibilityState !== 'visible' && !isFirstTime) return
    try {
      const res = await fetch(versionUrl)
      if (!res.ok) return
      const data = await res.json()
      const { version } = data
      if (!version) return

      const stored = localStorage.getItem(applicationKey)
      localStorage.setItem(applicationKey, version)

      if (stored && version !== stored && !isFirstTime) {
        onVersionUpdate?.(version)
      }
      isFirstTime = false
    } catch {}
  }

  check()
  pollingInterval = setInterval(check, interval)
  document.addEventListener('visibilitychange', check)

  return {
    stop() {
      if (pollingInterval) clearInterval(pollingInterval)
      document.removeEventListener('visibilitychange', check)
    }
  }
}

export function stopVersionPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
  if (pollingWorker) {
    pollingWorker.terminate()
    pollingWorker = null
  }
}
