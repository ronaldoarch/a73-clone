<template>
  <Teleport to="body">
    <Transition name="pcf-fade">
      <div v-if="visible" class="pcf-float">
        <div class="pcf-inner">
          <button type="button" class="pcf-dismiss" aria-label="Fechar promoções" @click.stop="dismiss">×</button>
          <div
            ref="viewportRef"
            class="pcf-viewport"
            @scroll.passive="onViewportScroll"
          >
            <div class="pcf-track">
              <div
                v-for="(slide, i) in slides"
                :key="i"
                class="pcf-slide"
              >
                <button
                  type="button"
                  class="pcf-hit"
                  @touchstart.passive="onTouchStart"
                  @touchmove.passive="onTouchMove"
                  @touchend="onTouchEnd"
                  @click="onSlideClick(slide.to)"
                >
                  <img :src="slide.src" :alt="slide.alt" draggable="false" />
                </button>
              </div>
            </div>
          </div>
          <div class="pcf-dots" role="tablist" aria-label="Promoções">
            <button
              v-for="(_, i) in slides"
              :key="i"
              type="button"
              class="pcf-dot"
              :class="{ 'pcf-dot--active': i === activeIndex }"
              :aria-selected="i === activeIndex"
              :aria-label="`Slide ${i + 1}`"
              @click="scrollToSlide(i)"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const DISMISS_KEY = 'a73_promo_carousel_3_dismissed'

const slides = [
  { src: '/assets/fluantenocanto/111.png?v=2', to: '/main/indique-amigos', alt: 'Indique amigos' },
  {
    src: '/assets/fluantenocanto/222.png?v=2',
    to: { name: 'MysteryReward' },
    alt: 'MYSTERY REWARD — Bônus misterioso',
  },
  { src: '/assets/fluantenocanto/333.png?v=2', to: '/activity/LuckyWheel', alt: 'Roda da sorte' },
]

const router = useRouter()
const visible = ref(false)
const viewportRef = ref(null)
const activeIndex = ref(0)
let touchStartX = 0
let touchMoved = false

function dismiss() {
  visible.value = false
  sessionStorage.setItem(DISMISS_KEY, '1')
}

function onViewportScroll() {
  const el = viewportRef.value
  if (!el || el.clientWidth <= 0) return
  const i = Math.round(el.scrollLeft / el.clientWidth)
  activeIndex.value = Math.min(Math.max(0, i), slides.length - 1)
}

function scrollToSlide(i) {
  const el = viewportRef.value
  if (!el) return
  const w = el.clientWidth
  el.scrollTo({ left: i * w, behavior: 'smooth' })
}

function onSlideClick(path) {
  if (touchMoved) return
  router.push(path)
}

function onTouchStart(e) {
  touchStartX = e.touches?.[0]?.clientX ?? 0
  touchMoved = false
}

function onTouchMove(e) {
  const x = e.touches?.[0]?.clientX ?? 0
  if (Math.abs(x - touchStartX) > 12) touchMoved = true
}

function onTouchEnd() {
  requestAnimationFrame(() => {
    touchMoved = false
  })
}

onMounted(() => {
  if (!sessionStorage.getItem(DISMISS_KEY)) visible.value = true
  nextTick(() => onViewportScroll())
})
</script>

<style scoped>
/*
 * Direita, acima do flutuante sportbook e da mina (espaço para 3 flutuantes empilhados).
 */
.pcf-float {
  position: fixed;
  top: auto;
  right: calc((100vw - min(100vw, var(--max-width, 480px))) / 2 + 0.5rem + env(safe-area-inset-right, 0px));
  left: auto;
  bottom: calc(19rem + env(safe-area-inset-bottom, 0px));
  --pcf-w: 4.15rem;
  width: var(--pcf-w);
  z-index: 10019;
}

/* Sombra fora do contentor de scroll — `filter` no pai quebra swipe horizontal em alguns browsers */
.pcf-inner {
  position: relative;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
  border-radius: 0.4rem;
}

.pcf-dismiss {
  position: absolute;
  top: -0.2rem;
  right: -0.15rem;
  z-index: 3;
  width: 1.05rem;
  height: 1.05rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.7rem;
  line-height: 1;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.pcf-viewport {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  scrollbar-width: none;
  touch-action: pan-x;
}

.pcf-viewport::-webkit-scrollbar {
  display: none;
}

.pcf-track {
  display: flex;
  flex-direction: row;
  width: max-content;
}

.pcf-slide {
  flex: 0 0 var(--pcf-w);
  width: var(--pcf-w);
  box-sizing: border-box;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.pcf-hit {
  display: block;
  width: 100%;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 0.4rem;
  overflow: hidden;
  touch-action: pan-x;
}

.pcf-hit img {
  width: 100%;
  max-height: 6.5rem;
  height: auto;
  object-fit: contain;
  object-position: center top;
  display: block;
  pointer-events: none;
  user-select: none;
}

.pcf-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0 0.15rem;
}

.pcf-dot {
  width: 5px;
  height: 5px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
  cursor: pointer;
}

.pcf-dot--active {
  background: #ffe566;
  transform: scale(1.15);
}

.pcf-fade-enter-active,
.pcf-fade-leave-active {
  transition: opacity 0.28s ease;
}

.pcf-fade-enter-from,
.pcf-fade-leave-to {
  opacity: 0;
}
</style>
