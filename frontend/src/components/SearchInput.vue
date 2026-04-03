<template>
  <div class="search-wrap" :class="{ focused }">
    <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>
    <input
      ref="inputRef"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="focused = true"
      @blur="focused = false"
      @keyup.enter="$emit('search', modelValue)"
    />
    <button v-if="modelValue" class="search-clear" @click="$emit('update:modelValue', '')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Pesquisar...' }
})

defineEmits(['update:modelValue', 'search'])

const focused = ref(false)
const inputRef = ref(null)
</script>

<style scoped>
.search-wrap {
  display: flex; align-items: center; gap: 8px;
  background: var(--bg-input); border-radius: var(--radius-md);
  padding: 0 12px; border: 1.5px solid rgba(255,255,255,0.06);
  transition: var(--transition);
}
.search-wrap.focused { border-color: var(--purple-300); }
.search-icon { color: var(--text-muted); flex-shrink: 0; }
.search-wrap input {
  flex: 1; padding: 10px 0; background: transparent;
  color: var(--text-primary); font-size: 14px;
}
.search-wrap input::placeholder { color: var(--text-muted); }
.search-clear { color: var(--text-muted); padding: 4px; flex-shrink: 0; }
</style>
