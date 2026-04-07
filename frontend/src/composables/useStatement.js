import { ref, reactive, computed, watch, onMounted } from 'vue'
import { trpcQuery } from '../utils/api'
import { useAuthStore } from '../stores/auth'
import { useSystemStore } from '../stores/system'
import { formatCurrency, formatDate } from '../utils/formatters'
import { getPeriodRange } from '../utils/dateTime'

const MAIN_TYPES = [
  'recharge', 'withdraw', 'reward', 'commission', 'activity', 'game', 'adjustment'
]

const REMARK_TO_I18N = {
  ':day': 'mlmAgent.dayBord',
  ':week': 'mlmAgent.weekBord',
  ':month': 'mlmAgent.monthBord'
}

export function useStatement(t) {
  const authStore = useAuthStore()
  const systemStore = useSystemStore()

  const infiniteRef = ref(null)
  const loadMore = ref('more')
  const changeType = ref('all')
  const changeTwoType = ref('allDetails')
  const changeTime = ref('today')
  const isLoading = ref(false)

  const assetsChangeInfo = reactive({
    totalRechargeAmountChange: 0,
    totalWithdrawAmountChange: 0,
    totalRewardAmountChange: 0
  })

  const assetsChangeList = ref([])

  const params = reactive({
    page: 1,
    pageSize: 15,
    startTime: '',
    endTime: ''
  })

  const isToken = computed(() => !!authStore.token)
  const showEmpty = computed(() => !isToken.value || (loadMore.value === 'noMore' && !assetsChangeList.value.length))

  const merchantCy = computed(() => systemStore.tenantInfo?.merchantCy || 'R$')

  const currentTimeList = computed(() => {
    const range = systemStore.tenantInfo?.reportTimeRange
    return _buildTimeOptions(range)
  })

  const changeMainTypes = computed(() =>
    MAIN_TYPES.filter(type => !['game', 'other'].includes(type))
      .map(type => ({ type, label: t?.(`option.${type}`) || type }))
  )

  function _buildTimeOptions(range) {
    const options = ['today', 'yesterday', 'thisWeek', 'lastWeek', 'thisMonth']
    return options.map(name => ({ name, value: name }))
  }

  function _getDateRange(timeName) {
    try {
      return getPeriodRange(timeName)
    } catch {
      const now = new Date()
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      return { startTime: start.toISOString(), endTime: now.toISOString() }
    }
  }

  watch(() => changeTime.value, (val) => {
    const range = _getDateRange(val)
    params.startTime = range?.startTime || ''
    params.endTime = range?.endTime || ''
    params.page = 1
    loadMore.value = 'more'
    assetsChangeList.value = []
    fetchData()
  }, { immediate: true })

  watch(() => changeType.value, () => {
    changeTwoType.value = 'allDetails'
    params.page = 1
    loadMore.value = 'more'
    assetsChangeList.value = []
    fetchData()
  })

  watch(() => changeTwoType.value, (val) => {
    if (!val) return
    params.page = 1
    loadMore.value = 'more'
    assetsChangeList.value = []
    fetchData()
  })

  async function fetchData() {
    if (!isToken.value) return

    const query = {
      ...params,
      changeType: changeType.value === 'all' ? undefined : changeType.value,
      changeTwoType: changeTwoType.value === 'allDetails' ? undefined : changeTwoType.value
    }

    isLoading.value = true
    try {
      const result = await trpcQuery('report.assetsChange', query)
      if (!result) return

      Object.assign(assetsChangeInfo, {
        totalRechargeAmountChange: (result.totalRechargeAmountChange || 0) / 100,
        totalWithdrawAmountChange: Math.abs(result.totalWithdrawAmountChange || 0) / 100,
        totalRewardAmountChange: (result.totalRewardAmountChange || 0) / 100
      })

      const list = result.assetsChangeList || []
      if (params.page === 1) {
        assetsChangeList.value = list
      } else {
        assetsChangeList.value = [...assetsChangeList.value, ...list]
      }

      loadMore.value = list.length < params.pageSize ? 'noMore' : 'more'
    } catch {
      loadMore.value = 'noMore'
    } finally {
      isLoading.value = false
      infiniteRef.value?.$el?.complete()
    }
  }

  function ionInfinite() {
    if (loadMore.value === 'noMore') return
    params.page++
    fetchData()
  }

  function getBonusName(item) {
    if (!item.remark) return t?.(`option.${item.changeTwoType}`) || item.changeTwoType

    try {
      const parsed = JSON.parse(item.remark)
      if (parsed.type === 'invitee') return t?.('agent.inviteerReward') || 'Invitee Reward'
      if (parsed.type === 'inviter') return t?.('agent.referrerReward') || 'Referrer Reward'
    } catch {}

    for (const [key, i18nKey] of Object.entries(REMARK_TO_I18N)) {
      if (item.remark.includes(key)) return t?.(i18nKey) || key
    }

    return t?.(`option.${item.changeTwoType}`) || item.changeTwoType
  }

  function getStatusColor(status) {
    const success = ['SUCCESS', 'PAID', 'HAVE_ARRIVED']
    const fail = ['MANUALLY-END', 'TIMEOUT', 'CANCEL', 'LIMIT_EXCEED']

    if (success.includes(status)) return 'success'
    if (fail.includes(status)) return 'danger'
    return 'warning'
  }

  return {
    infiniteRef, loadMore, changeType, changeTwoType,
    changeTime, isLoading, assetsChangeInfo,
    assetsChangeList, params, isToken, showEmpty,
    merchantCy, currentTimeList, changeMainTypes,
    fetchData, ionInfinite, getBonusName, getStatusColor
  }
}
