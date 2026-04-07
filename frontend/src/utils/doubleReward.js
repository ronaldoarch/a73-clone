import { ref, computed } from 'vue'
import { trpcMutation } from './api'

export const RewardType = Object.freeze({
  MANUAL: 'manualReward',
  ACTIVITY: 'userActivityReward',
  REGISTER: 'registerReward'
})

const isDoubleRewardVisible = ref(false)
const doubleRewardData = ref(null)
const rewardType = ref(RewardType.MANUAL)
const waitPayOrderNo = ref('')
const rewardPayParams = ref(null)
const claimDoubleRegisterReward = ref(false)

export function useDoubleReward() {
  function showDoubleReward() {
    isDoubleRewardVisible.value = true
  }

  function hideDoubleReward() {
    isDoubleRewardVisible.value = false
  }

  function setDoubleRewardData(data) {
    doubleRewardData.value = data
    if (data?.rewardType) rewardType.value = data.rewardType
  }

  function resetDoubleReward() {
    isDoubleRewardVisible.value = false
    doubleRewardData.value = null
    rewardPayParams.value = null
  }

  function setWaitPayOrderNo(orderNo) {
    waitPayOrderNo.value = orderNo
  }

  function setRewardPayParams(params) {
    rewardPayParams.value = params
  }

  function setClaimDoubleRegisterReward(val) {
    claimDoubleRegisterReward.value = val
  }

  async function claimManualReward(params, giveUpDouble = true) {
    const { orderNo, batchNo } = params
    return trpcMutation('reward.claimManual', {
      orderNo,
      batchNo,
      userIsGiveUpDouble: giveUpDouble
    })
  }

  async function claimActivityReward(params, giveUpDouble = true) {
    const { id, type, userId } = params
    return trpcMutation('activity.apply', {
      id,
      applyInfo: {
        type,
        info: { userId, userIsGiveUpDouble: giveUpDouble }
      }
    })
  }

  async function claimRegisterReward(giveUpDouble = true) {
    return trpcMutation('activity.claimRegisterReward', {
      userIsGiveUpDouble: giveUpDouble
    })
  }

  async function requestDoubleReward(rewardId, type) {
    const resolvedType = type === RewardType.REGISTER ? RewardType.ACTIVITY : type
    return trpcMutation('reward.requestDouble', {
      rewardId,
      rewardType: resolvedType
    })
  }

  async function confirmDoubleRecharge(rewardId, type) {
    const resolvedType = type === RewardType.REGISTER ? RewardType.ACTIVITY : type
    return trpcMutation('reward.confirmDoubleRecharge', {
      rewardId,
      rewardType: resolvedType
    })
  }

  const isClaim = computed(() => doubleRewardData.value?.popupType === 'claim')
  const amount = computed(() => doubleRewardData.value?.amount || 0)
  const isFixedType = computed(() => doubleRewardData.value?.doubleType !== 'RECHARGE')
  const isRechargeType = computed(() => doubleRewardData.value?.doubleType === 'RECHARGE')
  const multiplier = computed(() => {
    if (isFixedType.value) return doubleRewardData.value?.doubleMultiplier || 0
    return doubleRewardData.value?.rechargeDoubleMultiplier || 0
  })
  const doubleRechargeConfig = computed(() => doubleRewardData.value?.doubleRechargeConfig || [])
  const doubleRewardAmount = computed(() => {
    const amt = amount.value || 0
    const mult = multiplier.value || 0
    return (amt * mult / 10000).toFixed(2)
  })

  return {
    isDoubleRewardVisible,
    doubleRewardData,
    rewardType,
    waitPayOrderNo,
    rewardPayParams,
    claimDoubleRegisterReward,
    isClaim, amount, isFixedType, isRechargeType,
    multiplier, doubleRechargeConfig, doubleRewardAmount,
    showDoubleReward, hideDoubleReward,
    setDoubleRewardData, resetDoubleReward,
    setWaitPayOrderNo, setRewardPayParams, setClaimDoubleRegisterReward,
    claimManualReward, claimActivityReward, claimRegisterReward,
    requestDoubleReward, confirmDoubleRecharge
  }
}

const giftTheme = ref('default')

export async function loadGiftTheme(tenantInfo) {
  giftTheme.value = ((tenantInfo?.giftTheme) || 'default').toLowerCase()
}

export function getGiftTheme() {
  return giftTheme.value
}
