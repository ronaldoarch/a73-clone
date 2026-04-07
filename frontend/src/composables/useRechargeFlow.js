import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { trpcQuery, trpcMutation } from '../utils/api'
import { useSystemStore } from '../stores/system'
import { useUserStore } from '../stores/user'
import { useRechargeStore } from '../stores/recharge'
import { formatCurrency } from '../utils/formatters'

const ERROR_CODES_WITH_HANDLER = [2001, 2002, 2003]

const rechargePayload = ref({
  amount: 0,
  processMode: 'THREE_PARTY_PAYMENT',
  payTypeSubId: 0,
  participateReward: false
})

const isSubmitting = ref(false)
const bindFields = ref([])

const BIND_FIELD_MAP = {
  needCPF: 'cpf',
  needPhone: 'phone',
  needRealName: 'realName',
  needEmail: 'email'
}

export function useRechargeFlow() {
  const router = useRouter()
  const systemStore = useSystemStore()
  const userStore = useUserStore()
  const rechargeStore = useRechargeStore()

  const merchantCy = computed(() => systemStore.tenantInfo?.merchantCy || 'R$')

  async function createOrder(callback) {
    if (isSubmitting.value) return
    isSubmitting.value = true

    try {
      const result = await trpcMutation('recharge.createOrder', rechargePayload.value)
      const orderNo = result.orderNo

      rechargeStore.QRCodeInfo = {
        ...rechargeStore.QRCodeInfo,
        QRCode: result.payUrl,
        orderNo,
        amount: formatCurrency(result.amount)
      }

      rechargeStore.orderInfo = {
        ...rechargeStore.orderInfo,
        orderNo
      }

      if (result.code && ERROR_CODES_WITH_HANDLER.includes(result.code)) {
        _handleErrorCode(result)
        return
      }

      callback?.(result)
      _trackPayStart()
    } catch (e) {
      console.error('[RechargeFlow] createOrder error:', e)
    } finally {
      setTimeout(() => { isSubmitting.value = false }, 2000)
    }
  }

  function _handleErrorCode(result) {
    if (result.code === 2001) {
      router.push('/rechargeRecord')
    } else if (result.code === 2002) {
      const fields = JSON.parse(result.msg)
      bindFields.value = []
      for (const key in fields) {
        if (fields[key]) bindFields.value.push(BIND_FIELD_MAP[key])
      }
      router.push(`/bindCPF/${rechargePayload.value.processMode}`)
    } else if (result.code === 2003) {
      const msg = result.msg?.length > 200 ? result.msg.slice(0, 200) + '...' : result.msg
      console.error('[RechargeFlow] Error 2003:', msg)
    }
  }

  function _trackPayStart() {
    const userId = userStore.userDetails?.userId || userStore.userDetails?.id
    const tenantId = systemStore.tenantInfo?.id
    if (userId) {
      console.log('[Track] pay-start', { userId, tenantId, amount: rechargePayload.value.amount / 100 })
    }
  }

  function parsePayUrl(payUrl, redirectType) {
    const isJson = payUrl.startsWith('{')

    if (isJson) {
      const data = JSON.parse(payUrl)
      const url = data.payUrl
      if ((redirectType || data.redirectType) === 'REDIRECT') {
        window.location.href = url
        return { url: '', isQRCode: false }
      }
      return { isQRCode: !url.startsWith('http'), url: url.startsWith('http') ? url : '' }
    }

    if (redirectType === 'REDIRECT') {
      window.location.href = payUrl
      return { url: '', isQRCode: false }
    }

    return { isQRCode: !payUrl.startsWith('http'), url: payUrl.startsWith('http') ? payUrl : '' }
  }

  function processPayResult(amount, result, callbacks = {}) {
    const parsed = parsePayUrl(result.payUrl, result.redirectType)
    rechargeStore.thirdUrl = parsed.url
    rechargeStore.isQRCode = parsed.isQRCode
    rechargeStore.orderNo = result.orderNo

    rechargeStore.QRCodeInfo.amount = amount
    rechargeStore.orderInfo.amount = String(Number(amount) * 100)

    callbacks?.[rechargePayload.value.processMode]?.(result)
  }

  async function confirmTransfer() {
    const tenantId = systemStore.tenantInfo?.id
    const orderNo = rechargeStore.orderInfo.orderNo

    if (rechargeStore.orderInfo.isTransfer) {
      if (rechargeStore.transferConfig?.transferNameRequired === 'ON' && !rechargeStore.orderInfo.payerName) {
        return false
      }
      if (!rechargeStore.orderInfo.voucher) {
        return false
      }
      await trpcMutation('recharge.confirmTransfer', {
        tenantId: Number(tenantId),
        orderNo,
        transferVoucher: rechargeStore.orderInfo.voucher,
        payerRealName: rechargeStore.orderInfo.payerName
      })
    }

    const result = await trpcMutation('recharge.payConfirm', { orderNo })
    return result && 'status' in result
  }

  async function payAgain() {
    const orderNo = rechargeStore.orderNo
    const result = await trpcMutation('recharge.payAgain', { orderNo })
    if (!result || 'message' in result) return false

    if (result.payUrl) {
      const parsed = parsePayUrl(result.payUrl, result.redirectType)
      rechargeStore.isQRCode = parsed.isQRCode
      rechargeStore.thirdUrl = parsed.url
      return true
    }
    return false
  }

  function validateAmount(value, min, max) {
    const num = Number(value)
    if (!value || isNaN(num)) return { isValid: false, message: 'toast.invalidInputAmount' }
    if (num < min || num > max) return { isValid: false, message: 'toast.invalidInputAmount' }
    if (!Number.isInteger(num)) return { isValid: false, message: 'toast.0001' }
    return { isValid: true, amount: num }
  }

  function buildOrderPayload(options) {
    const payload = {
      amount: options.amount * 100,
      participateReward: options.isParticipate,
      payTypeSubId: options.subTabId,
      processMode: options.processMode
    }

    if (options.channelId) payload.payChannelId = options.channelId
    if (options.bankCode) payload.bankCode = options.bankCode

    if (options.isParticipate && options.rechargeRewardInfo) {
      payload.extend = {
        activityId: options.rechargeRewardInfo.id,
        activityType: options.rechargeRewardInfo.type,
        type: 'activity'
      }
    }

    return payload
  }

  return {
    rechargePayload, isSubmitting, bindFields, merchantCy,
    createOrder, parsePayUrl, processPayResult,
    confirmTransfer, payAgain,
    validateAmount, buildOrderPayload
  }
}

