<template>
  <Teleport to="body">
    <Transition name="lang-fade">
      <div v-if="visible" class="lang-overlay" @click.self="close">
        <div class="lang-modal">
          <div class="lang-header">
            <h3 class="lang-title">Idioma / Language</h3>
            <button class="lang-close" @click="close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="lang-list">
            <button
              v-for="lang in languages"
              :key="lang.code"
              class="lang-item"
              :class="{ active: currentLang === lang.code }"
              @click="selectLang(lang.code)"
            >
              <span class="lang-flag">{{ lang.flag }}</span>
              <span class="lang-name">{{ lang.name }}</span>
              <svg v-if="currentLang === lang.code" class="lang-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close', 'change'])

const visible = ref(false)
const currentLang = ref(localStorage.getItem('app_language') || 'pt-BR')

const languages = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' }
]

function show() { visible.value = true }
function close() {
  visible.value = false
  emit('close')
}

function selectLang(code) {
  currentLang.value = code
  localStorage.setItem('app_language', code)
  emit('change', code)
  close()
}

defineExpose({ show })
</script>

<style scoped>
.lang-overlay {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(0,0,0,.6); backdrop-filter: blur(3px);
  display: flex; align-items: flex-end; justify-content: center;
}

.lang-modal {
  width: 100%; max-width: 25rem;
  background: var(--ep-color-background-fill-surface-raised-L1, #1a2a50);
  border-radius: 1rem 1rem 0 0;
  border-top: 1px solid var(--ep-color-border-default);
  max-height: 60vh; overflow: hidden;
}

.lang-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1rem .75rem;
  border-bottom: 1px solid var(--ep-color-border-default);
}

.lang-title {
  font-size: .9375rem; font-weight: 700;
  color: var(--ep-color-text-default);
}

.lang-close {
  width: 1.75rem; height: 1.75rem; border-radius: 50%;
  background: rgba(255,255,255,.06); color: var(--ep-color-text-weakest);
  display: flex; align-items: center; justify-content: center;
}

.lang-list { padding: .5rem 0; }

.lang-item {
  display: flex; align-items: center; gap: .75rem;
  width: 100%; padding: .75rem 1rem; text-align: left;
  color: var(--ep-color-text-weak); transition: background .15s;
}
.lang-item:active { background: rgba(255,255,255,.04); }
.lang-item.active { color: var(--ep-color-text-selected); }

.lang-flag { font-size: 1.25rem; }
.lang-name { flex: 1; font-size: .8125rem; font-weight: 500; }
.lang-check { color: var(--ep-color-text-selected); flex-shrink: 0; }

.lang-fade-enter-active, .lang-fade-leave-active { transition: opacity .2s; }
.lang-fade-enter-active .lang-modal { transition: transform .25s cubic-bezier(.34,1.56,.64,1); }
.lang-fade-leave-active .lang-modal { transition: transform .2s ease-in; }
.lang-fade-enter-from, .lang-fade-leave-to { opacity: 0; }
.lang-fade-enter-from .lang-modal { transform: translateY(100%); }
.lang-fade-leave-to .lang-modal { transform: translateY(100%); }
</style>
