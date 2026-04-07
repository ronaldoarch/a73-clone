import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { trpcQuery, trpcMutation } from '../utils/api'
import { centsToAmount, formatAmount, getMerchantCurrency } from '../utils/currency'

export function useRecharge() {
  const route = useRoute()
  const router = useRouter()
  const id = computed(() => route.params.id)
  const merchantCy = computed(() => getMerchantCurrency())

  const isLoaded = ref(false)
  const activityName = ref('')
  const activityRule = ref('')

  const activityInfo = reactive({
    name: '',
    awardType: '',
    awardCount: 0,
    description: '',
    mainMediaShare: false
  })

  const rewardList = ref([])
  const isMultiple = ref(false)
  const multipleRechargeConfig = ref([])
  const isAutoReceive = ref(false)
  const isSumRecharge = ref(false)
  const sumRechargeAmount = ref('0')

  const isDisabled = computed(() => {
    if (isMultiple.value) return totalReceive.value === 0
    return !activityInfo.awardCount
  })

  const descriptionList = computed(() => {
    return activityInfo.description ? activityInfo.description.split('\n') : []
  })

  const totalReceive = computed(() => {
    return rewardData.value?.reduce((sum, item) => {
      if (item.canReceive) sum += item.reward
      return sum
    }, 0) || 0
  })

  const rewardData = computed(() => {
    if (!isMultiple.value || !multipleRechargeConfig.value.length) return []
    return multipleRechargeConfig.value.map(config => ({
      ...config,
      canReceive: false,
      reward: 0,
      done: false
    }))
  })

  async function fetchDetail() {
    isLoaded.value = false
    try {
      const data = await trpcQuery('activity.detail', {
        id: Number(id.value),
        type: 'Recharge'
      })
      if (!data) return

      activityInfo.awardType = data.awardType || ''
      activityInfo.awardCount = centsToAmount(data.awardCount)
      activityInfo.mainMediaShare = data.config?.mainMediaShare === 'ON'
      isMultiple.value = data.config?.type === 'MULTIPLE'
      multipleRechargeConfig.value = data.config?.multipleRechargeConfig || []
      isAutoReceive.value = data.awardType === 'BALANCE'
      isSumRecharge.value = data.config?.type === 'SUM'
      sumRechargeAmount.value = formatAmount(centsToAmount(data.sumRecharge || 0))

      activityName.value = data.name || 'Recharge'
      activityRule.value = data.rule || data.description || ''
      activityInfo.description = data.rule || ''

      if (data.rewardLevels) {
        rewardList.value = data.rewardLevels.map(level => ({
          ...level,
          conditionAmount: centsToAmount(level.conditionAmount),
          rewardAmount: centsToAmount(level.rewardAmount)
        }))
      }
    } catch (e) {
      console.warn('[useRecharge] fetch failed:', e.message)
    } finally {
      isLoaded.value = true
    }
  }

  async function claimReward(levelUuid) {
    try {
      const result = await trpcMutation('activity.apply', {
        id: Number(id.value),
        applyInfo: {
          type: 'Recharge',
          info: { ...(levelUuid && { levelId: levelUuid }) }
        }
      })
      if (result) {
        await fetchDetail()
      }
      return result
    } catch (e) {
      console.warn('[useRecharge] claim failed:', e.message)
      return null
    }
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
    rewardData,
    merchantCy,
    isMultiple,
    isDisabled,
    isAutoReceive,
    isSumRecharge,
    sumRechargeAmount,
    totalReceive,
    descriptionList,
    fetchDetail,
    claimReward,
    formatAmount,
    centsToAmount
  }
}
