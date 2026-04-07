<template>
  <Teleport to="body">
    <Transition name="announce-fade">
      <div v-if="visible" class="announce-overlay" @click.self="dismiss">
        <div class="announce-modal">
          <!-- Tabs (multiple announcements) -->
          <div v-if="announcements.length > 1" class="announce-tabs">
            <button
              v-for="(ann, idx) in announcements"
              :key="ann.id"
              class="tab-btn"
              :class="{ active: activeIndex === idx }"
              @click="activeIndex = idx"
            >
              {{ ann.title || `Aviso ${idx + 1}` }}
            </button>
          </div>

          <button class="close-btn" @click="dismiss">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div class="announce-content">
            <h3 class="announce-title">{{ current.title || 'Aviso' }}</h3>

            <div v-if="current.type === 'img' && current.imageUrl" class="announce-img-wrap">
              <img :src="current.imageUrl" alt="" class="announce-img" @error="(e) => e.target.style.display = 'none'" />
            </div>

            <div v-else class="announce-text" v-html="current.content || current.text || ''"></div>
          </div>

          <div class="announce-footer">
            <label class="no-remind" @click="toggleNoRemind">
              <span class="checkbox-icon" :class="{ checked: noRemind }">
                <svg v-if="noRemind" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
              <span>Não lembrar hoje</span>
            </label>
            <button class="dismiss-btn" @click="dismiss">Entendido</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  announcements: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'dismiss'])

const visible = ref(false)
const activeIndex = ref(0)
const noRemind = ref(false)

const current = computed(() => props.announcements[activeIndex.value] || {})

function toggleNoRemind() {
  noRemind.value = !noRemind.value
}

function dismiss() {
  if (noRemind.value) {
    const today = new Date().toDateString()
    localStorage.setItem('announcement_hidden_date', today)
  }
  visible.value = false
  emit('close')
}

function show() {
  const hiddenDate = localStorage.getItem('announcement_hidden_date')
  const today = new Date().toDateString()
  if (hiddenDate === today) return
  if (props.announcements.length === 0) return
  visible.value = true
}

onMounted(() => {
  if (props.announcements.length > 0) {
    setTimeout(show, 1500)
  }
})

defineExpose({ show })
</script>

<style scoped>
.announce-overlay {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(0,0,0,0.65); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
}

.announce-modal {
  width: 100%; max-width: 22rem;
  background: var(--ep-color-background-fill-surface-raised-L1, #1a2a50);
  border-radius: 1rem; position: relative;
  border: 1px solid var(--ep-color-border-default, rgba(255,255,255,0.08));
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
  overflow: hidden;
}

.announce-tabs {
  display: flex; overflow-x: auto; gap: 0;
  border-bottom: 1px solid var(--ep-color-border-default);
  scrollbar-width: none;
}
.announce-tabs::-webkit-scrollbar { display: none; }
.announce-tabs .tab-btn {
  flex: 1; min-width: 0; padding: .625rem .5rem;
  font-size: .6875rem; font-weight: 600;
  color: var(--ep-color-text-weakest); background: transparent;
  border-bottom: 2px solid transparent;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  transition: all .2s;
}
.announce-tabs .tab-btn.active {
  color: var(--ep-color-text-selected);
  border-bottom-color: var(--ep-color-text-selected);
}

.close-btn {
  position: absolute; top: .5rem; right: .5rem;
  width: 1.75rem; height: 1.75rem; border-radius: 50%;
  background: rgba(255,255,255,0.08);
  color: var(--ep-color-text-weakest);
  display: flex; align-items: center; justify-content: center;
  z-index: 2; transition: background .15s;
}
.close-btn:active { background: rgba(255,255,255,0.15); }

.announce-content {
  padding: 1.25rem 1rem; max-height: 60vh; overflow-y: auto;
}

.announce-title {
  font-size: 1rem; font-weight: 700;
  color: var(--ep-color-text-default);
  margin-bottom: .75rem; padding-right: 1.5rem;
}

.announce-img-wrap { border-radius: .5rem; overflow: hidden; }
.announce-img { width: 100%; display: block; border-radius: .5rem; }

.announce-text {
  font-size: .8125rem; line-height: 1.6;
  color: var(--ep-color-text-weak);
  word-break: break-word;
}
.announce-text :deep(img) { max-width: 100%; border-radius: .5rem; }
.announce-text :deep(a) { color: var(--ep-color-text-selected); }

.announce-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: .75rem 1rem;
  border-top: 1px solid var(--ep-color-border-default);
}

.no-remind {
  display: flex; align-items: center; gap: .375rem; cursor: pointer;
  font-size: .6875rem; color: var(--ep-color-text-weakest);
}
.checkbox-icon {
  width: 1rem; height: 1rem; border-radius: .25rem;
  border: 1.5px solid var(--ep-color-text-weakest);
  display: flex; align-items: center; justify-content: center;
  transition: all .15s;
}
.checkbox-icon.checked {
  background: var(--ep-color-background-fill-active-primary, #18aaff);
  border-color: var(--ep-color-background-fill-active-primary, #18aaff);
}

.dismiss-btn {
  padding: .4375rem 1.25rem; border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--gradient-primary, linear-gradient(135deg, #18aaff, #7c3aed));
  color: #fff; font-size: .75rem; font-weight: 600;
  transition: opacity .15s;
}
.dismiss-btn:active { opacity: .8; }

.announce-fade-enter-active, .announce-fade-leave-active {
  transition: opacity .25s ease;
}
.announce-fade-enter-active .announce-modal, .announce-fade-leave-active .announce-modal {
  transition: transform .25s ease;
}
.announce-fade-enter-from, .announce-fade-leave-to { opacity: 0; }
.announce-fade-enter-from .announce-modal { transform: scale(0.9) translateY(20px); }
.announce-fade-leave-to .announce-modal { transform: scale(0.95); }
</style>
