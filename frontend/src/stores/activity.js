/**
 * Pinia store for activity/promotion management.
 * Handles activity lists, configuration, red packets, rebate, lucky wheel, etc.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useActivityStore = defineStore('activity', () => {
  const pageType = ref(0)
  const curPageType = ref(0)
  const rebateRule = ref('')
  const gameTypes = ref([])
  const rebateList = ref([])
  const validBetList = ref({})
  const wheelPrizes = ref([])
  const piecePrizes = ref([])
  const activityConfig = ref([])
  const activityList = ref([])
  const redPointList = ref([])
  const isHasUnclaimed = ref(false)
  const isShowPromoRedPoint = ref(false)
  const isShowProfileRedPoint = ref(false)
  const isGetBindingNewPwaReward = ref(false)
  const showAvailableTomorrow = ref(false)
  const availableTomorrow = ref(0)
  const redPacketDetail = ref({})
  const showNewUserExclusivePopup = ref(0)
  const userHomeTop = ref([])
  const rechargeBonusPopupStatus = ref(0)
  const announcementPopupStatus = ref(0)

  function setActivityList(list) {
    activityList.value = list || []
  }

  function clearActivityList() {
    activityList.value = []
  }

  function setActivityConfig(config) {
    activityConfig.value = config || []
  }

  function setRebateData(data) {
    if (!data) return
    if (data.resetType === 'DAILY') {
      showAvailableTomorrow.value = true
      availableTomorrow.value = Number(data.receiveAmount) / 100
    } else if (data.resetType === 'NONE') {
      showAvailableTomorrow.value = false
      availableTomorrow.value = 0
    }
    if (data.rebateList) rebateList.value = data.rebateList
    if (data.rule) rebateRule.value = data.rule
    if (data.validBetList) validBetList.value = data.validBetList
    if (data.gameTypes) gameTypes.value = data.gameTypes
  }

  function setWheelPrizes(prizes) {
    wheelPrizes.value = prizes || []
  }

  function setPiecePrizes(prizes) {
    piecePrizes.value = prizes || []
  }

  function setRedPacketDetail(detail) {
    redPacketDetail.value = detail || {}
  }

  function setRedPointList(list) {
    redPointList.value = list || []
    isShowPromoRedPoint.value = list?.some(item => item.redPoint) || false
  }

  function setIsHasUnclaimed(value) {
    isHasUnclaimed.value = !!value
  }

  function updateRedPointData(redPoints, hasUnclaimed) {
    setRedPointList(redPoints)
    setIsHasUnclaimed(hasUnclaimed)
    isShowPromoRedPoint.value = redPointList.value.some(item => item.redPoint) || isHasUnclaimed.value
  }

  function clearRedPointList() {
    redPointList.value = []
    isHasUnclaimed.value = false
    isShowPromoRedPoint.value = false
  }

  function setUserHomeTop(list) {
    userHomeTop.value = list || []
  }

  async function setNewUserExclusivePopup(value) {
    showNewUserExclusivePopup.value = value
    try {
      localStorage.setItem('showNewUserExclusivePopup', String(value))
    } catch {}
  }

  function getNewUserExclusivePopup() {
    if (!showNewUserExclusivePopup.value) {
      showNewUserExclusivePopup.value = Number(localStorage.getItem('showNewUserExclusivePopup') || 0)
    }
    return showNewUserExclusivePopup.value
  }

  async function setRechargeBonusPopupStatus(value) {
    rechargeBonusPopupStatus.value = value
    try {
      localStorage.setItem('RECHARGE_BONUS_POPUP_STATUS', String(value))
    } catch {}
  }

  function setPageType(type) {
    pageType.value = type
  }

  function setCurPageType(type) {
    curPageType.value = type
  }

  const hasActivities = computed(() => activityList.value.length > 0)
  const activeActivities = computed(() =>
    activityList.value.filter(a => a.status === 'PROCESSING' || a.status === 'PENDING')
  )

  return {
    pageType,
    curPageType,
    rebateRule,
    gameTypes,
    rebateList,
    validBetList,
    wheelPrizes,
    piecePrizes,
    activityConfig,
    activityList,
    redPointList,
    isHasUnclaimed,
    isShowPromoRedPoint,
    isShowProfileRedPoint,
    isGetBindingNewPwaReward,
    showAvailableTomorrow,
    availableTomorrow,
    redPacketDetail,
    showNewUserExclusivePopup,
    userHomeTop,
    rechargeBonusPopupStatus,
    announcementPopupStatus,
    hasActivities,
    activeActivities,
    setActivityList,
    clearActivityList,
    setActivityConfig,
    setRebateData,
    setWheelPrizes,
    setPiecePrizes,
    setRedPacketDetail,
    setRedPointList,
    setIsHasUnclaimed,
    updateRedPointData,
    clearRedPointList,
    setUserHomeTop,
    setNewUserExclusivePopup,
    getNewUserExclusivePopup,
    setRechargeBonusPopupStatus,
    setPageType,
    setCurPageType
  }
})
