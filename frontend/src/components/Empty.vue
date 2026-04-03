<template>
  <div class="empty-state">
    <div class="empty-icon">
      <svg v-if="type === 'data'" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="12" y="16" width="40" height="32" rx="4" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <path d="M22 28h20M22 36h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
      </svg>
      <svg v-else-if="type === 'search'" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="28" cy="28" r="12" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <path d="M37 37l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
      </svg>
      <svg v-else-if="type === 'notification'" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <path d="M32 12c-8 0-14 6-14 14v10l-4 4h36l-4-4V26c0-8-6-14-14-14z" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <path d="M28 48c0 2.2 1.8 4 4 4s4-1.8 4-4" stroke="currentColor" stroke-width="2" opacity="0.4"/>
      </svg>
      <svg v-else width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="20" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <path d="M24 32h16M32 24v16" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.2"/>
      </svg>
    </div>
    <p class="empty-text">{{ text || defaultText }}</p>
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'data' },
  text: { type: String, default: '' }
})

const defaultTexts = {
  data: 'Nenhum dado encontrado',
  search: 'Nenhum resultado encontrado',
  notification: 'Sem notificações',
  default: 'Nada aqui ainda'
}

const defaultText = computed(() => defaultTexts[props.type] || defaultTexts.default)
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 12px;
}
.empty-icon { color: var(--text-muted); }
.empty-text { font-size: 14px; color: var(--text-muted); text-align: center; }
</style>
