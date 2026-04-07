import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { trpcQuery, trpcMutation, apiPost, apiGet } from '../utils/api'

export const useRechargeStore = defineStore('recharge', () => {
  const typeId = ref(0)
  const subTypeId = ref(0)
  const rechargeMode = ref('ConfigCycle')
  const channelLoading = ref(false)
  const channelId = ref(0)
  const channelList = ref([])
  const bankList = ref([])
  const channelMap = ref(new Map())
  const bankMap = ref(new Map())
  const bankCode = ref('')
  const isOpenOrderModal = ref(false)
  const thirdUrl = ref('')
  const orderNo = ref('')
  const isQRCode = ref(false)
  const isFromActivity = ref(false)

  const payMethods = ref([])
  const rechargeHistory = ref([])
  const currentOrder = ref(null)
  const loading = ref(false)
  const bonusBanner = ref(null)
  const activitySwitch = ref(true)

  const QRCodeInfo = ref({
    orderNo: '',
    QRCode: '',
    expireTime: 0,
    createTime: '',
    amount: ''
  })

  const transferConfig = ref({
    showTransferName: 'OFF',
    showTransferVoucher: 'OFF',
    transferNameRequired: 'OFF',
    transferOrderRequired: 'OFF'
  })

  const orderInfo = ref({
    amount: '',
    qrCodeUrl: '',
    transferAccount: '',
    transferCompany: '',
    transferRealName: '',
    transferVoucher: '',
    orderNo: '',
    expireTime: 0,
    createTime: '',
    voucher: '',
    payTypeName: '',
    isTransfer: false,
    status: '',
    payerRealName: '',
    payerName: ''
  })

  const pixMethod = computed(() => payMethods.value.find(m => m.type === 'PIX' || m.id === 'pix'))
  const hasActiveOrder = computed(() => !!currentOrder.value && currentOrder.value.status === 'pending')
  const isNoCycle = computed(() => rechargeMode.value === 'NoCycle')

  function setRechargeConfig(config) {
    if (config.rechargeMode) rechargeMode.value = config.rechargeMode
    const tc = {
      showTransferName: config.showTransferName || 'OFF',
      showTransferVoucher: config.showTransferVoucher || 'OFF',
      transferNameRequired: config.transferNameRequired || 'OFF',
      transferOrderRequired: config.transferOrderRequired || 'OFF'
    }
    transferConfig.value = tc
    try {
      sessionStorage.setItem('transferConfig', JSON.stringify(tc))
    } catch {}
  }

  async function fetchPayMethods() {
    try {
      const data = await trpcQuery('pay.list', null, { cache: true, cacheTTL: 120000 })
      if (data?.tenantPayTypeList) {
        const filtered = data.tenantPayTypeList
          .filter(t => t.payTypeSubList?.length > 0)
          .sort((a, b) => (b.sort || 0) - (a.sort || 0))
        payMethods.value = filtered
        setRechargeConfig(data)
      } else if (data?.list) {
        payMethods.value = data.list
      } else if (Array.isArray(data)) {
        payMethods.value = data
      }
      return data
    } catch (e) {
      console.warn('[RechargeStore] fetchPayMethods failed:', e.message)
    }
  }

  async function fetchChannelList(params) {
    channelLoading.value = true
    try {
      const data = await trpcQuery('pay.channelList', params)
      if (data) channelList.value = Array.isArray(data) ? data : []
      return data
    } catch (e) {
      console.warn('[RechargeStore] fetchChannelList failed:', e.message)
    } finally {
      channelLoading.value = false
    }
  }

  async function createOrder(payload) {
    loading.value = true
    try {
      const data = await trpcMutation('pay.create', payload)
      if (data) {
        currentOrder.value = data
        if (data.orderNo) orderNo.value = data.orderNo
        if (data.qrCodeUrl) {
          QRCodeInfo.value = {
            orderNo: data.orderNo || '',
            QRCode: data.qrCodeUrl || '',
            expireTime: data.expireTime || 0,
            createTime: data.createTime || '',
            amount: data.amount || ''
          }
          isQRCode.value = true
        }
        if (data.thirdUrl) thirdUrl.value = data.thirdUrl
      }
      return data
    } catch (e) {
      console.warn('[RechargeStore] createOrder failed:', e.message)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createPixOrder(amount) {
    loading.value = true
    try {
      const data = await apiPost('/api/deposito/pix', { amount })
      if (data) currentOrder.value = data
      return data
    } catch (e) {
      console.warn('[RechargeStore] createPixOrder failed:', e.message)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function payAgain(params) {
    try {
      return await trpcMutation('pay.payAgain', params)
    } catch (e) {
      console.warn('[RechargeStore] payAgain failed:', e.message)
    }
  }

  async function payConfirm(params) {
    try {
      return await trpcMutation('pay.payConfirm', params)
    } catch (e) {
      console.warn('[RechargeStore] payConfirm failed:', e.message)
    }
  }

  async function updateVoucher(params) {
    try {
      return await trpcMutation('pay.updateVoucher', params)
    } catch (e) {
      console.warn('[RechargeStore] updateVoucher failed:', e.message)
    }
  }

  async function checkOrderStatus(externalId) {
    try {
      return await apiGet(`/api/deposito/pix/status/${externalId}`)
    } catch (e) {
      console.warn('[RechargeStore] checkOrderStatus failed:', e.message)
    }
  }

  async function fetchHistory(params = {}) {
    try {
      const data = await trpcQuery('pay.recordList', params)
      if (data?.list) rechargeHistory.value = data.list
      else if (Array.isArray(data)) rechargeHistory.value = data
      return data
    } catch (e) {
      console.warn('[RechargeStore] fetchHistory failed:', e.message)
    }
  }

  function setTypeId(id) { typeId.value = id }
  function setSubTypeId(id) { subTypeId.value = id }
  function setChannelId(id) { channelId.value = id }
  function setBankCode(code) { bankCode.value = code }

  function clearOrder() {
    currentOrder.value = null
    isQRCode.value = false
    thirdUrl.value = ''
    orderNo.value = ''
  }

  function reset() {
    payMethods.value = []
    rechargeHistory.value = []
    currentOrder.value = null
    channelList.value = []
    bankList.value = []
    typeId.value = 0
    subTypeId.value = 0
    channelId.value = 0
    isFromActivity.value = false
  }

  return {
    typeId, subTypeId, rechargeMode, channelLoading, channelId,
    channelList, bankList, channelMap, bankMap, bankCode,
    isOpenOrderModal, thirdUrl, orderNo, isQRCode, isFromActivity,
    payMethods, rechargeHistory, currentOrder, loading, bonusBanner, activitySwitch,
    QRCodeInfo, transferConfig, orderInfo,
    pixMethod, hasActiveOrder, isNoCycle,
    setRechargeConfig,
    fetchPayMethods, fetchChannelList, createOrder, createPixOrder,
    payAgain, payConfirm, updateVoucher,
    checkOrderStatus, fetchHistory,
    setTypeId, setSubTypeId, setChannelId, setBankCode,
    clearOrder, reset
  }
})
