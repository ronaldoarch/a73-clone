<template>
  <Teleport to="body">
    <Transition name="roleta-novos">
      <div v-if="visible" class="roleta-novos-overlay">
        <!-- Barra superior -->
        <header class="roleta-novos-header">
          <ion-button fill="clear" class="roleta-novos-back" @click="close">
            <ion-icon name="chevron-back" />
          </ion-button>
          <h1 class="roleta-novos-title">Exclusivo para Novos Usuários</h1>
        </header>

        <!-- Área principal: fundo + luzes + roleta -->
        <div class="roleta-novos-stage">
          <img src="/images/roleta-novos/bg.png" alt="" class="roleta-novos-bg" />
          <img src="/images/roleta-novos/guangxiao1.png" alt="" class="roleta-novos-spotlight" />
          <img src="/images/roleta-novos/guangquan1.png" alt="" class="roleta-novos-lights" />

          <div class="roleta-novos-wheel-wrap">
            <!-- Moldura/borda da roleta -->
            <img src="/images/roleta-novos/border.png" alt="" class="roleta-novos-border" />
            <!-- Roleta giratória (8 segmentos) -->
            <div
              class="roleta-novos-wheel"
              :class="{ spinning: isSpinning }"
              :style="{ transform: `rotate(${wheelRotation}deg)` }"
            >
              <div
                v-for="(seg, i) in segments"
                :key="i"
                class="roleta-novos-segment"
                :style="segmentStyle(i)"
              >
                <template v-if="seg.value !== null">
                  <img :src="iconSrc(seg.icon)" :alt="seg.label" class="roleta-novos-segment-icon roleta-novos-segment-icon-coin" />
                  <span class="roleta-novos-segment-value">R$ {{ seg.value }}</span>
                </template>
                <template v-else>
                  <img :src="iconSrc(seg.icon)" :alt="seg.label" class="roleta-novos-segment-icon" />
                  <span v-if="seg.icon === 'thks'" class="roleta-novos-segment-label">{{ seg.label }}</span>
                </template>
              </div>
            </div>
            <!-- Ponteiro no topo -->
            <img src="/images/roleta-novos/pointer.png" alt="" class="roleta-novos-pointer" />
            <!-- Botão GO no centro -->
            <button
              type="button"
              class="roleta-novos-go-btn"
              :disabled="isSpinning"
              @click="doSpin"
            >
              <img src="/images/roleta-novos/button.png" alt="" class="roleta-novos-go-img" />
              <span class="roleta-novos-go-text">GO</span>
            </button>
          </div>
        </div>

        <!-- Detalhes do Evento (banner vermelho com regras) -->
        <div class="roleta-novos-details">
          <img src="/images/roleta-novos/content-bg.png" alt="" class="roleta-novos-details-bg" />
          <div class="roleta-novos-details-content">
            <h3 class="roleta-novos-details-title">
              <img src="/images/roleta-novos/bot1.png" alt="" class="roleta-novos-coin" />
              Detalhes do Evento
              <img src="/images/roleta-novos/bot2.png" alt="" class="roleta-novos-coin" />
            </h3>
            <ol class="roleta-novos-rules">
              <li>Novos usuários que se cadastrarem com um número de telefone e fornecerem seu CPF receberão recompensas personalizadas da plataforma.</li>
              <li>As recompensas devem ser reivindicadas manualmente, e as não reivindicadas permanecerão válidas até o encerramento ou término do evento. Após isso, elas expirarão.</li>
              <li>Os bônus fornecidos neste evento (excluindo o valor principal) exigem 1 vez de apostas válidas antes de serem retirados.</li>
              <li>Para evitar mal-entendidos, a plataforma reserva-se o direito de fazer a interpretação final desta atividade.</li>
            </ol>
          </div>
        </div>

        <!-- Modal de resultado (ganhou / thanks) -->
        <Transition name="roleta-novos-result">
          <div v-if="showResult" class="roleta-novos-result-overlay" @click.self="closeResult">
            <div class="roleta-novos-result-modal" :class="resultPrize > 0 ? 'win' : 'thanks'">
              <div class="roleta-novos-result-icon">{{ resultPrize > 0 ? '🎉' : '😉' }}</div>
              <h2 class="roleta-novos-result-title">{{ resultPrize > 0 ? 'Parabéns!' : 'Thanks' }}</h2>
              <p class="roleta-novos-result-msg">
                <template v-if="resultPrize > 0">
                  Você ganhou <strong>R$ {{ resultPrizeFormatted }}</strong>!
                </template>
                <template v-else>
                  Não foi dessa vez. Tente na próxima!
                </template>
              </p>
              <ion-button expand="block" class="roleta-novos-result-btn" @click="closeResult">OK</ion-button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { IonButton, IonIcon } from '@ionic/vue'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const visible = ref(false)
