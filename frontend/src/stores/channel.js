import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { trpcQuery } from '../utils/api'

export const useChannelStore = defineStore('channel', () => {
  const installStatus = ref('NotInstall')
  const copyUrlModalVisible = ref(false)
  const modalChecked = ref(undefined)
  const mainChannelInstallInfo = ref({})
  const channelConfig = ref(null)
  const promotionInfo = ref(null)
  const downloadTemplate = ref(null)
  const isShowCompulsoryModal = ref(false)
  const APKTaskPopupTime = ref('Home')
  const isShowForceModal = ref(false)
  const forceModalKey = ref(null)
  const forceModalCloseType = ref(2)

  const isTikTokAPI = computed(() => channelConfig.value?.pointType === 'TikTokAPI')
  const isTikTok = computed(() => channelConfig.value?.pointType === 'TikTok')
  const isFacebookAPI = computed(() => channelConfig.value?.pointType === 'FacebookAPI')
  const isAFAPI = computed(() => channelConfig.value?.pointType === 'AFAPI')

  function setInstallStatus(status) {
    installStatus.value = status
  }

  function setModalChecked(checked = false) {
    modalChecked.value = checked
  }

  async function requestChannelInfo(params) {
    try {
      const data = await trpcQuery('channel.info', params)
      if (data?.config) {
        let frontConfig = {}
        try {
          if (data.config.frontConfig) {
            frontConfig = JSON.parse(data.config.frontConfig)
          }
        } catch {}
        channelConfig.value = { ...data.config, ...frontConfig }

        const systemStore = _getSystemStore()
        if (systemStore?.isIOS) {
          promotionInfo.value = channelConfig.value?.ios
        } else {
          promotionInfo.value = channelConfig.value?.android
        }
      }
    } catch (e) {
      console.warn('[ChannelStore] requestChannelInfo failed:', e.message)
    }
  }

  async function fetchDownloadTemplate(params) {
    try {
      const data = await trpcQuery('domain.info', params, { cache: true, cacheTTL: 300000 })
      if (data?.info?.styleConfig) {
        const styleConfig = JSON.parse(data.info.styleConfig)
        downloadTemplate.value = {
          ...styleConfig,
          authentication: data.info.authentication,
          style: data.info.style,
          jumpDomainType: data.info.jumpDomainType,
          imitationAppType: data.info.imitationAppType,
          appScore: styleConfig?.appScore || 4.9,
          downloadCounts: styleConfig?.downloadCounts || '80M+',
          usersRating: styleConfig?.usersRating || '50000'
        }
      }
    } catch (e) {
      console.warn('[ChannelStore] fetchDownloadTemplate failed:', e.message)
    }
    return downloadTemplate.value
  }

  async function requestMainChannelInstallInfo() {
    try {
      const data = await trpcQuery('channel.mainInstallInfo')
      if (data) mainChannelInstallInfo.value = data
    } catch (e) {
      console.warn('[ChannelStore] requestMainChannelInstallInfo failed:', e.message)
    }
  }

  function setCompulsoryInstallTime(hours) {
    const expiry = Date.now() + hours * 60 * 60 * 1000
    try {
      localStorage.setItem('compulsoryInstallTime', String(expiry))
    } catch {}
  }

  async function getCompulsoryInstallTime(key = 'compulsoryInstallTime') {
    try {
      return Number(localStorage.getItem(key)) || 0
    } catch {
      return 0
    }
  }

  function setForceModalTime(key, time) {
    try {
      localStorage.setItem(key, String(time))
    } catch {}
  }

  function _getSystemStore() {
    try {
      const { useSystemStore } = require('./system')
      return useSystemStore()
    } catch {
      return null
    }
  }

  function reset() {
    channelConfig.value = null
    promotionInfo.value = null
    downloadTemplate.value = null
    isShowForceModal.value = false
    forceModalKey.value = null
  }

  return {
    installStatus, copyUrlModalVisible, modalChecked,
    mainChannelInstallInfo, channelConfig, promotionInfo, downloadTemplate,
    isShowCompulsoryModal, APKTaskPopupTime,
    isShowForceModal, forceModalKey, forceModalCloseType,
    isTikTokAPI, isTikTok, isFacebookAPI, isAFAPI,
    setInstallStatus, setModalChecked,
    requestChannelInfo, fetchDownloadTemplate, requestMainChannelInstallInfo,
    setCompulsoryInstallTime, getCompulsoryInstallTime, setForceModalTime,
    reset
  }
})
