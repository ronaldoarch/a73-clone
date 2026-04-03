import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiPost, apiGet, trpcQuery } from '../utils/api'

export const useRechargeStore = defineStore('recharge', () => {
  const payMethods = ref([])
  const rechargeHistory = ref([])
  const currentOrder = ref(null)
  const loading = ref(false)
  const bonusBanner = ref(null)
  const activitySwitch = ref(true)

  const pixMethod = computed(() => payMethods.value.find(m => m.type === 'PIX' || m.id === 'pix'))
  const hasActiveOrder = computed(() => !!currentOrder.value && currentOrder.value.status === 'pending')

  async function fetchPayMethods() {
    try {
      const data = await trpcQuery('pay.list', null, { cache: true, cacheTTL: 120000 })
      if (data?.list) payMethods.value = data.list
      else if (Array.isArray(data)) payMethods.value = data
    } catch (e) {
      console.error('Failed to fetch pay methods:', e)
    }
  }

  async function createOrder(payload) {
    loading.value = true
    try {
      const data = await apiPost('/api/deposito', payload)
      if (data) currentOrder.value = data
      return data
    } catch (e) {
      console.error('Failed to create order:', e)
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
      console.error('Failed to create PIX order:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function checkOrderStatus(externalId) {
    try {
      const data = await apiGet(`/api/deposito/pix/status/${externalId}`)
      return data
    } catch (e) {
      console.error('Failed to check order status:', e)
    }
  }

  async function fetchHistory(params = {}) {
    try {
      const data = await apiGet('/api/user/relatorios?' + new URLSearchParams({ type: 'deposit', ...params }))
      if (data?.list) rechargeHistory.value = data.list
      return data
    } catch (e) {
      console.error('Failed to fetch recharge history:', e)
    }
  }

  function clearOrder() {
    currentOrder.value = null
  }

  function reset() {
    payMethods.value = []
    rechargeHistory.value = []
    currentOrder.value = null
  }

  return {
    payMethods, rechargeHistory, currentOrder, loading, bonusBanner, activitySwitch,
    pixMethod, hasActiveOrder,
    fetchPayMethods, createOrder, createPixOrder, checkOrderStatus, fetchHistory, clearOrder, reset
  }
})
