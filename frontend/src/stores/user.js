import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { trpcQuery, trpcMutation } from '../utils/api'
import { useAuthStore } from './auth'

export const useUserStore = defineStore('user', () => {
  const details = ref(null)
  const assets = ref(null)
  const loading = ref(false)
  const vipInfo = ref(null)

  const balance = computed(() => assets.value?.balance ?? 0)
  const vipLevel = computed(() => vipInfo.value?.level ?? 0)
  const account = computed(() => details.value?.account ?? '')
  const userId = computed(() => details.value?.id ?? '')
  const avatar = computed(() => details.value?.avatar ?? '')
  const phone = computed(() => details.value?.phone ?? '')
  const email = computed(() => details.value?.email ?? '')
  const cpf = computed(() => details.value?.cpf ?? '')
  const hasCpf = computed(() => !!cpf.value)
  const hasPhone = computed(() => !!phone.value)
  const hasEmail = computed(() => !!email.value)

  async function fetchDetails() {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) return
    loading.value = true
    try {
      const data = await trpcQuery('user.details', null, { cache: true, cacheTTL: 30000 })
      if (data) {
        details.value = data
        auth.setUser(data)
      }
    } catch (e) {
      console.error('Failed to fetch user details:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchAssets() {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) return
    try {
      const data = await trpcQuery('user.assets', null, { cache: true, cacheTTL: 10000 })
      if (data) assets.value = data
    } catch (e) {
      console.error('Failed to fetch user assets:', e)
    }
  }

  async function fetchVipInfo() {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) return
    try {
      const data = await trpcQuery('vip.info', null, { cache: true, cacheTTL: 60000 })
      if (data) vipInfo.value = data
    } catch (e) {
      console.error('Failed to fetch VIP info:', e)
    }
  }

  async function updateAvatar(avatarId) {
    try {
      await trpcMutation('user.updateAvatar', { avatar: avatarId })
      if (details.value) details.value.avatar = avatarId
    } catch (e) {
      console.error('Failed to update avatar:', e)
      throw e
    }
  }

  function reset() {
    details.value = null
    assets.value = null
    vipInfo.value = null
  }

  return {
    details, assets, loading, vipInfo,
    balance, vipLevel, account, userId, avatar,
    phone, email, cpf, hasCpf, hasPhone, hasEmail,
    fetchDetails, fetchAssets, fetchVipInfo, updateAvatar, reset
  }
})
