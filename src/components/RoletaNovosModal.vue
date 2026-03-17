<template>
  <!--
  ESTRUTURA DA ROLETA (de cima para baixo, camadas):
  1. Overlay (fundo escuro) → Modal (caixa max 420px)
  2. Header: seta voltar + título "Exclusivo para Novos Usuários"
  3. Stage (área da roleta):
     - bg.png: fundo roxo (cover)
     - wheel-wrap: border.png (roleta do meio, z2), wheel giratório (z3), pointer (z10), GO (z15)
  4. Detalhes: content-bg.png + bot1/bot2 + título + 4 regras
  5. Modal resultado (ganhou/thanks) por cima quando ativo
  -->
  <Teleport to="body">
    <Transition name="roleta-novos">
      <div v-if="visible" class="roleta-novos-overlay">
        <div class="roleta-novos-modal">
        <!-- Barra superior -->
        <header class="roleta-novos-header">
          <IonButton fill="clear" class="roleta-novos-back" @click="close">
            <IonIcon name="chevron-back" />
          </IonButton>
          <h1 class="roleta-novos-title">Exclusivo para Novos Usuários</h1>
        </header>

        <!-- Área principal: content-bg (cortina) → base (bot1) → roda -->
        <div class="roleta-novos-stage">
          <img src="/images/roleta-novos/content-bg.png" alt="" class="roleta-novos-stage-bg" />
          <!-- Base da roleta: atrás da roda, na frente da cortina -->
          <div class="roleta-novos-wheel-base">
            <img src="/images/roleta-novos/bot1.png" alt="" class="roleta-novos-wheel-base-img" />
          </div>
          <div class="roleta-novos-wheel-wrap">
            <!-- Camada 1: anel de luz (guangquan1) -->
            <img src="/images/roleta-novos/guangquan1.png" alt="" class="roleta-novos-lights" />
            <!-- Camada 2: brilho central (guangxiao1) -->
            <img src="/images/roleta-novos/guangxiao1.png" alt="" class="roleta-novos-spotlight" />
            <!-- Camada 3: moldura (border) -->
            <img src="/images/roleta-novos/border.png" alt="" class="roleta-novos-border" />
            <!-- Roda giratória: wheel-bg + 8 segmentos -->
            <div
              class="roleta-novos-wheel"
              :class="{ spinning: isSpinning }"
              :style="{ transform: `rotate(${wheelRotation}deg)` }"
            >
              <img src="/images/roleta-novos/wheel-bg.png" alt="" class="roleta-novos-wheel-bg" />
              <div
                v-for="(seg, i) in segments"
                :key="i"
                class="roleta-novos-segment"
                :style="segmentStyle(i)"
              >
                <div class="roleta-novos-segment-inner" :style="itemRotateStyle(i)">
                  <template v-if="seg.value !== null">
                    <img :src="iconSrc(seg.icon)" :alt="seg.label" class="roleta-novos-segment-icon roleta-novos-segment-icon-coin" />
                    <span class="roleta-novos-segment-value">R$ {{ seg.value != null ? (seg.value % 1 === 0 ? seg.value : seg.value.toFixed(2).replace('.', ',')) : '' }}</span>
                  </template>
                  <template v-else>
                    <img :src="iconSrc(seg.icon)" :alt="seg.label" class="roleta-novos-segment-icon" />
                    <span class="roleta-novos-segment-label">{{ seg.label || 'Presente' }}</span>
                  </template>
                </div>
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
            <p v-if="spinError" class="roleta-novos-spin-error">{{ spinError }}</p>
          </div>
        </div>

        <!-- Palanque: painel vermelho com borda dourada, abaixo da roleta -->
        <div class="roleta-novos-details">
          <div class="roleta-novos-details-content">
            <!-- Imagem atrás de todo o bloco (título + lista), maior que todo o texto -->
            <img src="/images/roleta-novos/bot2.png" alt="" class="roleta-novos-details-content-bg" aria-hidden="true" />
            <h3 class="roleta-novos-details-title">
              <span class="roleta-novos-details-title-text">Detalhes do Evento</span>
            </h3>
            <ol class="roleta-novos-rules">
              <li>Novos usuários que se cadastrarem com um número de telefone e fornecerem seu CPF receberão recompensas personalizadas da plataforma.</li>
              <li>As recompensas devem ser reivindicadas manualmente, e as não reivindicadas permanecerão válidas até o encerramento ou término do evento. Após isso, elas expirarão.</li>
              <li>Os bônus fornecidos neste evento (excluindo o valor principal) exigem 1 vez de apostas válidas antes de serem retirados.</li>
              <li>Para evitar mal-entendidos, a plataforma reserva-se o direito de fazer a interpretação final desta atividade.</li>
            </ol>
          </div>
          <div class="roleta-novos-details-base" aria-hidden="true" />
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
              <IonButton expand="block" class="roleta-novos-result-btn" @click="closeResult">OK</IonButton>
            </div>
          </div>
        </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { IonButton, IonIcon } from '@ionic/vue'
