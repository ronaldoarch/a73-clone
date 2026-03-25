<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="deposit-toolbar">
        <ion-title class="deposit-title">
          <ion-icon name="wallet" class="deposit-title-icon" />
          Depósito
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="deposit-content">
      <!-- Modal PIX QR -->
      <div v-if="pixModalOpen" class="pix-modal-overlay" @click.self="pixModalOpen = false">
        <div class="pix-modal">
          <div class="pix-modal-header">
            <h3>Pague via PIX</h3>
            <button type="button" class="pix-modal-close" @click="closePixModal" aria-label="Fechar">&times;</button>
          </div>
          <div class="pix-modal-body">
            <p class="pix-modal-valor">R$ {{ pixValorDisplay }}</p>

            <div v-if="pixGenerating" class="pix-generating">
              <ion-spinner name="crescent" />
              <p class="pix-generating-text">Gerando PIX com o provedor… Aguarde.</p>
            </div>

            <template v-else>
              <div v-if="pixStatus === 'concluido'" class="pix-success-msg">
                <ion-icon name="checkmark-circle" />
                Pagamento confirmado! Seu saldo foi creditado.
              </div>
              <template v-else>
                <div v-if="!pixQrcode && !pixCopyPaste" class="pix-error-msg">
                  <ion-icon name="warning" />
                  Não foi possível gerar o PIX. Verifique os dados e tente novamente.
                  <ion-button size="small" fill="outline" @click="closePixModal">Fechar</ion-button>
                </div>
                <template v-else>
                  <p class="pix-modal-hint">Escaneie o QR Code ou copie o código abaixo</p>
                  <div v-if="pixQrClientLoading" class="pix-qr-loading">
                    <ion-spinner name="crescent" />
                    <span>Gerando QR…</span>
                  </div>
                  <div v-else-if="pixQrcode" class="pix-qr-wrap">
                    <img :src="pixQrcode" alt="QR Code PIX" class="pix-qr-img" />
                  </div>
                  <div v-if="pixCopyPaste" class="pix-copy-wrap">
                    <p class="pix-copy-label">Código PIX (copia e cola):</p>
                    <textarea ref="pixCopyRef" readonly class="pix-copy-text" :value="pixCopyPaste" rows="4"></textarea>
                    <ion-button size="small" @click="copyPixCode">Copiar código</ion-button>
                  </div>
                  <div class="pix-pending-msg">
                    <ion-spinner name="crescent" />
                    Aguardando pagamento...
                    <ion-button size="small" fill="outline" class="pix-verify-btn" :disabled="pixVerifying" @click="verificarPagamento">
                      {{ pixVerifying ? 'Verificando...' : 'Já paguei' }}
                    </ion-button>
                  </div>
                </template>
              </template>
            </template>
          </div>
        </div>
      </div>

      <!-- Não logado -->
      <div v-if="!isLoggedIn" class="deposit-login-prompt">
        <p>Faça login para realizar depósitos.</p>
        <ion-button expand="block" color="warning" @click="$router.push('/main/login/')">
          Entrar
        </ion-button>
      </div>

      <!-- Logado - Página de depósito completa -->
      <div v-else class="deposit-page">
        <!-- Suporte -->
        <p class="deposit-support-msg">
          Se você tiver dúvidas ou problemas, entre em contato com o suporte ao cliente. Obrigado!
        </p>
        <a href="#" class="deposit-support-link" @click.prevent="openSupport">
          <ion-icon name="headset" />
          suporte online.
        </a>

        <template v-if="pixEnabled">
          <!-- Depósito on-line -->
          <div class="deposit-online-wrap">
            <span class="deposit-reco-badge">RECO</span>
            <ion-button class="deposit-online-btn" expand="block" @click="selectOnlineDeposit">
              Depósito on-line
            </ion-button>
          </div>

          <div class="deposit-divider"></div>

          <!-- Pagamento -->
          <h3 class="deposit-section-title">Pagamento</h3>
          <ion-button class="deposit-pix-btn" fill="outline" @click="selectPix">
            <ion-icon name="flame" class="pix-flame" />
            PIX
          </ion-button>

          <!-- Montante -->
          <h3 class="deposit-section-title">Montante</h3>
          <div class="deposit-field">
            <input
              v-model="amountInput"
              type="text"
              class="deposit-amount-input"
              placeholder="Digite o valor (ex: 10 ou 10,50)"
              inputmode="decimal"
              @blur="formatAmountInput"
            />
          </div>

          <!-- Texto PIX -->
          <p class="deposit-pix-promo">
            🏠 Para garantir mais agilidade, pague via PIX! 🔥⚡ É rápido, seguro e a confirmação sai em segundos! 💰 Aproveite ao máximo os jogos e boa sorte nos ganhos! 🌸🌸🌸
          </p>

          <!-- Valores pré-definidos -->
          <div class="deposit-amounts-grid">
            <button
              v-for="val in presetAmounts"
              :key="val"
              type="button"
              class="deposit-amount-btn"
              :class="{ active: selectedAmount === val || parseAmountInput(amountInput) === val }"
              @click="selectAmount(val)"
            >
              {{ formatAmount(val) }}
            </button>
          </div>

          <!-- CPF e Nome (obrigatórios para PIX) -->
          <h3 class="deposit-section-title">Dados para PIX</h3>
          <div class="deposit-field">
            <label class="deposit-label">CPF (apenas números)</label>
            <input
              v-model="depositCpf"
              type="text"
              class="deposit-input"
              placeholder="00000000000"
              maxlength="14"
              inputmode="numeric"
            />
          </div>
          <div class="deposit-field">
            <label class="deposit-label">Nome completo</label>
            <input
              v-model="depositNome"
              type="text"
              class="deposit-input"
              placeholder="Nome como no documento"
            />
          </div>

          <!-- Botão depositar -->
          <ion-button class="deposit-now-btn" expand="block" :disabled="pixGenerating" @click="doDeposit">
            {{ pixGenerating ? 'Gerando PIX…' : 'Depositar Agora' }}
          </ion-button>
        </template>
        <div v-else class="deposit-pix-unavailable">
          <p>Depósito via PIX não está disponível no momento. Entre em contato com o <a href="#" class="deposit-support-link" @click.prevent="openSupport">suporte</a>.</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonSpinner,
  onIonViewWillEnter
} from '@ionic/vue'
import { useAfiliado } from '@/composables/useAfiliado'
import { useSettings } from '@/composables/useSettings'
import { afiliadoApi } from '@/api/afiliado'
import { useToast } from '@/composables/useToast'
import QRCode from 'qrcode'

