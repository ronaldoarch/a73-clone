import localforage from 'localforage'

const store = localforage.createInstance({
  name: '35m',
  storeName: 'app_data',
  description: '35m App Storage'
})

export async function getItem(key) {
  try {
    return await store.getItem(key)
  } catch (e) {
    console.warn('[Storage] getItem error:', key, e.message)
    return null
  }
}

export async function setItem(key, value) {
  try {
    await store.setItem(key, value)
  } catch (e) {
    console.warn('[Storage] setItem error:', key, e.message)
  }
}

export async function removeItem(key) {
  try {
    await store.removeItem(key)
  } catch (e) {
    console.warn('[Storage] removeItem error:', key, e.message)
  }
}

export async function clearStorage() {
  try {
    await store.clear()
  } catch (e) {
    console.warn('[Storage] clear error:', e.message)
  }
}

export async function keys() {
  try {
    return await store.keys()
  } catch {
    return []
  }
}

export default store
