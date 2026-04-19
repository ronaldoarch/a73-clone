import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { trpcQuery, trpcMutation, apiGet } from '../utils/api'

export const useAgentStore = defineStore('agent', () => {
  const config = ref(null)
  const shareConfig = ref([])
  const agentData = ref(null)
  const inviteLink = ref('')
  const loading = ref(false)

  const totalCommission = computed(() => {
    const c = Number(agentData.value?.histComm || 0) / 100
    return isNaN(c) ? 0 : c
  })
  const availableCommission = computed(() => {
    const c = Number(agentData.value?.commission || agentData.value?.unclaimedCommission || 0) / 100
    return isNaN(c) ? 0 : c
  })
  const weekCommission = computed(() => {
    const c = Number(agentData.value?.weekComm || 0) / 100
    return isNaN(c) ? 0 : c
  })
  const yesterdayCommission = computed(() => {
    const c = Number(agentData.value?.yesterdayComm || 0) / 100
    return isNaN(c) ? 0 : c
  })
  const totalSubordinates = computed(() => {
    return (agentData.value?.histDirectCnt || 0) + (agentData.value?.histTeamCnt || 0)
  })
  const directCount = computed(() => agentData.value?.histDirectCnt || 0)
  const teamCount = computed(() => agentData.value?.histTeamCnt || 0)
  const todayNewSubs = computed(() => {
    return (agentData.value?.dayDirectAdd || 0) + (agentData.value?.dayTeamAdd || 0)
  })
  const agentLevel = computed(() => {
    if (!agentData.value?.agencyLevel) return 1
    return agentData.value.agencyLevel
  })

  const agencyMode = computed(() => config.value?.agencyMode || 'normal')
  const isUnlimitedLevel = computed(() => agencyMode.value === 'unlimitedLevel')

  const directSubordinate = computed(() => ({
    memberCount: agentData.value?.dayDirectAdd || 0,
    rechargeCount: agentData.value?.dayDirectRechargeCnt || 0,
    rechargeAmount: fmtCents(agentData.value?.dayDirectRechargeAmt),
    firstRechargeCount: agentData.value?.dayDirectFirstRechargeCnt || 0
  }))

  const teamSubordinate = computed(() => ({
    memberCount: agentData.value?.dayTeamAdd || 0,
    rechargeCount: agentData.value?.dayTeamRechargeCnt || 0,
    rechargeAmount: fmtCents(agentData.value?.dayTeamRechargeAmt),
    firstRechargeCount: agentData.value?.dayTeamFirstRechargeCnt || 0
  }))

  function fmtCents(val) {
    const num = Number(val || 0) / 100
    return isNaN(num) ? 0 : num
  }

  function setAgentConfig(cfg) { config.value = cfg }
  function setShareConfig(configs) { shareConfig.value = configs || [] }
  function setAgentData(data) { agentData.value = data }

  async function fetchAgentInfo() {
    loading.value = true
    try {
      const [info, cfg] = await Promise.allSettled([
        trpcQuery('agent.myAgentInfo').catch(() => null),
        trpcQuery('agent.config').catch(() => null)
      ])
      if (info.status === 'fulfilled' && info.value) {
        agentData.value = info.value
      }
      if (cfg.status === 'fulfilled' && cfg.value) {
        config.value = cfg.value
      }
      await fetchInviteLink()
    } catch (e) {
      console.warn('[AgentStore] fetchAgentInfo failed:', e.message)
    } finally {
      loading.value = false
    }
  }

  async function fetchInviteLink() {
    try {
      const data = await trpcQuery('agent.shareUrl').catch(() => null)
      if (data?.shareUrl) inviteLink.value = data.shareUrl
      else if (data?.url) inviteLink.value = data.url
      else if (typeof data === 'string') inviteLink.value = data
      if (!inviteLink.value) {
        inviteLink.value = window.location.origin + '/?ref=' + (agentData.value?.userId || '')
      }
    } catch {
      inviteLink.value = window.location.origin + '/?ref='
    }
  }

  async function claimCommission() {
    try {
      const result = await trpcMutation('agent.claimCommission')
      return result
    } catch (e) {
      throw e
    }
  }

  async function fetchSubordinateList(params = {}) {
    try {
      return await trpcQuery('agent.subordinateList', params)
    } catch {
      return { list: [], count: 0 }
    }
  }

  async function fetchCommissionDetail(params = {}) {
    try {
      return await trpcQuery('agent.commissionDetail', params)
    } catch {
      return { list: [], myTotalCommission: 0 }
    }
  }

  function normalizeCommissionData(raw) {
    if (!raw) return null
    const c = v => Number(v || 0) / 100
    return {
      ...raw,
      unclaimedCommission: c(raw.unclaimedCommission),
      commission: c(raw.commission),
      claimedCommission: c(raw.claimedCommission),
      lastCommission: c(raw.lastCommission),
      teamAchievement: c(raw.teamAchievement),
      directAchievement: c(raw.directAchievement),
      dayCommission: c(raw.dayCommission)
    }
  }

  function emptyCommissionData() {
    return {
      parentId: 0, commission: 0, claimedCommission: 0, lastCommission: 0,
      teamCount: 0, directCount: 0, directAchievement: 0, teamAchievement: 0,
      dayCommission: 0, dayDirectAdd: 0, dayTeamAdd: 0, unclaimedCommission: 0
    }
  }

  function getShareableConfig() {
    return shareConfig.value.filter(c => c.isOpen)
  }

  return {
    config, shareConfig, agentData, inviteLink, loading,
    totalCommission, availableCommission, weekCommission, yesterdayCommission,
    totalSubordinates, directCount, teamCount, todayNewSubs, agentLevel,
    agencyMode, isUnlimitedLevel, directSubordinate, teamSubordinate,
    setAgentConfig, setShareConfig, setAgentData,
    fetchAgentInfo, fetchInviteLink, claimCommission,
    fetchSubordinateList, fetchCommissionDetail,
    normalizeCommissionData, emptyCommissionData, getShareableConfig
  }
})
