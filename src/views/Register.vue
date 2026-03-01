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
              <ion-item lines="none" class="ion-margin-bottom">
                <ion-label position="stacked">Número de telefone</ion-label>
                <ion-input
                  v-model="phone"
                  type="tel"
                  placeholder="Ex: (11) 99999-9999"
                  inputmode="numeric"
                  required
                />
              </ion-item>
              <ion-item lines="none" class="ion-margin-bottom">
                <ion-label position="stacked">Senha</ion-label>
                <ion-input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Digite sua senha"
                  required
                />
              </ion-item>
              <ion-item lines="none" class="ion-margin-bottom">
                <ion-label position="stacked">Confirmar senha</ion-label>
                <ion-input
                  v-model="confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Confirme sua senha"
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
  IonItem, IonLabel, IonInput, IonButton
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
</style>
