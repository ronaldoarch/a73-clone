<template>
  <Transition name="backtop-fade">
    <button
      v-if="showButton"
      class="back-to-top"
      @click="scrollToTop"
      aria-label="Voltar ao topo"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
      <span class="top-label">TOP</span>
    </button>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const showButton = ref(false)
let scrollEl = null

function onScroll() {
  if (!scrollEl) return
  showButton.value = scrollEl.scrollTop > 800
}

function scrollToTop() {
  if (!scrollEl) return
  scrollEl.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  scrollEl = document.querySelector('.page-content') || document.documentElement
  scrollEl.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  if (scrollEl) scrollEl.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: calc(var(--tab-bar-height, 3.5rem) + env(safe-area-inset-bottom, 0px) + 4.5rem);
  right: .75rem;
  width: 2.5rem; height: 2.5rem;
  border-radius: 50%;
  background: var(--ep-color-background-fill-surface-raised-L2, rgba(24,37,78,0.9));
  border: 1px solid var(--ep-color-border-default);
  color: var(--ep-color-text-weak);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 0; z-index: 9990; cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  transition: transform .15s, background .15s;
}
.back-to-top:active {
  transform: scale(0.9);
  background: var(--ep-color-background-fill-active-primary);
  color: #fff;
}

.top-label {
  font-size: .4375rem; font-weight: 700;
  line-height: 1; margin-top: -1px;
  letter-spacing: .5px;
}

.backtop-fade-enter-active, .backtop-fade-leave-active {
  transition: opacity .3s, transform .3s;
}
.backtop-fade-enter-from, .backtop-fade-leave-to {
  opacity: 0; transform: translateY(10px) scale(0.8);
}
</style>
