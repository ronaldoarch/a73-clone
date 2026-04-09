<template>
  <div class="nurp" :class="{ 'nurp--modal': variant === 'modal' }">
    <p class="nurp-hint" :class="{ 'nurp-hint--modal': variant === 'modal' }">
      1 giro exclusivo após o cadastro. Toque em <strong>GO</strong> para sortear.
    </p>

    <p v-if="statusMessage" class="status-banner">{{ statusMessage }}</p>

    <div class="wheel-stage">
      <div class="wheel-visual">
        <div
          v-if="isSpinning"
          class="wheel-halo"
          :style="{ backgroundImage: `url(${assets.glowRing})` }"
          aria-hidden="true"
        />

        <div class="wheel-frame">
        <!-- Moldura por baixo: muitos PNGs têm centro opaco e tapavam o disco e os prémios -->
        <div class="wheel-border" :style="{ backgroundImage: `url(${assets.wheelBorder})` }" aria-hidden="true" />

        <div
          class="wheel-rotor"
          :style="rotorStyle"
          @transitionend.self="onRotorTransitionEnd"
        >
          <div class="wheel-disc" :style="{ backgroundImage: `url(${assets.wheelBg})` }" aria-hidden="true" />
          <div
            v-for="si in 8"
            :key="si - 1"
            class="seg-slot"
            :style="segOuterStyle(si - 1)"
          >
            <div class="seg-inner" :style="segInnerStyle(si - 1)">
              <img class="seg-ico" :src="segmentIconAt(si - 1)" alt="" decoding="async" />
              <span
                class="seg-lbl"
                :class="{ 'seg-lbl--vert': labelVertical(si - 1) }"
              >{{ segmentText(si - 1) }}</span>
            </div>
          </div>
        </div>

        <img class="wheel-pointer" :src="assets.pointer" alt="" decoding="async" />

        <button
          type="button"
          class="wheel-go"
          :class="{ 'wheel-go--busy': isSpinning }"
          :disabled="centerDisabled"
          @click="spin"
        >
          <div
            v-if="isSpinning"
            class="wheel-go-burst"
            :style="{ backgroundImage: `url(${assets.glowBurst})` }"
            aria-hidden="true"
          />
          <img
            v-show="!isSpinning"
            class="wheel-go-img"
            :src="assets.goButton"
            alt="GO"
            decoding="async"
          />
          <span v-if="isSpinning" class="wheel-go-dots">…</span>
        </button>
        </div>
      </div>

      <div class="wheel-deco-strip">
        <img class="wheel-bot1" :src="assets.decoBot1" alt="" decoding="async" aria-hidden="true" />
        <img class="wheel-bot2" :src="assets.decoBot2" alt="" decoding="async" aria-hidden="true" />
        <section
          class="nurp-event-details nurp-event-details--on-bot2"
          aria-labelledby="nurp-event-details-title"
        >
          <h2 id="nurp-event-details-title" class="nurp-event-details__title">
            Detalhes do Evento
          </h2>
          <ol class="nurp-event-details__list">
            <li>
              Novos usuários que se cadastrarem com um número de telefone e fornecerem seu CPF receberão
              recompensas personalizadas da plataforma.
            </li>
            <li>
              As recompensas devem ser reivindicadas manualmente na área de promoções, e as não reivindicadas
              permanecerão válidas até o encerramento ou término do evento. Após isso, elas expirarão.
            </li>
            <li>
              Os bônus fornecidos neste evento (excluindo o valor principal) exigem 1x (uma vez) em apostas
              válidas antes de serem retirados.
            </li>
            <li>
              Para evitar mal-entendidos, a plataforma reserva-se o direito de fazer a interpretação final desta
              atividade.
            </li>
          </ol>
        </section>
      </div>
    </div>

    <p v-if="!hasSpunLocal && auth.token && novosEligible" class="grid-tip">Toque em <strong>GO</strong> para girar.</p>
    <p v-else-if="hasSpunLocal && wonLine" class="grid-tip won">{{ wonLine }}</p>

    <button v-if="!auth.token" type="button" class="login-cta" @click="router.push('/login')">Entrar para girar</button>
    <button
      v-else-if="!novosEligible && !hasSpunLocal"
      type="button"
      class="login-cta login-cta--ghost"
      @click="router.push('/activity/LuckyWheel')"
    >
      Ir para a roleta diária
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { toastError } from '../utils/toast'
import { fetchRoletaConfig, fetchRoletaNovosStatus, postRoletaNovosSpin } from '../utils/roletaApi'
import { NOVOS_ROULETTE_ASSETS } from '../constants/novosRouletteAssets'

