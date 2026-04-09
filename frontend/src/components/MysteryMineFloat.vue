<template>
  <Teleport to="body">
    <Transition name="mmf-modal-fade">
      <div v-if="showModal" class="mmf-overlay" @click.self="closeModal">
        <div class="mmf-modal-mine">
          <button type="button" class="mmf-modal-x" aria-label="Fechar" @click="closeModal">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <MysteryMineContent :hex-label="minePopupHexLabel" @mining="goMinePage" />
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="mmf-pop">
      <div v-if="visible" class="mmf-float">
        <button type="button" class="mmf-dismiss" aria-label="Fechar atalho da mina" @click.stop="dismiss">×</button>
        <button type="button" class="mmf-hit" @click="openModal">
          <img
            :src="floatImgSrc"
            alt="Mina Misteriosa"
            draggable="false"
            class="mmf-float-img"
            @error="onFloatImgError"
          />
          <div class="mmf-timer" aria-live="polite">{{ formattedTime }}</div>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import MysteryMineContent from './MysteryMineContent.vue'

const router = useRouter()
/* Chave nova: quem fechou a mina antiga ainda tinha `mine_dismissed` e o flutuante sumia para sempre */
const DISMISS_KEY = 'a73_mina_float_dismissed'

const visible = ref(false)
const showModal = ref(false)
const countdown = ref(0)

/* Arte da mina = redPacket_1.png (cartão Mina Misteriosa), não o 111.png */
const floatImgSrc = ref('/assets/fluantenocanto/redPacket_1.png?v=1')
let tick = null

function onFloatImgError(e) {
  const src = e?.target?.src || ''
  if (src.includes('redPacket_1')) {
    floatImgSrc.value = '/assets/fluantenocanto/mina-misteriosa-float.png?v=1'
    return
  }
  if (src.includes('mina-misteriosa-float')) {
    return
  }
}

function resetCountdown() {
  countdown.value = 3600 + Math.floor(Math.random() * 7200)
}

const formattedTime = computed(() => {
  const h = Math.floor(countdown.value / 3600)
  const m = Math.floor((countdown.value % 3600) / 60)
  const s = countdown.value % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const minePopupHexLabel = computed(() => `Fechado ${formattedTime.value} Abrirá em Breve`)

function openModal() {
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function goMinePage() {
  closeModal()
  router.push('/activity/mine')
}

function dismiss() {
  visible.value = false
  sessionStorage.setItem(DISMISS_KEY, '1')
}

watch(showModal, (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  if (!sessionStorage.getItem(DISMISS_KEY)) {
    visible.value = true
    resetCountdown()
    tick = setInterval(() => {
      if (countdown.value > 0) countdown.value -= 1
      else resetCountdown()
    }, 1000)
  }
})

onBeforeUnmount(() => {
  if (tick) clearInterval(tick)
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<style scoped>
.mmf-overlay {
  position: fixed;
  inset: 0;
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0px));
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(5px);
}

/* Popup MYSTERIOUS MINE (mesmo layout que a página / print) */
.mmf-modal-mine {
  position: relative;
  width: min(19rem, calc(100vw - 1.5rem));
  max-width: 100%;
  max-height: min(92dvh, 42rem);
  overflow: hidden;
  border-radius: 0.5rem;
  box-sizing: border-box;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
}

.mmf-modal-x {
  position: absolute;
  top: 0.45rem;
  right: 0.45rem;
  z-index: 10;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  cursor: pointer;
  padding: 0;
}

.mmf-modal-fade-enter-active,
.mmf-modal-fade-leave-active {
  transition: opacity 0.22s ease;
}

.mmf-modal-fade-enter-active .mmf-modal-mine,
.mmf-modal-fade-leave-active .mmf-modal-mine {
  transition: transform 0.22s ease;
}

.mmf-modal-fade-enter-from,
.mmf-modal-fade-leave-to {
  opacity: 0;
}

.mmf-modal-fade-enter-from .mmf-modal-mine,
.mmf-modal-fade-leave-to .mmf-modal-mine {
  transform: scale(0.94);
}

/* Flutuante: canto inferior direito (suporte fica à esquerda) */
.mmf-float {
  position: fixed;
  top: auto;
  left: auto;
  bottom: calc(5.5rem + env(safe-area-inset-bottom, 0px));
  right: calc((100vw - min(100vw, var(--max-width, 480px))) / 2 + 0.55rem + env(safe-area-inset-right, 0px));
  transform: none;
  z-index: 10020;
  width: 4.35rem;
  padding: 0;
  border: none;
  background: transparent;
  filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.45));
}

.mmf-float:active {
  transform: scale(0.96);
  transition: transform 0.15s ease;
}

.mmf-dismiss {
  position: absolute;
  top: -0.2rem;
  right: -0.2rem;
  z-index: 5;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.75rem;
  line-height: 1;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.mmf-hit {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 0.45rem;
  overflow: hidden;
  isolation: isolate;
}

.mmf-float-img {
  position: relative;
  z-index: 0;
  width: 100%;
  height: auto;
  object-fit: contain;
  object-position: center center;
  display: block;
  pointer-events: none;
  user-select: none;
}

/* Slot escuro na base do cartão “Mina Misteriosa” */
.mmf-timer {
  position: absolute;
  z-index: 2;
  left: 12%;
  right: 12%;
  top: auto;
  bottom: 5.5%;
  margin: 0;
  padding: 0.05rem 0.08rem;
  font-size: clamp(0.48rem, 2.4vw, 0.62rem);
  font-weight: 800;
  color: #fff3c4;
  text-align: center;
  line-height: 1.15;
  font-family: 'Share Tech', ui-monospace, monospace;
  letter-spacing: 0.04em;
  text-shadow:
    0 0 5px rgba(0, 0, 0, 0.95),
    0 1px 2px rgba(0, 0, 0, 1);
  pointer-events: none;
}

.mmf-hit:focus-visible {
  outline: 2px solid rgba(255, 228, 77, 0.7);
  outline-offset: 2px;
}

/* Só opacidade: evita conflito com transform no .mmf-float (entrada ficava fora do ecrã) */
.mmf-pop-enter-active {
  transition: opacity 0.3s ease;
}

.mmf-pop-leave-active {
  transition: opacity 0.2s ease;
}

.mmf-pop-enter-from,
.mmf-pop-leave-to {
  opacity: 0;
}
</style>
