<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="roleta-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="$router.back()">
            <ion-icon name="chevron-back" />
          </ion-button>
        </ion-buttons>
        <ion-title>Ganhe R$100,00 Grátis</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="roleta-content">
      <!-- Giros restantes + Convide amigos -->
      <div class="roleta-spins-card">
        <span class="roleta-spins-label">Giros Restantes: {{ spinsRemaining }}</span>
        <button type="button" class="roleta-invite-btn" @click="$router.push('/main/convidar/')">
          Convide amigos para ganhar +1 giro por indicação
          <ion-icon name="chevron-forward" />
        </button>
      </div>

      <!-- Roleta - imagem da roleta com fogo atrás -->
      <div class="roleta-wheel-wrap">
        <!-- Fogo/background (atrás da roleta) -->
        <img src="/images/roleta-wheel-fire.png" alt="" class="roleta-wheel-fire" />
        <!-- Imagem da roleta (gira) -->
        <div class="roleta-wheel-img-wrap" :class="{ spinning: isSpinning }" :style="wheelStyle">
          <img src="/images/roleta-wheel.png" alt="Roleta" class="roleta-wheel-img" />
        </div>
        <!-- Pointer -->
        <div class="roleta-pointer">
          <div class="roleta-pointer-gem" />
        </div>
        <div class="roleta-center-btn" @click="doSpin">
          <span class="roleta-center-num">{{ spinsRemaining }}</span>
        </div>
        <div class="roleta-banner">
          <span class="roleta-banner-text">Spin to Win Big !!!</span>
        </div>
      </div>

      <!-- Saldo e saque -->
      <div class="roleta-balance-wrap">
        <span class="roleta-balance">R$ {{ bonusBalanceFormatted }}</span>
        <p v-if="bonusBalance >= minWithdraw" class="roleta-min-msg roleta-msg-ok">
          Prêmio será coletado automaticamente ao abrir esta página
        </p>
        <p v-else class="roleta-min-msg">
          Você ainda precisa {{ (minWithdraw - bonusBalance).toFixed(2).replace('.', ',') }} para fazer um saque
        </p>
      </div>

      <!-- Tabs -->
      <div class="roleta-tabs">
        <button
          type="button"
          class="roleta-tab"
          :class="{ active: tabAtivo === 'relatorio' }"
          @click="tabAtivo = 'relatorio'"
        >
          Relatório
        </button>
        <button
          type="button"
          class="roleta-tab"
          :class="{ active: tabAtivo === 'referencia' }"
          @click="$router.push('/main/convidar/')"
        >
          Minha Referência
        </button>
      </div>

      <!-- Relatório -->
      <div v-show="tabAtivo === 'relatorio'" class="roleta-report">
        <div class="roleta-report-header">
          <span>ID</span>
          <span>Descrição</span>
          <span>Bônus</span>
        </div>
        <div v-if="!report.length" class="roleta-report-empty">Nenhum registro ainda</div>
        <div
          v-for="(r, i) in report"
          :key="i"
          class="roleta-report-row"
        >
          <span>{{ r.id }}</span>
          <span>{{ r.descricao }}</span>
          <span class="roleta-bonus-val">{{ r.bonus }}</span>
        </div>
      </div>

      <!-- Modal de resultado (ganhou ou perdeu) -->
      <Transition name="roleta-result">
        <div v-if="showResultModal" class="roleta-result-overlay" @click.self="closeResultModal">
          <div class="roleta-result-modal" :class="resultModalType">
            <div class="roleta-result-icon">
              <span v-if="resultModalType === 'win'">🎉</span>
              <span v-else>💫</span>
            </div>
            <h2 class="roleta-result-title">{{ resultModalType === 'win' ? 'Parabéns!' : 'Não foi dessa vez' }}</h2>
            <p class="roleta-result-msg">
              <template v-if="resultModalType === 'win'">
                Você ganhou <strong>R$ {{ resultPrizeFormatted }}</strong>!
                <span v-if="!getToken()" class="roleta-result-hint">Faça login para acumular prêmios.</span>
              </template>
              <template v-else>
                Tente novamente amanhã! A sorte pode estar do seu lado.
              </template>
            </p>
            <ion-button expand="block" class="roleta-result-btn" @click="closeResultModal">
              OK
            </ion-button>
          </div>
        </div>
      </Transition>

      <!-- Regras do evento -->
      <div class="roleta-regras">
        <h4>* Regras do evento *</h4>
        <ol>
          <li>Você terá 1 chances de ganhar um prêmio todos os dias. Você pode retirar o prêmio quando o valor do prêmio atingir o valor da recompensa. Convide amigos para ter mais chances de ganhar um prêmio;</li>
          <li>Cada atividade é válida por 3 dias. Você pode participar várias vezes. O prêmio em dinheiro será coletado automaticamente. Após o vencimento, o prêmio em dinheiro será inválido;</li>
          <li>O bônus (excluindo o principal) requer 0 vezes de apostas válidas para sacar;</li>
          <li>Somente o proprietário da conta pode realizar operações manuais normais, caso contrário, o bônus será cancelado ou deduzido, congelado ou até mesmo colocado na lista negra;</li>
          <li>Para evitar diferenças na compreensão do texto, a plataforma se reserva o direito final de interpretação desta atividade.</li>
        </ol>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon } from '@ionic/vue'