watch(() => props.show, (v) => { visible.value = v }, { immediate: true })

// 8 segmentos: R$ 3, 9, 99, 22, 45, Thanks, Presente, Presente
// icon: 'bonus' (moedas), 'thks' (thanks), 'gift_box' (presente)
const segments = [
  { label: 'R$ 3,00', value: 3, icon: 'bonus' },
  { label: 'R$ 9,00', value: 9, icon: 'bonus' },
  { label: 'R$ 99,00', value: 99, icon: 'bonus' },
  { label: 'R$ 22,00', value: 22, icon: 'bonus' },
  { label: 'R$ 45,00', value: 45, icon: 'bonus' },
  { label: 'Thanks', value: null, icon: 'thks' },
  { label: 'Presente', value: null, icon: 'gift_box' },
  { label: 'Presente', value: null, icon: 'gift_box' }
]

const iconSrc = (icon) => `/images/roleta-novos/${icon}.png`

const wheelRotation = ref(0)
const isSpinning = ref(false)
const showResult = ref(false)
const resultPrize = ref(0)

const resultPrizeFormatted = computed(() =>
  resultPrize.value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
)

const segmentAngle = 360 / segments.length

function segmentStyle(index) {
  const deg = index * segmentAngle
  return {
    transform: `rotate(${deg}deg)`
  }
}

function close() {
  visible.value = false
  emit('close')
}

function doSpin() {
  if (isSpinning.value) return
  isSpinning.value = true
  const prizeIndex = Math.floor(Math.random() * segments.length)
  const seg = segments[prizeIndex]
  const prize = seg.value != null ? seg.value : 0
  resultPrize.value = prize

  const targetAngle = 360 * 6 + (prizeIndex * segmentAngle + segmentAngle / 2)
  wheelRotation.value += targetAngle

  setTimeout(() => {
    showResult.value = true
  }, 4200)

  setTimeout(() => {
    isSpinning.value = false
  }, 4200)
}

function closeResult() {
  showResult.value = false
}
</script>

