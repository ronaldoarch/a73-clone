<template>
  <div class="activity-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
      <h2>Recompensa de Registro</h2>
    </div>
    <div class="act-banner" style="background:linear-gradient(135deg,#e11d48,#f43f5e)">
      <h3>🎁 Gire e ganhe ao se registrar!</h3>
      <p>Novos membros ganham giros grátis na roleta da sorte!</p>
    </div>
    <div class="reward-display">
      <div class="reward-circle">
        <span class="reward-val">R$ 99</span>
        <span class="reward-text">Até</span>
      </div>
    </div>
    <button class="action-btn" @click="$router.push('/register')">Registrar e Ganhar</button>
  </div>
</template>
<style scoped>
.activity-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }
.act-banner { border-radius: var(--radius-lg); padding: 20px 16px; margin-bottom: 16px; text-align: center; }
.act-banner h3 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.act-banner p { font-size: 12px; color: rgba(255,255,255,0.8); }
.reward-display { display: flex; justify-content: center; margin: 24px 0; }
.reward-circle { width: 140px; height: 140px; border-radius: 50%; background: linear-gradient(135deg, #fbbf24, #f59e0b); display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 24px rgba(251,191,36,0.4); }
.reward-val { font-size: 32px; font-weight: 900; color: #000; }
.reward-text { font-size: 14px; font-weight: 600; color: rgba(0,0,0,0.6); }
.action-btn { width: 100%; padding: 14px; border-radius: var(--radius-md); background: linear-gradient(135deg, #e11d48, #f43f5e); color: #fff; font-size: 16px; font-weight: 700; }
</style>
