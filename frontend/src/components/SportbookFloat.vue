<template>
  <Teleport to="body">
    <Transition name="sbf-fade">
      <div v-if="visible" class="sbf-float">
        <button type="button" class="sbf-dismiss" aria-label="Fechar atalho apostas esportivas" @click.stop="dismiss">
          ×
        </button>
        <button type="button" class="sbf-hit" @click="openSports">
          <img
            src="/assets/fluantenocanto/sportbook-float.png?v=1"
            alt="Apostas esportivas — Sportbook"
            draggable="false"
            class="sbf-img"
          />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const DISMISS_KEY = 'a73_sportbook_float_dismissed'

const router = useRouter()
const visible = ref(false)

function dismiss() {
  visible.value = false
  sessionStorage.setItem(DISMISS_KEY, '1')
}

function openSports() {
  router.push('/game/category/sport')
}

onMounted(() => {
  if (!sessionStorage.getItem(DISMISS_KEY)) visible.value = true
})
</script>

<style scoped>
/*
 * Entre o carrossel de promo (acima) e a mina misteriosa (abaixo).
 * Largura alinhada aos outros flutuantes da direita.
 */
.sbf-float {
  position: fixed;
  top: auto;
  right: calc((100vw - min(100vw, var(--max-width, 480px))) / 2 + 0.5rem + env(safe-area-inset-right, 0px));
  left: auto;
  bottom: calc(12.5rem + env(safe-area-inset-bottom, 0px));
  --sbf-w: 4.15rem;
  width: var(--sbf-w);
  z-index: 10018;
  filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.45));
}

.sbf-float:active {
  transform: scale(0.96);
  transition: transform 0.15s ease;
}

.sbf-dismiss {
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

.sbf-hit {
  display: block;
  width: 100%;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 0.4rem;
  overflow: hidden;
  isolation: isolate;
}

.sbf-img {
  width: 100%;
  max-height: 6.5rem;
  height: auto;
  object-fit: cover;
  object-position: center center;
  display: block;
  pointer-events: none;
  user-select: none;
  border-radius: 0.4rem;
}

.sbf-hit:focus-visible {
  outline: 2px solid rgba(255, 228, 77, 0.7);
  outline-offset: 2px;
}

.sbf-fade-enter-active,
.sbf-fade-leave-active {
  transition: opacity 0.28s ease;
}

.sbf-fade-enter-from,
.sbf-fade-leave-to {
  opacity: 0;
}
</style>
