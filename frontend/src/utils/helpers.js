/**
 * Deep clone any value (objects, arrays, Date, RegExp, Map, Set).
 */
export function deepClone(value) {
  if (value == null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(item => deepClone(item))
  if (value instanceof Date) return new Date(value)
  if (value instanceof RegExp) return new RegExp(value)
  if (value instanceof Map) {
    const map = new Map()
    for (const [k, v] of value) map.set(deepClone(k), deepClone(v))
    return map
  }
  if (value instanceof Set) {
    const set = new Set()
    for (const v of value) set.add(deepClone(v))
    return set
  }
  const result = {}
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      result[key] = deepClone(value[key])
    }
  }
  return result
}

/**
 * Deep equality comparison (supports Map, Set, Date, RegExp, nested objects/arrays).
 */
export function deepEqual(a, b, seen = new WeakMap()) {
  if (a === b) return true
  if (typeof a === 'number' && typeof b === 'number') {
    if (isNaN(a) && isNaN(b)) return true
    if (a === 0 && b === 0) return 1 / a === 1 / b
  }
  if (a == null || b == null || typeof a !== 'object' || typeof b !== 'object') return false
  if (seen.has(a)) return seen.get(a) === b
  seen.set(a, b)

  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  if (a instanceof RegExp && b instanceof RegExp) return a.source === b.source && a.flags === b.flags

  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false
    for (const [key, val] of a) {
      if (!b.has(key) || !deepEqual(val, b.get(key), seen)) return false
    }
    return true
  }

  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false
    const sortedA = Array.from(a).sort()
    const sortedB = Array.from(b).sort()
    return deepEqual(sortedA, sortedB, seen)
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, i) => deepEqual(item, b[i], seen))
  }

  if (Object.getPrototypeOf(a) === Object.prototype && Object.getPrototypeOf(b) === Object.prototype) {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    return keysA.every(key => deepEqual(a[key], b[key], seen))
  }

  return a === b
}

export function isEqual(a, b) {
  return deepEqual(a, b, new WeakMap())
}

/**
 * Deep merge two objects. Arrays in source override target arrays.
 */
export function deepMerge(target, source) {
  const result = { ...target }
  for (const key in source) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue
    const val = source[key]
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      result[key] = deepMerge(result[key] || {}, val)
    } else {
      result[key] = val
    }
  }
  return result
}

/**
 * Debounce a function call.
 */
export function debounce(fn, wait, options = {}) {
  let timeoutId, lastArgs, lastThis, lastCallTime, lastInvokeTime = 0, result
  const leading = !!options.leading
  const trailing = 'trailing' in options ? !!options.trailing : true
  const hasMaxWait = typeof options.maxWait !== 'undefined'
  const maxWait = hasMaxWait ? Math.max(Number(options.maxWait) || 0, wait) : undefined

  if (typeof fn !== 'function') throw new TypeError('Expected a function')

  function invokeFunc(time) {
    const args = lastArgs, thisArg = lastThis
    lastArgs = lastThis = undefined
    lastInvokeTime = time
    result = fn.apply(thisArg, args)
    return result
  }

  function startTimer(pendingFunc, waitMs) {
    return setTimeout(pendingFunc, waitMs)
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - (lastCallTime || 0)
    const timeSinceLastInvoke = time - lastInvokeTime
    return lastCallTime === undefined || timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 || (hasMaxWait && timeSinceLastInvoke >= maxWait)
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - (lastCallTime || 0)
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall
    return hasMaxWait ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting
  }

  function timerExpired() {
    const time = Date.now()
    if (shouldInvoke(time)) return trailingEdge(time)
    timeoutId = startTimer(timerExpired, remainingWait(time))
  }

  function leadingEdge(time) {
    lastInvokeTime = time
    timeoutId = startTimer(timerExpired, wait)
    return leading ? invokeFunc(time) : result
  }

  function trailingEdge(time) {
    timeoutId = undefined
    if (trailing && lastArgs) return invokeFunc(time)
    lastArgs = lastThis = undefined
    return result
  }

  function cancel() {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
    lastInvokeTime = 0
    lastArgs = lastCallTime = lastThis = timeoutId = undefined
  }

  function flush() {
    return timeoutId === undefined ? result : trailingEdge(Date.now())
  }

  function debounced(...args) {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)
    lastArgs = args
    lastThis = this
    lastCallTime = time
    if (isInvoking) {
      if (timeoutId === undefined) return leadingEdge(lastCallTime)
      if (hasMaxWait) {
        clearTimeout(timeoutId)
        timeoutId = startTimer(timerExpired, wait)
        return invokeFunc(lastCallTime)
      }
    }
    if (timeoutId === undefined) timeoutId = startTimer(timerExpired, wait)
    return result
  }

  debounced.cancel = cancel
  debounced.flush = flush
  return debounced
}

/**
 * Throttle a function (leading + trailing by default).
 */
export function throttle(fn, wait, options = {}) {
  const leading = options.leading !== undefined ? options.leading : true
  const trailing = options.trailing !== undefined ? options.trailing : true
  return debounce(fn, wait, { leading, maxWait: wait, trailing })
}

/**
 * Check if a value is empty (null, undefined, empty string, array, object, Map, Set).
 */