<style scoped>
.roleta-novos-overlay {
  position: fixed;
  inset: 0;
  background: #2d1b4e;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.roleta-novos-header {
  display: flex;
  align-items: center;
  min-height: 56px;
  padding: 8px 0;
  background: linear-gradient(135deg, #4a148c 0%, #6a1b9a 100%);
  color: #fff;
  flex-shrink: 0;
}
.roleta-novos-back {
  --color: #fff;
  margin: 0 4px;
}
.roleta-novos-title {
  flex: 1;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  padding-right: 48px;
}

.roleta-novos-stage {
  position: relative;
  flex: 1;
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
}
.roleta-novos-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
.roleta-novos-spotlight {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 80%;
  max-height: 400px;
  width: auto;
  object-fit: contain;
  opacity: 0.9;
  pointer-events: none;
}
.roleta-novos-lights {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 500px;
  height: auto;
  object-fit: contain;
  pointer-events: none;
}

.roleta-novos-wheel-wrap {
  position: relative;
  width: 280px;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.roleta-novos-border {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}
.roleta-novos-wheel {
  position: absolute;
  width: 82%;
  height: 82%;
  border-radius: 50%;
  overflow: hidden;
  transform-origin: 50% 50%;
  transition: transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99);
  background: linear-gradient(135deg, #3b82f6 0%, #93c5fd 50%, #3b82f6 100%);
  box-shadow: inset 0 0 0 4px rgba(255,255,255,0.3), 0 0 20px rgba(0,0,0,0.3);
}
.roleta-novos-wheel.spinning {
  transition: transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99);
}
.roleta-novos-segment {
  position: absolute;
  left: 50%;
  top: 0;
  width: 50%;
  height: 50%;
  margin-left: 0;
  transform-origin: 0% 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 8%;
  gap: 2px;
  background: rgba(59, 130, 246, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-sizing: border-box;
  /* 45° wedge: center (0,100%) -> right (100%,100%) -> 45° (70.7%, 0%) */
  clip-path: polygon(0% 100%, 100% 100%, 70.71% 0%);
}
.roleta-novos-segment:nth-child(odd) {
  background: rgba(30, 64, 175, 0.9);
}
.roleta-novos-segment-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
  flex-shrink: 0;
}
.roleta-novos-segment-icon-coin {
  width: 20px;
  height: 20px;
}
.roleta-novos-segment-value {
  font-size: 0.6rem;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.6);
  white-space: nowrap;
}
.roleta-novos-segment-label {
  font-size: 0.5rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.6);
  white-space: nowrap;
}

.roleta-novos-pointer {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: auto;
  z-index: 10;
  pointer-events: none;
}
.roleta-novos-go-btn {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 72px;
  height: 72px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: center;
}
.roleta-novos-go-btn:disabled {
  cursor: not-allowed;
  opacity: 0.9;
}
.roleta-novos-go-img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.roleta-novos-go-text {
  position: relative;
  z-index: 1;
  font-size: 1.5rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
}

.roleta-novos-details {
  position: relative;
  margin: 0 16px 24px;
  flex-shrink: 0;
}
.roleta-novos-details-bg {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 12px;
}
.roleta-novos-details-content {
  position: absolute;
  inset: 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24px 20px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  pointer-events: none;
}
.roleta-novos-details-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}
.roleta-novos-coin {
  width: 28px;
  height: auto;
  object-fit: contain;
}
.roleta-novos-rules {
  margin: 0;
  padding-left: 20px;
  color: #fff;
  font-size: 0.8rem;
  line-height: 1.5;
  text-align: left;
  width: 100%;
  max-width: 100%;
}
.roleta-novos-rules li {
  margin-bottom: 8px;
}

/* Result modal */
.roleta-novos-result-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 24px;
  backdrop-filter: blur(4px);
}
.roleta-novos-result-modal {
  width: 100%;
  max-width: 320px;
  padding: 28px 20px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
.roleta-novos-result-modal.win {
  background: linear-gradient(180deg, #065f46 0%, #047857 50%, #059669 100%);
  border: 3px solid #34d399;
}
.roleta-novos-result-modal.thanks {
  background: linear-gradient(180deg, #4c1d95 0%, #5b21b6 100%);
  border: 3px solid rgba(251, 191, 36, 0.5);
}
.roleta-novos-result-icon {
  font-size: 3.5rem;
  margin-bottom: 12px;
}
.roleta-novos-result-title {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 8px 0;
}
.roleta-novos-result-msg {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1rem;
  margin: 0 0 20px 0;
}
.roleta-novos-result-msg strong {
  color: #fef08a;
}
.roleta-novos-result-btn {
  --background: #fbbf24;
  --color: #1f2937;
  font-weight: 700;
  --border-radius: 12px;
}

/* Transitions */
.roleta-novos-enter-active,
.roleta-novos-leave-active {
  transition: opacity 0.25s ease;
}
.roleta-novos-enter-from,
.roleta-novos-leave-to {
  opacity: 0;
}

.roleta-novos-result-enter-active,
.roleta-novos-result-leave-active {
  transition: opacity 0.2s ease;
}
.roleta-novos-result-enter-from,
.roleta-novos-result-leave-to {
  opacity: 0;
}
</style>