import { apiUrl } from '@/config/api'

const DEFAULT_SEGMENTS = [
  { label: 'R$ 3,00', value: 3, icon: 'bonus', weight: 1 },
  { label: 'R$ 9,00', value: 9, icon: 'bonus', weight: 1 },
  { label: 'R$ 99,00', value: 99, icon: 'bonus', weight: 1 },
  { label: 'R$ 22,00', value: 22, icon: 'bonus', weight: 1 },
  { label: 'R$ 45,00', value: 45, icon: 'bonus', weight: 1 },
  { label: 'Thanks', value: null, icon: 'thks', weight: 1 },
  { label: 'Presente', value: null, icon: 'gift_box', weight: 1 },
  { label: 'Presente', value: null, icon: 'gift_box', weight: 1 }
]

const props = defineProps({
  show: { type: Boolean, default: false },
  segments: { type: Array, default: () => [] }
})

const emit = defineEmits(['close'])

const visible = ref(false)
watch(() => props.show, (v) => { visible.value = v }, { immediate: true })

const segments = ref([...DEFAULT_SEGMENTS])

watch(visible, async (v) => {
  if (v) {
    try {
      const r = await fetch(apiUrl('/api/roleta/config'), { cache: 'no-store' })
      const data = await r.json()
      if (Array.isArray(data.segments) && data.segments.length === 8) {
        segments.value = data.segments.map(s => {
          const label = String(s?.label ?? '')
          const val = Number(s?.value) ?? 0
          let icon = 'bonus'
          if (label && /^\?+$/.test(label)) icon = 'gift_box'
          else if (val === 0) icon = 'thks'
          return {
            label: label || 'Prêmio',
            value: val === 0 ? null : val,
            icon,
            weight: Math.max(0, parseInt(s?.weight, 10) || 1)
          }
        })
      }
    } catch (e) {
      segments.value = [...DEFAULT_SEGMENTS]
    }
  }
})

const iconSrc = (icon) => `/images/roleta-novos/${icon}.png`

const wheelRotation = ref(0)
const isSpinning = ref(false)
const showResult = ref(false)
const resultPrize = ref(0)
const spinError = ref('')

const resultPrizeFormatted = computed(() =>
  resultPrize.value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
)

const segmentAngle = computed(() => 360 / (segments.value.length || 8))

function segmentStyle(index) {
  const deg = index * segmentAngle.value
  return {
    transform: `rotate(${deg}deg)`,
    transformOrigin: '0% 100%'
  }
}

/** Ajuste por segmento para todos ficarem virados para o centro (GO). Índice 5 (Thanks/emoji feliz) = referência, não alterar. */
const SEGMENT_OFFSETS = [90, -230, -190, -150, -110, -55, -15, 30]

function itemRotateStyle(index) {
  const angle = segmentAngle.value
  const segCenterDeg = index * angle + angle / 2
  const offset = SEGMENT_OFFSETS[index] ?? -55
  const rotateToCenter = 180 - segCenterDeg + offset
  return {
    transform: `translate(6%, 10%) rotate(${rotateToCenter}deg)`,
    transformOrigin: '50% 50%'
  }
}

function close() {
  visible.value = false
  emit('close')
}

async function doSpin() {
  if (isSpinning.value) return
  spinError.value = ''
  const list = segments.value
  if (!list.length) return
  const token = localStorage.getItem('token')
  if (!token || String(token).startsWith('demo-')) {
    spinError.value = 'Faça login para participar da roleta de novos usuários.'
    return
  }
  isSpinning.value = true
  try {
    const r = await fetch(apiUrl('/api/roleta-novos/spin'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({})
    })
    const data = await r.json().catch(() => ({}))
    const errMsg = typeof data?.error === 'string' ? data.error : data?.error?.message
    if (!r.ok || !data?.ok || errMsg) {
      spinError.value = errMsg || 'Erro ao girar. Tente novamente.'
      isSpinning.value = false
      return
    }
    const prizeIndex = data.prizeIndex ?? Math.floor(Math.random() * list.length)
    const prize = data.prize ?? 0
    resultPrize.value = prize

    const angle = segmentAngle.value
    const segCenterDeg = prizeIndex * angle + angle / 2
    const targetAngle = 360 * 6 + (360 - segCenterDeg)
    await nextTick()
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        wheelRotation.value += targetAngle
      })
    })

    setTimeout(() => {
      showResult.value = true
    }, 4200)

    setTimeout(() => {
      isSpinning.value = false
    }, 4200)
  } catch (e) {
    spinError.value = e?.message || 'Erro de conexão. Tente novamente.'
    isSpinning.value = false
  }
}

function closeResult() {
  showResult.value = false
  // Fecha o modal da roleta imediatamente após o usuário ver o resultado
  close()
}
</script>

