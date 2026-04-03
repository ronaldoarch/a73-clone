<template>
  <div class="activity-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
      <h2>Convide com CPF</h2>
    </div>
    <div class="act-banner" style="background:linear-gradient(135deg,#059669,#22c55e)">
      <h3>📋 Convide amigos com CPF</h3>
      <p>Ganhe bônus por cada amigo que vincular o CPF e depositar.</p>
    </div>
    <div class="invite-stats">
      <div class="stat"><span class="stat-val">0</span><span class="stat-lbl">CPFs vinculados</span></div>
      <div class="stat"><span class="stat-val">R$ 0</span><span class="stat-lbl">Bônus ganho</span></div>
    </div>
    <button class="action-btn" @click="$router.push('/spread')">Compartilhar Link</button>
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
.invite-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
.stat { background: var(--bg-card); border-radius: var(--radius-md); padding: 16px; text-align: center; }
.stat-val { display: block; font-size: 22px; font-weight: 800; margin-bottom: 4px; }
.stat-lbl { font-size: 12px; color: var(--text-muted); }
.action-btn { width: 100%; padding: 14px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--accent-green), #16a34a); color: #fff; font-size: 16px; font-weight: 700; }
</style>