const assets = NOVOS_ROULETTE_ASSETS

/** Centro de cada fatia no disco, sentido horário a partir do topo (12h), alinhado à grelha 3×3 antiga. */
const SEGMENT_ANGLE_DEG = [315, 0, 45, 90, 135, 180, 225, 270]
const SPIN_EXTRA_TURNS = 5

const props = defineProps({
  variant: { type: String, default: 'page' },
})

const emit = defineEmits(['spin-complete'])

const router = useRouter()
const auth = useAuthStore()

const segments = ref([])
const novosEligible = ref(false)
const novosAlreadyUsed = ref(false)
const configLoaded = ref(false)

const rotationDeg = ref(0)
const spinTransition = ref('none')
const isSpinning = ref(false)
const hasSpunLocal = ref(false)
const wonLine = ref('')

const pendingSpinResult = ref(null)
const spinAwaitingEnd = ref(false)
let spinFallbackTimer = null

const eightSegs = computed(() => {
  const s = segments.value
  if (!Array.isArray(s) || s.length === 0) {
    return Array.from({ length: 8 }, () => ({ label: '???', value: 0 }))
  }
  const pad = [...s.slice(0, 8)]
  while (pad.length < 8) pad.push({ label: '???', value: 0 })
  return pad
})

const rotorStyle = computed(() => ({
  transform: `rotate(${rotationDeg.value}deg)`,
  transition: spinTransition.value,
  WebkitTransition: spinTransition.value,
}))

