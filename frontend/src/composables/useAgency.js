import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAgentStore } from '../stores/agent'
import { useSystemStore } from '../stores/system'
import { trpcQuery, trpcMutation } from '../utils/api'
import { centsToAmount, formatAmount, getMerchantCurrency } from '../utils/currency'

const RewardDisplayMode = Object.freeze({
  BOX: 'BOX',
  RED_PACKET: 'RED_PACKET'
})

const BonusType = Object.freeze({
  FIXED: 'FIXED',
  RANDOM: 'RANDOM'
})

export function useAgency() {
  const route = useRoute()
  const router = useRouter()
  const agentStore = useAgentStore()
  const systemStore = useSystemStore()
  const id = computed(() => route.params.id)
  const merchantCy = computed(() => getMerchantCurrency())

  const activityName = ref('')
  const showRewardAmount = ref(false)
  const rewardShowMode = ref(null)
  const rewardList = ref([])
  const conditionType = ref(null)
  const bonusType = ref(BonusType.FIXED)
  const showValidCondition = ref(false)
  const receiveBtnIsDisabled = ref(true)

  const activityInfo = reactive({
    subordinate: 0,
    validCount: 0,
    rewardAmount: '0',
    firstRecharge: { amount: 0, status: 'OFF' },
    rechargeAmount: { amount: 0, status: 'OFF' },
    validBet: { amount: 0, status: 'OFF' },
    rechargeDay: { days: 0, status: 'OFF' },
    rechargeTimes: { count: 0, status: 'OFF' },
    time: '',
    condition: '',
    description: ''
  })

  const shareUrl = computed(() => {
    const domain = window.location.origin
    return `${domain}/register?invite=${id.value}`
  })

  function isRewardOpen(status) {
    return status === 'ON'
  }

  function getBoxIconPath(isOpen) {
    const mode = isOpen ? 'Open' : 'Close'
    if (rewardShowMode.value === RewardDisplayMode.BOX) return `/images/activity/treasureBox${mode}.png`
    return `/images/activity/redPacket${mode}.png`
  }

  function getBoxAmount(item) {
    if (item.isOpen) return formatAmount(item.rewardAmount)
    if (bonusType.value === BonusType.FIXED) return formatAmount(item.max)
    return `${formatAmount(item.min)}~${formatAmount(item.max)}`
  }

  async function loadDetail() {
    try {
      const data = await trpcQuery('activity.detail', {
        id: Number(id.value),
        type: 'Agency'
      })
      if (!data) return

      bonusType.value = data.rewardType || BonusType.FIXED
      showRewardAmount.value = data.isShow || false
      rewardShowMode.value = data.displayMode || RewardDisplayMode.RED_PACKET
      conditionType.value = data.validUsers?.type || null
      activityName.value = data.name || 'Agência'
      activityInfo.description = data.rule || ''

      activityInfo.subordinate = data.allCount || 0
      activityInfo.validCount = data.validCount || 0
      activityInfo.time = data.endTime ? `${formatDate(data.startTime)} - ${formatDate(data.endTime)}` : 'Permanente'

      const vu = data.validUsers || {}
      activityInfo.firstRecharge = { ...vu.firstRechargeAmount, amount: centsToAmount(vu.firstRechargeAmount?.amount || 0) }
      activityInfo.rechargeAmount = { ...vu.recharge, amount: centsToAmount(vu.recharge?.amount || 0) }
      activityInfo.validBet = { ...vu.bet, amount: centsToAmount(vu.bet?.amount || 0) }
      activityInfo.rechargeDay = vu.rechargeDays || { days: 0, status: 'OFF' }
      activityInfo.rechargeTimes = vu.rechargeCount || { count: 0, status: 'OFF' }

      showValidCondition.value = isRewardOpen(activityInfo.firstRecharge.status) ||
        isRewardOpen(activityInfo.rechargeAmount.status) ||
        isRewardOpen(activityInfo.validBet.status)

      if (data.rewardConfig) {
        rewardList.value = data.rewardConfig.map((config, idx) => ({
          uuid: config.uuid,
          userCount: config.userCount,
          min: centsToAmount(config.min),
          max: centsToAmount(config.max),
          rewardAmount: 0,
          isOpen: false,
          isMeet: (data.validCount || 0) >= config.userCount,
          showOpenAni: false
        }))

        if (data.rewardList) {
          data.rewardList.forEach(reward => {
            const item = rewardList.value.find(r => r.uuid === reward.levelId)
            if (item) {
              item.isOpen = true
              item.rewardAmount = centsToAmount(reward.awardCount || 0)
            }
          })
        }

        const unclaimedItems = rewardList.value.filter(r => r.isMeet && !r.isOpen)
        receiveBtnIsDisabled.value = !unclaimedItems.length

        const { min, max } = unclaimedItems.reduce(
          (acc, r) => ({ min: acc.min + r.min, max: acc.max + r.max }),
          { min: 0, max: 0 }
        )

        activityInfo.rewardAmount = bonusType.value === BonusType.RANDOM && (min || max)
          ? `${formatAmount(min)}~${formatAmount(max)}`
          : formatAmount(max)
      }
    } catch (e) {
      console.warn('[useAgency] loadDetail failed:', e.message)
    }
  }

  async function claimHandle() {
    try {
      const result = await trpcMutation('activity.apply', {
        id: Number(id.value),
        applyInfo: { type: 'Agency', info: {} }
      })
      if (result) await loadDetail()
      return result
    } catch (e) {
      console.warn('[useAgency] claim failed:', e.message)
      return null
    }
  }

  async function openBoxHandle(item) {
    if (item.isOpen || !item.isMeet) return
    try {
      const result = await trpcMutation('activity.apply', {
        id: Number(id.value),
        applyInfo: { type: 'Agency', info: { rewardId: item.uuid } }
      })
      if (result) {
        item.isOpen = true
        item.showOpenAni = true
        item.rewardAmount = centsToAmount(result.rewardAmount || result.awardCount || 0)
        setTimeout(() => { item.showOpenAni = false }, 1000)
        await loadDetail()
      }
    } catch (e) {
      console.warn('[useAgency] openBox failed:', e.message)
    }
  }

  function shareHandle(platform) {
    const text = `Junte-se a mim e ganhe bônus!`
    const url = shareUrl.value
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank')
    } else {
      navigator.clipboard?.writeText(url).catch(() => {})
    }
  }

  function claimHistoryHandle() {
    router.push('/main/promo')
  }

  function detailsHandle() {
    router.push(`/activity/agency/details/${id.value}`)
  }

  function formatDate(ts) {
    if (!ts) return ''
    const d = new Date(typeof ts === 'number' && ts < 1e12 ? ts * 1000 : ts)
    return d.toLocaleDateString('pt-BR')
  }

  onMounted(() => {
    if (id.value) {
      agentStore.setAgentConfig({})
      loadDetail()
    }
  })

  return {
    id,
    merchantCy,
    activityName,
    activityInfo,
    showRewardAmount,
    rewardShowMode,
    rewardList,
    conditionType,
    bonusType,
    showValidCondition,
    receiveBtnIsDisabled,
    shareUrl,
    RewardDisplayMode,
    BonusType,
    isRewardOpen,
    getBoxIconPath,
    getBoxAmount,
    loadDetail,
    claimHandle,
    openBoxHandle,
    shareHandle,
    claimHistoryHandle,
    detailsHandle,
    formatAmount,
    centsToAmount
  }
}
