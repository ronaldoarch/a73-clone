<template>
  <div class="amount-btn-list">
    <button
      v-for="amt in amounts"
      :key="amt"
      class="amt-btn"
      :class="{ active: modelValue === amt }"
      @click="$emit('update:modelValue', amt)"
    >
      <span class="amt-symbol">{{ symbol }}</span>
      <span class="amt-value">{{ formatAmount(amt) }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  amounts: { type: Array, default: () => [20, 50, 100, 200, 500, 1000] },
  modelValue: { type: Number, default: 0 },
  symbol: { type: String, default: 'R$' }
})

defineEmits(['update:modelValue'])

function formatAmount(n) {
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k'
  return String(n)
}
</script>

<style scoped>
.amount-btn-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.amt-btn {
  display: flex; align-items: center; justify-content: center; gap: 2px;
  padding: 10px 8px; border-radius: var(--radius-md);
  background: var(--bg-input); font-size: 14px; font-weight: 600;
  color: var(--text-primary); border: 1.5px solid transparent;
  transition: var(--transition);
}
.amt-btn.active { border-color: var(--purple-300); background: rgba(168,85,247,0.15); color: var(--purple-200); }
.amt-btn:active { opacity: 0.7; }
.amt-symbol { font-size: 11px; color: var(--text-muted); }
.amt-value { font-weight: 700; }
</style>
