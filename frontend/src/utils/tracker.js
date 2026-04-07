/**
 * Ad/attribution tracker detection.
 * Identifies the user's acquisition source (Facebook, TikTok, Kwai, etc.)
 * for server-side attribution on registration.
 */

function getCookies() {
  const cookies = new Map()
  document.cookie.split(';').forEach(c => {
    const [k, v] = c.trim().split('=')
    if (k) cookies.set(k, v || '')
  })
  return cookies
}

/**
 * Detect the current ad tracker source.
 * Returns tracker info to send with registration/login requests.
 * @returns {Object|null} Tracker data with `type` field, or null if none detected
 */
export function detectTracker() {
  const cookies = getCookies()
  const params = new URLSearchParams(window.location.search)

  const fbc = cookies.get('_fbc') || params.get('fbc')
  const fbp = cookies.get('_fbp') || params.get('fbp')
  if (window.fbPixelId && fbc && fbp) {
    return { type: 'fb', fbc, fbp, pixel_id: window.fbPixelId }
  }

  const ttp = cookies.get('_ttp') || params.get('ttp')
  if (window.ttPixelId && ttp) {
    const ttclid = params.get('ttclid') || window.ttclid
    return { type: 'tiktok', ttp, ttclid: ttclid || '', pixel_id: window.ttPixelId }
  }

  if (window.kwaiId) {
    const kwaiClickId = params.get('kwai_click_id') || window.kwai_click_id
    const clickId = params.get('click_id') || window.click_id
    return { type: 'kwai', kwai_click_id: kwaiClickId || clickId || '' }
  }

  if (window.okspPixelId) {
    const pixelClickId = params.get('pixel_click_id')
    if (pixelClickId) return { type: 'oks', pixel_click_id: pixelClickId }
  }

  if (window.afId) {
    return { type: 'af', appsflyer_id: window.afId }
  }

  if (window.bgPixel) {
    const bbg = params.get('bbg') || window.bbg || cookies.get('_bge_bbg')
    const ci = params.get('ci') || window.ci || cookies.get('_bge_ci')
    if (bbg) return { type: 'bigo', bbg, ci }
  }

  if (window.operaPixelId || window.operaCvid) {
    const opcid = params.get('opcid')
    if (opcid) return { type: 'opera', opcid }
  }

  if (window.megoDataSetId && window.megoSignKey) {
    return { type: 'mego', dataSetId: window.megoDataSetId, signKey: window.megoSignKey }
  }

  if (window.pePixelId) {
    const clickId = params.get('pixel_click_id')
    if (clickId) return { type: 'pemedia', click_id: clickId, pixel_id: window.pePixelId }
  }

  if (window.device_id) {
    let adid = window.adid
    if (!adid && window.jsBridge?.getadid) {
      try { adid = window.jsBridge.getadid() } catch {}
    }
    return { type: 'ad', device_id: window.device_id, adid }
  }

  return null
}

/**
 * Persist tracker-related URL params and globals to localStorage on registration.
 */
export function persistTrackerParams() {
  const keys = [
    'kwaiId', 'fbPixelId', 'ttPixelId', 'ch', 'sdmode', 'bgPixel',
    'gtagId', 'test', 'tt_test_id', 'ttclid', 'afId', 'mgSkyPixelId',
    'okspPixelId', 'device_id', 'adid', 'bbg', 'ci'
  ]
  const params = new URLSearchParams(window.location.search)
  keys.forEach(key => {
    const value = params.get(key) || window[key]
    if (value) localStorage.setItem(key, value)
  })
}

/**
 * Restore persisted tracker params from localStorage to window globals.
 */
export function restoreTrackerParams() {
  const keys = [
    'kwaiId', 'fbPixelId', 'ttPixelId', 'bgPixel', 'gtagId',
    'afId', 'mgSkyPixelId', 'okspPixelId', 'device_id', 'adid'
  ]
  keys.forEach(key => {
    const val = localStorage.getItem(key)
    if (val && !window[key]) window[key] = val
  })
}
