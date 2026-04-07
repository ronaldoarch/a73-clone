import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { trpcQuery, trpcMutation } from '../utils/api'
import { centsToAmount, formatAmount, getMerchantCurrency, formatPercent } from '../utils/currency'

export function useRechargeBonus() {
  const route = useRoute()
  const router = useRouter()
  const id = computed(() => route.params.id)
  const merchantCy = computed(() => getMerchantCurrency())

  const activityName = ref('')
  const rewardType = ref('SINGLE_DEPOSIT')
  const reward = ref(null)
  const rechargeList = ref([])
  const activityRule = ref('')
  const maxRewardAmountText = ref('')
  const canReceive = ref(false)
  const cumulativeRecharge = ref(0)

  const rewardInfo = reactive({
    isShowProgress: false,
    rechargeTitle: '',
    rechargeAmount: '-',
    bonus: '-',
    claimedAmount: '-',
    claimAmountToday: '-',
    distributeDay: 0,
    currentDays: 0,
    desc: ''
  })

  async function getRechargeBonusDetail() {
    try {
      const data = await trpcQuery('activity.detail', {
        id: Number(id.value),
        type: 'RechargeBonus'
      })
      if (!data) return

      rewardType.value = data.rewardType || 'SINGLE_DEPOSIT'
      canReceive.value = data.canReceive || false
      cumulativeRecharge.value = data.cumulativeRecharge || 0
      reward.value = data.reward || null
      activityName.value = data.name || 'Bônus de Recarga'
      activityRule.value = data.rule || ''

      if (data.activityConfig) {
        const maxReward = Math.max(...data.activityConfig.map(c => c.rewardAmount || 0))
        maxRewardAmountText.value = `${maxReward / 100}%`

        rechargeList.value = data.activityConfig.map(config => ({
          ...config,
          rechargeAmountText: formatAmount(centsToAmount(config.rechargeAmount)),
          rewardText: `${config.rewardAmount / 100}%`
        }))
      }

      updateRewardInfo(data)
    } catch (e) {
      console.warn('[useRechargeBonus] fetch failed:', e.message)
    }
  }

  function updateRewardInfo(data) {
    if (!data.reward) {
      rewardInfo.rechargeTitle = rewardType.value === 'SINGLE_DEPOSIT'
        ? 'Depósito Único' : 'Depósito Acumulado'
      return
    }

    const r = data.reward
    const daysElapsed = Math.min(
      Math.ceil((Date.now() - r.createTime) / (24 * 60 * 60 * 1000)),
      r.distributeDay || 1
    )

    rewardInfo.isShowProgress = true
    rewardInfo.rechargeAmount = formatAmount(centsToAmount(r.triggerAmount || data.cumulativeRecharge))
    rewardInfo.bonus = formatAmount(centsToAmount(r.distributeTotalAmount))
    rewardInfo.claimedAmount = formatAmount(centsToAmount((data.receiveCount || 0) * (r.distributeSingleAmount || 0)))
    rewardInfo.claimAmountToday = formatAmount(centsToAmount(r.distributeSingleAmount))
    rewardInfo.distributeDay = r.distributeDay || 0
    rewardInfo.currentDays = daysElapsed
  }

  async function gotoRechargePage() {
    router.push('/recharge/apply')
  }

  async function receiveBonus(levelUuid) {
    try {
      const result = await trpcMutation('activity.apply', {
        id: Number(id.value),
        applyInfo: {
          type: 'RechargeBonus',
          info: { levelUuid }
        }
      })
      if (result) await getRechargeBonusDetail()
      return result
    } catch (e) {
      console.warn('[useRechargeBonus] receive failed:', e.message)
      return null
    }
  }

  onMounted(() => {
    if (id.value) getRechargeBonusDetail()
  })

  return {
    id,
    merchantCy,
    activityName,
    rewardType,
    reward,
    rechargeList,
    activityRule,
    maxRewardAmountText,
    canReceive,
    cumulativeRecharge,
    rewardInfo,
    getRechargeBonusDetail,
    gotoRechargePage,
    receiveBonus,
    formatAmount,
    centsToAmount
  }
}
