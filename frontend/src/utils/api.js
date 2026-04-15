import superjson from 'superjson'
import { v4 as uuidv4 } from 'uuid'
import { useAuthStore } from '../stores/auth'

const BASE_URL = '/api/frontend/trpc'
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

const requestCache = new Map()
const pendingRequests = new Map()

function generateDeviceId() {
  let id = localStorage.getItem('x-device-id')
  if (!id) {
    id = uuidv4()
    localStorage.setItem('x-device-id', id)
  }
  return id
}

function getHeaders() {
  const auth = useAuthStore()
  const headers = {
    'Content-Type': 'application/json',
    'X-Device-Type': 'web',
    'X-Device-Id': generateDeviceId(),
    'Client-Language': localStorage.getItem('app-language') || 'pt-BR'
  }
  if (auth.token) {
    headers['Authorization'] = `Bearer ${auth.token}`
  }
  const tenantId = localStorage.getItem('tenantId')
  if (tenantId) headers['TenantId'] = tenantId
  const channelId = localStorage.getItem('channelId')
  if (channelId) headers['ChannelId'] = channelId
  return headers
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function trpcQuery(procedure, input = null, options = {}) {
  const { cache = false, cacheTTL = 60000, retries = MAX_RETRIES } = options
  const cacheKey = cache ? `${procedure}:${JSON.stringify(input)}` : null

  if (cacheKey && requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey)
    if (Date.now() - cached.timestamp < cacheTTL) {
      return cached.data
    }
    requestCache.delete(cacheKey)
  }

  if (cacheKey && pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)
  }

  const promise = _executeQuery(procedure, input, retries)

  if (cacheKey) {
    pendingRequests.set(cacheKey, promise)
    promise.finally(() => pendingRequests.delete(cacheKey))
  }

  const result = await promise
  if (cacheKey && result) {
    requestCache.set(cacheKey, { data: result, timestamp: Date.now() })
  }
  return result
}

function deserializeResponse(data) {
  const json = data?.result?.data?.json
  const meta = data?.result?.data?.meta
  if (json && meta?.values) {
    try {
      return superjson.deserialize({ json, meta: meta.values })
    } catch {
      return json
    }
  }
  return json ?? data
}

async function _executeQuery(procedure, input, retriesLeft) {
  const serializedInput = input != null ? superjson.serialize(input) : null
  const url = serializedInput
    ? `${BASE_URL}/${procedure}?input=${encodeURIComponent(JSON.stringify({ json: serializedInput.json, meta: serializedInput.meta ? { values: serializedInput.meta } : undefined }))}`
    : `${BASE_URL}/${procedure}`

  for (let attempt = 0; attempt <= retriesLeft; attempt++) {
    try {
      const res = await fetch(url, { method: 'GET', headers: getHeaders() })
      const data = await res.json()
      if (data?.error) {
        throw new Error(data.error.json?.message || data.error.message || 'Query failed')
      }
      return deserializeResponse(data)
    } catch (err) {
      if (attempt < retriesLeft) {
        await sleep(RETRY_DELAY * Math.pow(2, attempt))
        continue
      }
      throw err
    }
  }
}

export async function trpcMutation(procedure, input, options = {}) {
  const { retries = MAX_RETRIES } = options
  const serialized = superjson.serialize(input)

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}/${procedure}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ json: serialized.json, meta: serialized.meta ? { values: serialized.meta } : undefined })
      })
      const data = await res.json()
      if (data?.error) {
        throw new Error(data.error.json?.message || data.error.message || 'Mutation failed')
      }
      return deserializeResponse(data)
    } catch (err) {
      if (attempt < retries) {
        await sleep(RETRY_DELAY * Math.pow(2, attempt))
        continue
      }
      throw err
    }
  }
}

export async function apiGet(path, options = {}) {
  const res = await fetch(path, { headers: getHeaders(), ...options })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function apiPost(path, body, options = {}) {
  const res = await fetch(path, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
    ...options
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (data?.error) {
    const msg = data.error.message || data.error.json?.message || 'Pedido rejeitado'
    throw new Error(msg)
  }
  return data
}

export function clearCache(pattern) {
  if (!pattern) {
    requestCache.clear()
    return
  }
  for (const key of requestCache.keys()) {
    if (key.startsWith(pattern)) requestCache.delete(key)
  }
}

export function formatCurrency(value, symbol = 'R$') {
  const num = Number(value) || 0
  return `${symbol} ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(date, format = 'short') {
  const d = new Date(date)
  if (format === 'short') {
    return d.toLocaleDateString('pt-BR')
  }
  if (format === 'full') {
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
  return d.toISOString()
}
