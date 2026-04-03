<template>
  <div v-if="visible" class="bonus-pool">
    <div class="bonus-inner">
      <span class="bonus-label">Prêmio acumulado</span>
      <span class="bonus-value">
        <span class="bonus-currency">R$</span>
        <span class="bonus-amount" ref="amountRef">{{ displayAmount }}</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: true }
})

const poolValue = ref(1847293.56)
let interval = null

const displayAmount = computed(() => {
  return poolValue.value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
})

function tick() {
  poolValue.value += Math.random() * 15 + 2
}

onMounted(() => {
  interval = setInterval(tick, 2000 + Math.random() * 3000)
})

onBeforeUnmount(() => {
  if (interval) clearInterval(interval)
})
</script>

<style scoped>
.bonus-pool {
  background: var(--ep-color-background-fill-surface-raised-L2);
  border-radius: var(--ep-border-radius-l, .5rem);
  padding: .625rem .875rem;
  margin: .5rem 0;
  border: 1px solid var(--ep-color-border-default);
  position: relative;
  overflow: hidden;
}

.bonus-pool::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-primary);
}

.bonus-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bonus-label {
  font-size: var(--ep-font-size-s, .8125rem);
  color: var(--ep-color-text-weaker);
  font-weight: var(--ep-font-weight-medium, 500);
}

.bonus-value {
  display: flex;
  align-items: baseline;
  gap: .25rem;
}

.bonus-currency {
  font-size: var(--ep-font-size-s, .75rem);
  color: var(--color-currency, #FE963B);
  font-weight: var(--ep-font-weight-semi-bold, 600);
}

.bonus-amount {
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--color-currency, #FE963B);
  font-family: var(--font-display);
}
</style>