function formatSegmentLabel(seg) {
  const raw = String(seg?.label ?? '').trim()
  if (raw) {
    if (/^\?+$/.test(raw) || /[\u{1F300}-\u{1FAFF}]/u.test(raw)) return raw
    return raw.replace(/^r\$\s*/i, 'R$ ')
  }
  const v = Number(seg?.value)
  if (Number.isFinite(v) && v > 0) {
    return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return '???'
}

function segmentText(si) {
  return formatSegmentLabel(eightSegs.value[si])
}

function segmentIconAt(si) {
  const raw = segmentText(si)
  const t = raw.toLowerCase()
  if (/thanks|obrig|thks/.test(t)) return assets.iconThanks
  if (/r\$/.test(t) || (/\d/.test(t) && !/^\?+$/.test(raw))) return assets.iconBonus
  return assets.iconGift
}

function labelVertical(si) {
  return /thanks|obrig/i.test(segmentText(si))
}

function segmentAngleAt(si) {
  return SEGMENT_ANGLE_DEG[si] ?? 0
}

function segOuterStyle(si) {
  const d = segmentAngleAt(si)
  /* Valores mais negativos = prémios mais perto da borda (menos “tudo no meio”) */
  return { transform: `rotate(${d}deg) translateY(-84%)` }
}

function segInnerStyle(si) {
  const d = segmentAngleAt(si)
  return { transform: `rotate(${-d}deg)` }
}

function computeSpinDelta(prizeIndex) {
  const angle = SEGMENT_ANGLE_DEG[prizeIndex] ?? 0
  const cur = rotationDeg.value
  const sumNorm = ((angle + cur) % 360 + 360) % 360
  let add = (360 - sumNorm) % 360
  if (add === 0) add = 360
  return SPIN_EXTRA_TURNS * 360 + add
}

const statusMessage = computed(() => {
  if (!auth.token) return ''
  if (novosAlreadyUsed.value && !novosEligible.value) {
    return 'Você já utilizou sua chance na roleta exclusiva de novos usuários.'
  }
  return ''
})

const centerDisabled = computed(() => {
  if (!auth.token) return true
  if (!novosEligible.value || hasSpunLocal.value) return true
  if (!configLoaded.value) return true
  /* API pode devolver 2–8 segmentos; o UI preenche até 8 */
  if (!Array.isArray(segments.value) || segments.value.length < 2) return true
  return false
})

function applySpinResult() {
  const res = pendingSpinResult.value
  pendingSpinResult.value = null
  if (!res) return
  const amount = Number(res.amount) || 0
  const prizeIndex = res.prizeIndex
  wonLine.value =
    amount > 0
      ? `Você ganhou R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}! Crédito no saldo bônus da roleta.`
      : 'Obrigado por participar! Continue na roleta diária para mais prêmios.'
  isSpinning.value = false
  hasSpunLocal.value = true
  novosEligible.value = false
  novosAlreadyUsed.value = true
  emit('spin-complete', { amount, prizeIndex })
}

function onRotorTransitionEnd(ev) {
  const p = ev.propertyName
  if (p !== 'transform' && p !== '-webkit-transform') return
  if (!spinAwaitingEnd.value) return
  spinAwaitingEnd.value = false
  if (spinFallbackTimer) {
    clearTimeout(spinFallbackTimer)
    spinFallbackTimer = null
  }
  applySpinResult()
}

async function loadPage() {
  isSpinning.value = false
  spinAwaitingEnd.value = false
  spinTransition.value = 'none'
  if (spinFallbackTimer) {
    clearTimeout(spinFallbackTimer)
    spinFallbackTimer = null
  }
  pendingSpinResult.value = null

  try {
    const cfg = await fetchRoletaConfig()
    segments.value = Array.isArray(cfg.segments) && cfg.segments.length >= 2 ? cfg.segments : []
    configLoaded.value = true
  } catch {
    segments.value = []
    configLoaded.value = true
  }

  if (!auth.token) {
    novosEligible.value = false
    novosAlreadyUsed.value = false
    return
  }

  try {
    const st = await fetchRoletaNovosStatus(auth.token)
    novosEligible.value = !!st?.eligible
    novosAlreadyUsed.value = !!st?.alreadyUsed
    if (!st?.eligible && st?.alreadyUsed) {
      hasSpunLocal.value = true
      wonLine.value = 'Você já usou seu giro exclusivo de novo usuário.'
    }
  } catch {
    novosEligible.value = false
  }
}

async function spin() {
  if (!auth.token) {
    router.push('/login')
    return
  }
  if (centerDisabled.value || isSpinning.value) return
  if (!novosEligible.value) {
    toastError('Você não está elegível para este giro exclusivo.')
    return
  }

  let res
  try {
    res = await postRoletaNovosSpin(auth.token)
  } catch {
    toastError('Falha de conexão. Tente de novo.')
    return
  }

  if (!res?.ok) {
    toastError(res?.error || 'Não foi possível girar.')
    return
  }

  const prizeIndex = Math.min(7, Math.max(0, Number(res.prizeIndex) || 0))
  const amount = Number(res.prize) || 0
  pendingSpinResult.value = { amount, prizeIndex }
  isSpinning.value = true
  spinAwaitingEnd.value = true

  const delta = computeSpinDelta(prizeIndex)
  spinTransition.value = 'none'
  await nextTick()
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const ease = 'cubic-bezier(0.12, 0.75, 0.18, 1)'
      spinTransition.value = `transform 3.45s ${ease}, -webkit-transform 3.45s ${ease}`
      rotationDeg.value += delta
    })
  })

  if (spinFallbackTimer) clearTimeout(spinFallbackTimer)
  spinFallbackTimer = setTimeout(() => {
    if (!spinAwaitingEnd.value) return
    spinAwaitingEnd.value = false
    spinFallbackTimer = null
    applySpinResult()
  }, 4000)
}

watch(
  () => auth.token,
  () => {
    rotationDeg.value = 0
    spinTransition.value = 'none'
    hasSpunLocal.value = false
    wonLine.value = ''
    pendingSpinResult.value = null
    spinAwaitingEnd.value = false
    if (spinFallbackTimer) {
      clearTimeout(spinFallbackTimer)
      spinFallbackTimer = null
    }
    loadPage()
  }
)

