/**
 * Settings da plataforma (logo, banner) - carregados do backend
 */
import { ref, onMounted } from 'vue'

const logoUrl = ref('/s5/app-icon/1222508/LOGO.jpg')
const bannerUrl = ref('/s5/1770954153806/9999.jpg')

export function useSettings() {
  async function load() {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data.logo) logoUrl.value = data.logo + (data.logo.includes('?') ? '' : '?t=' + Date.now())
      if (data.banner) bannerUrl.value = data.banner + (data.banner.includes('?') ? '' : '?t=' + Date.now())
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
