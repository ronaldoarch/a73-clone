import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { trpcQuery, trpcMutation } from '../utils/api'
import { useAuthStore } from './auth'

export const useUserStore = defineStore('user', () => {
  const userDetails = ref(null)
  const assets = ref(null)
  const withdrawType = ref([])
  const withdrawSwitch = ref(false)
  const payList = ref(null)
  const mailCount = ref(0)
  const favoriteList = ref([])
  const favoriteIds = ref(new Set())
  const announcementList = ref([])
  const readAnnouncements = ref([])
  const experienceGold = ref(0)
  const trialPlayAmountType = ref('')
  const defaultAvatar = ref('')
  const isRechargeing = ref(false)
  const accountStatus = ref('NORMAL')
  const newWithdrawAccount = ref('')
  const isAlreadyDisplayRegisterReward = ref(false)
  const firstRechargeTime = ref('')

  const balance = computed(() => assets.value?.balance || 0)
  const hasAssetPassword = computed(() => !!assets.value?.isAssetPassword)
  const passwordSwitch = computed(() => assets.value?.passwordSwitch)
  const bindInfo = computed(() => {
    const info = []
    if (userDetails.value?.phoneNumber) info.push({ name: 'phone', value: userDetails.value.phoneNumber })
    if (userDetails.value?.email) info.push({ name: 'email', value: userDetails.value.email })
    return info
  })
  const unreadAnnouncementCount = computed(() => {
    let count = 0
    announcementList.value.forEach(group => {
      if (Array.isArray(group)) {
        group.forEach(item => {
          if (item.id && !readAnnouncements.value.includes(item.id)) count++
        })
      }
    })
    return count
  })

  function setUser(details) {
    userDetails.value = details
    _persistUser(details)
  }

  function setAssets(data) {
    assets.value = data
  }

  function setWithdrawType(types) {
    withdrawType.value = types || []
  }

  function setWithdrawSwitch(val) {
    withdrawSwitch.value = val
  }

  function setPayList(data) {
    payList.value = data
  }

  function setMailCount(count) {
    mailCount.value = count
  }

  function setExperienceGold(val) {
    if (typeof val === 'number') experienceGold.value = val
  }

  function setExperienceGoldType(type) {
    trialPlayAmountType.value = type
  }

  function setDefaultAvatar(avatar) {
    defaultAvatar.value = avatar
    try { localStorage.setItem('defaultAvatar', avatar) } catch {}
  }

  async function getDefaultAvatar() {
    if (!defaultAvatar.value) {
      defaultAvatar.value = localStorage.getItem('defaultAvatar') || ''
    }
    return defaultAvatar.value
  }

  async function fetchDetails() {
    try {
      const data = await trpcQuery('user.details')
      if (data) {
        userDetails.value = data
        _persistUser(data)
      }
    } catch (e) {
      console.warn('[UserStore] fetchDetails failed:', e.message)
    }
    return userDetails.value
  }

  async function fetchAssets() {
    try {
      const data = await trpcQuery('user.assets')
      if (data) assets.value = data
    } catch (e) {
      console.warn('[UserStore] fetchAssets failed:', e.message)
    }
    return assets.value
  }

  async function fetchWithdrawType() {
    try {
      const data = await trpcQuery('withdraw.type')
      if (data && 'withdrawType' in data) {
        withdrawSwitch.value = data.withdrawSwitch || false
        withdrawType.value = data.withdrawType || []
      }
    } catch (e) {
      console.warn('[UserStore] fetchWithdrawType failed:', e.message)
    }
    return withdrawType.value
  }

  async function fetchFavoriteList() {
    try {
      const auth = useAuthStore()
      if (!auth.isLoggedIn) return []
      const data = await trpcQuery('user.favoriteList', { page: 1, pageSize: 1000 })
      if (data?.favortieList) {
        favoriteList.value = data.favortieList
        _syncFavoriteIds()
      }
    } catch (e) {
      console.warn('[UserStore] fetchFavoriteList failed:', e.message)
    }
    return favoriteList.value
  }

  async function addFavorite(game, category) {
    const params = {
      gameType: game.gameType || (category && category.gameType),
      platformId: Number(game.platformId) || game.id,
      gameId: game.gameId || (!category && game.name ? Number(game.gameId) || Number(game.id) : undefined)
    }
    try {
      await trpcMutation('user.addFavorite', params)
    } catch {}
    favoriteList.value.push({
      id: 0,
      gameType: params.gameType,
      platformId: params.platformId,
      gameId: params.gameId,
      gameName: game.gameName || (game.type === 'game' ? game.name : null),
      gameLogo: game.logo,
      gameStatus: game.status
    })
    _syncFavoriteIds()
  }

  async function cancelFavorite(game, category) {
    const params = {
      gameType: game.gameType || (category && category.gameType),
      platformId: Number(game.platformId) || game.id,
      gameId: game.gameId || (!category && game.name ? Number(game.gameId) || Number(game.id) : undefined)
    }
    try {
      await trpcMutation('user.cancelFavorite', params)
    } catch {}
    favoriteList.value = favoriteList.value.filter(fav => {
      if (game.gameId) return fav.gameId !== game.gameId
      if (game.gameName) return fav.gameId !== game.id
      if (!fav.gameId && game.gameType === fav.gameType && game.platformId === fav.platformId) return false
      return true
    })
    _syncFavoriteIds()
  }

  function removeFavorite(gameId) {
    favoriteIds.value.delete(gameId)
  }

  function isFavorite(gameId) {
    return favoriteIds.value.has(gameId)
  }

  async function fetchUnreadMailCount() {
    try {
      const count = await trpcQuery('user.unreadMailCount')
      mailCount.value = count || 0
    } catch {
      mailCount.value = 0
    }
    return mailCount.value
  }

  async function fetchAnnouncements() {
    try {
      const data = await trpcQuery('announcement.loginOut')
      if (Array.isArray(data)) {
        announcementList.value = data
      }
    } catch {
      announcementList.value = []
    }
    return announcementList.value
  }

  function setReadAnnouncement(id) {
    if (!readAnnouncements.value.includes(id)) {
      readAnnouncements.value.push(id)
      _persistReadAnnouncements()
    }
  }

  function setAllReadAnnouncement(ids) {
    ids.forEach(id => {
      if (!readAnnouncements.value.includes(id)) readAnnouncements.value.push(id)
    })
    _persistReadAnnouncements()
  }

  function clearUser() {
    userDetails.value = null
    assets.value = null
    withdrawType.value = []
    withdrawSwitch.value = false
    payList.value = null
    mailCount.value = 0
    favoriteList.value = []
    favoriteIds.value = new Set()
    announcementList.value = []
    readAnnouncements.value = []
    experienceGold.value = 0
    trialPlayAmountType.value = ''
    isRechargeing.value = false
    isAlreadyDisplayRegisterReward.value = false
    try { localStorage.removeItem('cachedUser') } catch {}
  }

  function _syncFavoriteIds() {
    const ids = new Set()
    favoriteList.value.forEach(fav => {
      if (fav.gameId) ids.add(fav.gameId)
      if (fav.platformId) ids.add(fav.platformId)
    })
    favoriteIds.value = ids
  }

  function _persistUser(data) {
    try {
      localStorage.setItem('cachedUser', JSON.stringify(data))
    } catch {}
  }

  function _persistReadAnnouncements() {
    try {
      const userId = userDetails.value?.userId?.toString()
      if (!userId) return
      const stored = JSON.parse(localStorage.getItem('readAnnouncement') || '{}')
      stored[userId] = readAnnouncements.value
      localStorage.setItem('readAnnouncement', JSON.stringify(stored))
    } catch {}
  }

  async function loadReadAnnouncements() {
    try {
      const userId = userDetails.value?.userId?.toString()
      if (!userId) return
      const stored = JSON.parse(localStorage.getItem('readAnnouncement') || '{}')
      readAnnouncements.value = stored[userId] || []
    } catch {
      readAnnouncements.value = []
    }
  }

  return {
    userDetails,
    assets,
    withdrawType,
    withdrawSwitch,
    payList,
    mailCount,
    favoriteList,
    favoriteIds,
    announcementList,
    readAnnouncements,
    experienceGold,
    trialPlayAmountType,
    defaultAvatar,
    isRechargeing,
    accountStatus,
    newWithdrawAccount,
    isAlreadyDisplayRegisterReward,
    firstRechargeTime,
    balance,
    hasAssetPassword,
    passwordSwitch,
    bindInfo,
    unreadAnnouncementCount,
    setUser,
    setAssets,
    fetchDetails,
    fetchAssets,
    fetchWithdrawType,
    fetchFavoriteList,
    fetchUnreadMailCount,
    fetchAnnouncements,
    setWithdrawType,
    setWithdrawSwitch,
    setPayList,
    setMailCount,
    setExperienceGold,
    setExperienceGoldType,
    setDefaultAvatar,
    getDefaultAvatar,
    addFavorite,
    cancelFavorite,
    removeFavorite,
    isFavorite,
    setReadAnnouncement,
    setAllReadAnnouncement,
    loadReadAnnouncements,
    clearUser
  }
})
