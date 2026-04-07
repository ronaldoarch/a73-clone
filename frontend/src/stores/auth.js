import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const AccountStatus = Object.freeze({
  NORMAL: 'NORMAL',
  OFFLINE: 'OFFLINE',
  FROZEN: 'FROZEN'
})

export const LoginType = Object.freeze({
  Phone: 'Phone',
  Account: 'Account'
})

export const useAuthStore = defineStore('auth', () => {
  const token = ref(sessionStorage.getItem('token') || localStorage.getItem('token') || localStorage.getItem('auth_token') || '')
  const isLoggedIn = computed(() => !!token.value)
  const accountStatus = ref(AccountStatus.NORMAL)
  const locale = ref(localStorage.getItem('app-language') || 'pt-BR')
  const channelId = ref(localStorage.getItem('channelId') || '0')
  const parentId = ref(localStorage.getItem('parentId') || '')
  const rememberAccount = ref(localStorage.getItem('rememberAccount') !== 'false')
  const modalVisible = ref(false)
  const experienceGold = ref(0)
  const experienceGoldType = ref('')

  const loginType = ref(localStorage.getItem('loginType') || LoginType.Phone)
  const account = ref('')
  const password = ref('')
  const pwaBarVisible = ref(true)
  const pwaFooterVisible = ref(true)
  const drawerLoad = ref(false)
  const unStandalone = ref(false)
  const pwaLaunchAllow = ref(false)
  const languageModalVisible = ref(false)
  const operation = ref('login')
  const oldVerifyToken = ref('')
  const newVerifyToken = ref('')
  const sendedBindTimestamp = ref(0)
  const sendedVerifyTimestamp = ref(0)
  const appInfo = ref({})
  const announcementNotice = ref({})
  const isShowGuidePwa = ref(false)
  const isShowPwaBar = ref(false)
  const isShowPwaFooter = ref(false)
  const webPushRegId = ref('')
  const tokenDataMap = ref({})
  const startUrlSearchParams = ref(window.location.search)

  async function setToken(newToken) {
    if (_isValid(newToken)) {
      token.value = newToken
      sessionStorage.setItem('token', newToken)
      localStorage.setItem('token', newToken)
    } else {
      token.value = ''
      sessionStorage.removeItem('token')
      localStorage.removeItem('token')
    }
  }

  async function getToken(route) {
    if (!token.value) {
      token.value = sessionStorage.getItem('token') || localStorage.getItem('token') || ''
    }
    if (!token.value && route?.query?.token && _isValid(route.query.token)) {
      token.value = route.query.token
      sessionStorage.setItem('token', token.value)
    }
    return token.value
  }

  async function checkUserHasLogin() {
    return !!(await getToken())
  }

  async function removeToken() {
    tokenDataMap.value = {}
    localStorage.removeItem('xTag')
    localStorage.removeItem('xTagDatas')
    token.value = ''
    sessionStorage.removeItem('token')
    localStorage.removeItem('token')
  }

  function setAccountStatus(status) {
    accountStatus.value = status
  }

  function setExperienceGold(amount) {
    experienceGold.value = amount || 0
  }

  function setExperienceGoldType(type) {
    experienceGoldType.value = type || ''
  }

  function setRememberAccount(value) {
    rememberAccount.value = value
    localStorage.setItem('rememberAccount', String(value))
  }

  async function setAccount(username, pwd, force = true) {
    if ((!account.value || force) && _isValid(username)) {
      account.value = username
      localStorage.setItem('saved_account', btoa(encodeURIComponent(username)))
    }
    if ((!password.value || force) && _isValid(pwd)) {
      password.value = pwd
      localStorage.setItem('saved_password', btoa(encodeURIComponent(pwd)))
    }
    if (_isValid(username)) {
      loginType.value = /^\d+$/.test(username) ? LoginType.Phone : LoginType.Account
      localStorage.setItem('loginType', loginType.value)
    }
  }

  async function getAccount() {
    if (!account.value) {
      try {
        const saved = localStorage.getItem('saved_account')
        account.value = saved ? decodeURIComponent(atob(saved)) : ''
      } catch {
        account.value = ''
      }
    }
    return account.value
  }

  async function getPassword() {
    if (!password.value) {
      try {
        const saved = localStorage.getItem('saved_password')
        password.value = saved ? decodeURIComponent(atob(saved)) : ''
      } catch {
        password.value = ''
      }
    }
    return password.value
  }

  async function getLoginType() {
    if (!loginType.value) {
      loginType.value = localStorage.getItem('loginType') || LoginType.Phone
    }
    return loginType.value
  }

  function removeAccount() {
    account.value = ''
    password.value = ''
    loginType.value = ''
    localStorage.removeItem('saved_account')
    localStorage.removeItem('saved_password')
    localStorage.removeItem('loginType')
  }

  function setLocale(newLocale) {
    const supported = ['pt-BR', 'en-US', 'en-PH', 'id-ID', 'vi-VN', 'hi-IN', 'zh-CN']
    if (supported.includes(newLocale)) {
      locale.value = newLocale
    }
    localStorage.setItem('app-language', locale.value)
  }

  function getLocale() {
    if (!locale.value) {
      locale.value = localStorage.getItem('app-language') || 'pt-BR'
    }
    return locale.value
  }

  async function hasLocale() {
    return !!localStorage.getItem('app-language')
  }

  function setChannelId(id) {
    channelId.value = String(id || '')
    localStorage.setItem('channelId', channelId.value)
  }

  function setParentId(route) {
    if (route?.query?.pid) {
      parentId.value = String(route.query.pid)
      localStorage.setItem('parentId', parentId.value)
    }
  }

  async function getParentId() {
    if (!parentId.value) {
      parentId.value = localStorage.getItem('parentId') || ''
    }
    return Number(parentId.value) || 0
  }

  function setOldVerifyToken(t) {
    oldVerifyToken.value = t
    localStorage.setItem('oldVerifyToken', t)
  }

  async function getOldVerifyToken() {
    if (!oldVerifyToken.value) {
      oldVerifyToken.value = localStorage.getItem('oldVerifyToken') || ''
    }
    return oldVerifyToken.value
  }

  function setNewVerifyToken(t) {
    newVerifyToken.value = t
    localStorage.setItem('newVerifyToken', t)
  }

  async function getNewVerifyToken() {
    if (!newVerifyToken.value) {
      newVerifyToken.value = localStorage.getItem('newVerifyToken') || ''
    }
    return newVerifyToken.value
  }

  function setSendedVerifyTimestamp() {
    sendedVerifyTimestamp.value = Math.floor(Date.now() / 1000)
    localStorage.setItem('sendedVerifyTimestamp', String(sendedVerifyTimestamp.value))
  }

  async function getVerifyTimestampDiff() {
    if (!sendedVerifyTimestamp.value) {
      sendedVerifyTimestamp.value = Number(localStorage.getItem('sendedVerifyTimestamp')) || 0
    }
    return Math.floor(Date.now() / 1000) - sendedVerifyTimestamp.value
  }

  function setSendedBindTimestamp() {
    sendedBindTimestamp.value = Math.floor(Date.now() / 1000)
    localStorage.setItem('sendedBindTimestamp', String(sendedBindTimestamp.value))
  }

  async function getBindTimestampDiff() {
    if (!sendedBindTimestamp.value) {
      sendedBindTimestamp.value = Number(localStorage.getItem('sendedBindTimestamp')) || 0
    }
    return Math.floor(Date.now() / 1000) - sendedBindTimestamp.value
  }

  function setAppInfoData(data) {
    Object.assign(appInfo.value, data)
    try { localStorage.setItem('appInfo', JSON.stringify(data)) } catch {}
  }

  async function getAppInfo() {
    if (!Object.keys(appInfo.value).length) {
      try {
        appInfo.value = JSON.parse(localStorage.getItem('appInfo') || '{}')
      } catch {
        appInfo.value = {}
      }
    }
    return appInfo.value
  }

  function setAnnouncementNotice(data) { announcementNotice.value = data }
  function setUnStandalone(val) { unStandalone.value = val }
  function setDrawerLoad(val = false) { drawerLoad.value = val }
  function setLanguageModalVisible(val = false) { languageModalVisible.value = val }
  function setPwaLaunchAllow(val = false) { pwaLaunchAllow.value = val }
  function setPwaBarVisible(val) { pwaBarVisible.value = val }
  function setPwaFooterVisible(val) { pwaFooterVisible.value = val }

  function setWebPushRegId(id) {
    webPushRegId.value = id
    localStorage.setItem('webPushRegId', id)
  }

  function getWebPushRegId() {
    if (!webPushRegId.value) {
      webPushRegId.value = localStorage.getItem('webPushRegId') || ''
      if (!webPushRegId.value) {
        const params = new URLSearchParams(window.location.search)
        webPushRegId.value = params.get('webPushRegId') || ''
        if (webPushRegId.value) localStorage.setItem('webPushRegId', webPushRegId.value)
      }
    }
    return webPushRegId.value
  }

  function getLoginTypes() {
    return [LoginType.Phone, LoginType.Account]
  }

  function getRegisterTypes() {
    return [LoginType.Phone, LoginType.Account]
  }

  async function login(accountInput, passwordInput) {
    try {
      const res = await fetch('/api/frontend/trpc/user.login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Type': 'web',
          'Client-Language': locale.value || 'pt-BR'
        },
        body: JSON.stringify({ json: { account: accountInput, phone: accountInput, password: passwordInput } })
      })
      const data = await res.json()
      if (data?.error) {
        return { success: false, error: data.error.message || data.error.json?.message || 'Falha no login' }
      }
      const result = data?.result?.data?.json || data
      if (result?.token) {
        await setToken(result.token)
        localStorage.setItem('auth_token', result.token)
        await setAccount(accountInput, passwordInput)
        return { success: true, user: result.user }
      }
      return { success: false, error: 'Resposta inválida do servidor' }
    } catch (e) {
      return { success: false, error: e.message || 'Erro de conexão' }
    }
  }

  async function register(accountInput, passwordInput, confirmPasswordInput) {
    try {
      const parentIdVal = await getParentId()
      const res = await fetch('/api/frontend/trpc/user.register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Type': 'web',
          'Client-Language': locale.value || 'pt-BR'
        },
        body: JSON.stringify({
          json: {
            account: accountInput,
            phone: accountInput,
            password: passwordInput,
            confirmPassword: confirmPasswordInput,
            pid: parentIdVal ? String(parentIdVal) : undefined
          }
        })
      })
      const data = await res.json()
      if (data?.error) {
        return { success: false, error: data.error.message || data.error.json?.message || 'Falha no registro' }
      }
      const result = data?.result?.data?.json || data
      if (result?.token) {
        await setToken(result.token)
        localStorage.setItem('auth_token', result.token)
        await setAccount(accountInput, passwordInput)
        return { success: true, user: result.user }
      }
      return { success: false, error: 'Resposta inválida do servidor' }
    } catch (e) {
      return { success: false, error: e.message || 'Erro de conexão' }
    }
  }

  function logout() {
    removeToken()
    localStorage.removeItem('auth_token')
    accountStatus.value = AccountStatus.NORMAL
    experienceGold.value = 0
    experienceGoldType.value = ''
    tokenDataMap.value = {}
  }

  function _isValid(val) {
    return val !== undefined && val !== 'undefined' && val !== null && val !== ''
  }

  return {
    token, isLoggedIn, accountStatus, locale, channelId, parentId,
    rememberAccount, modalVisible, experienceGold, experienceGoldType,
    loginType, account, password,
    pwaBarVisible, pwaFooterVisible, drawerLoad, unStandalone, pwaLaunchAllow,
    languageModalVisible, operation, oldVerifyToken, newVerifyToken,
    sendedBindTimestamp, sendedVerifyTimestamp,
    appInfo, announcementNotice, isShowGuidePwa, isShowPwaBar, isShowPwaFooter,
    webPushRegId, tokenDataMap, startUrlSearchParams,
    setToken, getToken, checkUserHasLogin, removeToken,
    setAccountStatus, setExperienceGold, setExperienceGoldType,
    setRememberAccount, setAccount, getAccount, getPassword, getLoginType, removeAccount,
    setLocale, getLocale, hasLocale,
    setChannelId, setParentId, getParentId,
    setOldVerifyToken, getOldVerifyToken, setNewVerifyToken, getNewVerifyToken,
    setSendedVerifyTimestamp, getVerifyTimestampDiff,
    setSendedBindTimestamp, getBindTimestampDiff,
    setAppInfoData, getAppInfo,
    setAnnouncementNotice, setUnStandalone, setDrawerLoad,
    setLanguageModalVisible, setPwaLaunchAllow, setPwaBarVisible, setPwaFooterVisible,
    setWebPushRegId, getWebPushRegId,
    getLoginTypes, getRegisterTypes, login, register, logout
  }
})
