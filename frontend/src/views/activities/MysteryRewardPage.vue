<template>
  <div class="mystery-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Recompensa Misteriosa</h2>
    </div>
    <div class="mystery-banner">
      <div class="mystery-gem">💎</div>
      <h3>Descubra seu prêmio!</h3>
      <p>Quanto mais você joga, maiores as recompensas misteriosas.</p>
    </div>
    <div class="mystery-boxes">
      <div v-for="box in boxes" :key="box.id" class="box-card" :class="{ opened: box.opened }" @click="openBox(box)">
        <div v-if="!box.opened" class="box-closed">?</div>
        <div v-else class="box-opened">{{ box.prize }}</div>
      </div>
    </div>
    <div class="mystery-info">
      <p>• Caixas disponíveis renovam diariamente</p>
      <p>• Aposte mais para desbloquear caixas melhores</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const boxes = ref([
  { id: 1, opened: false, prize: 'R$ 2' },
  { id: 2, opened: false, prize: 'R$ 5' },
  { id: 3, opened: false, prize: 'R$ 10' },
  { id: 4, opened: false, prize: 'R$ 1' },
  { id: 5, opened: false, prize: 'R$ 3' },
  { id: 6, opened: false, prize: 'R$ 20' },
])
function openBox(box) {
  if (box.opened) return
  box.opened = true
}
</script>

<style scoped>
.mystery-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }
.mystery-banner { background: linear-gradient(135deg, #5b21b6, #7c3aed); border-radius: var(--radius-lg); padding: 24px 16px; text-align: center; margin-bottom: 16px; }
.mystery-gem { font-size: 48px; margin-bottom: 8px; }
.mystery-banner h3 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
.mystery-banner p { font-size: 12px; color: rgba(255,255,255,0.8); }
.mystery-boxes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
.box-card { aspect-ratio: 1; background: var(--bg-card); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid rgba(255,255,255,0.1); transition: var(--transition); }
.box-card:active { transform: scale(0.95); }
.box-card.opened { background: rgba(34,197,94,0.15); border-color: var(--accent-green); }
.box-closed { font-size: 32px; font-weight: 800; color: var(--accent-yellow); }
.box-opened { font-size: 16px; font-weight: 700; color: var(--accent-green); }
.mystery-info { background: var(--bg-card); border-radius: var(--radius-md); padding: 14px; }
.mystery-info p { font-size: 12px; color: var(--text-muted); line-height: 1.8; }
</style>
