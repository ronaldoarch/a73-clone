<template>
  <div class="bind-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Vincular Conta</h2>
    </div>

    <div class="bind-card">
      <div class="type-selector">
        <button v-for="t in types" :key="t" class="type-btn" :class="{ active: selectedType === t }" @click="selectedType = t">{{ t }}</button>
      </div>

      <div class="input-group">
        <label>Chave PIX</label>
        <input v-model="pixKey" type="text" :placeholder="keyPlaceholder" />
      </div>

      <div class="input-group">
        <label>Nome do titular</label>
        <input v-model="holderName" type="text" placeholder="Nome completo" />
      </div>

      <button class="submit-btn" :disabled="!pixKey || !holderName || loading" @click="handleBind">
        {{ loading ? 'Vinculando...' : 'Vincular' }}
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

const types = ['CPF', 'CNPJ', 'Email', 'Telefone', 'Aleatória']
const selectedType = ref('CPF')
const pixKey = ref('')
const holderName = ref('')
const loading = ref(false)

const keyPlaceholder = computed(() => {
  const map = { CPF: '000.000.000-00', CNPJ: '00.000.000/0000-00', Email: 'email@exemplo.com', Telefone: '+5511999999999', 'Aleatória': 'Chave aleatória' }
  return map[selectedType.value] || ''
})

async function handleBind() {
  loading.value = true
  try {
    await store.bindBankAccount({ type: selectedType.value, key: pixKey.value, holderName: holderName.value })
    alert('Conta vinculada com sucesso!')
    router.back()
  } catch (e) {
    alert(e.message || 'Erro ao vincular conta')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.bind-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }
.bind-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 20px 16px; }
.type-selector { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.type-btn { padding: 8px 14px; border-radius: 20px; background: rgba(255,255,255,0.06); color: var(--text-muted); font-size: 12px; font-weight: 600; }
.type-btn.active { background: var(--purple-500); color: #fff; }
.input-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.input-group label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
.input-group input { width: 100%; padding: 12px 14px; background: var(--bg-input); border: 1.5px solid rgba(255,255,255,0.08); border-radius: var(--radius-md); color: var(--text-primary); font-size: 15px; }
.input-group input::placeholder { color: var(--text-muted); }
.submit-btn { width: 100%; padding: 14px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--purple-300), var(--purple-500)); color: #fff; font-size: 16px; font-weight: 700; margin-top: 8px; }
.submit-btn:disabled { opacity: 0.4; }
</style>
