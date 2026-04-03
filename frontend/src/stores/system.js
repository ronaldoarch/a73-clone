import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { trpcQuery } from '../utils/api'

export const useSystemStore = defineStore('system', () => {
  const tenantInfo = ref(null)
  const channelInfo = ref(null)
  const domainInfo = ref(null)
  const settings = ref(null)
  const carouselList = ref([])
  const marqueeContent = ref([])
  const initialized = ref(false)

  const siteName = computed(() => tenantInfo.value?.siteName ?? 'A73')
  const siteLogo = computed(() => tenantInfo.value?.siteLogo ?? '')
  const appIcon = computed(() => tenantInfo.value?.appIcon ?? '')
  const currency = computed(() => tenantInfo.value?.currencySymbol ?? 'R$')
  const region = computed(() => tenantInfo.value?.region ?? { currency: 'BRL', symbol: 'R$', language: 'pt-BR' })
  const languages = computed(() => tenantInfo.value?.appLanguage ?? ['pt-BR'])
  const defaultLanguage = computed(() => tenantInfo.value?.appDefaultLanguage ?? 'pt-BR')
  const skinBackground = computed(() => tenantInfo.value?.background ?? '')

  async function init() {
    if (initialized.value) return
    try {
      const [tenant, channel, domain] = await Promise.allSettled([
        trpcQuery('tenant.info', null, { cache: true, cacheTTL: 300000 }),
        trpcQuery('channel.info', null, { cache: true, cacheTTL: 300000 }),
        trpcQuery('domain.info', null, { cache: true, cacheTTL: 300000 })
      ])
      if (tenant.status === 'fulfilled') tenantInfo.value = tenant.value
      if (channel.status === 'fulfilled') channelInfo.value = channel.value
      if (domain.status === 'fulfilled') domainInfo.value = domain.value
      initialized.value = true
    } catch (e) {
      console.error('System init failed:', e)
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

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      settings.value = data
    } catch (e) {
      console.error('Failed to fetch settings:', e)
    }
  }

  return {
    tenantInfo, channelInfo, domainInfo, settings, carouselList, marqueeContent, initialized,
    siteName, siteLogo, appIcon, currency, region, languages, defaultLanguage, skinBackground,
    init, fetchCarousel, fetchMarquee, fetchSettings
  }
})
