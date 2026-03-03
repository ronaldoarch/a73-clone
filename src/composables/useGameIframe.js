/**
 * Composable para abrir jogos iGameWin em iframe (como LuxBet)
 */
import { ref, shallowRef } from 'vue'
import { igamewinApi } from '@/api/igamewin'
import { useToast } from '@/composables/useToast'

export function useGameIframe() {
  const toast = useToast()
  const gameUrl = shallowRef(null)
  const gameLoading = ref(false)

  function openGame(providerCode, gameCode) {
    const userCode = localStorage.getItem('account') || 'guest'
    gameLoading.value = true
    gameUrl.value = null
    toast.show('Carregando jogo...')
    igamewinApi.gameLaunch(userCode, providerCode, gameCode).then((data) => {
      gameLoading.value = false
      if (data?.status === 1 && data?.launch_url) {
        gameUrl.value = data.launch_url
      } else {
        const msg = data?.msg === 'IGAMEWIN_NOT_CONFIGURED'
          ? 'Configure as credenciais iGameWin no Admin → API de Jogos'
          : (data?.msg || 'Não foi possível abrir o jogo')
        toast.error(msg)
      }
    }).catch(() => {
      gameLoading.value = false
      toast.error('Erro ao carregar o jogo')
    })
  }

  function closeGame() {
    gameUrl.value = null
  }

  return { gameUrl, gameLoading, openGame, closeGame }
}
