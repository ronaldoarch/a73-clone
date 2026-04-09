<template>
  <div class="app-logo-mark" role="button" tabindex="0" @click="emit('click')" @keydown.enter.prevent="emit('click')">
    <img
      v-if="brandingLogoUrl"
      class="app-logo-mark__img"
      :src="brandingLogoUrl"
      alt=""
      decoding="async"
    />
    <template v-else>
      <span class="app-logo-mark__a">A</span><span class="app-logo-mark__num">73</span><span class="app-logo-mark__dot">.com</span>
    </template>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useSystemStore } from '../stores/system'

const emit = defineEmits(['click'])
const system = useSystemStore()
const { brandingLogoUrl } = storeToRefs(system)
</script>

<style scoped>
.app-logo-mark {
  cursor: pointer;
  display: flex;
  align-items: center;
  user-select: none;
}
.app-logo-mark__img {
  display: block;
  max-height: 2.25rem;
  width: auto;
  max-width: 9rem;
  object-fit: contain;
  object-position: left center;
}
.app-logo-mark__a {
  font-family: var(--font-display);
  font-size: 1.625rem;
  font-weight: 900;
  font-style: italic;
  background: linear-gradient(180deg, #ff6b6b, #e53e3e, #c53030);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 1px 2px rgba(229, 62, 62, 0.3));
}
.app-logo-mark__num {
  font-family: var(--font-display);
  font-size: 1.625rem;
  font-weight: 900;
  font-style: italic;
  background: linear-gradient(180deg, #ffd700, #f5c84c, #e8b230);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 1px 2px rgba(245, 200, 76, 0.3));
}
.app-logo-mark__dot {
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 700;
  font-style: italic;
  margin-left: 1px;
  background: linear-gradient(180deg, #ffd700, #e8b230);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
