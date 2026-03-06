<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="saque-senha-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="$router.back()">
            <ion-icon name="chevron-back" />
          </ion-button>
        </ion-buttons>
        <ion-title>Saque Senha</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="saque-senha-content">
      <div class="saque-senha-inner">
        <h2 class="saque-senha-section-title">Configurar Saque Senha</h2>

        <div class="saque-senha-field">
          <label class="saque-senha-label">Novo Saque Senha</label>
          <div class="saque-senha-inputs">
            <input
              v-for="(_, i) in 6"
              :key="'new-' + i"
              ref="newInputs"
              type="password"
              inputmode="numeric"
              maxlength="1"
              class="saque-senha-digit"
              :class="{ focused: focusedNew === i }"
              :value="novaSenha[i]"
              @input="onNewInput($event, i)"
              @focus="focusedNew = i"
              @keydown="onKeydown($event, i, 'new')"
            />
          </div>
        </div>

        <div class="saque-senha-field">
          <label class="saque-senha-label">Confirmar Novo Senha</label>
          <div class="saque-senha-inputs">
            <input
              v-for="(_, i) in 6"
              :key="'conf-' + i"
              ref="confInputs"
              type="password"
              inputmode="numeric"
              maxlength="1"
              class="saque-senha-digit"
              :class="{ focused: focusedConf === i }"
              :value="confirmarSenha[i]"
              @input="onConfInput($event, i)"
              @focus="focusedConf = i"
              @keydown="onKeydown($event, i, 'conf')"
            />
          </div>
        </div>

        <p class="saque-senha-msg">
          Para o primeiro saque, você precisa definir a senha de saque primeiro
        </p>

        <ion-button class="saque-senha-btn" expand="block" @click="retirarAgora">
          Retirar Agora
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons
} from '@ionic/vue'

const router = useRouter()
const novaSenha = ref(['', '', '', '', '', ''])
const confirmarSenha = ref(['', '', '', '', '', ''])
const focusedNew = ref(0)
const focusedConf = ref(0)
const newInputs = ref([])
const confInputs = ref([])

function onNewInput(e, i) {
  const v = e.target.value.replace(/\D/g, '').slice(-1)
  novaSenha.value = [...novaSenha.value]
  novaSenha.value[i] = v
  if (v && i < 5) {
    nextTick(() => newInputs.value[i + 1]?.focus())
  }
}

function onConfInput(e, i) {
  const v = e.target.value.replace(/\D/g, '').slice(-1)
  confirmarSenha.value = [...confirmarSenha.value]
  confirmarSenha.value[i] = v
  if (v && i < 5) {
    nextTick(() => confInputs.value[i + 1]?.focus())
  }
}

function onKeydown(e, i, type) {
  const val = type === 'new' ? novaSenha.value : confirmarSenha.value
  const inputs = type === 'new' ? newInputs.value : confInputs.value
  if (e.key === 'Backspace' && !val[i] && i > 0) {
    e.preventDefault()
    if (type === 'new') {
      novaSenha.value = [...novaSenha.value]
      novaSenha.value[i - 1] = ''
    } else {
      confirmarSenha.value = [...confirmarSenha.value]
      confirmarSenha.value[i - 1] = ''
    }
    nextTick(() => inputs[i - 1]?.focus())
  }
}

function retirarAgora() {
  const n = novaSenha.value.join('')
  const c = confirmarSenha.value.join('')
  if (n.length !== 6 || c.length !== 6) {
    return
  }
  if (n !== c) {
    return
  }
  router.push('/main/withdraw/')
}
</script>

<style scoped>
.saque-senha-toolbar {
  --background: #2d1f4e;
  --color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.saque-senha-toolbar ion-button {
  --color: #fff;
}
.saque-senha-content {
  --background: #2d1f4e;
}
.saque-senha-inner {
  padding: 24px 20px;
}
.saque-senha-section-title {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 24px 0;
}
.saque-senha-field {
  margin-bottom: 24px;
}
.saque-senha-label {
  display: block;
  color: #fff;
  font-size: 0.95rem;
  margin-bottom: 12px;
}
.saque-senha-inputs {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}
.saque-senha-digit {
  width: 44px;
  height: 48px;
  border-radius: 8px;
  background: #3d2f5c;
  border: 2px solid #3d2f5c;
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.saque-senha-digit:focus {
  outline: none;
  border-color: #fbbf24;
  box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.3);
}
.saque-senha-digit.focused {
  border-color: #fbbf24;
  box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.3);
}
.saque-senha-msg {
  color: #f59e0b;
  font-size: 0.9rem;
  margin: 0 0 28px 0;
  line-height: 1.4;
}
.saque-senha-btn {
  --background: linear-gradient(90deg, #a3e635, #84cc16);
  --color: #fff;
  font-weight: 700;
  font-size: 1rem;
  --border-radius: 12px;
  height: 52px;
}
</style>
