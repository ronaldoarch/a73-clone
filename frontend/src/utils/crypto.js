/**
 * Simple data encryption/decryption utilities.
 * Uses reversed Base64 encoding for obfuscation (matching the original platform).
 * Note: This is NOT cryptographically secure — it's for light obfuscation only.
 */

/**
 * Encrypt an object to a reversible string.
 * @param {*} data - Any JSON-serializable value
 * @returns {string|null} Encoded string, or null on failure
 */
export function encryptData(data) {
  try {
    if (data === null || data === undefined) return null
    const json = JSON.stringify(data)
    if (!json) return null
    return btoa(encodeURIComponent(json)).split('').reverse().join('')
  } catch (err) {
    console.error('[Crypto] Encrypt error:', err)
    return null
  }
}

/**
 * Decrypt a string back to the original object.
 * @param {string} encoded - The encoded string from encryptData
 * @returns {*} Decoded value, or null on failure
 */
export function decryptData(encoded) {
  if (!encoded || typeof encoded !== 'string') return null
  try {
    const reversed = encoded.split('').reverse().join('')
    const decoded = decodeURIComponent(atob(reversed))
    return JSON.parse(decoded)
  } catch (err) {
    console.error('[Crypto] Decrypt error:', err)
    return null
  }
}

/**
 * Parse URL query parameters.
 * @param {string} [search] - Query string (defaults to window.location.search)
 * @returns {Object} Key-value pairs
 */
export function parseQueryParams(search) {
  const qs = search || (typeof window !== 'undefined' ? window.location.search : '')
  const params = {}
  try {
    const urlParams = new URLSearchParams(qs)
    urlParams.forEach((value, key) => { params[key] = value })
  } catch {
    const regex = /[?&]([^=#]+)=([^&#]*)/g
    let match
    while ((match = regex.exec(qs))) {
      params[decodeURIComponent(match[1])] = decodeURIComponent(match[2])
    }
  }
  return params
}

/**
 * Get a single query parameter value.
 * @param {string} key - Parameter name
 * @param {string} [fallback] - Default value
 * @returns {string|null}
 */
export function getQueryParam(key, fallback = null) {
  return parseQueryParams()[key] || fallback
}

/**
 * Build query string from an object (filtering out empty values).
 */
export function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })
  return searchParams.toString()
}
