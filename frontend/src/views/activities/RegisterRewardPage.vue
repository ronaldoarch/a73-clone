<template>
  <div class="register-reward-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Recompensa de Registro</h2>
    </div>

    <div class="reward-banner">
      <div class="banner-bg"></div>
      <div class="banner-inner">
        <h3>Registre-se e Ganhe!</h3>
        <p>Novos membros ganham bônus exclusivos</p>
      </div>
    </div>

    <div class="reward-showcase">
      <div class="showcase-circle" :class="{ spinning: isSpinning }">
        <div class="circle-inner">
          <span class="circle-label">Até</span>
          <span class="circle-amount">R$ 99</span>
          <span class="circle-sub">em bônus</span>
        </div>
      </div>
      <div class="showcase-rays"></div>
    </div>

    <div class="steps-section">
      <h3>Como Ganhar</h3>
      <div class="steps">
        <div class="step" :class="{ done: step >= 1 }">
          <div class="step-num">1</div>
          <div class="step-info">
            <span class="step-title">Registre-se</span>
            <span class="step-desc">Crie sua conta gratuita</span>
          </div>
          <svg v-if="step >= 1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="step-connector"></div>
        <div class="step" :class="{ done: step >= 2 }">
          <div class="step-num">2</div>
          <div class="step-info">
            <span class="step-title">Verifique</span>
            <span class="step-desc">Vincule seu CPF</span>
          </div>
          <svg v-if="step >= 2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="step-connector"></div>
        <div class="step" :class="{ done: step >= 3 }">
          <div class="step-num">3</div>
          <div class="step-info">
            <span class="step-title">Deposite</span>
            <span class="step-desc">Faça seu primeiro depósito</span>
          </div>
          <svg v-if="step >= 3" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </div>
    </div>

    <div class="bonus-tiers">
      <h3>Tabela de Bônus</h3>
      <div class="tier-list">
        <div v-for="tier in bonusTiers" :key="tier.deposit" class="tier-item">
          <span class="tier-deposit">Depósito ≥ R$ {{ tier.deposit }}</span>
          <span class="tier-bonus">+ R$ {{ tier.bonus }}</span>
        </div>
      </div>
    </div>

    <button class="action-btn" @click="handleAction">
      {{ step === 0 ? 'Registrar Agora' : step < 3 ? 'Continuar' : 'Depositar e Ganhar' }}
    </button>

    <div class="rules-section">
      <h3>Regras</h3>
      <ul>
        <li>Disponível apenas para novos membros</li>
        <li>Bônus creditado após primeiro depósito qualificado</li>
        <li>Bônus tem requisito de aposta de 3x antes do saque</li>
        <li>Promoção válida por 7 dias após o registro</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const step = ref(0)
const isSpinning = ref(true)

const bonusTiers = [
  { deposit: '20', bonus: '5' },
  { deposit: '50', bonus: '15' },
  { deposit: '100', bonus: '35' },
  { deposit: '200', bonus: '70' },
  { deposit: '500', bonus: '99' },
]

function handleAction() {
  if (step.value === 0) {
    router.push('/register')
  } else if (step.value < 3) {
    router.push('/bindCPF')
  } else {
    router.push('/main/deposito')
  }
}
</script>

<style scoped>
.register-reward-page {
  padding: 0 .75rem 6rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100vh;
}
.page-header { display: flex; align-items: center; padding: .75rem 0; gap: .75rem; }
.page-header h2 { flex: 1; font-size: 1.125rem; font-weight: 700; color: var(--ep-color-text-default); }
.back-btn { color: var(--ep-color-text-default); padding: .25rem; background: none; border: none; cursor: pointer; }

.reward-banner { position: relative; border-radius: .75rem; overflow: hidden; margin-bottom: .75rem; }
.banner-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #e11d48, #f43f5e, #fb7185); }
.banner-inner { position: relative; z-index: 1; padding: 1.25rem 1rem; text-align: center; }
.banner-inner h3 { font-size: 1.25rem; font-weight: 800; }
.banner-inner p { font-size: .75rem; color: rgba(255,255,255,.75); margin-top: .25rem; }

.reward-showcase {
  display: flex; justify-content: center; padding: 1.5rem 0;
  position: relative;
}
.showcase-rays {
  position: absolute; inset: 0;
  background: radial-gradient(circle, rgba(251,191,36,.08) 0%, transparent 70%);
  pointer-events: none;
}
.showcase-circle {
  width: 9rem; height: 9rem; border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 2rem rgba(251,191,36,.4);
  position: relative; z-index: 1;
}
.showcase-circle.spinning { animation: pulse-glow 2s ease infinite; }
.circle-inner { display: flex; flex-direction: column; align-items: center; }
.circle-label { font-size: .75rem; font-weight: 600; color: rgba(0,0,0,.5); }
.circle-amount { font-size: 2rem; font-weight: 900; color: #000; line-height: 1; }
.circle-sub { font-size: .625rem; color: rgba(0,0,0,.5); }

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 1.5rem rgba(251,191,36,.3); }
  50% { box-shadow: 0 0 3rem rgba(251,191,36,.6); }
}

.steps-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-bottom: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.steps-section h3 { font-size: .875rem; font-weight: 700; margin-bottom: .75rem; color: var(--ep-color-text-default); }
.steps { display: flex; flex-direction: column; gap: 0; }
.step {
  display: flex; align-items: center; gap: .75rem; padding: .625rem;
  border-radius: .5rem; background: rgba(255,255,255,.02);
}
.step.done { background: rgba(34,197,94,.05); }
.step-num {
  width: 2rem; height: 2rem; border-radius: 50%;
  background: rgba(255,255,255,.06); display: flex;
  align-items: center; justify-content: center;
  font-size: .875rem; font-weight: 800; color: var(--ep-color-text-weakest);
}
.step.done .step-num { background: rgba(34,197,94,.15); color: #22c55e; }
.step-info { flex: 1; }
.step-title { display: block; font-size: .8125rem; font-weight: 600; color: var(--ep-color-text-default); }
.step-desc { display: block; font-size: .6875rem; color: var(--ep-color-text-weakest); }
.step-connector { height: 1rem; width: 1px; background: rgba(255,255,255,.06); margin-left: 1rem; }

.bonus-tiers {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-bottom: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.bonus-tiers h3 { font-size: .875rem; font-weight: 700; margin-bottom: .625rem; color: var(--ep-color-text-default); }
.tier-list { display: flex; flex-direction: column; gap: .25rem; }
.tier-item {
  display: flex; justify-content: space-between; padding: .5rem .625rem;
  font-size: .8125rem; border-radius: .375rem; background: rgba(255,255,255,.02);
}
.tier-deposit { color: var(--ep-color-text-default); }
.tier-bonus { color: var(--accent-green, #22c55e); font-weight: 700; }

.action-btn {
  width: 100%; padding: .875rem; border-radius: .5rem;
  font-size: 1rem; font-weight: 700; border: none; cursor: pointer;
  background: linear-gradient(135deg, #e11d48, #f43f5e);
  color: #fff; transition: all .2s;
}
.action-btn:active { transform: scale(.97); }

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
  background: #e11d48;
}
</style>