const { refresh } = useAfiliado()
const { depositoMin, whatsappUrl, pixEnabled } = useSettings()
const toast = useToast()
const isLoggedIn = ref(!!localStorage.getItem('token'))

function checkLogin() {
  isLoggedIn.value = !!localStorage.getItem('token')
}
onMounted(checkLogin)
onIonViewWillEnter(checkLogin)

const basePresetAmounts = [10, 30, 50, 100, 500, 1000, 5000, 10000, 50000]
const presetAmounts = computed(() => {
  const min = depositoMin.value ?? 10
  const filtered = basePresetAmounts.filter(x => x >= min)
  return filtered.length ? filtered : [min]
})
const selectedAmount = ref(10)
const amountInput = ref('10,00')
watch(depositoMin, (min) => {
  const m = min ?? 10
  if (selectedAmount.value < m) {
    const presets = presetAmounts.value
    selectedAmount.value = presets.length ? presets[0] : m
    amountInput.value = formatAmount(selectedAmount.value)
  }
}, { immediate: true })
const minAmount = computed(() => depositoMin.value ?? 10)
const maxAmount = 50000
const depositCpf = ref('')
const depositNome = ref('')

function parseAmountInput(str) {
  if (!str || typeof str !== 'string') return 0
  const s = str.replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  return parseFloat(s) || 0
}

function formatAmountInput() {
  const num = parseAmountInput(amountInput.value)
  if (num > 0) {
    amountInput.value = formatAmount(num)
    selectedAmount.value = num
  }
}

const pixModalOpen = ref(false)
const pixQrcode = ref('')
const pixCopyPaste = ref('')
const pixExternalId = ref('')
const pixValorDisplay = ref('')
const pixStatus = ref('pendente')
const pixCopyRef = ref(null)
const pixVerifying = ref(false)
const pixGenerating = ref(false)
const pixQrClientLoading = ref(false)
let pixPollInterval = null

function formatAmount(val) {
  return val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

function selectAmount(val) {
  selectedAmount.value = val
  amountInput.value = formatAmount(val)
}

function selectPix() {
  // PIX já selecionado por padrão
}

function selectOnlineDeposit() {
  // Abre fluxo de depósito online
}

function closePixModal() {
  pixModalOpen.value = false
  pixGenerating.value = false
  pixQrClientLoading.value = false
  if (pixPollInterval) {
    clearInterval(pixPollInterval)
    pixPollInterval = null
  }
}

function copyPixCode() {
  const text = pixCopyPaste.value
  if (!text) return
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => toast.success('Código copiado!'))
  } else {
    pixCopyRef.value?.select()
    document.execCommand('copy')
    toast.success('Código copiado!')
  }
}

function validarCpf(cpf) {
  const d = String(cpf).replace(/\D/g, '')
  return d.length === 11
}

