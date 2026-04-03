import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiGet, apiPost, trpcQuery } from '../utils/api'

export const useAgentStore = defineStore('agent', () => {
  const agentInfo = ref(null)
  const subordinates = ref([])
  const commissionHistory = ref([])
  const inviteLink = ref('')
  const leaderBoard = ref([])
  const agentLevels = ref([])
  const commissionRates = ref([])
  const loading = ref(false)

  const totalCommission = computed(() => agentInfo.value?.totalCommission ?? 0)
  const availableCommission = computed(() => agentInfo.value?.availableCommission ?? 0)
  const totalSubordinates = computed(() => agentInfo.value?.totalSubordinates ?? 0)
  const todayNewSubs = computed(() => agentInfo.value?.todayNewSubordinates ?? 0)

  async function fetchAgentInfo() {
    loading.value = true
    try {
      const data = await apiGet('/api/afiliado')
      if (data) {
        agentInfo.value = data
        if (data.inviteLink) inviteLink.value = data.inviteLink
        else inviteLink.value = window.location.origin + '/register?ref=' + (data.inviteCode || '')
      }
    } catch (e) {
      console.error('Failed to fetch agent info:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchSubordinates(params = {}) {
    try {
      const data = await trpcQuery('agent.subordinates', params)
      if (data?.list) subordinates.value = data.list
      return data
    } catch (e) {
      console.error('Failed to fetch subordinates:', e)
    }
  }

  async function fetchCommissionHistory(params = {}) {
    try {
      const data = await trpcQuery('agent.commissionDetail', params)
      if (data?.list) commissionHistory.value = data.list
      return data
    } catch (e) {
      console.error('Failed to fetch commission history:', e)
    }
  }

  async function claimCommission() {
    try {
      const data = await apiPost('/api/afiliado/receber-comissao', {})
      return data
    } catch (e) {
      console.error('Failed to claim commission:', e)
      throw e
    }
  }

  async function fetchLeaderBoard(period = 'daily') {
    try {
      const data = await trpcQuery('agent.leaderBoard', { period })
      if (data?.list) leaderBoard.value = data.list
      return data
    } catch (e) {
      console.error('Failed to fetch leader board:', e)
    }
  }

  async function fetchPid() {
    try {
      const data = await apiGet('/api/afiliado/pid')
      return data
    } catch (e) {
      console.error('Failed to fetch pid:', e)
    }
  }

  function reset() {
    agentInfo.value = null
    subordinates.value = []
    commissionHistory.value = []
    inviteLink.value = ''
  }

  return {
    agentInfo, subordinates, commissionHistory, inviteLink, leaderBoard,
    agentLevels, commissionRates, loading,
    totalCommission, availableCommission, totalSubordinates, todayNewSubs,
    fetchAgentInfo, fetchSubordinates, fetchCommissionHistory,
    claimCommission, fetchLeaderBoard, fetchPid, reset
  }
})