import { apiUrl } from '@/config/api'
import { useToast } from '@/composables/useToast'

// Ordem do backend: [30, 100, 50, 20, 0, 1000, 10, 5]
// Ordem na imagem (clockwise do topo): 1000, ????, ??, 30, 100, 50, ???, 😎
// Mapeamento: prizeIndex -> posição na imagem (0=topo)
const IMAGE_POSITION_FOR_PRIZE_INDEX = [3, 4, 5, 6, 7, 0, 1, 2]
const wheelSegments = [
  { label: '30,00', value: 30, color: '#7c3aed' },
  { label: '100,00', value: 100, color: '#2563eb' },
  { label: '50,00', value: 50, color: '#f97316' },
  { label: '???', value: 20, color: '#dc2626' },
  { label: '😎', value: 0, color: '#4c1d95' },
  { label: '1.000,00', value: 1000, color: '#22d3ee' },
  { label: '????', value: 10, color: '#16a34a' },
  { label: '??', value: 5, color: '#fbbf24' }
]

const bonusBalance = ref(0)
const spinsRemaining = ref(1)
const minWithdraw = ref(100)
const report = ref([])
const tabAtivo = ref('relatorio')
const isSpinning = ref(false)
const wheelRotation = ref(0)
const lastPrizeIndex = ref(0)
const showResultModal = ref(false)
const resultModalType = ref('win') // 'win' | 'lose'
const resultPrize = ref(0)

const resultPrizeFormatted = computed(() =>
  resultPrize.value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
)

const bonusBalanceFormatted = computed(() =>
  bonusBalance.value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
)

const wheelStyle = computed(() => ({
  transform: `rotate(${wheelRotation.value}deg)`
}))

const toast = useToast()

function getToken() {
  return localStorage.getItem('token')
}

