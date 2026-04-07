import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { trpcQuery, trpcMutation } from '../utils/api'
import { useUserStore } from '../stores/user'
import { useSystemStore } from '../stores/system'
import { formatCurrency } from '../utils/formatters'

export function useRegisterReward() {
  const router = useRouter()
  const userStore = useUserStore()
  const systemStore = useSystemStore()

  const isSpinning = ref(false)
  const isStart = ref(false)
  const isNotWinner = ref(false)
  const multiple = ref(0)
  const deviceTypes = ref('')
  const prizes = ref([])
  const luckyRef = ref(null)

  let rewardResult = {}
  let wheelConfig = []
  let applyAppTypeList = []

  const merchantCy = computed(() => systemStore.tenantInfo?.merchantCy || 'R$')

  async function getRegisterRewardInfo() {
    try {
      const data = await trpcQuery('activity.registerRewardConfig', null)
      if (!data) return

      const { wheelReward = [], applyAppType = '', auditMultiple = 0 } = data
      wheelConfig = wheelReward
      multiple.value = auditMultiple
      applyAppTypeList = applyAppType ? applyAppType.split(',') : []

      deviceTypes.value = applyAppTypeList.join(', ')

      prizes.value = wheelReward.map(item => {
        const { rewardType, rewardValue } = item
        if (rewardType === 'RANDOM') {
          return { label: '🎁', type: 'random', value: 0 }
        }
        if (rewardType === 'THANKS') {
          return { label: 'THANKS', type: 'thanks', value: 0 }
        }
        return {
          label: `${merchantCy.value} ${formatCurrency(rewardValue)}`,
          type: 'fixed',
          value: rewardValue
        }
      })
    } catch (e) {
      console.warn('[RegisterReward] getInfo error:', e.message)
    }
  }

  async function startCallback() {
    if (isNotWinner.value) return
    isStart.value = true

    try {
      rewardResult = await trpcMutation('activity.applyRegisterReward', {}) || {}
      isNotWinner.value = (rewardResult?.awardAmount || 0) === 0
      userStore.fetchDetails?.().catch(() => {})
    } catch (e) {
      console.error('[RegisterReward] spin error:', e)
      isNotWinner.value = true
    }
  }

  function endCallback() {
    isStart.value = false
    setTimeout(() => { isSpinning.value = false }, 800)

    if (!rewardResult?.awardAmount) return

    if (rewardResult.isOpenDouble) {
      return { type: 'double', data: rewardResult }
    }

    return { type: 'single', data: rewardResult }
  }

  function navigate() {
    userStore.isAlreadyDisplayRegisterReward = true
    router.push('/main/inicio')
  }

  onUnmounted(() => {
    isNotWinner.value = false
  })

  return {
    isSpinning, isStart, isNotWinner,
    multiple, deviceTypes, prizes, luckyRef, merchantCy,
    getRegisterRewardInfo, startCallback, endCallback, navigate
  }
}
