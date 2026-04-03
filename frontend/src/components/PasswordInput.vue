<template>
  <div class="password-input">
    <label v-if="label" class="pwd-label">{{ label }}</label>
    <div class="pwd-wrap" :class="{ focused, error: !!errorMsg }">
      <input
        ref="inputRef"
        :type="visible ? 'text' : 'password'"
        :value="modelValue"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :autocomplete="autocomplete"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="focused = true"
        @blur="focused = false"
      />
      <button type="button" class="pwd-toggle" @click="visible = !visible" tabindex="-1">
        <svg v-if="visible" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>
    </div>
    <p v-if="errorMsg" class="pwd-error">{{ errorMsg }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Digite a senha' },
  maxlength: { type: Number, default: 32 },
  autocomplete: { type: String, default: 'current-password' },
  errorMsg: { type: String, default: '' }
})

defineEmits(['update:modelValue'])

const visible = ref(false)
const focused = ref(false)
const inputRef = ref(null)
</script>

<style scoped>
.pwd-label { display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
.pwd-wrap {
  display: flex; align-items: center;
  background: var(--bg-input); border: 1.5px solid rgba(255,255,255,0.08);
  border-radius: var(--radius-md); transition: var(--transition);
}
.pwd-wrap.focused { border-color: var(--purple-300); }
.pwd-wrap.error { border-color: var(--accent-red); }
.pwd-wrap input {
  flex: 1; padding: 12px 14px; background: transparent;
  color: var(--text-primary); font-size: 15px;
}
.pwd-wrap input::placeholder { color: var(--text-muted); }
.pwd-toggle { padding: 8px 12px; color: var(--text-muted); flex-shrink: 0; }
.pwd-error { font-size: 12px; color: var(--accent-red); margin-top: 4px; }
</style>
