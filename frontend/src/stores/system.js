import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

let settingsVisibilityListenerAttached = false
import { trpcQuery } from '../utils/api'
import { detectOS, detectBrowser, detectDeviceType, detectPlatformType } from '../utils/platform'
import { PlatformType, BrowserType, OSType } from '../utils/constants'
import { isInAppBrowser } from '../utils/formatters'
import { getSkinDefinition } from '../utils/themeRegistry'

export const useSystemStore = defineStore('system', () => {
  const tenantInfo = ref(null)
  const channelInfo = ref(null)
  const domainInfo = ref(null)
  const settings = ref(null)
  const carouselList = ref([])
  const marqueeContent = ref([])
  const announcements = ref([])
  const initialized = ref(false)
  const themeConfig = ref(null)

  const os = ref(detectOS())
  const browser = ref(detectBrowser())
  const deviceType = ref(detectDeviceType())
  const deviceId = ref('')
  const deviceModel = ref('')
  const appInfo = ref(null)
  const modalType = ref('')
  const inAppBrowser = ref(false)

  const siteName = computed(() => tenantInfo.value?.siteName ?? 'A73')
  const tenantName = computed(() => tenantInfo.value?.name ?? siteName.value)
  const siteLogo = computed(() => tenantInfo.value?.siteLogo ?? '')
  /** Logo enviada pelo Admin (/api/upload/logo); se vazia, o header usa o texto A73.com */
  const brandingLogoUrl = computed(() => {
    const u = settings.value?.logo
    return typeof u === 'string' && u.trim() !== '' ? u.trim() : ''
  })
  const appIcon = computed(() => tenantInfo.value?.appIcon ?? '')
  const currency = computed(() => tenantInfo.value?.currencySymbol ?? 'R$')
  const currencySuffix = computed(() => tenantInfo.value?.currencySuffix ?? '')
  const region = computed(() => tenantInfo.value?.region ?? { currency: 'BRL', symbol: 'R$', language: 'pt-BR' })
  const languages = computed(() => tenantInfo.value?.appLanguage ?? ['pt-BR'])
  const defaultLanguage = computed(() => tenantInfo.value?.appDefaultLanguage ?? 'pt-BR')
  const skinBackground = computed(() => tenantInfo.value?.background ?? '')
  const tenantId = computed(() => tenantInfo.value?.id ?? null)
  const channelId = computed(() => channelInfo.value?.id ?? null)

  const isIOS = computed(() => os.value === OSType.IOS)
  const isAndroid = computed(() => os.value === OSType.ANDROID)
  const isPwa = computed(() => appInfo.value?.build === PlatformType.PWA)
  const isApk = computed(() => [PlatformType.APK, PlatformType.APK_RELEASE].includes(appInfo.value?.build))
  const isPC = computed(() => appInfo.value?.build === PlatformType.DESKTOP_OS)
  const isNative = computed(() => ['APKRelease', 'APK', 'iOSApp'].includes(appInfo.value?.build ?? ''))
  const isIOSH5 = computed(() => appInfo.value?.build === PlatformType.IOS_H5)
  const isAndroidH5 = computed(() => appInfo.value?.build === PlatformType.ANDROID_H5)
  const isIOSApp = computed(() => appInfo.value?.build === PlatformType.IOS_APP)

  const isPwaVisible = computed(() => {
    const chromeTypes = [BrowserType.CHROME, BrowserType.SAMSUNG_INTERNET]
    if (browser.value === BrowserType.MOBILE_SAFARI) return true
    if (isAndroidH5.value && chromeTypes.includes(browser.value)) return true
    if (isPC.value && ['Edge', 'Chrome'].includes(browser.value)) return true
    return false
  })

  function generateDeviceId() {
    let id = localStorage.getItem('x-device-id')
    if (!id) {
      id = 'web_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
      localStorage.setItem('x-device-id', id)
    }
    return id
  }

  function setAppInfo(route) {
    const currentOs = detectOS()
    const currentBrowser = detectBrowser()
    os.value = currentOs
    browser.value = currentBrowser

    const sdParam = route?.query?.sd
    if (sdParam && sdParam !== '2') {
      const platforms = ['iOSH5', 'AndroidH5', 'PWA', 'APK', 'iOSApp', 'iOSBookmark', 'APKRelease', 'DesktopOS']
      appInfo.value = { build: platforms[Number(sdParam)] || PlatformType.DESKTOP_OS, version: '', name: '', id: '' }
    } else {
      const isStandalone = ('standalone' in navigator && navigator.standalone) ||
        window.matchMedia('(display-mode: standalone)').matches
      if (isStandalone) {
        appInfo.value = { build: PlatformType.PWA, version: '', name: '', id: '' }
      } else if (currentOs === OSType.IOS) {
        appInfo.value = { build: PlatformType.IOS_H5, version: '', name: '', id: '' }
      } else if (currentOs === OSType.ANDROID) {
        appInfo.value = { build: PlatformType.ANDROID_H5, version: '', name: '', id: '' }
      } else {
        appInfo.value = { build: PlatformType.DESKTOP_OS, version: '', name: '', id: '' }
      }
    }
  }

  function setDeviceInfo() {
    deviceId.value = generateDeviceId()
    const ua = navigator.userAgent
    deviceModel.value = `web ${navigator.platform} ${os.value}`
  }

  function setModalType(type) {
    modalType.value = type
  }

  function checkInAppBrowser() {
    inAppBrowser.value = isInAppBrowser()
  }

  function setThemeConfig(tenantData) {
    const skinKey = tenantData?.skinTwoType || 'Layout1:AmberPurple'
    const skinDef = getSkinDefinition(skinKey)
    const homeType = tenantData?.homeType || skinDef.homeType || 'GameType'
    themeConfig.value = {
      ...skinDef,
      homeType,
      skinKey
    }
    /* data-theme: apenas App.vue (app-shell + documentElement) respeita override do utilizador */

    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.setAttribute('name', 'theme-color')
      document.head.appendChild(metaThemeColor)
    }
    metaThemeColor.setAttribute('content', skinDef.color || '#262346')
  }

  async function init() {
    if (initialized.value) return
    setDeviceInfo()
    checkInAppBrowser()
    try {
      const [tenant, channel, domain] = await Promise.allSettled([
        trpcQuery('tenant.info', null, { cache: true, cacheTTL: 300000 }),
        trpcQuery('channel.info', null, { cache: true, cacheTTL: 300000 }),
        trpcQuery('domain.info', null, { cache: true, cacheTTL: 300000 })
      ])
      if (tenant.status === 'fulfilled' && tenant.value) {
        tenantInfo.value = tenant.value
        setThemeConfig(tenant.value)
      }
      if (channel.status === 'fulfilled' && channel.value) channelInfo.value = channel.value
      if (domain.status === 'fulfilled' && domain.value) domainInfo.value = domain.value
    } catch (e) {
      console.warn('[SystemStore] init failed:', e.message)
    }
    try {
      await fetchSettings()
    } catch (e) {
      console.warn('[SystemStore] fetchSettings:', e?.message)
    } finally {
      initialized.value = true
      if (!settingsVisibilityListenerAttached && typeof document !== 'undefined') {
        settingsVisibilityListenerAttached = true
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) return
          fetchSettings()
        })
      }
    }
  }

  async function fetchCarousel() {
    try {
      const data = await trpcQuery('carousel.configList', null, { cache: true, cacheTTL: 120000 })
      if (Array.isArray(data)) carouselList.value = data
    } catch (e) {
      console.error('Failed to fetch carousel:', e)
    }
  }

  async function fetchMarquee() {
    try {
      const data = await trpcQuery('home.marquee', null, { cache: true, cacheTTL: 60000 })
      if (data?.content) marqueeContent.value = data.content
      else if (data?.list) marqueeContent.value = data.list
    } catch (e) {
      console.error('Failed to fetch marquee:', e)
    }
  }

  async function fetchAnnouncements() {
    try {
      const data = await trpcQuery('announcement.list', null, { cache: true, cacheTTL: 300000 })
      if (Array.isArray(data)) announcements.value = data
    } catch (e) {
      console.warn('[SystemStore] announcements fetch skipped:', e.message)
    }
  }

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      settings.value = data
    } catch (e) {
      console.error('Failed to fetch settings:', e)
    }
  }

  function getDomain() {
    const host = window.location.host
    return host.startsWith('www.') ? host.replace('www.', '') : host
  }

  function getFullDomain() {
    return window.location.host
  }

  function getLaunchUrl() {
    return `${window.location.protocol}//${window.location.host}/launch`
  }

  function isGrayDomain() {
    return window.location.hostname.includes('gray')
  }

  return {
    tenantInfo, channelInfo, domainInfo, settings, carouselList, marqueeContent, announcements, initialized,
    themeConfig,
    os, browser, deviceType, deviceId, deviceModel, appInfo, modalType, inAppBrowser,
    siteName, tenantName, siteLogo, brandingLogoUrl, appIcon, currency, currencySuffix, region, languages, defaultLanguage,
    skinBackground, tenantId, channelId,
    isIOS, isAndroid, isPwa, isApk, isPC, isNative, isIOSH5, isAndroidH5, isIOSApp, isPwaVisible,
    init, fetchCarousel, fetchMarquee, fetchAnnouncements, fetchSettings,
    setAppInfo, setDeviceInfo, setModalType, checkInAppBrowser, setThemeConfig,
    getDomain, getFullDomain, getLaunchUrl, isGrayDomain
  }
})
