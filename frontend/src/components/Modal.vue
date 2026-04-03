<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="handleOverlayClick">
        <div class="modal-container" :class="[sizeClass, { 'modal-fullscreen': fullscreen }]">
          <div v-if="title || showClose" class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button v-if="showClose" class="modal-close" @click="close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body" :class="{ 'no-padding': noPadding }">
            <slot></slot>
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  showClose: { type: Boolean, default: true },
  closeOnOverlay: { type: Boolean, default: true },
  size: { type: String, default: 'default' },
  fullscreen: { type: Boolean, default: false },
  noPadding: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'close'])

const sizeClass = computed(() => `modal-${props.size}`)

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function handleOverlayClick() {
  if (props.closeOnOverlay) close()
}

watch(() => props.modelValue, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal, 10001);
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: var(--ep-color-background-fill-surface-raised-L1, #18254E);
  border-radius: var(--ep-border-radius-surface-large, 1rem);
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--ep-color-border-default);
}

.modal-default { max-width: 25rem; }
.modal-small { max-width: 20rem; }
.modal-large { max-width: 30rem; }

.modal-fullscreen {
  max-width: 100%;
  max-height: 100%;
  height: 100%;
  border-radius: 0;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  flex-shrink: 0;
  border-bottom: 1px solid var(--ep-color-border-default);
}

.modal-title {
  font-size: var(--ep-font-size-l, 1rem);
  font-weight: var(--ep-font-weight-bold, 700);
  color: var(--ep-color-text-default);
}

.modal-close {
  color: var(--ep-color-text-weakest);
  padding: .25rem;
}

.modal-close:active {
  opacity: 0.6;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 1rem 1rem;
}

.modal-body.no-padding {
  padding: 0;
}

.modal-footer {
  padding: .75rem 1rem;
  border-top: 1px solid var(--ep-color-border-default);
  flex-shrink: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.92) translateY(1.25rem);
}
</style>
