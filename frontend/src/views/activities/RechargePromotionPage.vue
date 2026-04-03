<template>
  <div class="activity-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
      <h2>Promoção de Recarga</h2>
    </div>
    <div class="act-banner" style="background:linear-gradient(135deg,#7c3aed,#a855f7)">
      <h3>⚡ Recarregue e ganhe mais!</h3>
      <p>Bônus especiais para recargas durante o período promocional.</p>
    </div>
    <div class="promo-items">
      <div v-for="item in items" :key="item.min" class="promo-item">
        <div class="promo-left">
          <span class="promo-min">Depósito ≥ R$ {{ item.min }}</span>
          <span class="promo-bonus">Bônus: {{ item.bonus }}%</span>
        </div>
        <button class="deposit-btn" @click="$router.push('/main/deposito')">Depositar</button>
      </div>
    </div>
  </div>
</template>
<script setup>
const items = [
  { min: '50', bonus: 10 },
  { min: '100', bonus: 15 },
  { min: '500', bonus: 20 },
  { min: '1.000', bonus: 30 },
  { min: '5.000', bonus: 50 },
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
.promo-items { display: flex; flex-direction: column; gap: 8px; }
.promo-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: var(--bg-card); border-radius: var(--radius-md); }
.promo-min { display: block; font-size: 14px; font-weight: 600; margin-bottom: 2px; }
.promo-bonus { font-size: 12px; color: var(--accent-green); font-weight: 700; }
.deposit-btn { padding: 8px 18px; border-radius: 20px; background: var(--purple-500); color: #fff; font-size: 12px; font-weight: 700; }
</style>
