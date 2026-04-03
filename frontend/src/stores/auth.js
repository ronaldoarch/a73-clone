import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth_token') || '')
  const user = ref(null)

  const isLoggedIn = computed(() => !!token.value)

  function setToken(t) {
    token.value = t
    if (t) {
      localStorage.setItem('auth_token', t)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  function setUser(u) {
    user.value = u
  }

  async function login(account, password) {
    const res = await fetch('/api/frontend/trpc/user.login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ json: { account, password, loginType: 'account' } })
    })
    const data = await res.json()
    const token = data?.result?.data?.json?.token
    if (token) {
      setToken(token)
      return { success: true }
    }
    return { success: false, error: data?.error?.message || 'Login failed' }
  }

  async function register(account, password, confirmPassword) {
    const res = await fetch('/api/frontend/trpc/user.register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ json: { account, password, confirmPassword, loginType: 'account' } })
    })
    const data = await res.json()
    const token = data?.result?.data?.json?.token
    if (token) {
      setToken(token)
      return { success: true }
    }
    return { success: false, error: data?.error?.message || 'Registration failed' }
  }

  function logout() {
    setToken('')
    setUser(null)
  }

  return { token, user, isLoggedIn, login, register, logout, setToken, setUser }
})
