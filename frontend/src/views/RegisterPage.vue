<template>
  <div class="auth-page">
    <button class="back-btn" @click="$router.back()">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
    </button>

    <div class="auth-card">
      <h1 class="auth-title">Registro</h1>
      <p class="auth-subtitle">Crie sua conta e ganhe até R$99</p>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="input-group">
          <label>Conta</label>
          <input v-model="account" type="text" placeholder="Escolha um nome de usuário" autocomplete="username" />
        </div>

        <div class="input-group">
          <label>Senha</label>
          <div class="password-wrap">
            <input v-model="password" :type="showPwd ? 'text' : 'password'" placeholder="Crie uma senha" autocomplete="new-password" />
            <button type="button" class="eye-btn" @click="showPwd = !showPwd">
              <svg v-if="showPwd" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>

        <div class="input-group">
          <label>Confirmar Senha</label>
          <input v-model="confirmPassword" :type="showPwd ? 'text' : 'password'" placeholder="Repita a senha" autocomplete="new-password" />
        </div>

        <p v-if="error" class="auth-error">{{ error }}</p>

        <button type="submit" class="auth-submit" :disabled="submitting">
          {{ submitting ? 'Criando conta...' : 'Criar Conta' }}
        </button>
      </form>

      <p class="auth-switch">
        Já tem conta?
        <router-link to="/login" class="auth-link">Entrar</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const account = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPwd = ref(false)
const submitting = ref(false)
const error = ref('')

async function handleRegister() {
  if (!account.value || !password.value || !confirmPassword.value) {
    error.value = 'Preencha todos os campos'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'As senhas não coincidem'
    return
  }
  if (password.value.length < 6) {
    error.value = 'A senha deve ter pelo menos 6 caracteres'
    return
  }
  submitting.value = true
  error.value = ''
  const result = await auth.register(account.value, password.value, confirmPassword.value)
  submitting.value = false
  if (result.success) {
    router.push('/main/inicio')
  } else {
    error.value = result.error || 'Falha no registro'
  }
}
</script>

<style scoped>
.auth-page {
  padding: 1.25rem 1rem;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--ep-color-background-fill-body-default);
}

.back-btn {
  color: var(--ep-color-text-weaker);
  padding: .25rem;
  margin-bottom: 1rem;
  align-self: flex-start;
}

.auth-card { flex: 1; }

.auth-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: var(--ep-font-weight-bold, 700);
  margin-bottom: .25rem;
  color: var(--ep-color-text-default);
}

.auth-subtitle {
  font-size: var(--ep-font-size-m, .875rem);
  color: var(--ep-color-text-weakest);
  margin-bottom: 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: .375rem;
}

.input-group label {
  font-size: var(--ep-font-size-s, .8125rem);
  font-weight: var(--ep-font-weight-semi-bold, 600);
  color: var(--ep-color-text-weaker);
}

.input-group input {
  width: 100%;
  padding: .75rem .875rem;
  background: var(--ep-color-background-fill-surface-lowered);
  border: 1.5px solid var(--ep-color-border-default);
  border-radius: var(--ep-border-radius-l, .5rem);
  color: var(--ep-color-text-default);
  font-size: var(--ep-font-size-m, .9375rem);
  transition: all .2s ease;
}

.input-group input:focus {
  border-color: var(--ep-color-border-selected);
  box-shadow: 0 0 0 3px var(--ep-color-background-fill-glow-primary-opacity-40, rgba(24,170,255,.15));
}

.input-group input::placeholder { color: var(--ep-color-text-weakest); }

.password-wrap { position: relative; }
.password-wrap input { padding-right: 2.75rem; }

.eye-btn {
  position: absolute;
  right: .625rem;
  top: 50%;
  transform: translateY(-50%);
  padding: .25rem;
  color: var(--ep-color-text-weakest);
}

.auth-error {
  color: var(--ep-light-accent-color-red, #F5222D);
  font-size: var(--ep-font-size-s, .8125rem);
  text-align: center;
}

.auth-submit {
  width: 100%;
  padding: .875rem;
  border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--gradient-primary);
  color: var(--ep-color-text-inverse, #0E1E3D);
  font-size: var(--ep-font-size-l, 1rem);
  font-weight: var(--ep-font-weight-bold, 700);
  transition: all .2s ease;
  margin-top: .5rem;
}

.auth-submit:active { transform: scale(0.98); opacity: 0.9; }
.auth-submit:disabled { opacity: 0.5; background: var(--ep-color-background-fill-active-disabled); }

.auth-switch {
  text-align: center;
  margin-top: 1.5rem;
  font-size: var(--ep-font-size-m, .875rem);
  color: var(--ep-color-text-weakest);
}

.auth-link {
  color: var(--ep-color-text-brand-primary);
  font-weight: var(--ep-font-weight-semi-bold, 600);
}
</style>
