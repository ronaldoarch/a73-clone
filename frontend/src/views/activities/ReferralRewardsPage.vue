<template>
  <div class="activity-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
      <h2>Recompensas de Indicação</h2>
    </div>
    <div class="act-banner" style="background:linear-gradient(135deg,#0ea5e9,#3b82f6)">
      <h3>🤝 Indique e ganhe!</h3>
      <p>Ganhe bônus para cada amigo que se registrar e fazer o primeiro depósito.</p>
    </div>
    <div class="tiers">
      <div v-for="tier in tiers" :key="tier.count" class="tier-card">
        <span class="tier-target">{{ tier.count }} amigos</span>
        <span class="tier-reward">{{ tier.reward }}</span>
      </div>
    </div>
    <button class="action-btn" @click="$router.push('/spread')">Compartilhar Agora</button>
  </div>
</template>
<script setup>
const tiers = [
  { count: 1, reward: 'R$ 5' }, { count: 3, reward: 'R$ 20' },
  { count: 5, reward: 'R$ 50' }, { count: 10, reward: 'R$ 120' },
  { count: 20, reward: 'R$ 300' }, { count: 50, reward: 'R$ 1.000' },
]
</script>
<style scoped>
.activity-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }
.act-banner { border-radius: var(--radius-lg); padding: 20px 16px; margin-bottom: 16px; text-align: center; }
.act-banner h3 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.act-banner p { font-size: 12px; color: rgba(255,255,255,0.8); }
.tiers { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px; }
.tier-card { background: var(--bg-card); border-radius: var(--radius-md); padding: 14px; text-align: center; }
.tier-target { display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 4px; }
.tier-reward { font-size: 18px; font-weight: 800; color: var(--accent-yellow); }
.action-btn { width: 100%; padding: 14px; border-radius: var(--radius-md); background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; font-size: 16px; font-weight: 700; }
</style>
