<template>
  <div class="deposit-page">
    <h2 class="page-title">Depósito</h2>

    <div class="deposit-card">
      <div class="amount-label">Valor do depósito</div>

      <div class="quick-amounts">
        <button
          v-for="amt in amounts"
          :key="amt"
          class="amount-btn"
          :class="{ active: amount === amt }"
          @click="amount = amt"
        >
          R$ {{ amt }}
        </button>
      </div>

      <div class="custom-amount">
        <span class="currency">R$</span>
        <input
          v-model.number="amount"
          type="number"
          placeholder="Outro valor"
          min="10"
        />
      </div>

      <div class="payment-methods">
        <h3>Método de Pagamento</h3>
        <div class="methods-list">
          <div
            v-for="method in methods"
            :key="method.id"
            class="method-item"
            :class="{ active: selectedMethod === method.id }"
            @click="selectedMethod = method.id"
          >
            <span class="method-icon">{{ method.icon }}</span>
            <span class="method-name">{{ method.name }}</span>
            <div class="method-check" v-if="selectedMethod === method.id">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
        </div>
      </div>

      <button class="deposit-btn shiny" :disabled="!amount || !selectedMethod" @click="handleDeposit">
        Depositar R$ {{ amount || '0' }}
      </button>
    </div>

    <div class="deposit-info">
      <p>• Depósito mínimo: R$ 10,00</p>
      <p>• PIX processado em até 5 minutos</p>
      <p>• Suporte 24/7 disponível</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const amounts = [20, 50, 100, 200, 500, 1000]
const amount = ref(50)
const selectedMethod = ref('pix')

const methods = [
  { id: 'pix', name: 'PIX', icon: '⚡' },
  { id: 'bank', name: 'Transferência', icon: '🏦' }
]

function handleDeposit() {
  alert(`Depósito de R$ ${amount.value} via ${selectedMethod.value} — funcionalidade será integrada com a API de pagamento.`)
}
</script>

<style scoped>
.deposit-page {
  padding: 1rem .75rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100%;
}

.page-title {
  font-size: 1.25rem;
  font-weight: var(--ep-font-weight-bold, 700);
  margin-bottom: 1rem;
  color: var(--ep-color-text-default);
}

.deposit-card {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: var(--ep-border-radius-surface-large, 1rem);
  padding: 1.25rem 1rem;
  border: 1px solid var(--ep-color-border-default);
}

.amount-label {
  font-size: var(--ep-font-size-s, .8125rem);
  color: var(--ep-color-text-weakest);
  margin-bottom: .625rem;
}

.quick-amounts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .5rem;
  margin-bottom: .75rem;
}

.amount-btn {
  padding: .625rem;
  border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--ep-color-background-fill-surface-lowered);
  font-size: var(--ep-font-size-m, .875rem);
  font-weight: var(--ep-font-weight-semi-bold, 600);
  color: var(--ep-color-text-default);
  border: 1.5px solid transparent;
  transition: all .2s ease;
}

.amount-btn.active {
  border-color: var(--ep-color-border-selected);
  background: var(--ep-color-background-fill-btn-level-2-bg, rgba(24,170,255,.15));
  color: var(--ep-color-text-selected);
}

.custom-amount {
  display: flex;
  align-items: center;
  background: var(--ep-color-background-fill-surface-lowered);
  border-radius: var(--ep-border-radius-l, .5rem);
  padding: 0 .875rem;
  border: 1.5px solid var(--ep-color-border-default);
  margin-bottom: 1.25rem;
}

.currency {
  font-size: 1rem;
  font-weight: var(--ep-font-weight-bold, 700);
  color: var(--ep-color-text-weakest);
  margin-right: .5rem;
}

.custom-amount input {
  flex: 1;
  padding: .75rem 0;
  background: transparent;
  color: var(--ep-color-text-default);
  font-size: 1.125rem;
  font-weight: var(--ep-font-weight-semi-bold, 600);
}

.custom-amount input::placeholder {
  color: var(--ep-color-text-weakest);
  font-weight: var(--ep-font-weight-regular, 400);
}

.payment-methods h3 {
  font-size: var(--ep-font-size-m, .875rem);
  font-weight: var(--ep-font-weight-semi-bold, 600);
  margin-bottom: .625rem;
  color: var(--ep-color-text-default);
}

.methods-list {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  margin-bottom: 1.25rem;
}

.method-item {
  display: flex;
  align-items: center;
  gap: .625rem;
  padding: .75rem .875rem;
  background: var(--ep-color-background-fill-surface-lowered);
  border-radius: var(--ep-border-radius-l, .5rem);
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all .2s ease;
}

.method-item.active {
  border-color: var(--ep-color-border-selected);
  background: var(--ep-color-background-fill-btn-level-2-bg, rgba(24,170,255,.15));
}

.method-icon { font-size: 1.25rem; }

.method-name {
  flex: 1;
  font-size: var(--ep-font-size-m, .875rem);
  font-weight: var(--ep-font-weight-semi-bold, 600);
  color: var(--ep-color-text-default);
}

.method-check {
  color: var(--ep-accent-green, #17C964);
}

.deposit-btn {
  width: 100%;
  padding: .875rem;
  border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--gradient-primary);
  color: var(--ep-color-text-inverse, #0E1E3D);
  font-size: var(--ep-font-size-l, 1rem);
  font-weight: var(--ep-font-weight-bold, 700);
  transition: all .2s ease;
  position: relative;
  overflow: hidden;
}

.deposit-btn:active { transform: scale(0.98); }
.deposit-btn:disabled { opacity: 0.4; background: var(--ep-color-background-fill-active-disabled); }

.deposit-info {
  margin-top: 1.25rem;
  padding: .875rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: var(--ep-border-radius-l, .5rem);
  border: 1px solid var(--ep-color-border-default);
}

.deposit-info p {
  font-size: var(--ep-font-size-s, .75rem);
  color: var(--ep-color-text-weakest);
  line-height: 1.8;
}
</style>