export function isEmpty(value) {
  if (value == null) return true
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0
  if (value instanceof Set || value instanceof Map) return value.size === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Pick specified keys from an object.
 */
export function pick(obj, ...keys) {
  if (!obj || typeof obj !== 'object') return {}
  const flatKeys = keys.flat()
  const result = {}
  for (const key of flatKeys) {
    if (key in obj) result[key] = obj[key]
  }
  return result
}

/**
 * Omit specified keys from an object.
 */
export function omit(obj, ...keys) {
  if (!obj || typeof obj !== 'object') return {}
  const result = { ...obj }
  const flatKeys = keys.flat()
  for (const key of flatKeys) delete result[key]
  return result
}

/**
 * Shuffle an array (Fisher-Yates).
 */
export function shuffle(arr) {
  if (!arr || !arr.length) return []
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Generate a random number (inclusive).
 */
export function random(min = 0, max = 1, floating = false) {
  if (arguments.length === 1 && typeof min !== 'boolean') {
    max = min
    min = 0
  }
  if (min > max) [min, max] = [max, min]
  if (floating || (Number.isFinite(min) && min % 1) || (Number.isFinite(max) && max % 1)) {
    return min + Math.random() * (max - min)
  }
  return Math.floor(min + Math.random() * (max - min + 1))
}

/**
 * Find the item with the maximum value (by key or function).
 */
export function maxBy(arr, iteratee) {
  if (!arr || !arr.length) return undefined
  let maxItem = arr[0], maxVal = -Infinity
  for (const item of arr) {
    const val = typeof iteratee === 'function' ? iteratee(item) : item[iteratee]
    if (val > maxVal || (val === maxVal && item > maxItem)) {
      maxVal = val
      maxItem = item
    }
  }
  return maxItem
}

/**
 * Calculate the mean of array values.
 */
export function mean(arr, iteratee = v => v) {
  if (!arr || !arr.length) return NaN
  const accessor = typeof iteratee === 'function' ? iteratee : item => item[iteratee]
  return arr.reduce((sum, item) => sum + (Number(accessor(item)) || 0), 0) / arr.length
}

/**
 * Concat arrays and/or values.
 */
export function concat(arr, ...values) {
  const result = arr ? [...arr] : []
  for (const val of values) {
    Array.isArray(val) ? result.push(...val) : result.push(val)
  }
  return result
}

/**
 * Capitalize the first letter.
 */
export function capitalize(str) {
  if (!str || typeof str !== 'string') return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convert string to camelCase.
 */
export function camelCase(str) {
  if (!str || typeof str !== 'string') return ''
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, ch) => ch.toUpperCase())
    .replace(/^[A-Z]/, ch => ch.toLowerCase())
}

/**
 * Convert newlines to <br> tags.
 */
export function nl2br(str) {
  return str ? str.replace(/\n/g, '<br>') : ''
}

export function isObject(val) {
  const type = typeof val
  return val != null && (type === 'object' || type === 'function')
}

export function isInteger(val) {
  return Number.isInteger(val)
}

export function isArray(val) {
  return Array.isArray(val)
}

export function isFunction(val) {
  return typeof val === 'function'
}

export function isDefined(val) {
  return typeof val !== 'undefined'
}

export function isUndefined(val) {
  return typeof val === 'undefined'
}

export function isNull(val) {
  return val === null
}

export function isNilOrEmpty(val) {
  return isUndefined(val) || isNull(val) || val === ''
}

/**
 * Async sleep/delay.
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Get object keys with proper typing.
 */
export function objectKeys(obj) {
  return Object.keys(obj)
}

/**
 * Mask a string showing only the last N characters.
 */
export function maskTail(value, visibleCount = 4, maskChar = '*') {
  const str = String(value)
  if (str.length <= visibleCount) return str
  return maskChar.repeat(str.length - visibleCount) + str.slice(-visibleCount)
}

/**
 * Mask middle of a string (e.g. 84**23).
 */
export function maskMiddle(value, options = {}) {
  const str = String(value)
  const { visibleDigits = 2, maskChar = '*', fixedMaskLength = 4 } = options
  if (!str || str.length <= 2 * visibleDigits) return str
  const start = str.slice(0, visibleDigits)
  const end = str.slice(-visibleDigits)
  const mask = maskChar.repeat(fixedMaskLength || str.length - 2 * visibleDigits)
  return `${start}${mask}${end}`
}

/**
 * Simple FNV-1a hash of a string.
 */
export function hashString(str) {
  if (!str || str.length === 0) return 'empty'
  const FNV_PRIME = 16777619
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = (hash * FNV_PRIME) >>> 0
  }
  hash = (hash ^ str.length) >>> 0
  return hash.toString(16).padStart(8, '0')
}

/**
 * Truncate a string to max length.
 */
export function truncate(str, maxLength = 128) {
  return str.length > maxLength ? str.slice(0, maxLength) : str
}

/**
 * Strip empty/null values from an object.
 */
export function stripEmpty(obj) {
  const result = {}
  for (const key in obj) {
    const val = obj[key]
    if (val != null && val !== '') result[key] = val
  }
  return result
}

/**
 * Poll a condition with timeout.
 */
const pendingPolls = {}
export async function pollUntil({ condition, timeout = 3000, uniqueKey }) {
  const poll = async () => {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      if (await condition()) return true
      await new Promise(r => setTimeout(r, 100))
    }
    return false
  }

  if (uniqueKey) {
    if (pendingPolls[uniqueKey]) return pendingPolls[uniqueKey]
    const promise = poll()
    pendingPolls[uniqueKey] = promise
    promise.finally(() => delete pendingPolls[uniqueKey])
    return promise
  }
  return poll()
}

/**
 * Mask the middle of a long string (e.g. PIX key).
 */
export function maskCenter(str, maskStr = '****') {
  if (!str || str.length <= 4) return str
  const len = str.length
  const padLen = Math.floor((len - 4) / 2)
  return str.slice(0, padLen) + maskStr + str.slice(padLen + 4)
}

/**
 * Extract only alphabetic characters from a string.
 */
export function extractAlpha(str) {
  return str.replace(/[^a-zA-Z]/g, '')
}

/**
 * Check if a string contains only digits.
 */
export function isDigitsOnly(str) {
  return /^\d+$/.test(str)
}
