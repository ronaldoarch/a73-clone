import Cookies from 'universal-cookie'

const cookies = new Cookies()

export function getCookie(name) {
  return cookies.get(name)
}

export function setCookie(name, value, options = {}) {
  cookies.set(name, value, {
    path: '/',
    sameSite: 'lax',
    ...options
  })
}

export function removeCookie(name, options = {}) {
  cookies.remove(name, { path: '/', ...options })
}

export function getAllCookies() {
  return cookies.getAll()
}

export function useCookies() {
  return {
    get: getCookie,
    set: setCookie,
    remove: removeCookie,
    getAll: getAllCookies
  }
}
