<template>
  <div class="commission-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Recompensa de Comissão</h2>
    </div>

    <div class="commission-banner">
      <div class="banner-bg"></div>
      <div class="banner-inner">
        <div class="banner-top-val">
          <span class="banner-cy">R$</span>
          <span class="banner-amount">{{ lastRewardAmount }}</span>
        </div>
        <p class="banner-sub">Última recompensa recebida</p>
      </div>
    </div>

    <div class="amount-cards">
      <div class="amount-card">
        <div class="ac-top">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          <span class="ac-label">Comissão Total</span>
        </div>
        <span class="ac-val">R$ {{ totalCommission }}</span>
      </div>
      <div class="divider-v"></div>
      <div class="amount-card">
        <div class="ac-top">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-yellow)" stroke-width="2"><path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"/><rect x="2" y="7" width="20" height="5" rx="1"/></svg>
          <span class="ac-label">Bônus Disponível</span>
        </div>
        <span class="ac-val highlight">R$ {{ availableBonus }}</span>
      </div>
    </div>

    <div class="tiers-section">
      <h3>Níveis de Recompensa</h3>
      <div class="tiers-table">
        <div class="tier-header">
          <span>Comissão Gerada</span>
          <span>Bônus</span>
        </div>
        <div v-for="tier in tiers" :key="tier.condition" class="tier-row" :class="{ reached: tier.reached }">
          <span class="tier-cond">
            <svg v-if="tier.reached" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            ≥ R$ {{ tier.condition }}
          </span>
          <span class="tier-reward">R$ {{ tier.reward }}</span>
        </div>
      </div>
    </div>

    <button class="claim-btn" :disabled="parseFloat(availableBonus) <= 0" @click="claimBonus">
      {{ parseFloat(availableBonus) > 0 ? 'Resgatar Bônus' : 'Nenhum bônus disponível' }}
    </button>

    <div class="rules-section">
      <h3>Regras</h3>
      <ul>
        <li>Gere comissões convidando amigos para apostar</li>
        <li>Quando sua comissão total atingir um nível, o bônus é liberado</li>
        <li>Bônus é creditado automaticamente após resgate</li>
        <li>Cada nível pode ser resgatado apenas uma vez</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const totalCommission = ref('125,00')
const availableBonus = ref('10,00')
const lastRewardAmount = ref('10,00')

const tiers = ref([
  { condition: '50', reward: '5', reached: true },
  { condition: '100', reward: '10', reached: true },
  { condition: '500', reward: '60', reached: false },
  { condition: '1.000', reward: '150', reached: false },
  { condition: '5.000', reward: '800', reached: false },
  { condition: '10.000', reward: '2.000', reached: false },
])

function claimBonus() {
  if (parseFloat(availableBonus.value) <= 0) return
  availableBonus.value = '0,00'
}
</script>

<style scoped>
.commission-page {
  padding: 0 .75rem 6rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100vh;
}
.page-header { display: flex; align-items: center; padding: .75rem 0; gap: .75rem; }
.page-header h2 { flex: 1; font-size: 1.125rem; font-weight: 700; color: var(--ep-color-text-default); }
.back-btn { color: var(--ep-color-text-default); padding: .25rem; background: none; border: none; cursor: pointer; }

.commission-banner { position: relative; border-radius: .75rem; overflow: hidden; margin-bottom: .75rem; }
.banner-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%); }
.banner-inner { position: relative; z-index: 1; padding: 1.5rem 1rem; text-align: center; }
.banner-top-val { display: flex; align-items: baseline; justify-content: center; gap: .25rem; }
.banner-cy { font-size: 1rem; font-weight: 600; opacity: .8; }
.banner-amount { font-size: 2rem; font-weight: 900; }
.banner-sub { font-size: .75rem; color: rgba(255,255,255,.7); margin-top: .25rem; }

.amount-cards {
  display: flex; align-items: stretch;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; margin-bottom: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.amount-card { flex: 1; padding: 1rem; text-align: center; }
.ac-top { display: flex; align-items: center; justify-content: center; gap: .25rem; margin-bottom: .375rem; }
.ac-label { font-size: .6875rem; color: var(--ep-color-text-weakest); }
.ac-val { font-size: 1.125rem; font-weight: 800; color: var(--ep-color-text-default); display: block; }
.ac-val.highlight { color: var(--accent-green, #22c55e); }
.divider-v { width: 1px; background: var(--ep-color-border-default); margin: .75rem 0; }

.tiers-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-bottom: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.tiers-section h3 { font-size: .875rem; font-weight: 700; margin-bottom: .625rem; color: var(--ep-color-text-default); }

.tier-header {
  display: flex; justify-content: space-between; padding: .5rem .625rem;
  font-size: .6875rem; font-weight: 600; color: var(--ep-color-text-weakest);
  background: rgba(255,255,255,.03); border-radius: .375rem;
}
.tier-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: .625rem; font-size: .8125rem;
  border-bottom: 1px solid rgba(255,255,255,.03);
}
.tier-row.reached { background: rgba(34,197,94,.05); }
.tier-cond { display: flex; align-items: center; gap: .25rem; }
.tier-reward { font-weight: 700; color: var(--accent-green, #22c55e); }

.claim-btn {
  width: 100%; padding: .875rem; border-radius: .5rem;
  font-size: 1rem; font-weight: 700; border: none; cursor: pointer;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff; transition: all .2s;
}
.claim-btn:active:not(:disabled) { transform: scale(.97); }
.claim-btn:disabled { opacity: .4; cursor: default; }

.rules-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-top: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.rules-section h3 { font-size: .875rem; font-weight: 700; margin-bottom: .625rem; color: var(--ep-color-text-default); }
.rules-section ul { list-style: none; padding: 0; margin: 0; }
.rules-section li {
  font-size: .75rem; color: var(--ep-color-text-weakest);
  padding: .375rem 0 .375rem 1rem; position: relative; line-height: 1.5;
}
.rules-section li::before {
  content: ''; position: absolute; left: 0; top: .625rem;
  width: .25rem; height: .25rem; border-radius: 50%;
  background: var(--accent-green, #22c55e);
}
</style>
