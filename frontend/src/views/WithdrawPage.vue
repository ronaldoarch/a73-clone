<template>
  <div class="withdraw-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Saque</h2>
      <button class="history-btn" @click="$router.push('/report')">Histórico</button>
    </div>

    <!-- Audit / Balance Info -->
    <div class="audit-card">
      <div class="audit-row">
        <div class="audit-item">
          <span class="audit-label">Saldo</span>
          <span class="audit-val">{{ currency }} {{ formattedBalance }}</span>
          <button class="refresh-btn" :class="{ spinning: refreshing }" @click="refreshBalance">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </button>
        </div>
        <div class="audit-item">
          <span class="audit-label">Aposta Pendente</span>
          <span class="audit-val warn">{{ currency }} {{ fmtMoney(pendingBet) }}</span>
        </div>
      </div>
      <div class="audit-row" v-if="todayBonus > 0 || auditAmount > 0">
        <div class="audit-item" v-if="todayBonus > 0">
          <span class="audit-label">Bônus</span>
          <span class="audit-val green">{{ currency }} {{ fmtMoney(todayBonus) }}</span>
        </div>
        <div class="audit-item" v-if="auditAmount > 0">
          <span class="audit-label">Auditoria</span>
          <span class="audit-val">{{ currency }} {{ fmtMoney(auditAmount) }}</span>
          <button class="audit-detail-btn" @click="$router.push('/withdrawAuditDetails')">Detalhes</button>
        </div>
      </div>
    </div>

    <!-- Withdraw Card -->
    <div class="withdraw-card">
      <!-- Channel Tabs -->
      <div class="channel-tabs" v-if="channelList.length > 1">
        <button
          v-for="ch in channelList"
          :key="ch.id"
          class="channel-tab"
          :class="{ active: activeChannel === ch.id }"
          @click="activeChannel = ch.id"
        >{{ ch.name }}</button>
      </div>
      <!-- Amount Input -->
      <div class="amount-section">
        <label>Valor do saque</label>
        <div class="amount-input-wrap">
          <span class="currency-prefix">{{ currency }}</span>
          <input
            v-model="amountInput"
            type="number"
            inputmode="numeric"
            :placeholder="`${minAmount} - ${maxAmount.toLocaleString()}`"
            @input="onAmountInput"
          />
          <button v-if="amountInput" class="max-btn" @click="setMax">MAX</button>
        </div>
      </div>

      <!-- Quick amount buttons -->
      <div class="quick-amounts">
        <button
          v-for="val in quickAmounts"
          :key="val"
          class="quick-btn"
          :class="{ active: Number(amountInput) === val, disabled: balanceNum < val }"
          @click="amountInput = val"
        >{{ fmtMoney(val) }}</button>
      </div>

      <!-- Fee info -->
      <div class="fee-info" v-if="amountInput > 0">
        <div class="fee-row">
          <span>Taxa de serviço</span>
          <span class="fee-val">{{ currency }} {{ fmtMoney(feeAmount) }}</span>
        </div>
        <div class="fee-row receive">
          <span>Valor a receber</span>
          <span class="receive-val">{{ currency }} {{ fmtMoney(receiveAmount) }}</span>
        </div>
      </div>

      <!-- Account section -->
      <div class="account-section">
        <div class="account-header">
          <span>Conta de recebimento</span>
          <button class="my-accts" @click="$router.push('/withdrawalAccount')">Minhas contas</button>
        </div>
        <div v-if="hasAccounts" class="account-card" @click="$router.push('/withdrawalAccount')">
          <div class="acct-icon">PIX</div>
          <span class="acct-key">{{ maskedKey }}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <button v-else class="add-account-btn" @click="$router.push('/withdrawalBindAccount')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
          </svg>
          Adicionar conta
        </button>
      </div>

      <!-- Submit -->
      <button class="withdraw-btn" :disabled="!canSubmit || loading" @click="handleWithdrawClick">
        {{ loading ? 'Processando...' : (hasAccounts ? 'Solicitar Saque' : 'Cadastrar conta') }}
      </button>
    </div>

    <!-- Info tips -->
    <div class="withdraw-info">
      <p>• Saques processados em dias úteis</p>
      <p>• Máximo de {{ dailyLimit }} saques por dia</p>
      <p>• Verifique se seus dados estão corretos</p>
    </div>

    <!-- Confirm Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="showConfirmModal = false">
      <div class="confirm-modal">
        <button class="modal-close" @click="showConfirmModal = false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <h3>Confirmar Saque</h3>
        <p class="confirm-label">Valor do saque</p>
        <p class="confirm-amount">{{ currency }} {{ fmtMoney(receiveAmount) }}</p>
        <div class="confirm-line"></div>
        <div class="confirm-detail">
          <span>Taxa de serviço</span>
          <span>{{ currency }} {{ fmtMoney(feeAmount) }}</span>
        </div>

        <div class="password-section" v-if="requirePassword">
          <p class="pw-label">Digite sua senha de saque</p>
          <div class="pw-grid">
            <div v-for="i in 6" :key="i" class="pw-dot" :class="{ filled: password.length >= i }"></div>
          </div>
          <input
            ref="pwInput"
            v-model="password"
            type="password"
            inputmode="numeric"
            maxlength="6"
            class="pw-hidden-input"
            autofocus
            @input="onPasswordInput"
          />
        </div>

        <button v-if="!requirePassword" class="confirm-btn" :disabled="loading" @click="executeWithdraw">
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useWithdrawStore } from '../stores/withdraw'
import { useUserStore } from '../stores/user'
import { useSystemStore } from '../stores/system'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const router = useRouter()
const withdrawStore = useWithdrawStore()
const userStore = useUserStore()
const systemStore = useSystemStore()
const { assets } = storeToRefs(userStore)
const { hasAccounts, minAmount, maxAmount, dailyLimit, loading } = storeToRefs(withdrawStore)

