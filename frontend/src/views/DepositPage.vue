<template>
  <div class="deposit-page">
    <h2 class="page-title">Depósito</h2>

    <!-- Step 1: Choose amount & pay -->
    <div v-if="step === 'form'" class="deposit-card">
      <div class="amount-label">Valor do depósito</div>

      <div class="quick-amounts">
        <button
          v-for="amt in amounts"
          :key="amt"
          class="amount-btn"
          :class="{ active: amount === amt }"
          @click="amount = amt"
        >
          {{ currency }} {{ amt }}
        </button>
      </div>

      <div class="custom-amount">
        <span class="currency-label">{{ currency }}</span>
        <input
          v-model.number="amount"
          type="number"
          placeholder="Outro valor"
          :min="minDeposit"
        />
      </div>

      <div class="user-fields">
        <div class="field">
          <label>Nome completo</label>
          <input v-model="nome" type="text" placeholder="Seu nome completo" />
        </div>
        <div class="field">
          <label>CPF</label>
          <input v-model="cpf" type="text" placeholder="000.000.000-00" maxlength="14" @input="formatCpf" />
        </div>
      </div>

      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

      <button
        class="deposit-btn shiny"
        :disabled="!canSubmit || isSubmitting"
        @click="handleDeposit"
      >
        <span v-if="isSubmitting" class="btn-spinner"></span>
        <span v-else>Depositar {{ currency }} {{ amount || '0' }}</span>
      </button>
    </div>

    <!-- Step 2: Show PIX QR Code -->
    <div v-else-if="step === 'qrcode'" class="qr-card">
      <div class="qr-header">
        <h3>Escaneie o QR Code para pagar</h3>
        <p class="qr-amount">{{ currency }} {{ pixResult.valor?.toFixed(2) }}</p>
      </div>

      <div class="qr-image-wrap" v-if="pixResult.copyPaste || pixResult.qrcode">
        <QRCodeVue3
          v-if="pixResult.copyPaste"
          :value="pixResult.copyPaste"
          :width="192"
          :height="192"
          :dots-options="{ type: 'rounded', color: '#1a0533' }"
          :corners-square-options="{ type: 'extra-rounded', color: '#7c3aed' }"
          :background-options="{ color: '#ffffff' }"
          image="/assets/ui/logo-icon.png"
          :image-options="{ hideBackgroundDots: true, imageSize: 0.3, margin: 4 }"
        />
        <img v-else :src="pixResult.qrcode" alt="QR Code PIX" class="qr-image" />
      </div>

      <div class="copy-section" v-if="pixResult.copyPaste">
        <label>Copia e Cola PIX:</label>
        <div class="copy-row">
          <input type="text" :value="pixResult.copyPaste" readonly class="copy-input" />
          <button class="copy-btn" @click="copyPixCode">
            {{ copied ? 'Copiado!' : 'Copiar' }}
          </button>
        </div>
      </div>

      <div class="qr-status" :class="{ checking: isPolling }">
        <span v-if="isPolling" class="poll-dot"></span>
        {{ statusText }}
      </div>

      <div class="qr-actions">
        <button class="back-btn" @click="resetForm">Fazer outro depósito</button>
      </div>
    </div>

    <!-- Step 3: Success -->
    <div v-else-if="step === 'success'" class="success-card">
      <div class="success-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#17C964" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="16 8 10 16 7 13"/>
        </svg>
      </div>
      <h3>Depósito Confirmado!</h3>
      <p>{{ currency }} {{ pixResult.valor?.toFixed(2) }} foi adicionado ao seu saldo.</p>
      <button class="deposit-btn" @click="resetForm">Novo depósito</button>
    </div>

    <div class="deposit-info">
      <p>• Depósito mínimo: {{ currency }} {{ minDeposit.toFixed(2) }}</p>
      <p>• PIX processado em até 5 minutos</p>
      <p>• Suporte 24/7 disponível</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import QRCodeVue3 from 'qrcode.vue'
import { writeText } from 'clipboard-polyfill'
import { useSystemStore } from '../stores/system'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/user'

const systemStore = useSystemStore()
const authStore = useAuthStore()
const userStore = useUserStore()

const currency = computed(() => systemStore.currency || 'R$')
const minDeposit = ref(10)

const amounts = [20, 50, 100, 200, 500, 1000]
const amount = ref(50)
const nome = ref('')
const cpf = ref('')
const step = ref('form')
const errorMsg = ref('')
const isSubmitting = ref(false)
const pixResult = ref({})
const copied = ref(false)
const isPolling = ref(false)
const statusText = ref('Aguardando pagamento...')
let pollTimer = null