<style scoped>
/* Mesmo tamanho da home: centralizado com margens laterais 16px */
.roleta-novos-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow-y: auto;
  box-sizing: border-box;
}
.roleta-novos-modal {
  width: min(calc(100vw - 32px), 420px);
  max-width: 420px;
  max-height: min(calc(100vh - 32px), 700px);
  background: #2d1b4e;
  border-radius: 16px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  box-sizing: border-box;
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
  min-height: 380px;
  max-height: 460px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
/* content-bg atrás da roleta (stage) */
.roleta-novos-stage-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
  z-index: 0;
}
.roleta-novos-wheel-wrap {
  position: relative;
  width: 380px;
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
/* Anel de luz (guangquan1) atrás da roda */
.roleta-novos-lights {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  pointer-events: none;
  z-index: 0;
}
/* Brilho central (guangxiao1) */
.roleta-novos-spotlight {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 110%;
  height: 110%;
  object-fit: contain;
  object-position: center;
  opacity: 0.9;
  pointer-events: none;
  z-index: 1;
}
/* Moldura (border) */
.roleta-novos-border {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  pointer-events: none;
  z-index: 2;
}
/* Roda (wheel-bg + segmentos) centralizada no wrap - 82% */
.roleta-novos-wheel {
  position: absolute;
  left: 9%;
  top: 9%;
  width: 82%;
  height: 82%;
  border-radius: 50%;
  overflow: hidden;
  transform-origin: 50% 50%;
  transition: transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99);
  will-change: transform;
  background: transparent;
  box-shadow: 0 0 20px rgba(0,0,0,0.2);
  z-index: 3;
}
.roleta-novos-wheel-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  pointer-events: none;
  z-index: 0;
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
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: none;
  box-sizing: border-box;
  z-index: 1;
  /* 45° wedge */
  clip-path: polygon(0% 100%, 100% 100%, 70.71% 0%);
}
.roleta-novos-segment-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 0;
  width: 100%;
  padding: 4px;
}
.roleta-novos-segment:nth-child(odd) {
  background: transparent;
}
.roleta-novos-segment-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
}
.roleta-novos-segment-icon-coin {
  width: 22px;
  height: 22px;
}
.roleta-novos-segment-value {
  font-size: 0.65rem;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.8), 0 0 1px rgba(0,0,0,0.9);
  white-space: nowrap;
  letter-spacing: 0.02em;
  text-align: center;
}
.roleta-novos-segment-label {
  font-size: 0.55rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.8), 0 0 1px rgba(0,0,0,0.9);
  white-space: nowrap;
  text-align: center;
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
.roleta-novos-spin-error {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  font-size: 0.75rem;
  color: #ff6b6b;
  text-align: center;
  white-space: nowrap;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
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

/* Base da roleta (bot1) – em baixo da roda, tipo pedestal */
/* Base: atrás da roleta (z 1), na frente da cortina (z 0) */
.roleta-novos-wheel-base {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 16px 8px;
  pointer-events: none;
}
/* Base (bot1) encaixada na largura do stage */
.roleta-novos-wheel-base-img {
  width: 100%;
  max-width: 300px;
  height: auto;
  object-fit: contain;
  object-position: center;
}

/* Área dos detalhes: sem faixa vermelha, só a imagem (bot2) no título */
.roleta-novos-details {
  position: relative;
  margin: 0 16px 24px;
  flex-shrink: 0;
  min-height: 120px;
  border-radius: 12px;
  overflow: visible;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}
.roleta-novos-details-content {
  position: relative;
  padding: 16px 16px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  pointer-events: none;
}
/* Imagem (bot2) encaixada no bloco de conteúdo */
.roleta-novos-details-content-bg {
  position: absolute;
  left: 50%;
  top: calc(50% - 24px);
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 300px;
  height: auto;
  object-fit: contain;
  object-position: center;
  z-index: 0;
}
/* Texto contido na faixa da imagem (bot2): mesma largura útil */
.roleta-novos-details-title {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 10px 0;
  width: 100%;
  max-width: 250px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.4);
}
.roleta-novos-details-title-text {
  position: relative;
  z-index: 2;
  text-align: center;
}
.roleta-novos-rules {
  position: relative;
  z-index: 2;
  margin: 0;
  padding-left: 18px;
  padding-right: 8px;
  color: #fff;
  font-size: 0.65rem;
  line-height: 1.4;
  text-align: left;
  width: 100%;
  max-width: 250px;
  box-sizing: border-box;
  word-wrap: break-word;
  overflow-wrap: break-word;
  text-shadow: 0 1px 1px rgba(0,0,0,0.3);
}
.roleta-novos-rules li {
  margin-bottom: 6px;
}
/* Faixa base azul/dourada no pé do palanque */
.roleta-novos-details-base {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(180deg, #1a237e 0%, #283593 50%, #d4af37 100%);
  border-radius: 0 0 8px 8px;
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