const currency = computed(() => systemStore.currency || 'R$')
const amountInput = ref('')
const refreshing = ref(false)
const showConfirmModal = ref(false)
const password = ref('')
const requirePassword = ref(false)
const todayBonus = ref(0)
const pendingBet = ref(0)
const auditAmount = ref(0)
const toastMsg = ref('')
const toastType = ref('success')
const showToast = ref(false)

function toast(msg, type = 'success') {
  toastMsg.value = msg
  toastType.value = type
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}
const activeChannel = ref('pix')
const channelList = ref([
  { id: 'pix', name: 'PIX' },
  { id: 'bank', name: 'Banco' }
])
const pwInput = ref(null)
const quickAmounts = [50, 100, 200, 500, 1000, 2000]

/** Saldo em reais (igual AppHeader / AfiliadoData.balance na API — não é centavos). */
const balanceNum = computed(() => Number(assets.value?.balance ?? 0) || 0)

const formattedBalance = computed(() =>
  balanceNum.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
)

const feeAmount = computed(() => withdrawStore.calculateFee(Number(amountInput.value) || 0))
const receiveAmount = computed(() => withdrawStore.getNetAmount(Number(amountInput.value) || 0))
const canSubmit = computed(() => {
  const amt = Number(amountInput.value)
  return amt >= minAmount.value && amt <= maxAmount.value && amt <= balanceNum.value
})
const maskedKey = computed(() => {
  const accounts = withdrawStore.bankAccounts || []
  if (!accounts.length) return '***...***'
  const acct = accounts[0]
  const key = acct.pixKey || acct.accountNumber || ''
  if (key.length <= 6) return key
  return key.slice(0, 3) + '***' + key.slice(-3)
})

