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

        <template v-if="pixEnabled">
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
              :placeholder="`R$ ${(saqueMin || 20).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - ${(saqueMax || 40000).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`"
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

          <h3 class="withdraw-section-title">Dados para PIX</h3>

          <div class="withdraw-field">
            <label class="withdraw-label">Nome completo do recebedor</label>
            <input
              v-model="nome"
              type="text"
              class="withdraw-input"
              placeholder="Nome como cadastrado no PIX"
            />
          </div>

          <div class="withdraw-field">
            <label class="withdraw-label">Chave PIX</label>
            <input
              v-model="chavePix"
              type="text"
              class="withdraw-input"
              placeholder="CPF (11 dígitos), e-mail, telefone ou chave aleatória"
            />
            <p class="withdraw-hint">
              CPF, CNPJ, e-mail, telefone (com DDD, com ou sem +55) ou chave aleatória. Celular com 11 dígitos é tratado como telefone quando não for CPF válido.
            </p>
          </div>

          <!-- Painel de rollover -->
          <div v-if="rolloverPendente > 0" class="withdraw-rollover-aviso">
            <ion-icon name="lock-closed" class="withdraw-rollover-icon" />
            <div class="withdraw-rollover-text">
              <strong>Saque bloqueado por rollover</strong>
              <span>Aposte mais <strong>R$ {{ rolloverPendente.toFixed(2).replace('.', ',') }}</strong> para liberar o saque de bônus.</span>
            </div>
          </div>

          <ion-button
            class="withdraw-submit-btn"
            color="success"
            expand="block"
            @click="retirarAgora"
            :disabled="Boolean(loading || (rolloverPendente ?? 0) > 0)"
          >
            {{ loading ? 'Processando...' : rolloverPendente > 0 ? 'Bloqueado (rollover pendente)' : 'Retirar Agora' }}
          </ion-button>
        </template>
        <div v-else class="withdraw-pix-unavailable">
          <p>Saque via PIX não está disponível no momento. Entre em contato com o <a href="#" class="withdraw-support-link" @click.prevent="openSupport">suporte</a>.</p>
        </div>
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
import { useSettings } from '@/composables/useSettings'
import { afiliadoApi } from '@/api/afiliado'
import { useToast } from '@/composables/useToast'

const { balanceFormatted, balance, rolloverPendente, refresh } = useAfiliado()
const { saqueMin, saqueMax, whatsappUrl, pixEnabled } = useSettings()
const toast = useToast()
const loading = ref(false)
const isLoggedIn = computed(() => !!localStorage.getItem('token'))
const amount = ref('')
const nome = ref('')
const chavePix = ref('')

const quickAmounts = computed(() => {
  const min = saqueMin.value ?? 20
  const max = saqueMax.value ?? 40000
  const base = [20, 50, 100, 500, 1000, 5000, 10000, 20000, 40000]
  const filtered = base.filter(x => x >= min && x <= max)
  return filtered.length ? filtered : [min, Math.min(min * 2, max), max]
})

function formatVal(n) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function setMax() {
  const max = typeof balance.value === 'number' ? balance.value : 0
  amount.value = formatVal(max || saqueMax.value || 40000)
}

function openSupport() {
  window.open(whatsappUrl.value || 'https://wa.me/', '_blank')
}

async function retirarAgora() {
  if (!pixEnabled.value) {
    toast.error('Saque PIX indisponível no momento.')
    return
  }
  const v = parseFloat(String(amount.value).replace(/\./g, '').replace(',', '.')) || 0
  const min = saqueMin.value ?? 20
  const max = saqueMax.value ?? 40000
  if (v < min) {
    toast.error(`Valor mínimo R$ ${min.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    return
  }
  if (v > max) {
    toast.error(`Valor máximo R$ ${max.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`)
    return
  }
  const saldo = typeof balance.value === 'number' ? balance.value : 0
  if (v > saldo) {
    toast.error('Saldo insuficiente')
    return
  }
  if (!nome.value?.trim()) {
    toast.error('Informe o nome completo')
    return
  }
  const chave = String(chavePix.value || '').trim()
  if (!chave) {
    toast.error('Informe a chave PIX')
    return
  }
  if (chave.length > 130) {
    toast.error('Chave PIX muito longa')
    return
  }
  loading.value = true
  try {
    const r = await afiliadoApi.saque({
      valor: v,
      metodo: 'pix',
      nome: nome.value.trim(),
      cpfId: chave
    })
    if (r?.ok) {
      toast.success(`PIX de R$ ${formatVal(v)} enviado com sucesso!`)
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
.withdraw-pix-unavailable {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fecaca;
  font-size: 0.95rem;
  line-height: 1.5;
}
.withdraw-pix-unavailable .withdraw-support-link {
  margin-bottom: 0;
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
.withdraw-hint {
  color: #9ca3af;
  font-size: 0.8rem;
  margin: 6px 0 0 0;
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
.withdraw-rollover-aviso {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 20px;
  padding: 14px 16px;
  background: rgba(251, 191, 36, 0.10);
  border: 1px solid rgba(251, 191, 36, 0.45);
  border-radius: 12px;
}
.withdraw-rollover-icon {
  font-size: 1.4rem;
  color: #fbbf24;
  flex-shrink: 0;
  margin-top: 2px;
}
.withdraw-rollover-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.88rem;
  color: #fbbf24;
}
.withdraw-rollover-text strong { font-weight: 700; }
.withdraw-rollover-text span { color: #e5e7eb; }
</style>
