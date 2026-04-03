import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { trpcQuery, trpcMutation } from '../utils/api'

export const useActivityStore = defineStore('activity', () => {
  const activityList = ref([])
  const activityConfig = ref(null)
  const taskList = ref([])
  const taskRules = ref({})
  const claimHistory = ref([])
  const unclaimedRewards = ref([])
  const rebateInfo = ref(null)
  const loading = ref(false)

  const activeActivities = computed(() =>
    activityList.value.filter(a => a.status === 'ON')
  )

  const tabConfig = computed(() => {
    if (!activityConfig.value?.configList?.tabSort) return []
    return activityConfig.value.configList.tabSort
      .map(s => { try { return JSON.parse(s) } catch { return null } })
      .filter(Boolean)
      .sort((a, b) => (b.sort || 0) - (a.sort || 0))
  })

  async function fetchActivities() {
    loading.value = true
    try {
      const data = await trpcQuery('activity.listPublic', null, { cache: true, cacheTTL: 60000 })
      if (data?.list) activityList.value = data.list
    } catch (e) {
      console.error('Failed to fetch activities:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchActivityConfig() {
    try {
      const data = await trpcQuery('activity.config', null, { cache: true, cacheTTL: 120000 })
      if (data) activityConfig.value = data
    } catch (e) {
      console.error('Failed to fetch activity config:', e)
    }
  }

  async function fetchTasks() {
    try {
      const data = await trpcQuery('task.list', null, { cache: true, cacheTTL: 30000 })
      if (data?.taskList) taskList.value = data.taskList
      if (data?.taskRules) taskRules.value = data.taskRules
    } catch (e) {
      console.error('Failed to fetch tasks:', e)
    }
  }

  async function claimReward(activityId, type) {
    try {
      const data = await trpcMutation('activity.claim', { activityId, type })
      return data
    } catch (e) {
      console.error('Failed to claim reward:', e)
      throw e
    }
  }

  async function fetchUnclaimed() {
    try {
      const data = await trpcQuery('activity.unclaimed', null, { cache: true, cacheTTL: 30000 })
      if (data?.list) unclaimedRewards.value = data.list
    } catch (e) {
      console.error('Failed to fetch unclaimed:', e)
    }
  }

  async function fetchRebate() {
    try {
      const data = await trpcQuery('activity.rebate', null, { cache: true, cacheTTL: 60000 })
      if (data) rebateInfo.value = data
    } catch (e) {
      console.error('Failed to fetch rebate:', e)
    }
  }

  async function fetchClaimHistory(params = {}) {
    try {
      const data = await trpcQuery('activity.claimHistory', params)
      if (data?.list) claimHistory.value = data.list
      return data
    } catch (e) {
      console.error('Failed to fetch claim history:', e)
    }
  }

  return {
    activityList, activityConfig, taskList, taskRules, claimHistory,
    unclaimedRewards, rebateInfo, loading,
    activeActivities, tabConfig,
    fetchActivities, fetchActivityConfig, fetchTasks,
    claimReward, fetchUnclaimed, fetchRebate, fetchClaimHistory
  }
})
