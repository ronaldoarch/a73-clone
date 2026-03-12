/**
 * Settings da plataforma (logo, banner, siteName, pageTitle, depositoMin, saqueMin, saqueMax, whatsappUrl) - carregados do backend
 */
import { ref, onMounted, watch } from 'vue'
import { apiUrl } from '@/config/api'

const logoUrl = ref('/s5/app-icon/1222508/LOGO.jpg')
const hasCustomLogo = ref(false)
const bannerUrl = ref('/s5/1770954153806/9999.jpg')
const loadingBannerUrl = ref('/s5/app-icon/1222508/LOGO.jpg')
const siteName = ref('A73.com')
const pageTitle = ref('A73')
const depositoMin = ref(10)
const saqueMin = ref(20)
const saqueMax = ref(40000)
const whatsappUrl = ref('')

export function useSettings() {
  async function load() {
    try {
      const res = await fetch(apiUrl('/api/settings'), { cache: 'no-store' })
      const data = await res.json()
      const fix = (url) => url ? apiUrl(url) + (url.includes('?') ? '' : '?t=' + Date.now()) : url
      hasCustomLogo.value = !!data.logo
      if (data.logo) logoUrl.value = fix(data.logo)
      if (data.banner) bannerUrl.value = fix(data.banner)
      if (data.loadingBanner) loadingBannerUrl.value = fix(data.loadingBanner)
      if (data.siteName) siteName.value = data.siteName
      if (data.pageTitle) pageTitle.value = data.pageTitle
      if (typeof data.depositoMin === 'number') depositoMin.value = data.depositoMin
      if (typeof data.saqueMin === 'number') saqueMin.value = data.saqueMin
      if (typeof data.saqueMax === 'number') saqueMax.value = data.saqueMax
      if (data.whatsappUrl) whatsappUrl.value = data.whatsappUrl
      if (typeof document !== 'undefined') document.title = pageTitle.value
    } catch (e) {
      // mantém defaults
    }
  }

  onMounted(load)

  watch(pageTitle, (v) => {
    if (typeof document !== 'undefined' && v) document.title = v
  })

  return {
    logoUrl,
    hasCustomLogo,
    bannerUrl,
    loadingBannerUrl,
    siteName,
    pageTitle,
    depositoMin,
    saqueMin,
    saqueMax,
    whatsappUrl,
    load
  }
}
