import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { trpcQuery, trpcMutation } from '../utils/api'
import { centsToAmount, formatAmount, getMerchantCurrency } from '../utils/currency'

export function useActivityDetail(activityType) {
  const route = useRoute()
  const router = useRouter()
  const id = computed(() => route.params.id)

  const isLoaded = ref(false)
  const activityInfo = ref(null)
  const activityName = ref('')
  const activityRule = ref('')
  const rewardList = ref([])
  const merchantCy = computed(() => getMerchantCurrency())

  async function fetchDetail() {
    isLoaded.value = false
    try {
      const data = await trpcQuery('activity.detail', {
        id: Number(id.value),
        type: activityType
      })
      if (data) {
        activityInfo.value = data
        activityName.value = data.name || data.multilingual?.name || activityType
        activityRule.value = data.rule || data.description || ''
        if (data.rewardLevels) {
          rewardList.value = data.rewardLevels.map(level => ({
            ...level,
            conditionAmount: centsToAmount(level.conditionAmount),
            rewardAmount: centsToAmount(level.rewardAmount)
          }))
        }
        if (data.rewardList) {
          rewardList.value = data.rewardList
        }
      }
    } catch (e) {
      console.warn(`[useActivityDetail] Failed to fetch ${activityType}:`, e.message)
    } finally {
      isLoaded.value = true
    }
  }

  async function claimReward(extraParams = {}) {
    try {
      const result = await trpcMutation('activity.apply', {
        id: Number(id.value),
        applyInfo: {
          type: activityType,
          info: extraParams
        }
      })
      return result
    } catch (e) {
      console.warn('[useActivityDetail] Claim failed:', e.message)
      return null
    }
  }

  function goBack() {
    router.back()
  }

  function goToRecords() {
    router.push('/report/activity')
  }

  function goToDeposit() {
    router.push('/recharge/apply')
  }

  onMounted(() => {
    if (id.value) fetchDetail()
  })

  return {
    id,
    isLoaded,
    activityInfo,
    activityName,
    activityRule,
    rewardList,
    merchantCy,
    fetchDetail,
    claimReward,
    goBack,
    goToRecords,
    goToDeposit,
    formatAmount,
    centsToAmount
  }
}