export function useRechargeReward() {
  const isParticipate = ref(false)
  const activityIsOpen = ref(false)
  const amountOfGift = ref(0)
  const rateOfGift = ref(0)
  const bannerUrl = ref('')
  const withdrawFlowStr = ref('')
  const limitPlatformList = ref([])
  let rewardRates = []
  let rechargeRewardInfo = null

  function initReward(payListData) {
    if (!payListData?.rechargeRewardInfo) {
      activityIsOpen.value = false
      return
    }

    rechargeRewardInfo = payListData.rechargeRewardInfo
    const { rewardRate, bannerUrl: url } = rechargeRewardInfo

    rewardRates = (rewardRate || []).map(r => ({
      amount: r.amount / 100,
      rate: r.rate / 100,
      betMultiple: r.betMultiple
    }))

    bannerUrl.value = url || ''
    activityIsOpen.value = true
  }

  function calculateGift(amount, isParticipating) {
    if (!amount) {
      amountOfGift.value = 0
      rateOfGift.value = 0
      withdrawFlowStr.value = ''
      return
    }

    if (isParticipating && rewardRates.length) {
      const matched = [...rewardRates].reverse().find(r => amount >= r.amount)
      if (matched) {
        rateOfGift.value = matched.rate
        amountOfGift.value = (matched.rate / 100) * matched.amount
        withdrawFlowStr.value = `${matched.betMultiple}x`
        return
      }
    }

    rateOfGift.value = 0
    amountOfGift.value = 0
    withdrawFlowStr.value = ''
  }

  return {
    isParticipate, activityIsOpen, amountOfGift, rateOfGift,
    bannerUrl, withdrawFlowStr, limitPlatformList,
    initReward, calculateGift
  }
}

export function usePayMethodTags() {
  function formatTag(tags, tagValue, t, isWeightCycle = false) {
    const map = {
      NOTHING: () => '',
      GIVE_AWAY: () => `+${(Number(tagValue) / 100).toFixed(2)}%`,
      RECOMMEND: () => isWeightCycle ? '' : t?.('tags.RECOMMEND') || 'Recomendado'
    }
    return map[tags]?.() || t?.(`tags.${tags}`) || ''
  }

  function buildSubTabList(payTypeSubList, isWeightCycle, t) {
    return payTypeSubList
      .sort((a, b) => b.sort - a.sort)
      .map(item => ({
        id: item.id,
        name: item.showName,
        tagValue: formatTag(item.tags, item.tagValue, t, isWeightCycle),
        icon: item.icon,
        isNative: !!item.isNative
      }))
  }

  return { formatTag, buildSubTabList }
}

export async function checkNativePay(subTabList, amount, nativePayConfig) {
  try {
    const config = JSON.parse(nativePayConfig)
    const { historicalPay = 0, rechargeCount = 0 } = await trpcQuery('recharge.history', null) || {}

    const { limitType, timesType, times, payAmountLimit, minAmount, maxAmount } = config
    if (limitType === 'NO_LIMIT') return subTabList

    const timesMatch = timesType === '>' ? rechargeCount > times : rechargeCount < times
    const amountCondition = timesMatch && historicalPay >= payAmountLimit
    const rangeCondition = amount >= minAmount / 100 && amount <= maxAmount / 100

    const conditionMap = {
      ANY_ONE: amountCondition || rangeCondition,
      ALL_MATCH: amountCondition && rangeCondition
    }

    const passes = conditionMap[limitType] ?? true
    return subTabList.filter(item => item.isNative ? passes : true)
  } catch {
    return subTabList
  }
}