onMounted(() => {
  loadPage()
})

defineExpose({ loadPage })
</script>

<style scoped>
.nurp {
  position: relative;
  color: #fff;
  background: #2d0a52 url('/assets/roleta-novos/content-bg-CYDrskB_.png') center top / cover no-repeat;
  border-radius: 0.75rem;
  padding: 0.5rem 0.35rem 0.75rem;
}

.nurp--modal {
  max-height: min(82vh, 680px);
  overflow-y: auto;
  padding-right: 2px;
  -webkit-overflow-scrolling: touch;
  border-radius: 0;
  background: transparent;
}

.nurp-hint {
  margin: 0 0 0.5rem;
  padding: 0 0.35rem;
  text-align: center;
  font-size: 0.72rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.88);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.nurp-hint--modal {
  margin-bottom: 0.35rem;
  font-size: 0.68rem;
}

.status-banner {
  margin: 0 0 0.5rem;
  padding: 0.55rem 0.65rem;
  border-radius: 0.5rem;
  font-size: 0.72rem;
  line-height: 1.45;
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.35);
  color: #fde68a;
}

.wheel-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto 0.5rem;
  max-width: 340px;
  padding: 10px 0.5rem 1.1rem;
}

.nurp--modal .wheel-stage {
  max-width: 300px;
  padding-top: 8px;
  padding-bottom: 0.85rem;
}

/* Só a roleta desce (transform); bot1/bot2 ficam no mesmo sítio no fluxo */
.wheel-visual {
  --wheel-drop: 3.4rem;
  position: relative;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.nurp--modal .wheel-visual {
  max-width: 288px;
  --wheel-drop: 3.05rem;
}

/* bot1 + bot2; detalhes na mesma célula do grid que o bot2 (sem wrapper extra) */
.wheel-deco-strip {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: stretch;
  width: min(102%, 340px);
  max-width: 100%;
  margin-top: 0.35rem;
  pointer-events: none;
}

.wheel-deco-strip .wheel-bot1 {
  grid-row: 1;
  grid-column: 1;
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
}

.wheel-deco-strip .wheel-bot2 {
  grid-row: 2;
  grid-column: 1;
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
  margin-top: -0.15rem;
}

/* Texto diretamente sobre a arte do bot2 (sem caixa / fundo extra) */
.nurp-event-details--on-bot2 {
  grid-row: 2;
  grid-column: 1;
  position: absolute;
  justify-self: stretch;
  align-self: stretch;
  z-index: 1;
  left: 5%;
  right: 5%;
  top: 10%;
  bottom: 12%;
  box-sizing: border-box;
  margin: 0;
  padding: 0.35rem 0.45rem 0.4rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  pointer-events: auto;
  text-align: left;
  background: none;
  border: none;
  box-shadow: none;
  border-radius: 0;
}

.nurp-event-details__title {
  margin: 0 0 0.4rem;
  font-size: 0.78rem;
  font-weight: 800;
  text-align: center;
  color: #fff;
  line-height: 1.2;
  text-shadow:
    0 0 6px rgba(0, 0, 0, 0.85),
    0 1px 2px rgba(0, 0, 0, 0.9);
}

.nurp-event-details__list {
  margin: 0;
  padding-left: 1.15rem;
  font-size: 0.62rem;
  font-weight: 500;
  line-height: 1.45;
  color: #fff;
  text-shadow:
    0 0 5px rgba(0, 0, 0, 0.9),
    0 1px 2px rgba(0, 0, 0, 0.85);
}

.nurp-event-details__list li {
  margin-bottom: 0.35rem;
}

.nurp-event-details__list li:last-child {
  margin-bottom: 0;
}

.nurp--modal .nurp-event-details--on-bot2 {
  top: 9%;
  bottom: 11%;
  padding: 0.3rem 0.35rem 0.35rem;
}

.nurp--modal .nurp-event-details__title {
  font-size: 0.72rem;
  margin-bottom: 0.3rem;
}

.nurp--modal .nurp-event-details__list {
  font-size: 0.58rem;
}

.nurp--modal .wheel-deco-strip {
  width: min(100%, 310px);
  margin-top: 0.25rem;
}

.wheel-halo {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, calc(-50% + var(--wheel-drop, 0px)));
  width: 92%;
  aspect-ratio: 1;
  max-width: 320px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  opacity: 0.55;
  pointer-events: none;
  z-index: 1;
  animation: halo-pulse 1s ease-in-out infinite alternate;
}

