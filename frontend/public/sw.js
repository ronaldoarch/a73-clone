const CACHE_NAME = 'a73-cache-v1'
const OFFLINE_URL = '/offline.html'

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html'
]

const API_CACHE_DURATION = 5 * 60 * 1000
const STATIC_CACHE_DURATION = 24 * 60 * 60 * 1000

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  )
})

function isApiRequest(url) {
  return url.pathname.startsWith('/api/')
}

function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(url.pathname)
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  if (event.request.method !== 'GET') return

  if (isApiRequest(url)) {
    event.respondWith(networkFirst(event.request))
    return
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request))
    return
  }

  event.respondWith(networkFirst(event.request))
})

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    if (request.destination === 'document') {
      return caches.match(OFFLINE_URL)
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

// Domain switching support
const DB_NAME = 'app_domain_store'
const DB_VERSION = 1
const STORE_NAME = 'kv'

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function getKey(key) {
  try {
    const db = await openDb()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(key)
      req.onsuccess = () => resolve(req.result?.value ?? null)
      req.onerror = () => resolve(null)
    })
  } catch { return null }
}

async function setKey(key, value) {
  try {
    const db = await openDb()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put({ key, value, updatedAt: Date.now() })
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
    })
  } catch { /* ignore */ }
}

async function checkDomain(domain) {
  try {
    const url = domain.startsWith('http') ? domain : `https://${domain}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal })
    clearTimeout(timer)
    return true
  } catch {
    return false
  }
}

self.addEventListener('message', async (event) => {
  const { type, data } = event.data || {}

  switch (type) {
    case 'SAVE_CREDENTIALS':
      await setKey('user_credentials', data)
      break
    case 'CLEAR_CREDENTIALS':
      await setKey('user_credentials', null)
      break
    case 'GET_CREDENTIALS': {
      const creds = await getKey('user_credentials')
      event.source?.postMessage({ type: 'CREDENTIALS', data: creds })
      break
    }
    case 'SAVE_DOMAIN':
      await setKey('active_domain', data)
      break
    case 'CHECK_DOMAIN': {
      const available = await checkDomain(data)
      event.source?.postMessage({ type: 'DOMAIN_STATUS', data: { domain: data, available } })
      break
    }
    case 'FIND_DOMAIN': {
      const domains = data || []
      for (const domain of domains) {
        if (await checkDomain(domain)) {
          event.source?.postMessage({ type: 'AVAILABLE_DOMAIN', data: domain })
          return
        }
      }
      event.source?.postMessage({ type: 'AVAILABLE_DOMAIN', data: null })
      break
    }
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
  }
})

// Push notifications (MTpush/Engagelab compatible)
self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data?.json() || {}
  } catch {
    payload = { title: 'Notificação', body: event.data?.text() || '' }
  }

  const title = payload.title || 'A73'
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/assets/icon-192.png',
    badge: payload.badge || '/assets/badge-72.png',
    data: payload.data || {},
    tag: payload.tag || 'default',
    vibrate: [200, 100, 200],
    actions: payload.actions || []
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const data = event.notification.data || {}
  const url = data.url || data.link || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            client.postMessage({ type: 'NOTIFICATION_CLICK', data })
            return client.focus()
          }
        }
        return self.clients.openWindow(url)
      })
  )
})
