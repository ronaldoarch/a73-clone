import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useSystemStore } from '../stores/system'
import { useChannelStore } from '../stores/channel'
import { detectOS, detectBrowser, isMobile, isIOS, isAndroid, isPWA } from '../utils/platform'
import {
  setupBeforeInstallPrompt, triggerInstallPrompt,
  canShowInstallPrompt, isStandalone,
  showIosPwaGuide, showSafariGuide
} from '../utils/pwaInstallGuide'

export const InstallStatus = Object.freeze({
  NOT_INSTALLED: 'NotInstall',
  INSTALLING: 'Installing',
  INSTALLED: 'Installed'
})

const installStatus = ref(InstallStatus.NOT_INSTALLED)
const installType = ref('PWA')
const installProgress = ref(0)

export function usePwaInstall() {
  const authStore = useAuthStore()
  const systemStore = useSystemStore()
  const channelStore = useChannelStore()

  const os = detectOS()
  const browser = detectBrowser()
  const isMobileDev = isMobile()
  const isIOSDev = isIOS()
  const isAndroidDev = isAndroid()
  const isPWAApp = isPWA()
  const isInApp = _isInAppBrowser(browser)

  const isAppUser = computed(() => installStatus.value === InstallStatus.INSTALLED)

  const isShowPwaInfo = computed(() => {
    if (isPWAApp) return false
    const promo = channelStore.promotionInfo
    return !!promo?.downloadBtn && !isAppUser.value
  })

  const btnText = computed(() => {
    if (installStatus.value === InstallStatus.INSTALLED) return 'Abrir App'
    if (isPWAApp) return 'Instalado'
    return 'Instalar'
  })

  function init() {
    setupBeforeInstallPrompt()
    window.addEventListener('appinstalled', () => {
      installStatus.value = InstallStatus.INSTALLED
      installProgress.value = 1
    })
  }

  async function handleInstall() {
    if (isIOSDev) {
      return _handleIOSInstall()
    }
    return _handleAndroidInstall()
  }

  async function _handleAndroidInstall() {
    if (canShowInstallPrompt()) {
      const accepted = await triggerInstallPrompt()
      if (accepted) {
        installStatus.value = InstallStatus.INSTALLING
        installType.value = 'PWA'
        _startProgressSimulation()
        return true
      }
    }

    const promo = channelStore.promotionInfo
    if (promo?.installUrl) {
      installType.value = 'APK'
      installStatus.value = InstallStatus.INSTALLING
      _startProgressSimulation()

      const apkUrl = _ensureProtocol(promo.installUrl)
      window.location.href = apkUrl
      return true
    }

    return false
  }

  function _handleIOSInstall() {
    if (browser === 'Mobile Safari') {
      showIosPwaGuide()
      return true
    }

    showSafariGuide(window.location.href)
    return true
  }

  function handleLaunch() {
    if (isStandalone()) return

    if (isInApp) {
      _openInChrome()
      return
    }

    if (canShowInstallPrompt()) {
      triggerInstallPrompt()
    }
  }

  function _openInChrome() {
    const token = authStore.token
    const currentUrl = window.location.href

    if (isIOSDev) {
      let url = 'googlechromes://' + currentUrl.replace(/^https?:\/\//, '')
      if (token) url += (url.includes('?') ? '&' : '?') + 'token=' + token
      window.location.href = url
    } else {
      const protocol = window.location.protocol.replace(':', '')
      let path = currentUrl.replace(`${window.location.protocol}//`, '')
      if (token && !path.includes('token=')) {
        path += (path.includes('?') ? '&' : '?') + 'token=' + token
      }
      window.location.href = `intent://${path}#Intent;scheme=${protocol};package=com.android.chrome;end`
    }
  }

  function _startProgressSimulation() {
    const increment = installType.value === 'APK' ? 0.1 : 0.01
    const interval = installType.value === 'APK' ? 20 : 240

    const timer = setInterval(() => {
      if (installProgress.value >= 1) {
        installStatus.value = InstallStatus.INSTALLED
        clearInterval(timer)
        return
      }
      installProgress.value = Math.min(1, installProgress.value + increment)
    }, interval)
  }

  function _ensureProtocol(url) {
    if (url.includes('http://') || url.includes('https://')) return url
    return `https://${url}`
  }

  function _isInAppBrowser(b) {
    return ['Facebook', 'TikTok', 'Chrome WebView', 'Instagram'].includes(b)
  }

  async function checkDomainAvailability(domain) {
    try {
      const url = domain.startsWith('http') ? domain : `https://${domain}`
      const res = await fetch(`${url}/api/public/health`, {
        signal: AbortSignal.timeout(5000)
      })
      const data = await res.json()
      return data?.status === 'ok' || data?.ok ? domain : false
    } catch {
      return false
    }
  }

  async function buildLaunchUrl(baseUrl, params = {}) {
    const account = await authStore.getAccount()
    const password = await authStore.getPassword()
    const token = authStore.token

    const allParams = {
      ...params,
      token,
      acc: account,
      pass: password,
      sd: 2
    }

    const qs = new URLSearchParams()
    Object.entries(allParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
    })

    const search = qs.toString()
    return search ? `${baseUrl}?${search}` : baseUrl
  }

  return {
    installStatus, installType, installProgress,
    isAppUser, isShowPwaInfo, btnText,
    init, handleInstall, handleLaunch,
    checkDomainAvailability, buildLaunchUrl
  }
}
