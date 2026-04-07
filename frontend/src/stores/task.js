import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { trpcQuery, trpcMutation } from '../utils/api'
import { useAuthStore } from './auth'
import { formatCurrency } from '../utils/formatters'

export const useTaskStore = defineStore('task', () => {
  const taskMap = ref(new Map())
  const rulesExplanationMap = ref({})
  const installApkTaskDetail = ref(null)

  const flatTaskList = computed(() => {
    if (!taskMap.value.size) return []
    return Array.from(taskMap.value.values()).flat()
  })

  const completedTheTaskList = computed(() => {
    if (!flatTaskList.value.length) return []
    return flatTaskList.value.filter(t =>
      t.rewardStatus === 'DISTRIBUTED' && t.awardInfo?.isClaimable
    )
  })

  const tasksInProgress = computed(() => {
    if (!flatTaskList.value.length) return []
    return flatTaskList.value.filter(t => t.rewardStatus !== 'RECEIVED')
  })

  async function updateTaskList(taskType) {
    const auth = useAuthStore()
    if (!await auth.checkUserHasLogin()) return

    try {
      const result = await trpcQuery('task.list', {
        page: 1, pageSize: 999, taskType,
        order: [{ type: 'desc', key: 'sort' }]
      })

      const { taskList = [], taskRules = {} } = result || {}
      if (!taskList.length) return

      let awardList = []
      try {
        awardList = await trpcQuery('task.award', {}) || []
      } catch {}

      taskList.forEach(task => {
        const minText = formatCurrency(task.rewardMin)
        const maxText = formatCurrency(task.rewardMax)
        task.rewardText = task.rewardType === 'Fixed' ? maxText : `${minText}~${maxText}`

        if (task.rewardStatus === 'DISTRIBUTED') {
          const award = awardList.find(a => a.taskId === task.id)
          if (award) {
            const now = new Date()
            task.awardInfo = {
              id: award.id,
              rewardAmount: award.rewardAmount,
              isExpired: now > new Date(award.expireTime),
              isClaimable: now > new Date(award.claimableTime)
            }
          }
        }
      })

      setTaskMap(taskType, taskList)
      if (taskRules) {
        const rules = { ...taskRules }
        if (rules.otherParam && typeof rules.otherParam === 'string') {
          try { rules.otherParam = JSON.parse(rules.otherParam) } catch { rules.otherParam = '' }
        }
        rulesExplanationMap.value[taskType] = rules
      }
    } catch (e) {
      console.warn('[TaskStore] updateTaskList error:', e.message)
    }
  }

  function setTaskMap(type, list) {
    if (type) {
      taskMap.value.set(type, list || [])
    } else {
      taskMap.value.clear()
    }
  }

  function getTaskListByType(type) {
    return taskMap.value.get(type) || []
  }

  function getInstallApkConfig() {
    return getTaskListByType('NewbieTask').find(t => t.taskTypeSub === 'NewbieTask:InstallAPK')
  }

  async function getInstallApkTaskDetail() {
    const auth = useAuthStore()
    if (!await auth.checkUserHasLogin()) return null

    const config = getInstallApkConfig()
    if (config) {
      try {
        installApkTaskDetail.value = await trpcQuery('task.details', { taskId: config.id })
      } catch {}
    }
    return installApkTaskDetail.value
  }

  async function checkShowRookieTaskModal() {
    const config = getInstallApkConfig()
    return !(!config || config.isCompleted)
  }

  async function claimTaskReward(awardId) {
    return trpcMutation('task.receive', { awardId })
  }

  async function batchClaimRewards(awardIds) {
    return trpcMutation('task.batchReceive', { awardIds })
  }

  return {
    taskMap, rulesExplanationMap, installApkTaskDetail,
    flatTaskList, completedTheTaskList, tasksInProgress,
    updateTaskList, setTaskMap, getTaskListByType,
    getInstallApkConfig, getInstallApkTaskDetail,
    checkShowRookieTaskModal, claimTaskReward, batchClaimRewards
  }
})
