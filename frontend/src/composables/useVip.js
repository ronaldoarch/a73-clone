import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { trpcQuery, trpcMutation } from '../utils/api'
import { useVipStore } from '../stores/vip'
import { useGamesStore } from '../stores/games'
import { centsToAmount, formatAmount, getMerchantCurrency, formatCurrencyDisplay } from '../utils/currency'

const PageType = Object.freeze({
  PROMOTION: 'PROMOTION',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  LEVEL: 'LEVEL'
})

export function useVip() {
  const router = useRouter()
  const route = useRoute()
  const vipStore = useVipStore()
  const gamesStore = useGamesStore()
  const merchantCy = computed(() => getMerchantCurrency())

  const vipLevelDatas = ref(null)
  const curShowPage = ref(PageType.PROMOTION)
  const claimBtnIsEnable = ref(false)
  const auditMultiple = ref(0)
  const vipReceiveList = ref([])
  const ifShowDeposit = ref(false)
  const ifShowBet = ref(false)

  const vipLevelInfo = reactive({
    curVipLevel: 0,
    nextVipLevel: 0,
    rechargeNeed: 0,
    betNeed: 0,
    rechargeRequirements: 0,
    betRequirements: 0,
    curRechargeAmount: 0,
    curBetAmount: 0,
    rechargeProgress: 0,
    betProgress: 0,
    firstLevelProgress: 0
  })

  const pageStatus = reactive({
    PROMOTION: false,
    DAILY: false,
    WEEKLY: false,
    MONTHLY: false,
    LEVEL: false
  })

  const pageList = computed(() => [
    { value: 'PROMOTION', title: 'Promoção', isEnable: pageStatus.PROMOTION },
    { value: 'DAILY', title: 'Diário', isEnable: pageStatus.DAILY },
    { value: 'WEEKLY', title: 'Semanal', isEnable: pageStatus.WEEKLY },
    { value: 'MONTHLY', title: 'Mensal', isEnable: pageStatus.MONTHLY },
    { value: 'LEVEL', title: 'Retenção', isEnable: pageStatus.LEVEL }
  ])

  const curPageTitles = computed(() => {
    const titles = {
      PROMOTION: ['Nível', 'Depósito', 'Aposta', 'Promoção'],
      DAILY: ['Nível', 'Aposta Válida', 'Requisito', 'Diário'],
      WEEKLY: ['Nível', 'Aposta Válida', 'Requisito', 'Semanal'],
      MONTHLY: ['Nível', 'Aposta Válida', 'Requisito', 'Mensal']
    }
    return titles[curShowPage.value] || titles.PROMOTION
  })

  const showReceiveBtn = computed(() => curShowPage.value !== PageType.LEVEL)

  const receiveBtnIsEnable = computed(() => {
    if (curShowPage.value === 'PROMOTION') return vipReceiveList.value.includes('PROMOTION')
    if (curShowPage.value === 'DAILY') return vipReceiveList.value.includes('DAILY')
    if (curShowPage.value === 'WEEKLY') return vipReceiveList.value.includes('WEEKLY')
    if (curShowPage.value === 'MONTHLY') return vipReceiveList.value.includes('MONTHLY')
    return false
  })

  const curPageData = computed(() => {
    if (!vipLevelDatas.value?.vipLevelDatas) return []

    return vipLevelDatas.value.vipLevelDatas.map((level, idx, arr) => {
      const prev = idx > 0 ? arr[idx - 1] : null
      const row = {
        level: level.level,
        rechargeRequirement: 0,
        betRequirement: 0,
        reward: 0,
        recharge: 0,
        bet: 0,
        rechargeProgress: 0,
        betProgress: 0,
        showRechargeProgress: false,
        showBetProgress: false
      }

      switch (curShowPage.value) {
        case 'PROMOTION':
          row.rechargeRequirement = centsToAmount(level.promotionRecharge)
          row.betRequirement = centsToAmount(level.promotionBet)
          row.reward = centsToAmount(level.promotionReward)
          row.showRechargeProgress = vipLevelInfo.nextVipLevel === level.level
          row.showBetProgress = vipLevelInfo.nextVipLevel === level.level
          if (row.rechargeRequirement) ifShowDeposit.value = true
          if (row.betRequirement) ifShowBet.value = true
          break
        case 'DAILY':
          row.betRequirement = centsToAmount(level.dailyBet)
          row.reward = centsToAmount(level.dailyReward)
          row.showBetProgress = vipLevelInfo.curVipLevel === level.level
          if (row.betRequirement) ifShowBet.value = true
          break
        case 'WEEKLY':
          row.betRequirement = centsToAmount(level.weeklyBet)
          row.reward = centsToAmount(level.weeklyReward)
          row.showBetProgress = vipLevelInfo.curVipLevel === level.level
          if (row.betRequirement) ifShowBet.value = true
          break
        case 'MONTHLY':
          row.betRequirement = centsToAmount(level.monthlyBet)
          row.reward = centsToAmount(level.monthlyReward)
          row.showBetProgress = vipLevelInfo.curVipLevel === level.level
          if (row.betRequirement) ifShowBet.value = true
          break
      }

      return row
    })
  })

  const retentionLevel = computed(() => {
    if (!vipLevelDatas.value?.vipLevelDatas) return []
    return vipLevelDatas.value.vipLevelDatas.map(level => ({
      level: level.level,
      retentionRecharge: centsToAmount(level.retentionRecharge),
      retentionBet: centsToAmount(level.retentionBet)
    }))
  })

  async function loadVipData() {
    try {
      const [userVipData, vipConfig] = await Promise.allSettled([
        trpcQuery('vip.userInfo'),
        trpcQuery('vip.config')
      ])

      if (userVipData.status === 'fulfilled' && userVipData.value) {
        vipStore.calculateVipProgress(userVipData.value)
        Object.assign(vipLevelInfo, {
          curVipLevel: userVipData.value.curVipLevel || 0,
          nextVipLevel: (userVipData.value.curVipLevel || 0) + 1,
          curRechargeAmount: centsToAmount(userVipData.value.totalRechargeAmount || 0),
          curBetAmount: centsToAmount(userVipData.value.totalValidBetAmount || 0)
        })
      }

      if (vipConfig.status === 'fulfilled' && vipConfig.value) {
        vipLevelDatas.value = vipConfig.value
        vipReceiveList.value = vipConfig.value.vipUserReceiveList || []
        claimBtnIsEnable.value = !!vipReceiveList.value.length
        auditMultiple.value = vipConfig.value.auditMultiple || 0

        pageStatus.PROMOTION = !!vipConfig.value.promotionStatus
        pageStatus.DAILY = !!vipConfig.value.dailyStatus
        pageStatus.WEEKLY = !!vipConfig.value.weeklyStatus
        pageStatus.MONTHLY = !!vipConfig.value.monthlyStatus
        pageStatus.LEVEL = !!vipConfig.value.retentionStatus
      }
    } catch (e) {
      console.warn('[useVip] loadVipData failed:', e.message)
    }
  }

  async function bathReceiveHandle() {
    try {
      const result = await trpcMutation('vip.receive')
      if (result) {
        claimBtnIsEnable.value = false
        await loadVipData()
      }
      return result
    } catch (e) {
      console.warn('[useVip] bathReceive failed:', e.message)
      return null
    }
  }

  async function receiveHandle() {
    try {
      const result = await trpcMutation('vip.receive', {
        receiveType: curShowPage.value
      })
      if (result) await loadVipData()
      return result
    } catch (e) {
      console.warn('[useVip] receive failed:', e.message)
      return null
    }
  }

  function claimRecordHandle() {
    router.push('/main/promo')
  }

  onMounted(() => loadVipData())

  return {
    PageType,
    vipLevelDatas,
    curShowPage,
    claimBtnIsEnable,
    auditMultiple,
    vipLevelInfo,
    pageStatus,
    pageList,
    curPageTitles,
    showReceiveBtn,
    receiveBtnIsEnable,
    curPageData,
    retentionLevel,
    vipReceiveList,
    merchantCy,
    ifShowDeposit,
    ifShowBet,
    loadVipData,
    bathReceiveHandle,
    receiveHandle,
    claimRecordHandle,
    formatAmount,
    centsToAmount
  }
}
