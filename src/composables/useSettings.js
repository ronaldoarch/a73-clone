/**
 * Settings da plataforma (logo, banner, app) - carregados do backend
 */
import { ref, onMounted } from 'vue'
import { apiUrl } from '@/config/api'

const logoUrl = ref('/s5/app-icon/1222508/LOGO.jpg')
const bannerUrl = ref('/s5/1770954153806/9999.jpg')

export function useSettings() {
  async function load() {
    try {
      const res = await fetch(apiUrl('/api/settings'))
      const data = await res.json()
      const fix = (url) => url ? apiUrl(url) + (url.includes('?') ? '' : '?t=' + Date.now()) : url
      if (data.logo) logoUrl.value = fix(data.logo)
      if (data.banner) bannerUrl.value = fix(data.banner)
    } catch (e) {
      // mantém defaults
    }
  }

  onMounted(load)

  return {
    logoUrl,
    bannerUrl,
    load
  }
}
