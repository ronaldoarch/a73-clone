<template>
  <div class="activity-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
      <h2>Bônus de Recarga</h2>
    </div>
    <div class="act-banner" style="background:linear-gradient(135deg,#16a34a,#22c55e)">
      <h3>💰 Recarga com Bônus Extra!</h3>
      <p>Faça uma recarga e ganhe bônus especial no seu depósito.</p>
    </div>
    <div class="bonus-tiers">
      <div v-for="tier in tiers" :key="tier.min" class="bonus-tier">
        <span class="tier-label">Depósito ≥ R$ {{ tier.min }}</span>
        <span class="tier-bonus">+{{ tier.bonus }}% bônus</span>
        <button class="tier-btn" @click="$router.push('/main/deposito')">Depositar</button>
      </div>
    </div>
  </div>
</template>
<script setup>
const tiers = [
  { min: '20', bonus: 5 }, { min: '100', bonus: 10 },
  { min: '500', bonus: 20 }, { min: '1.000', bonus: 30 }, { min: '5.000', bonus: 50 },
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
.bonus-tiers { display: flex; flex-direction: column; gap: 8px; }
.bonus-tier { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: var(--bg-card); border-radius: var(--radius-md); }
.tier-label { flex: 1; font-size: 13px; font-weight: 600; }
.tier-bonus { font-size: 14px; font-weight: 800; color: var(--accent-green); }
.tier-btn { padding: 7px 14px; border-radius: 20px; background: var(--accent-green); color: #fff; font-size: 12px; font-weight: 700; }
</style>
