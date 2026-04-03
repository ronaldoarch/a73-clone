<template>
  <div class="redeem-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Resgatar Código</h2>
    </div>

    <div class="redeem-card">
      <div class="redeem-icon">🎁</div>
      <h3>Tem um código promocional?</h3>
      <p>Digite o código abaixo para resgatar seu bônus.</p>
      <div class="code-input-wrap">
        <input v-model="code" type="text" placeholder="CÓDIGO-AQUI" maxlength="20" />
        <button class="redeem-btn" :disabled="!code.trim() || loading" @click="handleRedeem">
          {{ loading ? '...' : 'Resgatar' }}
        </button>
      </div>
      <p v-if="message" class="result-msg" :class="{ success: isSuccess }">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { trpcMutation } from '../utils/api'

const code = ref('')
const loading = ref(false)
const message = ref('')
const isSuccess = ref(false)

async function handleRedeem() {
  loading.value = true
  message.value = ''
  try {
    const data = await trpcMutation('redeem.use', { code: code.value.trim() })
    message.value = data?.message || 'Código resgatado com sucesso!'
    isSuccess.value = true
    code.value = ''
  } catch (e) {
    message.value = e.message || 'Código inválido ou expirado'
    isSuccess.value = false
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.redeem-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }

.redeem-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 32px 20px; text-align: center; }
.redeem-icon { font-size: 48px; margin-bottom: 12px; }
.redeem-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
.redeem-card p { font-size: 13px; color: var(--text-muted); margin-bottom: 20px; }
.code-input-wrap { display: flex; gap: 8px; }
.code-input-wrap input { flex: 1; padding: 12px 14px; background: var(--bg-input); border: 1.5px solid rgba(255,255,255,0.08); border-radius: var(--radius-md); color: var(--text-primary); font-size: 16px; font-weight: 600; text-align: center; text-transform: uppercase; letter-spacing: 2px; }
.code-input-wrap input::placeholder { color: var(--text-muted); letter-spacing: 1px; }
.redeem-btn { padding: 12px 20px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--accent-green), #16a34a); color: #fff; font-size: 15px; font-weight: 700; white-space: nowrap; }
.redeem-btn:disabled { opacity: 0.4; }
.result-msg { margin-top: 16px; font-size: 14px; font-weight: 600; color: var(--accent-red); }
.result-msg.success { color: var(--accent-green); }
</style>
