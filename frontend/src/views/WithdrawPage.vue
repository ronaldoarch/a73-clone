<template>
  <div class="withdraw-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Saque</h2>
      <button class="history-btn" @click="$router.push('/report/withdraw')">Histórico</button>
    </div>

    <div class="withdraw-card">
      <div class="balance-row">
        <span class="balance-label">Saldo disponível</span>
        <span class="balance-val">{{ formattedBalance }}</span>
      </div>

      <div class="amount-section">
        <label>Valor do saque</label>
        <div class="amount-input-wrap">
          <span class="currency">R$</span>
          <input v-model.number="amount" type="number" placeholder="0,00" :min="minAmount" :max="maxAmount" />
        </div>
        <div class="amount-range">
          <span>Mín: R$ {{ minAmount }}</span>
          <span>Máx: R$ {{ maxAmount.toLocaleString() }}</span>
        </div>
      </div>

      <AmountBtnList v-model="amount" :amounts="quickAmounts" />

      <div class="fee-section" v-if="amount > 0">
        <div class="fee-row">
          <span>Taxa</span>
          <span class="fee-val">- R$ {{ fee.toFixed(2) }}</span>
        </div>
        <div class="fee-row total">
          <span>Valor a receber</span>
          <span class="receive-val">R$ {{ netAmount.toFixed(2) }}</span>
        </div>
      </div>

      <div class="account-section">
        <h3>Conta para recebimento</h3>
        <div v-if="hasAccounts" class="account-card" @click="$router.push('/withdrawalAccount')">
          <div class="acct-type">PIX</div>
          <span class="acct-key">{{ maskedKey }}</span>
          <span class="acct-arrow">›</span>
        </div>
        <button v-else class="add-account-btn" @click="$router.push('/withdrawalBindAccount')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
          </svg>
          Adicionar conta
        </button>
      </div>

      <button class="withdraw-btn" :disabled="!canSubmit || loading" @click="handleWithdraw">
        {{ loading ? 'Processando...' : 'Solicitar Saque' }}
      </button>
    </div>

    <div class="withdraw-info">
      <p>• Saques processados em dias úteis</p>
      <p>• Máximo de {{ dailyLimit }} saques por dia</p>
      <p>• Verifique se seus dados estão corretos</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWithdrawStore } from '../stores/withdraw'
import { useUserStore } from '../stores/user'
import { storeToRefs } from 'pinia'
import AmountBtnList from '../components/AmountBtnList.vue'

const withdrawStore = useWithdrawStore()
const userStore = useUserStore()
const { balance } = storeToRefs(userStore)
const { hasAccounts, minAmount, maxAmount, dailyLimit, loading } = storeToRefs(withdrawStore)

const amount = ref(0)
const quickAmounts = [50, 100, 200, 500, 1000, 2000]

const formattedBalance = computed(() => `R$ ${(balance.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
const fee = computed(() => withdrawStore.calculateFee(amount.value))
const netAmount = computed(() => withdrawStore.getNetAmount(amount.value))
const canSubmit = computed(() => amount.value >= minAmount.value && amount.value <= maxAmount.value && hasAccounts.value)
const maskedKey = computed(() => '***...***')

async function handleWithdraw() {
  try {
    await withdrawStore.submitWithdraw({ amount: amount.value })
    amount.value = 0
    alert('Saque solicitado com sucesso!')
  } catch (e) {
    alert(e.message || 'Erro ao solicitar saque')
  }
}

onMounted(() => {
  userStore.fetchAssets()
  withdrawStore.fetchWithdrawInfo()
  withdrawStore.fetchBankAccounts()
})
</script>

<style scoped>
.withdraw-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }
.history-btn { font-size: 13px; color: var(--purple-200); font-weight: 500; }

.withdraw-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 20px 16px; }
.balance-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.balance-label { font-size: 13px; color: var(--text-muted); }
.balance-val { font-size: 20px; font-weight: 800; }

.amount-section { margin-bottom: 14px; }
.amount-section label { font-size: 13px; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 8px; }
.amount-input-wrap { display: flex; align-items: center; background: var(--bg-input); border-radius: var(--radius-md); padding: 0 14px; border: 1.5px solid rgba(255,255,255,0.08); margin-bottom: 6px; }
.currency { font-size: 16px; font-weight: 700; color: var(--text-muted); margin-right: 8px; }
.amount-input-wrap input { flex: 1; padding: 12px 0; background: transparent; color: var(--text-primary); font-size: 20px; font-weight: 700; }
.amount-input-wrap input::placeholder { color: var(--text-muted); font-weight: 400; }
.amount-range { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); }

.fee-section { margin-top: 16px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: var(--radius-sm); }
.fee-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary); padding: 4px 0; }
.fee-row.total { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; margin-top: 4px; }
.fee-val { color: var(--accent-red); }
.receive-val { font-weight: 700; color: var(--accent-green); font-size: 15px; }

.account-section { margin-top: 20px; }
.account-section h3 { font-size: 14px; font-weight: 600; margin-bottom: 10px; }
.account-card { display: flex; align-items: center; gap: 12px; padding: 14px; background: var(--bg-input); border-radius: var(--radius-md); cursor: pointer; }
.acct-type { background: var(--purple-500); color: #fff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; }
.acct-key { flex: 1; font-size: 14px; color: var(--text-secondary); }
.acct-arrow { font-size: 20px; color: var(--text-muted); }
.add-account-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; border-radius: var(--radius-md); border: 1.5px dashed rgba(255,255,255,0.2); color: var(--text-secondary); font-size: 14px; font-weight: 500; }

.withdraw-btn { width: 100%; padding: 14px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--purple-300), var(--purple-500)); color: #fff; font-size: 16px; font-weight: 700; margin-top: 20px; transition: var(--transition); }
.withdraw-btn:active { transform: scale(0.98); }
.withdraw-btn:disabled { opacity: 0.4; }

.withdraw-info { margin-top: 16px; padding: 14px; background: var(--bg-card); border-radius: var(--radius-md); }
.withdraw-info p { font-size: 12px; color: var(--text-muted); line-height: 1.8; }
</style>
