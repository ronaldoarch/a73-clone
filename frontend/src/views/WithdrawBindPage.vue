<template>
  <div class="bind-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Adicionar Conta</h2>
    </div>

    <!-- Tips -->
    <div class="tip-box">
      <div class="tip-item">
        <span class="tip-num">1.</span>
        <span>Para segurança dos fundos, vincule uma conta bancária ou PIX em seu nome.</span>
      </div>
      <div class="tip-item">
        <span class="tip-num">2.</span>
        <span>Certifique-se de que as informações estão corretas para evitar falhas no saque.</span>
      </div>
    </div>

    <!-- Account Type Tabs -->
    <div class="type-tabs">
      <button
        v-for="t in accountTypes" :key="t.id"
        class="type-tab" :class="{ active: selectedType === t.id }"
        @click="selectType(t.id)"
      >{{ t.label }}</button>
    </div>

    <!-- Form -->
    <div class="bind-form">
      <!-- Real Name -->
      <div class="field">
        <label class="field-label">Nome do Titular <span class="req">*</span></label>
        <div class="input-wrap">
          <input
            v-model="form.realName"
            type="text"
            placeholder="Nome completo conforme documento"
            maxlength="128"
            :readonly="isRealNameReadonly"
            class="field-input"
          />
        </div>
      </div>

      <!-- PIX fields -->
      <template v-if="selectedType === 'PIX'">
        <div class="field">
          <label class="field-label">Tipo de Chave PIX <span class="req">*</span></label>
          <div class="pix-type-selector">
            <button
              v-for="pt in pixTypes" :key="pt"
              class="pix-type-btn" :class="{ active: pixKeyType === pt }"
              @click="pixKeyType = pt"
            >{{ pt }}</button>
          </div>
        </div>
        <div class="field">
          <label class="field-label">Chave PIX <span class="req">*</span></label>
          <div class="input-wrap">
            <input
              v-model="form.pixKey"
              type="text"
              :placeholder="pixPlaceholder"
              class="field-input"
            />
          </div>
          <span v-if="pixError" class="field-error">{{ pixError }}</span>
        </div>
      </template>

      <!-- Bank fields -->
      <template v-if="selectedType === 'BANK'">
        <div class="field" v-if="bankList.length > 1">
          <label class="field-label">Banco <span class="req">*</span></label>
          <div class="select-wrap" @click="showBankSelect = !showBankSelect">
            <span :class="form.bankCode ? 'selected-val' : 'placeholder-val'">
              {{ selectedBankName || 'Selecione o banco' }}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ rotated: showBankSelect }">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <div v-if="showBankSelect" class="bank-dropdown">
            <input v-model="bankSearch" placeholder="Buscar banco..." class="bank-search" />
            <div
              v-for="bank in filteredBanks" :key="bank.code"
              class="bank-option" :class="{ active: form.bankCode === bank.code }"
              @click="selectBank(bank)"
            >
              <img v-if="bank.icon" :src="bank.icon" class="bank-icon" />
              <span>{{ bank.name }}</span>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="field-label">Número da Conta <span class="req">*</span></label>
          <div class="input-wrap">
            <input
              v-model="form.bankAccount"
              type="text"
              placeholder="Número da conta bancária"
              maxlength="64"
              class="field-input"
            />
          </div>
        </div>
      </template>

      <!-- Submit -->
      <button class="submit-btn" :disabled="!canSubmit || loading" @click="handleSubmit">
        <template v-if="loading">
          <div class="btn-spinner"></div>
          Vinculando...
        </template>
        <template v-else>Vincular Conta</template>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWithdrawStore } from '../stores/withdraw'

const router = useRouter()
const store = useWithdrawStore()

const accountTypes = [
  { id: 'PIX', label: 'PIX' },
  { id: 'BANK', label: 'Conta Bancária' }
]

const pixTypes = ['CPF', 'CNPJ', 'Email', 'Telefone', 'Aleatória']

const selectedType = ref('PIX')
const pixKeyType = ref('CPF')
const showBankSelect = ref(false)
const bankSearch = ref('')
const loading = ref(false)
const isRealNameReadonly = ref(false)

const form = ref({
  realName: '',
  pixKey: '',
  bankCode: '',
  bankAccount: ''
})

