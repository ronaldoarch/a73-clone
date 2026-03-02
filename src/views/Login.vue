<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding login-content">
      <div class="login-wrapper">
        <ion-card class="login-card">
          <ion-card-header>
            <ion-card-title>Faça login na sua conta</ion-card-title>
            <p class="register-link">
              Não tem uma conta? <router-link to="/main/register/">Registro R$ +99</router-link>
            </p>
          </ion-card-header>
          <ion-card-content>
            <form @submit.prevent="handleLogin">
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
              <ion-button expand="block" type="submit" color="warning" class="ion-margin-top login-btn" :disabled="loading">
                {{ loading ? 'Entrando...' : 'ENTRAR' }}
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
import {
  IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonItem, IonLabel, IonButton, IonIcon
} from '@ionic/vue'
import { useToast } from '@/composables/useToast'
import { api } from '@/api/trpc'
import { useAfiliado } from '@/composables/useAfiliado'

const router = useRouter()
const toast = useToast()
const phone = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    let res
    try {
      res = await api.login({ account: phone.value, phone: phone.value, password: password.value })
    } catch (e) {
      // API indisponível: login demo com qualquer telefone + senha
      if (!phone.value.trim() || !password.value.trim()) {
        error.value = 'Preencha telefone e senha'
        toast.error('Preencha telefone e senha')
        return
      }
      localStorage.setItem('token', 'demo-' + Date.now())
      localStorage.setItem('account', phone.value)
      toast.success('Login realizado! (modo demo)')
      router.push('/main/inicio/')
      return
    }
    if (res.error) {
      error.value = res.error
      toast.error(res.error)
      return
    }
    localStorage.setItem('token', res.token)
    localStorage.setItem('account', res.user?.account || phone.value)
    await useAfiliado().refresh()
    toast.success('Login realizado!')
    router.push('/main/inicio/')
  } catch (e) {
    error.value = e.message || 'Erro ao fazer login'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.login-content {
  --background: var(--bg);
}
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
}
.login-card {
  max-width: 400px;
  width: 100%;
  background: var(--ion-card-background);
  border-radius: 16px;
}
.register-link a {
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
