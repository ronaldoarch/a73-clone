import { ref } from 'vue'

const announcementPopupStatus = ref(0)
const rechargeBonusPopupStatus = ref(0)
const newUserExclusivePopup = ref(0)
const pageType = ref(0)

export function useAnnouncementFlow() {
  return {
    announcementPopupStatus,
    rechargeBonusPopupStatus,
    newUserExclusivePopup,
    pageType,
    setNewUserExclusivePopup(val) { newUserExclusivePopup.value = val }
  }
}

export function getUserHomeTop(type, homeTopList) {
  if (!homeTopList || !Array.isArray(homeTopList)) return {}
  return homeTopList.find(item => item?.type === type) || {}
}

export async function checkAnnouncementFlow(router, authStore, systemStore) {
  const currentPath = router.currentRoute?.value?.path
  if (currentPath !== '/main/inicio') return false
  if (announcementPopupStatus.value !== 0) return false

  try {
    const announcements = systemStore.announcementList || []
    if (!announcements.length) return false
    announcementPopupStatus.value = 1
    return true
  } catch {
    return false
  }
}

export async function checkRechargeBonusFlow(authStore, channelStore) {
  if (!authStore.isLoggedIn) return true
  if (rechargeBonusPopupStatus.value !== 0) return true

  try {
    const compulsoryTime = await channelStore.getCompulsoryInstallTime('rechargeBonus')
    if (compulsoryTime > Date.now()) return true
  } catch {}

  return false
}

export async function checkNewUserExclusiveFlow(authStore) {
  if (!authStore.isLoggedIn) return true
  if (newUserExclusivePopup.value !== 0) return true
  return false
}

export async function runModalDismissFlow(type, router, authStore, systemStore, channelStore) {
  if (type === 'announcement') {
    const result = await checkAnnouncementFlow(router, authStore, systemStore)
    if (result) return
  }

  const checks = new Map([
    ['newUserExclusive', () => checkNewUserExclusiveFlow(authStore)],
    ['RechargeBonus', () => checkRechargeBonusFlow(authStore, channelStore)]
  ])

  for (const [key, check] of checks) {
    const isHidden = await check()
    if (!isHidden) {
      return { type: key, isHideModal: false }
    }
  }
}

export async function healthCheck(domain) {
  try {
    const url = domain.startsWith('http') ? domain : `https://${domain}`
    const res = await fetch(`${url}/api/public/health`, { signal: AbortSignal.timeout(5000) })
    const data = await res.json()
    return (data?.status === 'ok' || data?.ok) ? domain : false
  } catch {
    return false
  }
}

export function buildLaunchUrl(baseUrl, params = {}) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.set(key, String(val))
    }
  })
  const qs = searchParams.toString()
  return qs ? `${baseUrl}?${qs}` : baseUrl
}

export function isStandalone() {
  return ('standalone' in navigator && navigator.standalone) ||
    window.matchMedia('(display-mode: standalone)').matches
}

export function isInsideIframe() {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
}

export function postToParent(type, params) {
  if (isInsideIframe()) {
    window.parent.postMessage({ type, params }, '*')
  }
}
