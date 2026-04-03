<template>
  <div class="activity-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
      <h2>Exclusivo Novos Usuários</h2>
    </div>
    <div class="act-banner" style="background:linear-gradient(135deg,#ec4899,#f43f5e)">
      <h3>🎉 Bônus de Boas-Vindas!</h3>
      <p>Exclusivo para novos membros. Ganhe até R$ 99 em bônus!</p>
    </div>
    <div class="lucky-grid">
      <div v-for="n in 9" :key="n" class="grid-cell" :class="{ prize: n === 5 }" @click="selectCell(n)">
        <span v-if="n === 5" class="grid-btn">GIRAR</span>
        <span v-else class="grid-prize">?</span>
      </div>
    </div>
    <p class="grid-hint">Toque em GIRAR para revelar seu prêmio!</p>
  </div>
</template>
<script setup>
function selectCell(n) { if (n === 5) alert('Você ganhou R$ 5,00! Bônus de boas-vindas!') }
</script>
<style scoped>
.activity-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }
.act-banner { border-radius: var(--radius-lg); padding: 20px 16px; margin-bottom: 16px; text-align: center; }
.act-banner h3 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.act-banner p { font-size: 12px; color: rgba(255,255,255,0.8); }
.lucky-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
.grid-cell { aspect-ratio: 1; background: var(--bg-card); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255,255,255,0.1); cursor: pointer; transition: var(--transition); }
.grid-cell.prize { background: linear-gradient(135deg, var(--accent-yellow), #f59e0b); border: none; }
.grid-btn { font-size: 16px; font-weight: 800; color: #000; }
.grid-prize { font-size: 24px; font-weight: 800; color: var(--text-muted); }
.grid-hint { text-align: center; font-size: 13px; color: var(--text-muted); }
</style>
