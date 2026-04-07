/**
 * API client utilities: request caching, deduplication, retry logic, and error handling.
 * Extracted from the original tRPC client configuration.
 */

const CACHE_TTL_MS = 60 * 1000
const DEDUP_WINDOW_MS = 1000
const CLEANUP_INTERVAL_MS = 30 * 1000
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 350
const REQUEST_THROTTLE_MS = 300

const cache = new Map()
const inflight = new Map()
let cleanupTimer = null

function buildCacheKey(path, input) {
  try {
    return `${path}:${JSON.stringify(input)}`
  } catch {
    return `${path}:${Math.random()}`
  }
}

/**
 * Clean expired cache entries.
 */
function cleanupCache(ttl = CACHE_TTL_MS) {
  const now = Date.now()
  for (const [key, entry] of cache.entries()) {
    const age = now - entry.timestamp
    if (age > ttl || age < 0) {
      cache.delete(key)
    }
  }
}

/**
 * Start periodic cache cleanup.
 */
export function startCacheCleanup() {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => cleanupCache(), CLEANUP_INTERVAL_MS)

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', stopCacheCleanup)
  }
}

/**
 * Stop periodic cache cleanup.
 */
export function stopCacheCleanup() {
  if (cleanupTimer) {
    clearInterval(cleanupTimer)
    cleanupTimer = null
  }
}

/**
 * Fetch with automatic retry on x-retry header.
 */
export async function fetchWithRetry(url, options, attempt = 0) {
  const response = await fetch(url, options)
  const shouldRetry = response.headers.get('x-retry') === 'true'

  if (shouldRetry && attempt < MAX_RETRIES) {
    await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
    return fetchWithRetry(url, options, attempt + 1)
  }

  return response
}

/**
 * Cache-aware request wrapper with deduplication.
 * @param {string} path - API path
 * @param {*} input - Request input/params
 * @param {Function} fetcher - The actual fetch function `(path, input) => Promise<data>`
 * @returns {Promise<*>}
 */
export async function cachedRequest(path, input, fetcher) {
  const key = buildCacheKey(path, input)
  const now = Date.now()

  const cached = cache.get(key)
  if (cached) {
    const age = now - cached.timestamp
    if (age >= 0 && age < DEDUP_WINDOW_MS) {
      return cached.data
    }
  }

  const existing = inflight.get(key)
  if (existing) {
    return existing.promise
  }

  let resolve, reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })
  inflight.set(key, { promise, resolve, reject })

  try {
    const data = await fetcher(path, input)
    cache.set(key, { data, timestamp: now })
    resolve(data)
    return data
  } catch (err) {
    reject(err)
    throw err
  } finally {
    inflight.delete(key)
  }
}

/**
 * Clear the entire request cache.
 */
export function clearCache() {
  cache.clear()
  inflight.clear()
}

/**
 * Generate a random trace ID for request tracking.
 */
export function generateTraceId(length = 8) {
  const chars = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let id = ''
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id
}

/**
 * Build request headers for the API.
 */
export function buildApiHeaders({
  token, tenantId, channelId, traceId, deviceType,
  deviceId, locale, authTag, tokenData, userId,
  clientVersion, isGray, fingerprintHeaders, turnstileHeaders
} = {}) {
  const headers = {
    Authorization: token ? `Bearer ${token}` : undefined,
    tenantId,
    channelId,
    'X-Trace-ID': traceId || generateTraceId(),
    'X-Device-Type': deviceType || 'unKnown',
    'X-Device-Id': deviceId || 'unKnown',
    'Client-Language': locale,
    'X-Tag': authTag?.tag,
    'X-Auth-Tag': authTag?.authTag,
    'x-token-data': authTag?.tokenData || tokenData,
    userId,
    'X-Client-Version': clientVersion,
    ...(isGray ? { 'X-Gray': 'true' } : {}),
    ...fingerprintHeaders,
    ...turnstileHeaders
  }

  return Object.fromEntries(
    Object.entries(headers).filter(([, v]) => v !== undefined)
  )
}

/**
 * HTTP error codes that require special handling.
 */
export const HttpErrorAction = Object.freeze({
  RATE_LIMITED: 429,
  CONCURRENCY_LIMIT: 412,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  METHOD_NOT_ALLOWED: 405
})

/**
 * Parse API error response to extract code and message.
 */
export function parseApiError(error) {
  try {
    const status = error?.meta?.response?.status
    let body = null

    if (error.message) {
      try {
        body = JSON.parse(error.message)
      } catch {
        body = { message: error.message }
      }
    }

    return { status, body, code: body?.code, message: body?.message }
  } catch {
    return { status: null, body: null, code: null, message: String(error) }
  }
}

startCacheCleanup()