async function loadRoleta() {
  const token = getToken()
  if (!token) {
    bonusBalance.value = 0
    spinsRemaining.value = 1
    report.value = []
    return
  }
  try {
    const r = await fetch(apiUrl('/api/roleta'), {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!r.ok) return
    const data = await r.json()
    bonusBalance.value = data.bonusBalance ?? 0
    spinsRemaining.value = data.spinsRemaining ?? 1
    minWithdraw.value = data.minWithdraw ?? 100
    report.value = data.report ?? []
    if (data.bonusCollected) {
      toast.success('Prêmio coletado automaticamente! Transferido para seu saldo.')
    }
  } catch (e) {
    console.error('load roleta:', e)
  }
}

async function doSpin() {
  if (isSpinning.value) return
  const token = getToken()
  if (token && spinsRemaining.value <= 0) {
    alert('Sem giros restantes. Volte amanhã!')
    return
  }
  if (!token && spinsRemaining.value <= 0) {
    spinsRemaining.value = 1
  }
  isSpinning.value = true
  let prizeIndex = 0
  let prize = 0
  try {
    if (token) {
      const r = await fetch(apiUrl('/api/roleta/spin'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: '{}'
      })
      const data = await r.json()
      if (!data.ok) {
        const msg = typeof data.error === 'object' ? (data.error?.message || 'Erro ao girar') : (data.error || 'Erro ao girar')
        alert(msg)
        isSpinning.value = false
        return
      }
      prizeIndex = data.prizeIndex ?? (wheelSegments.findIndex(s => s.value === data.prize) || 0)
      prize = data.prize
      bonusBalance.value = data.bonusBalance
      spinsRemaining.value = data.spinsRemaining
      await loadRoleta()
    } else {
      prizeIndex = Math.floor(Math.random() * wheelSegments.length)
      prize = wheelSegments[prizeIndex].value
      bonusBalance.value += prize
      spinsRemaining.value = Math.max(0, spinsRemaining.value - 1)
    }
    lastPrizeIndex.value = prizeIndex
    const segmentAngle = 360 / wheelSegments.length
    const imagePos = IMAGE_POSITION_FOR_PRIZE_INDEX[prizeIndex] ?? prizeIndex
    const targetAngle = 360 * 6 + (imagePos * segmentAngle + segmentAngle / 2)
    wheelRotation.value += targetAngle
    resultPrize.value = prize
    resultModalType.value = prize > 0 ? 'win' : 'lose'
    setTimeout(() => { showResultModal.value = true }, 4200)
  } catch (e) {
    alert('Erro ao girar. Tente novamente.')
  } finally {
    setTimeout(() => { isSpinning.value = false }, 4200)
  }
}

function closeResultModal() {
  showResultModal.value = false
}

onMounted(() => {
  loadRoleta()
})
</script>

<style scoped>
.roleta-toolbar {
  --background: linear-gradient(135deg, #4a148c 0%, #6a1b9a 100%);
  --color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.roleta-toolbar ion-button { --color: #fff; }

.roleta-content {
  --background: #4c1d95;
  background: linear-gradient(180deg, #310d54 0%, #4c1d95 30%, #5b21b6 70%, #310d54 100%);
}

.roleta-spins-card {
  margin: 16px;
  padding: 16px;
  background: rgba(91, 33, 182, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(168, 85, 247, 0.4);
}
.roleta-spins-label {
  display: block;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
}
.roleta-invite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 20px;
  background: #22c55e;
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

.roleta-wheel-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  min-height: 380px;
}
.roleta-wheel-fire {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 420px;
  height: 420px;
  object-fit: contain;
  z-index: 1;
  opacity: 0.95;
}
.roleta-wheel-img-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 320px;
  height: 320px;
  margin-top: -160px;
  margin-left: -160px;
  z-index: 2;
  transform-origin: 50% 50%;
  transition: transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99);
}
.roleta-wheel-img-wrap.spinning {
  transition: transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99);
}
.roleta-wheel-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.roleta-pointer {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 25;
}
.roleta-pointer-gem {
  width: 0;
  height: 0;
  border-left: 16px solid transparent;
  border-right: 16px solid transparent;
  border-top: 32px solid #fbbf24;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
  box-shadow: inset 0 4px 0 rgba(255,255,255,0.3);
}
.roleta-center-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #22c55e;
  border: 4px solid #fbbf24;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.6);
  z-index: 15;
}
.roleta-center-num {
  color: #fff;
  font-size: 1.8rem;
  font-weight: 900;
}
.roleta-banner {
  margin-top: -8px;
  padding: 10px 32px;
  background: linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%);
  color: #fbbf24;
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: 0.5px;
  border-radius: 0 0 24px 24px;
  border: 3px solid #fbbf24;
  border-top: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
  position: relative;
  z-index: 8;
}
.roleta-banner-text {
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5), 0 0 4px rgba(251,191,36,0.3);
}