function fmtMoney(reais) {
  const num = Number(reais) || 0
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function onAmountInput() {
  const num = Number(amountInput.value)
  if (num > balanceNum.value) {
    amountInput.value = Math.floor(balanceNum.value)
  }
}

function setMax() {
  amountInput.value = Math.min(Math.floor(balanceNum.value), maxAmount.value)
}

async function refreshBalance() {
  refreshing.value = true
  try { await userStore.fetchAssets() } catch {}
  setTimeout(() => { refreshing.value = false }, 1000)
}

function handleWithdrawClick() {
  if (!hasAccounts.value) {
    router.push('/withdrawalBindAccount')
    return
  }
  if (!canSubmit.value) return
  showConfirmModal.value = true
  password.value = ''
  nextTick(() => { if (pwInput.value) pwInput.value.focus() })
}

function onPasswordInput() {
  if (password.value.length >= 6) {
    executeWithdraw()
  }
}

async function executeWithdraw() {
  try {
    const accounts = withdrawStore.bankAccounts || []
    const acct = accounts[0]
    await withdrawStore.submitWithdraw({
      valor: Number(amountInput.value),
      metodo: 'pix',
      nome: String(acct?.realName || acct?.holderName || acct?.accountHolder || '').trim(),
      cpfId: String(acct?.pixKey || acct?.accountNumber || acct?.key || '').trim(),
      password: password.value || undefined
    })
    showConfirmModal.value = false
    amountInput.value = ''
    password.value = ''
    userStore.fetchAssets()
    toast('Saque solicitado com sucesso!', 'success')
  } catch (e) {
    toast(e.message || 'Erro ao solicitar saque', 'error')
  }
}

async function loadAuditInfo() {
  try {
    const { trpcQuery } = await import('../utils/api')
    const data = await trpcQuery('withdraw.auditInfo')
    if (data) {
      todayBonus.value = data.todayBonus || 0
      pendingBet.value = data.pendingBet || data.pendingValidBet || 0
      auditAmount.value = data.auditAmount || data.withdrawAudit || 0
      requirePassword.value = !!data.requirePassword
    }
  } catch {}
}

onMounted(() => {
  userStore.fetchAssets()
  withdrawStore.fetchWithdrawInfo()
  withdrawStore.fetchBankAccounts()
  loadAuditInfo()
})
</script>

<style scoped>
.withdraw-page {
  padding: 0 .75rem 1.5rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100%;
}
.page-header {
  display: flex; align-items: center; padding: .75rem 0; gap: .75rem;
}
.page-header h2 {
  flex: 1; font-size: 1.125rem;
  font-weight: var(--ep-font-weight-bold, 700);
  color: var(--ep-color-text-default);
}
.back-btn { color: var(--ep-color-text-default); padding: .25rem; }
.history-btn {
  font-size: .8125rem; color: var(--ep-color-text-selected);
  font-weight: 500;
}

/* Audit Card */
.audit-card {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: var(--ep-border-radius-surface-large, 1rem);
  padding: .875rem 1rem; margin-bottom: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.audit-row {
  display: flex; gap: .75rem; justify-content: space-between;
}
.audit-row + .audit-row { margin-top: .625rem; padding-top: .625rem; border-top: 1px solid var(--ep-color-border-default); }
.audit-item {
  display: flex; flex-direction: column; gap: .125rem; flex: 1;
}
.audit-label { font-size: .6875rem; color: var(--ep-color-text-weakest); }
.audit-val {
  font-size: 1.125rem; font-weight: 800;
  color: var(--ep-color-text-default); font-family: var(--font-display);
  display: flex; align-items: center; gap: .375rem;
}
.audit-val.warn { color: var(--color-currency, #FE963B); }
.audit-val.green { color: var(--ep-accent-green, #17C964); }
.audit-detail-btn {
  font-size: .625rem; color: var(--ep-color-text-selected);
  font-weight: 600; text-decoration: underline;
}
.refresh-btn {
  color: var(--ep-color-text-weakest); padding: .25rem;
  transition: transform .3s; display: inline-flex;
}
.refresh-btn.spinning { animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Channel Tabs */
.channel-tabs {
  display: flex; gap: .375rem; margin-bottom: 1rem;
}
.channel-tab {
  flex: 1; padding: .5rem; border-radius: .5rem; text-align: center;
  background: var(--ep-color-background-fill-surface-lowered);
  color: var(--ep-color-text-weak); font-size: .8125rem; font-weight: 600;
  border: 1px solid var(--ep-color-border-default); transition: all .2s;
}
.channel-tab.active {
  background: var(--gradient-primary);
  color: var(--ep-color-text-inverse, #0E1E3D);
  border-color: transparent;
}

/* Withdraw Card */
.withdraw-card {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: var(--ep-border-radius-surface-large, 1rem);
  padding: 1.25rem 1rem;
  border: 1px solid var(--ep-color-border-default);
}
.amount-section { margin-bottom: .75rem; }
.amount-section label {
  font-size: .8125rem; font-weight: 600;
  color: var(--ep-color-text-weak); display: block; margin-bottom: .5rem;
}
.amount-input-wrap {
  display: flex; align-items: center; gap: .5rem;
  background: var(--ep-color-background-fill-surface-lowered);
  border-radius: var(--ep-border-radius-l, .5rem);
  padding: 0 .875rem; border: 1px solid var(--ep-color-border-default);
}
.currency-prefix { font-size: 1rem; font-weight: 700; color: var(--ep-color-text-weakest); }
.amount-input-wrap input {
  flex: 1; padding: .875rem 0; background: transparent;
  color: var(--ep-color-text-default); font-size: 1.25rem; font-weight: 700;
}
.amount-input-wrap input::placeholder { color: var(--ep-color-text-weakest); font-weight: 400; font-size: .875rem; }
.max-btn {
  background: var(--gradient-primary); color: var(--ep-color-text-inverse, #0E1E3D);
  font-size: .6875rem; font-weight: 800; padding: .25rem .5rem; border-radius: .25rem;
}

/* Quick Amounts */
.quick-amounts { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: 1rem; }
.quick-btn {
  flex: 1; min-width: calc(33% - .5rem); padding: .5rem;
  border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--ep-color-background-fill-surface-lowered);
  color: var(--ep-color-text-default); font-size: .8125rem; font-weight: 600;
  border: 1px solid var(--ep-color-border-default); text-align: center;
}
.quick-btn.active {
  background: var(--gradient-primary); color: var(--ep-color-text-inverse, #0E1E3D);
  border-color: transparent;
}
.quick-btn.disabled { opacity: .4; }

/* Fee */
.fee-info {
  margin-bottom: 1rem; padding: .75rem;
  background: var(--ep-color-background-fill-surface-lowered);
  border-radius: var(--ep-border-radius-l, .5rem);
}
.fee-row {
  display: flex; justify-content: space-between;
  font-size: .8125rem; color: var(--ep-color-text-weakest); padding: .25rem 0;
}
.fee-row.receive {
  border-top: 1px solid var(--ep-color-border-default);
  padding-top: .5rem; margin-top: .25rem;
}
.fee-val { color: var(--ep-light-accent-color-red, #F5222D); }
.receive-val { font-weight: 700; color: var(--ep-accent-green, #17C964); font-size: .9375rem; }

/* Account */
.account-section { margin-bottom: 1rem; }
.account-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: .5rem;
}
.account-header span { font-size: .8125rem; font-weight: 600; color: var(--ep-color-text-default); }
.my-accts { font-size: .75rem; color: var(--ep-color-text-selected); }
.account-card {
  display: flex; align-items: center; gap: .75rem; padding: .875rem;
  background: var(--ep-color-background-fill-surface-lowered);
  border-radius: var(--ep-border-radius-l, .5rem); cursor: pointer;
  border: 1px solid var(--ep-color-border-default);
}
.acct-icon {
  background: var(--gradient-primary); color: var(--ep-color-text-inverse, #0E1E3D);
  font-size: .6875rem; font-weight: 800; padding: .25rem .5rem; border-radius: .25rem;
}
.acct-key { flex: 1; font-size: .875rem; color: var(--ep-color-text-weak); }
.add-account-btn {
  display: flex; align-items: center; justify-content: center; gap: .5rem;
  width: 100%; padding: .875rem; border-radius: var(--ep-border-radius-l, .5rem);
  border: 1.5px dashed var(--ep-color-border-default);
  color: var(--ep-color-text-weakest); font-size: .875rem;
}

/* Submit */
.withdraw-btn {
  width: 100%; padding: .875rem;
  border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--gradient-primary); color: var(--ep-color-text-inverse, #0E1E3D);
  font-size: 1rem; font-weight: 700; transition: all .2s;
}
.withdraw-btn:active { transform: scale(0.98); }
.withdraw-btn:disabled { opacity: .4; }

/* Info */
.withdraw-info {
  margin-top: 1rem; padding: .875rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: var(--ep-border-radius-l, .5rem);
  border: 1px solid var(--ep-color-border-default);
}
.withdraw-info p { font-size: .75rem; color: var(--ep-color-text-weakest); line-height: 1.8; }

/* Confirm Modal */
.modal-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,.6); display: flex; align-items: flex-end; justify-content: center;
}
.confirm-modal {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: 1rem 1rem 0 0; padding: 1.5rem; width: 100%; max-width: 28rem;
  position: relative;
}
.modal-close {
  position: absolute; top: 1rem; right: 1rem;
  color: var(--ep-color-text-weakest);
}
.confirm-modal h3 {
  font-size: 1.125rem; font-weight: 700;
  color: var(--ep-color-text-default); text-align: center; margin-bottom: 1rem;
}
.confirm-label { font-size: .75rem; color: var(--ep-color-text-weakest); text-align: center; }
.confirm-amount {
  font-size: 1.75rem; font-weight: 800; text-align: center;
  color: var(--ep-color-text-default); margin: .25rem 0 1rem;
}
.confirm-line {
  height: 1px; background: var(--ep-color-border-default); margin-bottom: .75rem;
}
.confirm-detail {
  display: flex; justify-content: space-between;
  font-size: .8125rem; color: var(--ep-color-text-weakest); margin-bottom: 1rem;
}

/* Password grid */
.password-section { margin: 1rem 0; }
.pw-label {
  font-size: .875rem; color: var(--ep-color-text-default);
  text-align: center; margin-bottom: .75rem;
}
.pw-grid { display: flex; gap: .5rem; justify-content: center; position: relative; }
.pw-dot {
  width: 2.5rem; height: 2.5rem;
  border: 1.5px solid var(--ep-color-border-default);
  border-radius: .375rem; display: flex; align-items: center; justify-content: center;
  background: var(--ep-color-background-fill-surface-lowered);
}
.pw-dot.filled::after {
  content: ''; width: .625rem; height: .625rem;
  background: var(--ep-color-text-default); border-radius: 50%;
}
.pw-hidden-input {
  position: absolute; opacity: 0; width: 1px; height: 1px;
}
.confirm-btn {
  width: 100%; padding: .875rem; margin-top: .5rem;
  border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--gradient-primary); color: var(--ep-color-text-inverse, #0E1E3D);
  font-size: 1rem; font-weight: 700;
}
.confirm-btn:disabled { opacity: .4; }
</style>