const bankList = ref([
  { code: 'BB', name: 'Banco do Brasil', icon: '' },
  { code: 'CEF', name: 'Caixa Econômica Federal', icon: '' },
  { code: 'ITAU', name: 'Itaú Unibanco', icon: '' },
  { code: 'BRADESCO', name: 'Bradesco', icon: '' },
  { code: 'SANTANDER', name: 'Santander', icon: '' },
  { code: 'NUBANK', name: 'Nubank', icon: '' },
  { code: 'INTER', name: 'Banco Inter', icon: '' },
  { code: 'C6', name: 'C6 Bank', icon: '' },
  { code: 'PAGBANK', name: 'PagBank', icon: '' },
  { code: 'MERCPAGO', name: 'Mercado Pago', icon: '' },
  { code: 'PICPAY', name: 'PicPay', icon: '' },
  { code: 'BTG', name: 'BTG Pactual', icon: '' },
  { code: 'SAFRA', name: 'Banco Safra', icon: '' },
  { code: 'SICOOB', name: 'Sicoob', icon: '' },
  { code: 'SICREDI', name: 'Sicredi', icon: '' },
  { code: 'ORIGINAL', name: 'Banco Original', icon: '' },
  { code: 'NEON', name: 'Neon', icon: '' },
  { code: 'OTHER', name: 'Outro', icon: '' }
])

const filteredBanks = computed(() => {
  if (!bankSearch.value) return bankList.value
  const q = bankSearch.value.toLowerCase()
  return bankList.value.filter(b => b.name.toLowerCase().includes(q))
})

const selectedBankName = computed(() => {
  const b = bankList.value.find(x => x.code === form.value.bankCode)
  return b?.name || ''
})

const pixPlaceholder = computed(() => {
  const map = {
    CPF: '000.000.000-00',
    CNPJ: '00.000.000/0000-00',
    Email: 'email@exemplo.com',
    Telefone: '+5511999999999',
    'Aleatória': 'Chave aleatória'
  }
  return map[pixKeyType.value] || ''
})

const pixError = computed(() => {
  if (!form.value.pixKey) return ''
  if (pixKeyType.value === 'CPF' && !/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(form.value.pixKey)) {
    return 'CPF inválido'
  }
  if (pixKeyType.value === 'Email' && !form.value.pixKey.includes('@')) {
    return 'Email inválido'
  }
  return ''
})

const canSubmit = computed(() => {
  if (!form.value.realName.trim()) return false
  if (selectedType.value === 'PIX') {
    return form.value.pixKey.trim().length > 0 && !pixError.value
  }
  if (selectedType.value === 'BANK') {
    return form.value.bankAccount.trim().length > 0
  }
  return false
})

function selectType(id) {
  selectedType.value = id
  showBankSelect.value = false
}

function selectBank(bank) {
  form.value.bankCode = bank.code
  showBankSelect.value = false
  bankSearch.value = ''
}

