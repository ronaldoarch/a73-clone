/**
 * Pinia store for VIP level management.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

const VIP_ICON_NAMES = [
  'vip1','vip2','vip3','vip4','vip5','vip6','vip7','vip8','vip9','vip10',
  'vip11','vip12','vip13','vip14','vip15','vip16','vip17','vip18','vip19','vip20',
  'vip21','vip22','vip23','vip24','vip25','vip26','vip27','vip28','vip29','vip30'
]

const VIP_BG_NAMES = ['levelBg1','levelBg2','levelBg3','levelBg4','levelBg5','levelBg6']
const VIP_DETAIL_NAMES = ['vipDetail1','vipDetail2','vipDetail3','vipDetail4','vipDetail5','vipDetail6']
const VIP_TEXT_NAMES = ['vipTextSvg1','vipTextSvg2','vipTextSvg3','vipTextSvg4','vipTextSvg5','vipTextSvg6']
const VIP_COLORS = ['#757575','#CE7E36','#6788A4','#8B6CB5','#FF8F01','#006EF1','#F41086','#F53B14','#F014F5','#FF0501']

export const useVipStore = defineStore('vip', () => {
  const vipLevelCount = ref(0)
  const activityVipInfo = ref(null)
  const activityVipType = ref(false)
  const activityVipOpen = ref(true)
  const claimBtnIsEnable = ref(false)

  function setVipLevelCount(count) {
    vipLevelCount.value = count
  }

  function setActivityVipInfo(info) {
    activityVipInfo.value = info
  }

  function setActivityVipType(value) {
    activityVipType.value = value
  }

  function setActivityVipOpen(value) {
    activityVipOpen.value = value
  }

  function getVipIconPath(level) {
    const totalIcons = VIP_ICON_NAMES.length
    let idx = 0
    if (totalIcons >= vipLevelCount.value) {
      idx = level
    } else {
      idx = Math.floor(level / Math.floor(vipLevelCount.value / totalIcons))
      idx = Math.min(idx, totalIcons - 1)
    }
    return `/first/vip/${VIP_ICON_NAMES[idx]}.png`
  }

  function getVipTextColor(level) {
    const totalColors = VIP_COLORS.length
    let idx = 0
    if (totalColors >= vipLevelCount.value) {
      idx = level
    } else {
      idx = Math.floor(level / Math.floor(vipLevelCount.value / totalColors))
      idx = Math.min(idx, totalColors - 1)
    }
    return VIP_COLORS[idx]
  }

  function getVipBgPath(level, type = 'myVipBg') {
    const iconLen = VIP_ICON_NAMES.length
    const bgLen = VIP_BG_NAMES.length
    const perBg = iconLen / bgLen
    let idx = 0
    if (iconLen >= vipLevelCount.value) {
      idx = Math.floor(level / perBg)
    } else {
      idx = Math.floor(Math.floor(level / Math.floor(vipLevelCount.value / iconLen)) / perBg)
      idx = Math.min(idx, bgLen - 1)
    }

    const map = {
      myVipBg: VIP_BG_NAMES,
      myVipDetailBg: VIP_DETAIL_NAMES,
      myVipTextBg: VIP_TEXT_NAMES
    }

    const names = map[type] || VIP_BG_NAMES
    const prefix = type === 'myVipTextBg' ? '/first/svg/vip/' : '/first/vip/'
    const ext = type === 'myVipTextBg' ? '.svg' : '.png'
    return `${prefix}${names[idx]}${ext}`
  }

  /**
   * Calculate VIP progress from API data.
   */
  function calculateVipProgress(data) {
    const {
      currentVipLevel, nextVipLevel,
      totalRechargeAmount, totalValidBetAmount, vipLevelCount: count
    } = data

    vipLevelCount.value = count

    const result = {
      curVipLevel: currentVipLevel.level,
      nextVipLevel: nextVipLevel?.level,
      rechargeNeed: 0,
      betNeed: 0,
      curRechargeAmount: 0,
      curBetAmount: 0,
      rechargeRequirements: 0,
      betRequirements: 0,
      rechargeProgress: 0,
      betProgress: 0,
      firstLevelProgress: 0
    }

    const centsToAmount = v => Number(v) / 100

    const betNeed = centsToAmount(Number(nextVipLevel?.promotionBet || 0) - Number(totalValidBetAmount))
    const rechargeNeed = centsToAmount(Number(nextVipLevel?.promotionRecharge || 0) - Number(totalRechargeAmount))

    result.betNeed = Math.max(betNeed, 0)
    result.rechargeNeed = Math.max(rechargeNeed, 0)
    result.curRechargeAmount = centsToAmount(totalRechargeAmount)
    result.curBetAmount = centsToAmount(totalValidBetAmount)

    if (nextVipLevel) {
      result.rechargeRequirements = centsToAmount(Number(nextVipLevel.promotionRecharge || 0))
      result.betRequirements = centsToAmount(Number(nextVipLevel.promotionBet || 0))
      result.rechargeProgress = result.curRechargeAmount / result.rechargeRequirements
      result.betProgress = result.curBetAmount / result.betRequirements

      const rp = Math.min(result.rechargeProgress, 1)
      const bp = Math.min(result.betProgress, 1)
      const safe = v => Number.isNaN(v) ? 0 : v
      result.firstLevelProgress = (safe(rp) + safe(bp)) / 2
    } else {
      result.rechargeRequirements = 999999
      result.betRequirements = 999999
      result.rechargeProgress = 1
      result.betProgress = 1
      result.firstLevelProgress = 1
    }

    return result
  }

  return {
    vipLevelCount,
    activityVipInfo,
    activityVipType,
    activityVipOpen,
    claimBtnIsEnable,
    setVipLevelCount,
    setActivityVipInfo,
    setActivityVipType,
    setActivityVipOpen,
    getVipIconPath,
    getVipTextColor,
    getVipBgPath,
    calculateVipProgress
  }
})
