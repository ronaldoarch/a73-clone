<template>
  <div class="mmp-page">
    <header class="mmp-bar">
      <button type="button" class="mmp-back" aria-label="Voltar" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <h1 class="mmp-title">Mina Misteriosa</h1>
    </header>

    <div class="mmp-inner">
      <MysteryMineContent @mining="onMining" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import MysteryMineContent from '../../components/MysteryMineContent.vue'

const router = useRouter()

function onMining() {
  router.push('/main/promo')
}
</script>

<style scoped>
.mmp-page {
  min-height: 100dvh;
  background: #1a0a2e;
  color: #fff;
}

.mmp-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem;
  padding-top: calc(0.65rem + env(safe-area-inset-top, 0px));
  background: linear-gradient(180deg, #2d1b4e 0%, #1a0a2e 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.mmp-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
}

.mmp-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.mmp-inner {
  max-width: min(100%, var(--max-width, 480px));
  margin: 0 auto;
  padding: 0.75rem 0.65rem 1.5rem;
}
</style>
