<template>
  <Teleport to="body">
    <Transition name="nurp-fade">
      <div v-if="modelValue" class="nurp-overlay" role="dialog" aria-modal="true" aria-labelledby="nurp-popup-title">
        <div class="nurp-sheet" @click.stop>
          <div class="nurp-top">
            <h2 id="nurp-popup-title" class="nurp-title">Exclusivo para novos usuários</h2>
            <button type="button" class="nurp-close" aria-label="Fechar" @click="close">✕</button>
          </div>
          <NovosUsuarioRoulettePanel variant="modal" @spin-complete="onSpinComplete" />
          <button type="button" class="nurp-later" @click="close">Fechar</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import NovosUsuarioRoulettePanel from './NovosUsuarioRoulettePanel.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}

function onSpinComplete() {
  /* utilizador pode ler o resultado; fechar manualmente */
}
</script>

<style scoped>
.nurp-overlay {
  position: fixed;
  inset: 0;
  z-index: 10020;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  backdrop-filter: blur(4px);
}

.nurp-sheet {
  width: 100%;
  max-width: 420px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(30, 11, 62, 0.88) 0%, rgba(15, 5, 36, 0.95) 100%),
    #2d0a52 url('/assets/roleta-novos/content-bg-CYDrskB_.png') center top / cover no-repeat;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
  padding: 12px 14px 14px;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.nurp-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.nurp-title {
  margin: 0;
  flex: 1;
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.3;
  color: #fff;
}

.nurp-close {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.75);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.nurp-close:active {
  opacity: 0.85;
}

.nurp-later {
  margin-top: 10px;
  width: 100%;
  padding: 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.nurp-fade-enter-active,
.nurp-fade-leave-active {
  transition: opacity 0.22s ease;
}

.nurp-fade-enter-active .nurp-sheet,
.nurp-fade-leave-active .nurp-sheet {
  transition: transform 0.22s ease;
}

.nurp-fade-enter-from,
.nurp-fade-leave-to {
  opacity: 0;
}

.nurp-fade-enter-from .nurp-sheet,
.nurp-fade-leave-to .nurp-sheet {
  transform: scale(0.96) translateY(8px);
}
</style>
