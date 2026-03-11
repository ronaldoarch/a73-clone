<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding register-content">
      <div class="register-wrapper">
        <ion-card class="register-card">
          <ion-card-header>
            <ion-card-title>Crie uma conta de jogo</ion-card-title>
            <p class="login-link">
              Já tem uma conta? <router-link to="/main/login/">Entrar</router-link>
            </p>
          </ion-card-header>
          <ion-card-content>
            <form @submit.prevent="handleRegister">
              <ion-item lines="none" class="ion-margin-bottom input-item">
                <ion-label position="stacked">Número de telefone</ion-label>
                <input
                  v-model="phone"
                  type="tel"
                  placeholder="Ex: (11) 99999-9999"
                  inputmode="numeric"
                  class="native-input"
                  aria-label="Número de telefone"
                  required
                />
              </ion-item>
              <ion-item lines="none" class="ion-margin-bottom input-item">
                <ion-label position="stacked">Senha</ion-label>
                <div class="input-with-icon">
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Digite sua senha"
                    class="native-input"
                    aria-label="Senha"
                    required
                  />
                  <ion-icon
                    :name="showPassword ? 'eye-off-outline' : 'eye-outline'"
                    class="toggle-password"
                    @click="showPassword = !showPassword"
                  />
                </div>
              </ion-item>
              <ion-item lines="none" class="ion-margin-bottom input-item">
                <ion-label position="stacked">Confirmar senha</ion-label>
                <input
                  v-model="confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Confirme sua senha"
                  class="native-input"
                  aria-label="Confirmar senha"
                  required
                />
              </ion-item>
              <ion-button expand="block" type="submit" color="primary" class="ion-margin-top">
                Registrar
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useAfiliado } from '@/composables/useAfiliado'
import {
  IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonItem, IonLabel, IonButton, IonIcon
} from '@ionic/vue'
import { api } from '@/api/trpc'

const router = useRouter()
const toast = useToast()
const { initFromRegistro, refresh } = useAfiliado()
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  error.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = 'As senhas não coincidem'
    toast.error(error.value)
    return
  }
  const phoneClean = phone.value.replace(/\D/g, '')
  if (phoneClean.length < 10) {
    error.value = 'Digite um telefone válido (mínimo 10 dígitos)'
    toast.error(error.value)
    return
  }
  loading.value = true
  try {
    const res = await api.register({
      phone: phone.value,
      account: phone.value,
      password: password.value,
      confirmPassword: confirmPassword.value
    })
    if (res.error) {
      error.value = res.error
      toast.error(res.error)
      return
    }
    localStorage.setItem('token', res.token)
    const account = res.user?.account || phone.value
    localStorage.setItem('account', account)
    const pidRef = localStorage.getItem('a73_pid_ref')
    initFromRegistro(account, pidRef)
    if (pidRef) localStorage.removeItem('a73_pid_ref') // usado uma vez
    await refresh()
    sessionStorage.setItem('showRoletaNovos', '1')
    sessionStorage.setItem('showBonusDiario', '1')
    toast.success('Conta criada!')
    router.push('/main/inicio/')
  } catch (e) {
    error.value = e.message || 'Erro ao registrar'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-content {
  --background: var(--bg);
}
.register-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
}
.register-card {
  max-width: 400px;
  width: 100%;
  background: var(--ion-card-background);
  border-radius: 16px;
}
.login-link a {
  color: var(--ion-color-primary);
  text-decoration: none;
}
.input-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}
.native-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 16px;
  font-family: var(--font-prompt);
  color: var(--ion-text-color);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: none;
}
.native-input::placeholder {
  color: var(--color-text-input-placeholder);
}
.native-input:focus {
  border-color: var(--ion-color-primary);
}
.input-with-icon {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
}
.input-with-icon .native-input {
  flex: 1;
  padding-right: 44px;
}
.input-with-icon .toggle-password {
  position: absolute;
  right: 12px;
  font-size: 22px;
  color: var(--ion-text-color);
  cursor: pointer;
}
</style>