.roleta-balance-wrap {
  text-align: center;
  padding: 16px;
}
.roleta-balance {
  display: block;
  color: #22c55e;
  font-size: 1.5rem;
  font-weight: 800;
}
.roleta-min-msg {
  color: #9ca3af;
  font-size: 0.9rem;
  margin: 8px 0 0 0;
}
.roleta-msg-ok {
  color: #34d399;
  font-weight: 600;
}

.roleta-tabs {
  display: flex;
  gap: 8px;
  padding: 0 16px 16px;
}
.roleta-tab {
  flex: 1;
  padding: 12px;
  background: rgba(91, 33, 182, 0.5);
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 12px;
  color: #e5e7eb;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}
.roleta-tab.active {
  background: rgba(168, 85, 247, 0.4);
  border-color: #fbbf24;
  color: #fef3c7;
}

.roleta-report {
  margin: 0 16px 20px;
  background: rgba(91, 33, 182, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  overflow: hidden;
}
.roleta-report-header {
  display: grid;
  grid-template-columns: 80px 1fr 100px;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(0,0,0,0.2);
  font-size: 0.8rem;
  color: #9ca3af;
}
.roleta-report-row {
  display: grid;
  grid-template-columns: 80px 1fr 100px;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgba(255,255,255,0.08);
  color: #e5e7eb;
  font-size: 0.9rem;
}
.roleta-bonus-val {
  color: #22c55e;
  font-weight: 600;
}
.roleta-report-empty {
  padding: 24px;
  text-align: center;
  color: #9ca3af;
}

/* Modal de resultado */
.roleta-result-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
  backdrop-filter: blur(4px);
}
.roleta-result-modal {
  width: 100%;
  max-width: 340px;
  padding: 32px 24px;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: roleta-result-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.roleta-result-modal.win {
  background: linear-gradient(180deg, #065f46 0%, #047857 50%, #059669 100%);
  border: 3px solid #34d399;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(52, 211, 153, 0.3);
}
.roleta-result-modal.lose {
  background: linear-gradient(180deg, #4c1d95 0%, #5b21b6 50%, #6d28d9 100%);
  border: 3px solid rgba(251, 191, 36, 0.5);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(168, 85, 247, 0.2);
}
.roleta-result-icon {
  font-size: 4rem;
  line-height: 1;
  margin-bottom: 12px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}
.roleta-result-title {
  color: #fff;
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
.roleta-result-msg {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.05rem;
  line-height: 1.5;
  margin: 0 0 24px 0;
}
.roleta-result-msg strong {
  color: #fef08a;
  font-size: 1.25rem;
}
.roleta-result-hint {
  display: block;
  font-size: 0.9rem;
  margin-top: 8px;
  opacity: 0.9;
}
.roleta-result-btn {
  --background: #fbbf24;
  --color: #1f2937;
  font-weight: 700;
  font-size: 1rem;
  --border-radius: 16px;
  height: 48px;
}
.roleta-result-btn::part(native) {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
}
@keyframes roleta-result-pop {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
.roleta-result-enter-active,
.roleta-result-leave-active {
  transition: opacity 0.3s ease;
}
.roleta-result-enter-from,
.roleta-result-leave-to {
  opacity: 0;
}
.roleta-result-enter-active .roleta-result-modal,
.roleta-result-leave-active .roleta-result-modal {
  transition: transform 0.3s ease;
}
.roleta-result-leave-to .roleta-result-modal {
  transform: scale(0.9);
}

.roleta-regras {
  margin: 0 16px 32px;
  padding: 20px;
  background: rgba(91, 33, 182, 0.3);
  border-radius: 16px;
  border: 1px solid rgba(168, 85, 247, 0.3);
}
.roleta-regras h4 {
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-align: center;
}
.roleta-regras ol {
  color: #e5e7eb;
  font-size: 0.85rem;
  line-height: 1.6;
  padding-left: 20px;
  margin: 0;
}
.roleta-regras li { margin-bottom: 10px; }
</style>
