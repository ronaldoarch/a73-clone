<template>
  <div class="mmc-root">
    <div class="mmc-stage">
      <img class="mmc-bg" src="/assets/mine/mine-popup-bg.png" alt="" width="750" height="1200" decoding="async" />
      <div class="mmc-body">
        <button type="button" class="mmc-hex" @click="$emit('mining')">
          <img src="/assets/mine/mine-hex-btn.png" alt="" decoding="async" />
          <span class="mmc-hex-label" :class="{ 'mmc-hex-label--long': Boolean(hexLabel) }">{{ displayHexLabel }}</span>
        </button>
        <p class="mmc-hint">Mina abre 12X por dia, máx queda 7.777,00</p>
        <div class="mmc-grid" role="list">
          <div
            v-for="slot in timeSlots"
            :key="slot.label"
            class="mmc-slot"
            :class="{ 'mmc-slot--muted': slot.muted }"
            role="listitem"
          >
            {{ slot.label }}
          </div>
        </div>
        <div class="mmc-rules">
          <p>Colete até 100.000,00 cristais.</p>
          <p>Grátis para usuários de depósito hoje.</p>
          <p>Os cristais minerados serão automaticamente trocados por saldo a uma taxa de 1:1.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** Se definido (ex. popup com countdown), substitui o rótulo «Mineração». */
  hexLabel: { type: String, default: '' },
})

defineEmits(['mining'])

const displayHexLabel = computed(() => (props.hexLabel.trim() ? props.hexLabel.trim() : 'Mineração'))

const timeSlots = [
  { label: '12:00-12:59', muted: true },
  { label: '14:00-14:59', muted: true },
  { label: '16:00-16:59', muted: false },
  { label: '18:00-18:59', muted: false },
  { label: '20:00-20:59', muted: false },
  { label: '22:00-22:59', muted: false },
]
</script>

<style scoped>
.mmc-root {
  width: 100%;
}

.mmc-stage {
  position: relative;
  width: 100%;
  line-height: 0;
}

.mmc-bg {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 0 0 0.35rem 0.35rem;
}

/* Conteúdo sobre a área roxa inferior do arte */
.mmc-body {
  position: absolute;
  left: 5%;
  right: 5%;
  top: 44%;
  bottom: 3.5%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.35rem;
  line-height: normal;
  pointer-events: auto;
}

.mmc-hex {
  position: relative;
  width: 94%;
  max-width: 17.5rem;
  margin: 0 auto;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.mmc-hex:active {
  transform: scale(0.97);
}

.mmc-hex img {
  width: 100%;
  height: auto;
  display: block;
}

.mmc-hex-label {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -52%);
  font-size: clamp(0.85rem, 3.8vw, 1rem);
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.02em;
  text-shadow:
    0 1px 0 rgba(0, 0, 0, 0.45),
    0 0 12px rgba(56, 189, 248, 0.35);
  pointer-events: none;
  white-space: nowrap;
}

.mmc-hex-label--long {
  white-space: normal;
  text-align: center;
  max-width: 88%;
  line-height: 1.2;
  font-size: clamp(0.58rem, 2.65vw, 0.78rem);
  letter-spacing: 0.01em;
}

.mmc-hint {
  margin: 0.1rem 0 0.15rem;
  padding: 0 0.25rem;
  font-size: clamp(0.55rem, 2.6vw, 0.68rem);
  font-weight: 700;
  color: #ff9f43;
  text-align: center;
  line-height: 1.35;
}

.mmc-grid {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3rem 0.55rem;
  padding: 0.45rem 0.5rem;
  background: rgba(0, 0, 0, 0.38);
  border-radius: 0.45rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
}

.mmc-slot {
  font-size: clamp(0.58rem, 2.7vw, 0.72rem);
  font-weight: 600;
  color: #fff;
  text-align: center;
  padding: 0.2rem 0.15rem;
}

.mmc-slot--muted {
  color: rgba(255, 255, 255, 0.42);
}

.mmc-rules {
  margin-top: auto;
  padding: 0.35rem 0.35rem 0.2rem;
  font-size: clamp(0.52rem, 2.4vw, 0.62rem);
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.92);
  text-align: left;
  background: rgba(15, 20, 45, 0.55);
  border-radius: 0 0 0.32rem 0.32rem;
}

.mmc-rules p {
  margin: 0.15rem 0;
}
</style>
