/**
 * Domain manager for domain switching and health checking.
 * Based on the original A73 service worker domain switching system.
 */

const DB_NAME = 'app_domain_store'
const DB_VERSION = 1
const STORE_NAME = 'kv'

const DOMAIN_CHECK_TIMEOUT = 5000
const MAX_RETRIES = 3

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getFromDb(key) {
  try {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(key)
      req.onsuccess = () => resolve(req.result?.value ?? null)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

async function setToDb(key, value) {
  try {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.put({ key, value, updatedAt: Date.now() })
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch { /* ignore */ }
}

async function removeFromDb(key) {
  try {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.delete(key)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch { /* ignore */ }
}

/**
 * Check if a domain is available by fetching it with a timeout.
 */
async function checkDomainAvailability(domain, timeout = DOMAIN_CHECK_TIMEOUT) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const url = domain.startsWith('http') ? domain : `https://${domain}`
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
      cache: 'no-store'
    })
    clearTimeout(timer)
    return true
  } catch {
    clearTimeout(timer)
    return false
  }
}

/**
 * Find the first available domain from a list.
 */
async function findAvailableDomain(domains, timeout = DOMAIN_CHECK_TIMEOUT) {
  for (const domain of domains) {
    const available = await checkDomainAvailability(domain, timeout)
    if (available) return domain
  }
  return null
}

/**
 * Fetch the domain list from the API.
 */
async function fetchDomainList(apiUrl) {
  try {
    const response = await fetch(`${apiUrl}/api/frontend/trpc/system.domainList`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })
    const data = await response.json()
    return data?.result?.data?.json?.domains || []
  } catch {
    return []
  }
}

/**
 * Save user credentials for domain switching persistence.
 */
async function saveCredentials(credentials) {
  await setToDb('user_credentials', {
    account: credentials.account,
    token: credentials.token,
    savedAt: Date.now()
  })
}

async function getCredentials() {
  return getFromDb('user_credentials')
}

async function clearCredentials() {
  return removeFromDb('user_credentials')
}

/**
 * Save the current active domain.
 */
async function saveActiveDomain(domain) {
  await setToDb('active_domain', domain)
  localStorage.setItem('active_domain', domain)
}

async function getActiveDomain() {
  return localStorage.getItem('active_domain') || await getFromDb('active_domain')
}

/**
 * Redirect to an available domain, preserving URL params.
 */
function redirectToDomain(domain) {
  const currentParams = new URLSearchParams(window.location.search)
  const url = domain.startsWith('http') ? domain : `https://${domain}`
  const target = new URL(url)
  currentParams.forEach((value, key) => target.searchParams.set(key, value))
  window.location.href = target.toString()
}

export {
  openDb,
  getFromDb,
  setToDb,
  removeFromDb,
  checkDomainAvailability,
  findAvailableDomain,
  fetchDomainList,
  saveCredentials,
  getCredentials,
  clearCredentials,
  saveActiveDomain,
  getActiveDomain,
  redirectToDomain
}
