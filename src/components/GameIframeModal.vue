<template>
  <Teleport to="body">
    <div v-if="url" class="game-iframe-overlay">
      <div class="game-iframe-header">
        <button type="button" class="game-iframe-close" @click="$emit('close')">
          <IonIcon name="close" />
          Fechar
        </button>
      </div>
      <iframe
        :src="url"
        class="game-iframe"
        allowfullscreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; payment; gamepad"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  </Teleport>
</template>

<script setup>
import { IonIcon } from '@ionic/vue'
defineProps({
  url: { type: String, default: null }
})
defineEmits(['close'])
</script>

<style scoped>
.game-iframe-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #0f0f14;
  display: flex;
  flex-direction: column;
}
.game-iframe-header {
  flex-shrink: 0;
  padding: 8px 12px;
  background: #1a1a24;
  border-bottom: 1px solid #2a2a3a;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.game-iframe-close {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--color-primary-600, #7c3aed);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
}
.game-iframe-close:hover {
  opacity: 0.9;
}
.game-iframe-close ion-icon {
  font-size: 1.2rem;
}
.game-iframe {
  flex: 1;
  width: 100%;
  border: none;
  min-height: 0;
}
</style>
