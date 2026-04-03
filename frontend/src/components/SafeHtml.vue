<template>
  <div v-html="sanitized" class="safe-html"></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: { type: String, default: '' },
  level: { type: Number, default: 1 }
})

const dangerousTags = /(<script[\s>]|<\/script>|javascript:|on\w+\s*=|<iframe|<object|<embed|<form|<meta|<link\s)/gi
const dangerousAttrs = /\s(on\w+|formaction|action|xlink:href|data-bind)\s*=/gi

const sanitized = computed(() => {
  let html = props.content || ''
  if (props.level >= 1) {
    html = html.replace(dangerousTags, '')
    html = html.replace(dangerousAttrs, '')
  }
  if (props.level >= 2) {
    html = html.replace(/<style[\s\S]*?<\/style>/gi, '')
  }
  return html
})
</script>

<style scoped>
.safe-html { word-break: break-word; }
.safe-html :deep(img) { max-width: 100%; height: auto; border-radius: 4px; }
.safe-html :deep(a) { color: var(--purple-200); }
.safe-html :deep(p) { margin: 8px 0; line-height: 1.6; }
.safe-html :deep(table) { width: 100%; border-collapse: collapse; }
.safe-html :deep(td), .safe-html :deep(th) { padding: 8px; border: 1px solid rgba(255,255,255,0.1); }
</style>