async function doDeposit() {
  if (!pixEnabled.value) {
    toast.error('Depósito PIX indisponível no momento.')
    return
  }
  const valor = parseAmountInput(amountInput.value) || selectedAmount.value
  selectedAmount.value = valor
  const min = depositoMin.value ?? 10
  if (!localStorage.getItem('token')) {
    toast.error('Faça login para depositar')
    return
  }
  if (valor < min) {
    toast.error(`Valor mínimo R$ ${min.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    return
  }
  const cpf = String(depositCpf.value).replace(/\D/g, '')
  if (!validarCpf(cpf)) {
    toast.error('Informe um CPF válido (11 dígitos)')
    return
  }
  if (!depositNome.value?.trim()) {
    toast.error('Informe seu nome completo')
    return
  }

  pixValorDisplay.value = valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  pixStatus.value = 'pendente'
  pixQrcode.value = ''
  pixCopyPaste.value = ''
  pixExternalId.value = ''
  pixQrClientLoading.value = false
  pixGenerating.value = true
  pixModalOpen.value = true

  try {
    const data = await afiliadoApi.depositoPix({ valor, cpf, nome: depositNome.value.trim() })
    if (!data?.ok) {
      toast.error(data?.error?.message || 'Erro ao gerar PIX')
      closePixModal()
      return
    }
    pixExternalId.value = data.externalId
    pixValorDisplay.value = (data.valor || valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    pixStatus.value = 'pendente'
    const qr = data.qrcode
    pixCopyPaste.value = data.copyPaste || ''
    const serverQr = (qr && (qr.startsWith('data:') || qr.startsWith('http'))) ? qr : (qr ? `data:image/png;base64,${qr}` : '')
    pixQrcode.value = serverQr

    const copyForQr = pixCopyPaste.value
    if (!serverQr && copyForQr) {
      pixQrClientLoading.value = true
      queueMicrotask(() => {
        QRCode.toDataURL(copyForQr, {
          width: 220,
          margin: 1,
          errorCorrectionLevel: 'L'
        })
          .then((url) => {
            pixQrcode.value = url
          })
          .catch(() => {})
          .finally(() => {
            pixQrClientLoading.value = false
          })
      })
    }

    if (pixPollInterval) clearInterval(pixPollInterval)
    pixPollInterval = setInterval(pollPixStatus, 2000)
    pollPixStatus()
  } catch (e) {
    toast.error(e?.message || 'Erro ao gerar PIX. Verifique se o Gatebox está configurado.')
    closePixModal()
  } finally {
    pixGenerating.value = false
  }
}

async function verificarPagamento() {
  if (!pixExternalId.value || pixVerifying.value) return
  pixVerifying.value = true
  try {
    await pollPixStatus()
  } finally {
    pixVerifying.value = false
  }
}

async function pollPixStatus() {
  if (!pixExternalId.value) return
  try {
    const data = await afiliadoApi.depositoPixStatus(pixExternalId.value)
    const status = String(data?.status || '').toLowerCase()
    if (status === 'concluido') {
      pixStatus.value = 'concluido'
      if (pixPollInterval) {
        clearInterval(pixPollInterval)
        pixPollInterval = null
      }
      await refresh()
      toast.success(`Depósito de R$ ${pixValorDisplay.value} confirmado!`)
      setTimeout(closePixModal, 2000)
    }
  } catch (e) {
    // mantém polling
  }
}

onUnmounted(() => {
  if (pixPollInterval) clearInterval(pixPollInterval)
})

function openSupport() {
  window.open(whatsappUrl.value || 'https://wa.me/', '_blank')
}
</script>

<style scoped>
.deposit-toolbar {
  --background: var(--bg);
  --color: #fff;
  border-bottom: 1px solid var(--border);
}
.deposit-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-smooch);
  font-weight: 800;
  font-size: 1.4rem;
}
.deposit-title-icon {
  font-size: 1.5rem;
  color: #fbbf24;
}
.deposit-content {
  --background: var(--bg);
}

.deposit-login-prompt {
  padding: 32px 20px;
  text-align: center;
}
.deposit-login-prompt p {
  color: var(--text);
  margin-bottom: 20px;
}

.deposit-page {
  padding: 20px 16px 32px;
}
.deposit-support-msg {
  color: #fff;
  font-size: 0.9rem;
  margin: 0 0 8px 0;
  line-height: 1.4;
}
.deposit-support-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #f97316;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  margin-bottom: 24px;
}
.deposit-support-link ion-icon {
  font-size: 1.1rem;
  color: #fbbf24;
}

.deposit-pix-unavailable {
  margin-top: 1.25rem;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fecaca;
  font-size: 0.95rem;
  line-height: 1.5;
}
.deposit-pix-unavailable .deposit-support-link {
  margin-bottom: 0;
}

.deposit-online-wrap {
  position: relative;
  margin-bottom: 24px;
}
.deposit-reco-badge {
  position: absolute;
  top: -4px;
  right: 16px;
  z-index: 1;
  background: #f97316;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}
.deposit-online-btn {
  --background: var(--color-bg-100);
  --color: #fff;
  --border-radius: 12px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  font-weight: 700;
  font-size: 1rem;
  border: 1px solid rgba(168, 85, 247, 0.5);
}

.deposit-divider {
  height: 1px;
  background: rgba(255,255,255,0.15);
  margin: 0 0 20px 0;
}

.deposit-section-title {
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 12px 0;
}
.deposit-pix-btn {
  --border-color: rgba(168, 85, 247, 0.6);
  --color: #fff;
  --padding-start: 16px;
  --padding-end: 16px;
  margin-bottom: 24px;
  border-radius: 10px;
}
.pix-flame {
  margin-right: 6px;
  color: #f97316;
}

.deposit-amount-input {
  width: 100%;
  background: var(--color-bg-100);
  border: 1px solid rgba(168, 85, 247, 0.5);
  border-radius: 10px;
  padding: 14px 16px;
  color: #f97316;
  font-size: 1.1rem;
  font-weight: 700;
  box-sizing: border-box;
}
.deposit-amount-input::placeholder {
  color: rgba(249, 115, 22, 0.6);
}
.deposit-amount-input:focus {
  outline: none;
  border-color: #a855f7;
}

.deposit-pix-promo {
  color: #fff;
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0 0 24px 0;
  opacity: 0.95;
}

.deposit-amounts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}
.deposit-amount-btn {
  background: var(--color-bg-100);
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 10px;
  padding: 12px 8px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.deposit-amount-btn:hover,
.deposit-amount-btn.active {
  border-color: #a855f7;
  background: rgba(168, 85, 247, 0.2);
  box-shadow: 0 0 12px rgba(168, 85, 247, 0.3);
}

.deposit-field {
  margin-bottom: 16px;
}
.deposit-label {
  display: block;
  color: #fff;
  font-size: 0.9rem;
  margin-bottom: 8px;
}
.deposit-input {
  width: 100%;
  background: var(--color-bg-100);
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 10px;
  padding: 14px 16px;
  color: #fff;
  font-size: 1rem;
  box-sizing: border-box;
}
.deposit-input::placeholder {
  color: rgba(255,255,255,0.5);
}
.deposit-input:focus {
  outline: none;
  border-color: #a855f7;
}
.deposit-now-btn {
  --background: #84cc16;
  --background-hover: #a3e635;
  --background-activated: #65a30d;
  --color: #fff;
  font-weight: 800;
  font-size: 1.1rem;
  --padding-top: 16px;
  --padding-bottom: 16px;
  border-radius: 12px;
}

/* Modal PIX */
.pix-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}
.pix-modal {
  background: var(--color-bg-100, #1a1a2e);
  border: 1px solid rgba(168, 85, 247, 0.5);
  border-radius: 16px;
  max-width: 360px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.pix-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.pix-modal-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1.2rem;
}
.pix-modal-close {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.8rem;
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
}
.pix-modal-body {
  padding: 20px;
}
.pix-generating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 8px 32px;
  color: rgba(255, 255, 255, 0.65);
}
.pix-generating ion-spinner {
  width: 48px;
  height: 48px;
  color: #a855f7;
}
.pix-generating-text {
  margin: 0;
  text-align: center;
  font-size: 0.95rem;
  line-height: 1.4;
  max-width: 260px;
}
.pix-qr-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 140px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.9rem;
}
.pix-modal-valor {
  font-size: 1.5rem;
  font-weight: 800;
  color: #f97316;
  margin: 0 0 8px 0;
}
.pix-modal-hint {
  color: rgba(255,255,255,0.8);
  font-size: 0.9rem;
  margin: 0 0 16px 0;
}
.pix-qr-wrap {
  text-align: center;
  margin-bottom: 16px;
}
.pix-qr-img {
  max-width: 220px;
  height: auto;
  border-radius: 8px;
}
.pix-copy-wrap {
  margin-top: 12px;
}
.pix-copy-label {
  color: rgba(255,255,255,0.9);
  font-size: 0.85rem;
  margin: 0 0 8px 0;
}
.pix-copy-text {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(168, 85, 247, 0.4);
  background: rgba(0,0,0,0.3);
  color: #fff;
  font-size: 0.8rem;
  resize: none;
  margin-bottom: 10px;
}
.pix-success-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #84cc16;
  font-weight: 600;
  margin-top: 16px;
}
.pix-success-msg ion-icon {
  font-size: 1.5rem;
}
.pix-pending-msg {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: #fbbf24;
  margin-top: 16px;
}
.pix-verify-btn {
  margin-left: 8px;
  --color: #fbbf24;
  --border-color: #fbbf24;
}
.pix-error-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #f87171;
  text-align: center;
  padding: 16px 0;
}
.pix-error-msg ion-icon {
  font-size: 2rem;
}
</style>