const canSubmit = computed(() => {
  return amount.value >= minDeposit.value &&
    nome.value.trim().length >= 3 &&
    cpf.value.replace(/\D/g, '').length === 11
})

function formatCpf() {
  let raw = cpf.value.replace(/\D/g, '').slice(0, 11)
  if (raw.length > 9) raw = raw.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
  else if (raw.length > 6) raw = raw.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
  else if (raw.length > 3) raw = raw.replace(/(\d{3})(\d{1,3})/, '$1.$2')
  cpf.value = raw
}

async function handleDeposit() {
  errorMsg.value = ''
  if (!authStore.isLoggedIn) {
    errorMsg.value = 'Faça login para depositar.'
    return
  }

  isSubmitting.value = true
  try {
    const res = await fetch('/api/deposito/pix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        valor: amount.value,
        cpf: cpf.value.replace(/\D/g, ''),
        nome: nome.value.trim()
      })
    })
    const data = await res.json()

    if (data.error) {
      errorMsg.value = data.error.message || 'Erro ao gerar PIX'
      return
    }

    const result = data.result?.data?.json || data
    if (result.ok) {
      pixResult.value = result
      step.value = 'qrcode'
      startPolling(result.externalId)
    } else {
      errorMsg.value = result.message || 'Erro ao processar depósito'
    }
  } catch (e) {
    errorMsg.value = e.message || 'Erro de conexão'
  } finally {
    isSubmitting.value = false
  }
}

function startPolling(externalId) {
  if (!externalId) return
  isPolling.value = true
  statusText.value = 'Aguardando pagamento...'

  const check = async () => {
    try {
      const res = await fetch(`/api/deposito/pix/status/${externalId}`, {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      })
      const data = await res.json()
      const status = data?.result?.data?.json?.status || data?.status || data?.depositStatus

      if (status === 'concluido' || status === 'completed' || status === 'paid') {
        isPolling.value = false
        statusText.value = 'Pagamento confirmado!'
        step.value = 'success'
        userStore.fetchAssets?.()
        return
      }
      if (status === 'expirado' || status === 'expired' || status === 'cancelled') {
        isPolling.value = false
        statusText.value = 'PIX expirado. Tente novamente.'
        return
      }
    } catch {}
    pollTimer = setTimeout(check, 5000)
  }
  pollTimer = setTimeout(check, 3000)
}

function resetForm() {
  step.value = 'form'
  pixResult.value = {}
  errorMsg.value = ''
  isPolling.value = false
  statusText.value = ''
  if (pollTimer) clearTimeout(pollTimer)
}

async function copyPixCode() {
  try {
    await writeText(pixResult.value.copyPaste)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    const input = document.querySelector('.copy-input')
    if (input) { input.select(); document.execCommand('copy'); copied.value = true }
  }
}

onBeforeUnmount(() => { if (pollTimer) clearTimeout(pollTimer) })
</script>

<style scoped>
.deposit-page {
  padding: 1rem .75rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100%;
}

.page-title {
  font-size: 1.25rem; font-weight: var(--ep-font-weight-bold, 700);
  margin-bottom: 1rem; color: var(--ep-color-text-default);
}

.deposit-card, .qr-card, .success-card {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: var(--ep-border-radius-surface-large, 1rem);
  padding: 1.25rem 1rem; border: 1px solid var(--ep-color-border-default);
}

.amount-label {
  font-size: var(--ep-font-size-s, .8125rem); color: var(--ep-color-text-weakest);
  margin-bottom: .625rem;
}

.quick-amounts { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; margin-bottom: .75rem; }

.amount-btn {
  padding: .625rem; border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--ep-color-background-fill-surface-lowered);
  font-size: var(--ep-font-size-m, .875rem); font-weight: var(--ep-font-weight-semi-bold, 600);
  color: var(--ep-color-text-default); border: 1.5px solid transparent; transition: all .2s ease;
}
.amount-btn.active {
  border-color: var(--ep-color-border-selected);
  background: var(--ep-color-background-fill-btn-level-2-bg, rgba(24,170,255,.15));
  color: var(--ep-color-text-selected);
}

.custom-amount {
  display: flex; align-items: center;
  background: var(--ep-color-background-fill-surface-lowered);
  border-radius: var(--ep-border-radius-l, .5rem);
  padding: 0 .875rem; border: 1.5px solid var(--ep-color-border-default); margin-bottom: 1rem;
}
.currency-label {
  font-size: 1rem; font-weight: var(--ep-font-weight-bold, 700);
  color: var(--ep-color-text-weakest); margin-right: .5rem;
}
.custom-amount input {
  flex: 1; padding: .75rem 0; background: transparent;
  color: var(--ep-color-text-default); font-size: 1.125rem;
  font-weight: var(--ep-font-weight-semi-bold, 600);
}
.custom-amount input::placeholder { color: var(--ep-color-text-weakest); font-weight: 400; }

