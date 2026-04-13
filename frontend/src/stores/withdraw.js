import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiPost, apiGet, formatCurrency } from '../utils/api'

export const useWithdrawStore = defineStore('withdraw', () => {
  const tabIndex = ref(0)
  const withdrawTypes = ref([])
  const subTypes = ref([])
  const bankAccounts = ref([])
  const withdrawHistory = ref([])
  const withdrawInfo = ref(null)
  const loading = ref(false)
  const auditInfo = ref(null)

  const hasAccounts = computed(() => bankAccounts.value.length > 0)
  const minAmount = computed(() => withdrawInfo.value?.minAmount ?? 50)
  const maxAmount = computed(() => withdrawInfo.value?.maxAmount ?? 50000)
  const feeRate = computed(() => withdrawInfo.value?.feeRate ?? 0)
  const feeFixed = computed(() => withdrawInfo.value?.feeFixed ?? 0)
  const dailyLimit = computed(() => withdrawInfo.value?.dailyLimit ?? 3)
  const dailyUsed = computed(() => withdrawInfo.value?.dailyUsed ?? 0)
  const canWithdraw = computed(() => dailyUsed.value < dailyLimit.value)

  function calculateFee(amount) {
    if (feeRate.value > 0) return amount * feeRate.value
    return feeFixed.value
  }

  function getNetAmount(amount) {
    return Math.max(0, amount - calculateFee(amount))
  }

  async function fetchWithdrawInfo() {
    try {
      const data = await apiGet('/api/saque/info')
      if (data) withdrawInfo.value = data
    } catch (e) {
      console.error('Failed to fetch withdraw info:', e)
    }
  }

  async function fetchBankAccounts() {
    try {
      const data = await apiGet('/api/saque/accounts')
      if (data?.list) bankAccounts.value = data.list
    } catch (e) {
      console.error('Failed to fetch bank accounts:', e)
    }
  }

  async function submitWithdraw(payload) {
    loading.value = true
    try {
      const valor = Number(payload.valor ?? payload.amount ?? 0)
      if (!Number.isFinite(valor) || valor <= 0) {
        throw new Error('Valor inválido')
      }
      const body = {
        valor,
        metodo: payload.metodo || 'pix',
        nome: String(payload.nome || '').trim(),
        cpfId: String(payload.cpfId || '').trim()
      }
      const data = await apiPost('/api/saque', body)
      if (data?.error?.message) {
        throw new Error(data.error.message)
      }
      return data
    } catch (e) {
      console.error('Failed to submit withdraw:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchHistory(params = {}) {
    try {
      const data = await apiGet('/api/saque/history?' + new URLSearchParams(params))
      if (data?.list) withdrawHistory.value = data.list
      return data
    } catch (e) {
      console.error('Failed to fetch withdraw history:', e)
    }
  }

  async function bindBankAccount(payload) {
    try {
      const data = await apiPost('/api/saque/bind-account', payload)
      return data
    } catch (e) {
      console.error('Failed to bind bank account:', e)
      throw e
    }
  }

  function reset() {
    bankAccounts.value = []
    withdrawHistory.value = []
    withdrawInfo.value = null
    auditInfo.value = null
  }

  return {
    tabIndex, withdrawTypes, subTypes, bankAccounts, withdrawHistory,
    withdrawInfo, loading, auditInfo,
    hasAccounts, minAmount, maxAmount, feeRate, feeFixed, dailyLimit, dailyUsed, canWithdraw,
    calculateFee, getNetAmount,
    fetchWithdrawInfo, fetchBankAccounts, submitWithdraw, fetchHistory, bindBankAccount, reset
  }
})
