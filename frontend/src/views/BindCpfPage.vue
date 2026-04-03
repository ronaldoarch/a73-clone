<template>
  <div class="bind-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Vincular CPF</h2>
    </div>

    <div class="bind-card">
      <p class="bind-desc">Vincule seu CPF para realizar saques e garantir a segurança da sua conta.</p>

      <div class="input-group">
        <label>Nome Completo</label>
        <input v-model="fullName" type="text" placeholder="Seu nome completo" />
      </div>

      <div class="input-group">
        <label>CPF</label>
        <input v-model="cpf" type="text" placeholder="000.000.000-00" maxlength="14" @input="formatCpf" />
      </div>

      <div class="input-group">
        <label>Email</label>
        <input v-model="emailVal" type="email" placeholder="seu@email.com" />
      </div>

      <div class="input-group">
        <label>Telefone</label>
        <input v-model="phoneVal" type="tel" placeholder="(00) 00000-0000" maxlength="15" @input="formatPhone" />
      </div>

      <p v-if="error" class="error-msg">{{ error }}</p>

      <button class="submit-btn" :disabled="!canSubmit || submitting" @click="handleSubmit">
        {{ submitting ? 'Vinculando...' : 'Vincular CPF' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { apiPost } from '../utils/api'

const router = useRouter()

const fullName = ref('')
const cpf = ref('')
const emailVal = ref('')
const phoneVal = ref('')
const error = ref('')
const submitting = ref(false)

const canSubmit = computed(() => fullName.value.length > 2 && cpf.value.length === 14)

function formatCpf(e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 11)
  if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2')
  cpf.value = v
}

function formatPhone(e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 11)
  if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3')
  else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,5})/, '($1) $2')
  phoneVal.value = v
}

async function handleSubmit() {
  submitting.value = true
  error.value = ''
  try {
    await apiPost('/api/frontend/trpc/user.bindCPF', {
      cpf: cpf.value.replace(/\D/g, ''),
      realName: fullName.value,
      email: emailVal.value,
      phone: phoneVal.value.replace(/\D/g, '')
    })
    alert('CPF vinculado com sucesso!')
    router.back()
  } catch (e) {
    error.value = e.message || 'Erro ao vincular CPF'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.bind-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }

.bind-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 20px 16px; }
.bind-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 20px; line-height: 1.5; }

.input-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.input-group label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
.input-group input { width: 100%; padding: 12px 14px; background: var(--bg-input); border: 1.5px solid rgba(255,255,255,0.08); border-radius: var(--radius-md); color: var(--text-primary); font-size: 15px; }
.input-group input:focus { border-color: var(--purple-300); }
.input-group input::placeholder { color: var(--text-muted); }

.error-msg { color: var(--accent-red); font-size: 13px; text-align: center; margin-bottom: 8px; }
.submit-btn { width: 100%; padding: 14px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--purple-300), var(--purple-500)); color: #fff; font-size: 16px; font-weight: 700; margin-top: 8px; }
.submit-btn:disabled { opacity: 0.4; }
</style>
