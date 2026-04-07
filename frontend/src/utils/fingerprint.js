/**
 * Fingerprint verification module.
 * Integrates with FingerprintJS Pro for device identification and anti-fraud.
 */

let fingerprintResult = null
let agentPromise = null
let isLoading = false

async function loadFingerprintAgent(apiKey) {
  try {
    const FingerprintJS = await import('@fingerprintjs/fingerprintjs-pro')
    return FingerprintJS.load({ apiKey })
  } catch (err) {
    console.error('[Fingerprint] Failed to load SDK:', err)
    return null
  }
}

/**
 * Initialize fingerprint with the given API key.
 * @param {string} apiKey - FingerprintJS Pro API key
 * @returns {Promise<{visitorId: string, requestId: string}>}
 */
export async function getFingerprint(apiKey) {
  if (fingerprintResult) return fingerprintResult

  if (isLoading) {
    await new Promise(resolve => {
      const check = setInterval(() => {
        if (!isLoading) {
          clearInterval(check)
          resolve()
        }
      }, 100)
    })
    return fingerprintResult || { visitorId: '', requestId: '' }
  }

  isLoading = true
  try {
    if (!apiKey) {
      console.warn('[Fingerprint] No API key provided')
      return { visitorId: '', requestId: '' }
    }

    if (!agentPromise) {
      agentPromise = loadFingerprintAgent(apiKey)
    }

    const agent = await agentPromise
    if (!agent) return { visitorId: '', requestId: '' }

    const result = await agent.get()
    fingerprintResult = {
      visitorId: result.visitorId || '',
      requestId: result.requestId || ''
    }

    return fingerprintResult
  } catch (err) {
    console.error('[Fingerprint] Failed to get fingerprint:', err)
    return { visitorId: '', requestId: '' }
  } finally {
    isLoading = false
  }
}

/**
 * Preload fingerprint in the background.
 */
export function preloadFingerprint(apiKey) {
  if (!fingerprintResult && !isLoading && apiKey) {
    getFingerprint(apiKey).catch(err => {
      console.warn('[Fingerprint] Preload failed:', err)
    })
  }
}

/**
 * Clear cached fingerprint result.
 */
export function clearFingerprint() {
  fingerprintResult = null
}