async function handleSubmit() {
  loading.value = true
  try {
    const payload = {
      type: selectedType.value,
      holderName: form.value.realName
    }
    if (selectedType.value === 'PIX') {
      payload.keyType = pixKeyType.value
      payload.key = form.value.pixKey
    } else {
      payload.bankCode = form.value.bankCode
      payload.bankAccount = form.value.bankAccount
    }
    await store.bindBankAccount(payload)
    router.back()
  } catch (e) {
    console.error('Bind failed:', e)
    window.alert(e?.message || 'Não foi possível vincular a conta. Tente novamente.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.bind-page {
  padding: 0 .75rem 1.5rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100%;
}
.page-header { display: flex; align-items: center; padding: .75rem 0; gap: .75rem; }
.page-header h2 { flex: 1; font-size: 1.125rem; font-weight: 700; color: var(--ep-color-text-default); }
.back-btn { color: var(--ep-color-text-default); padding: 4px; }

.tip-box { margin-bottom: 1rem; }
.tip-item {
  display: flex; gap: .375rem; padding: .5rem .75rem;
  background: rgba(251,191,36,.08); border-radius: .375rem;
  font-size: .75rem; color: var(--accent-yellow, #fbbf24);
  margin-bottom: .25rem;
}
.tip-num { font-weight: 700; flex-shrink: 0; }

.type-tabs { display: flex; gap: .375rem; margin-bottom: 1rem; }
.type-tab {
  flex: 1; padding: .625rem; text-align: center;
  border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--ep-color-background-fill-surface-raised-L1);
  border: 1px solid var(--ep-color-border-default);
  color: var(--ep-color-text-weak); font-size: .8125rem; font-weight: 600;
  transition: all .2s;
}
.type-tab.active {
  background: var(--gradient-primary);
  color: var(--ep-color-text-inverse, #0E1E3D);
  border-color: transparent;
}

.bind-form {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border: 1px solid var(--ep-color-border-default);
  border-radius: var(--ep-border-radius-l, .5rem);
  padding: 1.25rem 1rem;
}

.field { margin-bottom: 1rem; }
.field-label {
  display: block; font-size: .8125rem; font-weight: 600;
  color: var(--ep-color-text-default); margin-bottom: .375rem;
}
.req { color: #f5222d; }
.input-wrap {
  border: 1.5px solid var(--ep-color-border-default);
  border-radius: .5rem; overflow: hidden;
  transition: border-color .2s;
}
.input-wrap:focus-within { border-color: var(--ep-color-border-brand, var(--ep-color-text-selected)); }
.field-input {
  width: 100%; padding: .75rem; background: transparent;
  color: var(--ep-color-text-default); font-size: .9375rem;
  border: none; outline: none;
}
.field-input::placeholder { color: var(--ep-color-text-weakest); }
.field-input:read-only { opacity: .6; }
.field-error { font-size: .6875rem; color: #f5222d; margin-top: .25rem; display: block; }

.pix-type-selector { display: flex; flex-wrap: wrap; gap: .375rem; }
.pix-type-btn {
  padding: .5rem .875rem; border-radius: 1.25rem;
  background: rgba(255,255,255,.04); border: 1px solid var(--ep-color-border-default);
  color: var(--ep-color-text-weak); font-size: .75rem; font-weight: 600;
  transition: all .2s;
}
.pix-type-btn.active {
  background: var(--ep-dynamic-primary, rgba(24,170,255,.15));
  color: var(--ep-color-text-selected);
  border-color: var(--ep-color-border-brand, var(--ep-color-text-selected));
}

.select-wrap {
  display: flex; align-items: center; justify-content: space-between;
  padding: .75rem; border: 1.5px solid var(--ep-color-border-default);
  border-radius: .5rem; cursor: pointer; transition: border-color .2s;
}
.select-wrap:hover { border-color: var(--ep-color-border-brand, var(--ep-color-text-selected)); }
.selected-val { color: var(--ep-color-text-default); font-size: .9375rem; }
.placeholder-val { color: var(--ep-color-text-weakest); font-size: .9375rem; }
.select-wrap svg { transition: transform .2s; }
.select-wrap svg.rotated { transform: rotate(180deg); }

.bank-dropdown {
  margin-top: .375rem; border: 1px solid var(--ep-color-border-default);
  border-radius: .5rem; max-height: 15rem; overflow-y: auto;
  background: var(--ep-color-background-fill-surface-raised-L1);
}
.bank-search {
  width: 100%; padding: .625rem .75rem;
  background: transparent; border: none; border-bottom: 1px solid var(--ep-color-border-default);
  color: var(--ep-color-text-default); font-size: .8125rem; outline: none;
}
.bank-search::placeholder { color: var(--ep-color-text-weakest); }
.bank-option {
  display: flex; align-items: center; gap: .625rem;
  padding: .75rem; cursor: pointer; transition: background .15s;
  font-size: .875rem; color: var(--ep-color-text-default);
}
.bank-option:hover, .bank-option.active {
  background: var(--ep-dynamic-primary, rgba(24,170,255,.08));
}
.bank-option.active { font-weight: 600; color: var(--ep-color-text-selected); }
.bank-icon { width: 1.5rem; height: 1.5rem; border-radius: .25rem; }

.submit-btn {
  width: 100%; padding: .875rem; margin-top: .5rem;
  border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--gradient-primary);
  color: var(--ep-color-text-inverse, #0E1E3D);
  font-size: 1rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; gap: .5rem;
}
.submit-btn:disabled { opacity: .4; }
.btn-spinner {
  width: 1rem; height: 1rem; border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff; border-radius: 50%;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