.user-fields { display: flex; flex-direction: column; gap: .75rem; margin-bottom: 1rem; }
.field label {
  display: block; font-size: .75rem; color: var(--ep-color-text-weakest);
  margin-bottom: .25rem;
}
.field input {
  width: 100%; padding: .625rem .75rem;
  background: var(--ep-color-background-fill-surface-lowered);
  border: 1.5px solid var(--ep-color-border-default);
  border-radius: var(--ep-border-radius-l, .5rem);
  color: var(--ep-color-text-default); font-size: .875rem;
}

.error-msg {
  color: #F44336; font-size: .75rem; margin-bottom: .75rem;
  padding: .5rem; border-radius: .375rem;
  background: rgba(244,67,54,.1);
}

.deposit-btn {
  width: 100%; padding: .875rem; border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--gradient-primary); color: var(--ep-color-text-inverse, #0E1E3D);
  font-size: var(--ep-font-size-l, 1rem); font-weight: var(--ep-font-weight-bold, 700);
  transition: all .2s ease; position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center; gap: .5rem;
}
.deposit-btn:active { transform: scale(0.98); }
.deposit-btn:disabled { opacity: 0.4; background: var(--ep-color-background-fill-active-disabled); }

.btn-spinner {
  width: 1.25rem; height: 1.25rem; border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite;
}

/* QR Code step */
.qr-header { text-align: center; margin-bottom: 1rem; }
.qr-header h3 { font-size: 1rem; font-weight: 700; color: var(--ep-color-text-default); }
.qr-amount {
  font-size: 1.5rem; font-weight: 800; color: var(--ep-color-text-selected);
  margin-top: .5rem;
}
.qr-image-wrap {
  display: flex; justify-content: center; padding: 1rem;
  background: #fff; border-radius: .75rem; margin-bottom: 1rem;
}
.qr-image { width: 12rem; height: 12rem; object-fit: contain; }

.copy-section { margin-bottom: 1rem; }
.copy-section label { font-size: .75rem; color: var(--ep-color-text-weakest); margin-bottom: .375rem; display: block; }
.copy-row { display: flex; gap: .5rem; }
.copy-input {
  flex: 1; padding: .5rem; font-size: .6875rem;
  background: var(--ep-color-background-fill-surface-lowered);
  border: 1px solid var(--ep-color-border-default); border-radius: .375rem;
  color: var(--ep-color-text-default); overflow: hidden; text-overflow: ellipsis;
}
.copy-btn {
  padding: .5rem 1rem; border-radius: .375rem;
  background: var(--gradient-primary); color: var(--ep-color-text-inverse, #000);
  font-size: .8125rem; font-weight: 700; white-space: nowrap;
}

.qr-status {
  text-align: center; padding: .75rem; border-radius: .5rem;
  background: var(--ep-color-background-fill-surface-lowered);
  color: var(--ep-color-text-weaker); font-size: .8125rem;
  display: flex; align-items: center; justify-content: center; gap: .5rem;
  margin-bottom: 1rem;
}
.poll-dot {
  width: .5rem; height: .5rem; border-radius: 50%; background: #17C964;
  animation: breathing 1.5s ease-in-out infinite;
}

.qr-actions { text-align: center; }
.back-btn {
  padding: .5rem 1.5rem; border-radius: .375rem;
  background: var(--ep-color-background-fill-surface-raised-L2);
  color: var(--ep-color-text-default); font-size: .8125rem; font-weight: 600;
  border: 1px solid var(--ep-color-border-default);
}

/* Success */
.success-card { text-align: center; padding: 2rem 1rem; }
.success-icon { margin-bottom: 1rem; }
.success-card h3 { font-size: 1.25rem; font-weight: 700; color: #17C964; margin-bottom: .5rem; }
.success-card p { color: var(--ep-color-text-weaker); margin-bottom: 1.5rem; }

.deposit-info {
  margin-top: 1.25rem; padding: .875rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: var(--ep-border-radius-l, .5rem);
  border: 1px solid var(--ep-color-border-default);
}
.deposit-info p { font-size: var(--ep-font-size-s, .75rem); color: var(--ep-color-text-weakest); line-height: 1.8; }

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes breathing { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
</style>
