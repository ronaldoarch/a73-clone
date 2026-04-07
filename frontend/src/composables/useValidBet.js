import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { trpcQuery, trpcMutation } from '../utils/api'
import { centsToAmount, formatAmount, getMerchantCurrency } from '../utils/currency'

export function useValidBet() {
  const route = useRoute()
  const id = computed(() => route.params.id)
  const merchantCy = computed(() => getMerchantCurrency())

  const bonusData = ref([])
  const activityInfo = ref({ name: 'ValidBet' })
  const activityName = ref('')
  const activityRule = ref('')
  const ruleType = ref('DEFAULT')
  const customRule = ref('')
  const isAutoReceive = ref(false)
  const isLoading = ref(false)

  const canClaimAll = computed(() => {
    if (isAutoReceive.value) return false
    return bonusData.value.some(item => getItemStatus(item) === 'receivable')
  })

  const totalUnreceivedAmount = computed(() => {
    const total = bonusData.value.reduce((sum, item) => {
      const unreceived = (item.canReceiveAmount || 0) - (item.receivedAmount || 0)
      return sum + Math.max(0, unreceived)
    }, 0)
    return centsToAmount(total)
  })

  function getItemStatus(item) {
    const canReceive = item.canReceiveAmount || 0
    if ((item.receivedAmount || 0) > 0) return 'received'
    if (canReceive > 0) return 'receivable'
    return 'unreceivable'
  }

  async function getActivityDetail(silent = false) {
    if (!silent) isLoading.value = true
    try {
      const data = await trpcQuery('activity.detail', {
        id: Number(id.value),
        type: 'ValidBet'
      })
      if (!data) return

      activityInfo.value = data
      isAutoReceive.value = data.awardType === 'BALANCE'
      activityName.value = data.name || data.multilingual?.name || 'Aposta Válida'

      if (data.multilingual) {
        ruleType.value = data.multilingual.ruleType || 'DEFAULT'
        if (ruleType.value === 'DEFAULT' && data.multilingual.rule) {
          try {
            const parsed = JSON.parse(data.multilingual.rule)
            activityRule.value = parsed.variablesValue || data.multilingual.rule
          } catch {
            activityRule.value = data.multilingual.rule
          }
        } else {
          customRule.value = data.multilingual.rule || ''
        }
      } else {
        activityRule.value = data.rule || ''
      }

      if (data.rewardLevels) {
        bonusData.value = data.rewardLevels.map(level => ({
          ...level,
          conditionAmount: centsToAmount(level.conditionAmount),
          rewardAmount: centsToAmount(level.rewardAmount)
        }))
      }
    } catch (e) {
      console.warn('[useValidBet] fetch failed:', e.message)
    } finally {
      if (!silent) isLoading.value = false
    }
  }

  async function handleReceive(item) {
    isLoading.value = true
    try {
      const result = await trpcMutation('activity.apply', {
        id: Number(id.value),
        applyInfo: {
          type: 'ValidBet',
          info: { ...(item?.uuid && { levelId: item.uuid }) }
        }
      })
      if (result) {
        await getActivityDetail(true)
      }
      return result
    } catch (e) {
      console.warn('[useValidBet] receive failed:', e.message)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function handleClaimAll() {
    return handleReceive()
  }

  onMounted(() => {
    if (id.value) getActivityDetail()
  })

  return {
    id,
    bonusData,
    activityInfo,
    activityName,
    activityRule,
    ruleType,
    customRule,
    canClaimAll,
    totalUnreceivedAmount,
    isAutoReceive,
    isLoading,
    merchantCy,
    getActivityDetail,
    handleReceive,
    handleClaimAll,
    getItemStatus,
    formatAmount,
    centsToAmount
  }
}