@keyframes halo-pulse {
  from {
    opacity: 0.35;
    transform: translate(-50%, calc(-50% + var(--wheel-drop, 0px))) scale(0.94);
  }
  to {
    opacity: 0.6;
    transform: translate(-50%, calc(-50% + var(--wheel-drop, 0px))) scale(1.02);
  }
}

.wheel-frame {
  position: relative;
  z-index: 2;
  width: min(100%, 320px);
  aspect-ratio: 1;
  margin: 0 auto;
  isolation: isolate;
  overflow: visible;
  transform: translateY(var(--wheel-drop, 0px));
}

.nurp--modal .wheel-frame {
  width: min(100%, 288px);
}

.wheel-border {
  position: absolute;
  inset: 0;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  pointer-events: none;
  z-index: 1;
}

.wheel-rotor {
  position: absolute;
  left: 10%;
  right: 10%;
  top: 10%;
  bottom: 10%;
  border-radius: 50%;
  transform-origin: 50% 50%;
  will-change: transform;
  z-index: 2;
  overflow: visible;
}

.wheel-disc {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  z-index: 0;
}

.seg-slot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 32%;
  height: 32%;
  margin-left: -16%;
  margin-top: -16%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  transform-origin: center center;
  pointer-events: none;
  z-index: 1;
}

.seg-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.06rem;
  width: 100%;
  padding-top: 0;
}

.seg-ico {
  width: min(44%, 38px);
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.45));
}

.seg-lbl {
  font-size: 0.62rem;
  font-weight: 800;
  line-height: 1.12;
  color: #fff;
  text-align: center;
  max-width: 6.2em;
  text-shadow:
    0 0 6px rgba(0, 0, 0, 0.95),
    0 1px 2px rgba(0, 0, 0, 0.9);
}

.seg-lbl--vert {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  max-width: none;
  max-height: 4.2em;
  letter-spacing: 0.02em;
}

.wheel-pointer {
  position: absolute;
  top: -2%;
  left: 50%;
  transform: translateX(-50%);
  width: 13%;
  height: auto;
  z-index: 5;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.5));
  pointer-events: none;
}

.wheel-go {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  /* Botão GO (button-Bj95to6s.png) no centro geométrico do disco */
  width: 28%;
  min-width: 56px;
  max-width: 104px;
  aspect-ratio: 1;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.wheel-go:disabled {
  cursor: not-allowed;
  /* Mantém o PNG GO visível (visitantes e estados bloqueados); antes opacity 0.5 “sumia” o botão */
  opacity: 1;
  filter: saturate(0.92);
}

.wheel-go--busy {
  pointer-events: none;
}

.wheel-go-burst {
  position: absolute;
  inset: -35%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  opacity: 0.45;
  animation: burst-mini 0.85s ease-in-out infinite;
  pointer-events: none;
}

@keyframes burst-mini {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.9);
  }
  50% {
    opacity: 0.55;
    transform: scale(1.05);
  }
}

.wheel-go-img {
  display: block;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
  pointer-events: none;
}

.wheel-go-dots {
  font-size: 1.5rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
  animation: blink 0.45s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

.grid-tip {
  text-align: center;
  margin: 0.35rem 0 0.5rem;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.6);
}

.grid-tip.won {
  color: #86efac;
  font-weight: 700;
}

.login-cta {
  width: 100%;
  margin-top: 0.35rem;
  padding: 0.8rem 1rem;
  border-radius: 999px;
  border: none;
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
  background: linear-gradient(180deg, #34d399 0%, #059669 100%);
  color: #fff;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.4);
}

.login-cta--ghost {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: none;
  color: #fff;
}
</style>
