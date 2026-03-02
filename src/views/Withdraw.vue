<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="withdraw-toolbar">
        <ion-title class="withdraw-title">
          Saque
          <ion-icon name="bag" class="withdraw-title-icon" />
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="withdraw-content">
      <div v-if="!isLoggedIn" class="withdraw-login">
        <p>Faça login para realizar saques.</p>
        <ion-button expand="block" color="warning" @click="$router.push('/main/login/')">
          Entrar
        </ion-button>
      </div>

      <div v-else class="withdraw-inner">
        <p class="withdraw-instruction">
          Se você tiver dúvidas ou problemas, entre em contato com o suporte ao cliente. Obrigado!
        </p>
        <a href="#" class="withdraw-support-link" @click.prevent="openSupport">
          <ion-icon name="headset" />
          suporte online.
        </a>

        <h3 class="withdraw-section-title">Canais de Saque</h3>
        <button type="button" class="withdraw-channel-btn withdraw-channel-pix">
          PIX
        </button>

        <h3 class="withdraw-section-title">Conta Saldo</h3>
        <p class="withdraw-balance">R$ {{ balanceFormatted }}</p>

        <div class="withdraw-amount-row">
          <input
            v-model="amount"
            type="text"
            class="withdraw-amount-input"
            placeholder="R$ 20,00 - 40.000,00"
          />
          <button type="button" class="withdraw-max-btn" @click="setMax">Máx.</button>
        </div>

        <div class="withdraw-quick-amounts">
          <button
            v-for="val in quickAmounts"
            :key="val"
            type="button"
            class="withdraw-quick-btn"
            @click="amount = formatVal(val)"
          >
            {{ formatVal(val) }}
          </button>
        </div>

        <h3 class="withdraw-section-title">Método de Retirada</h3>
        <button type="button" class="withdraw-method-btn" :class="{ active: metodo === 'cpf' }" @click="metodo = 'cpf'">
          CPF
        </button>

        <div class="withdraw-field">
          <label class="withdraw-label">Nome</label>
          <input
            v-model="nome"
            type="text"
            class="withdraw-input"
            placeholder="Por favor, insira seu nome"
          />
        </div>

        <div class="withdraw-field">
          <label class="withdraw-label">Chave PIX</label>
          <input
            v-model="cpfId"
            type="text"
            class="withdraw-input"
            placeholder="CPF, e-mail ou telefone"
          />
        </div>

        <ion-button class="withdraw-submit-btn" expand="block" @click="retirarAgora" :disabled="loading">
          {{ loading ? 'Processando...' : 'Retirar Agora' }}
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  onIonViewWillEnter
} from '@ionic/vue'
import { useAfiliado } from '@/composables/useAfiliado'
import { afiliadoApi } from '@/api/afiliado'
import { useToast } from '@/composables/useToast'

const { balanceFormatted, balance, refresh } = useAfiliado()
const toast = useToast()
const loading = ref(false)
const isLoggedIn = computed(() => !!localStorage.getItem('token'))
const amount = ref('')
const nome = ref('')
const cpfId = ref('')
const metodo = ref('cpf')

const quickAmounts = [20, 50, 100, 500, 1000, 5000, 10000, 20000, 40000]

function formatVal(n) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function setMax() {
  const max = typeof balance.value === 'number' ? balance.value : 0
  amount.value = formatVal(max || 40000)
}

function openSupport() {
  window.open('https://wa.me/', '_blank')
}

async function retirarAgora() {
  const v = parseFloat(String(amount.value).replace(/\./g, '').replace(',', '.')) || 0
  if (v < 20) {
    toast.error('Valor mínimo R$ 20,00')
    return
  }
  if (v > 40000) {
    toast.error('Valor máximo R$ 40.000,00')
    return
  }
  const saldo = typeof balance.value === 'number' ? balance.value : 0
  if (v > saldo) {
    toast.error('Saldo insuficiente')
    return
  }
  if (!nome.value?.trim()) {
    toast.error('Informe o nome')
    return
  }
  if (!cpfId.value?.trim()) {
    toast.error('Informe o CPF')
    return
  }
  loading.value = true
  try {
    const r = await afiliadoApi.saque({
      valor: v,
      metodo: metodo.value,
      nome: nome.value.trim(),
      cpfId: cpfId.value.trim()
    })
    if (r?.ok) {
      toast.success(`Saque de R$ ${formatVal(v)} solicitado!`)
      amount.value = ''
      await refresh()
    }
  } catch (e) {
    const msg = e?.message || e?.error?.message || 'Erro ao solicitar saque'
    toast.error(msg)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (localStorage.getItem('token')) refresh()
})
onIonViewWillEnter(() => {
  if (localStorage.getItem('token')) refresh()
})
</script>

<style scoped>
.withdraw-toolbar {
  --background: #2d1f4e;
  --color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.withdraw-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.withdraw-title-icon {
  width: 28px;
  height: 28px;
  padding: 4px;
  background: #4a3d6b;
  border-radius: 50%;
}
.withdraw-content {
  --background: #2d1f4e;
}
.withdraw-login {
  padding: 32px 20px;
  text-align: center;
}
.withdraw-login p {
  color: #fff;
  margin-bottom: 20px;
}
.withdraw-inner {
  padding: 20px;
}
.withdraw-instruction {
  color: #fff;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0 0 8px 0;
}
.withdraw-support-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #a3e635;
  font-size: 0.9rem;
  text-decoration: none;
  margin-bottom: 24px;
}
.withdraw-support-link ion-icon {
  font-size: 1rem;
}
.withdraw-section-title {
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 12px 0;
}
.withdraw-channel-pix {
  background: #a3e635;
  color: #1f2937;
  font-weight: 800;
  font-size: 1rem;
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  margin-bottom: 24px;
  cursor: pointer;
}
.withdraw-balance {
  color: #f59e0b;
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0 0 16px 0;
}
.withdraw-amount-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.withdraw-amount-input {
  flex: 1;
  background: #3d2f5c;
  border: 2px solid #3d2f5c;
  border-radius: 10px;
  padding: 14px 16px;
  color: #fff;
  font-size: 1rem;
}
.withdraw-amount-input::placeholder {
  color: #f59e0b;
}
.withdraw-amount-input:focus {
  outline: none;
  border-color: #a3e635;
}
.withdraw-max-btn {
  background: #4a3d6b;
  color: #fff;
  border: none;
  padding: 0 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}
.withdraw-quick-amounts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}
.withdraw-quick-btn {
  background: #3d2f5c;
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}
.withdraw-quick-btn:hover {
  background: #4a3d6b;
}
.withdraw-method-btn {
  background: #3d2f5c;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 20px;
  cursor: pointer;
}
.withdraw-method-btn.active {
  background: #a3e635;
  color: #1f2937;
}
.withdraw-field {
  margin-bottom: 16px;
}
.withdraw-label {
  display: block;
  color: #fff;
  font-size: 0.9rem;
  margin-bottom: 8px;
}
.withdraw-input {
  width: 100%;
  background: #3d2f5c;
  border: 2px solid #3d2f5c;
  border-radius: 10px;
  padding: 14px 16px;
  color: #fff;
  font-size: 1rem;
  box-sizing: border-box;
}
.withdraw-input::placeholder {
  color: #9ca3af;
}
.withdraw-input:focus {
  outline: none;
  border-color: #a3e635;
}
.withdraw-submit-btn {
  --background: linear-gradient(90deg, #a3e635, #84cc16);
  --color: #1f2937;
  font-weight: 700;
  font-size: 1rem;
  --border-radius: 12px;
  height: 52px;
  margin-top: 24px;
}
</style>
