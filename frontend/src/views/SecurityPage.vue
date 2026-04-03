<template>
  <div class="security-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Central de Segurança</h2>
    </div>

    <div class="security-list">
      <div class="security-item" @click="$router.push('/security/verify/loginPwd')">
        <div class="sec-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>
        <div class="sec-info">
          <span class="sec-label">Senha de Login</span>
          <span class="sec-status done">Configurado</span>
        </div>
        <span class="sec-arrow">›</span>
      </div>

      <div class="security-item" @click="$router.push('/security/verify/assetPwd')">
        <div class="sec-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div class="sec-info">
          <span class="sec-label">Senha de Ativos</span>
          <span class="sec-status" :class="{ done: hasAssetPwd }">{{ hasAssetPwd ? 'Configurado' : 'Não configurado' }}</span>
        </div>
        <span class="sec-arrow">›</span>
      </div>

      <div class="security-item" @click="$router.push('/security/bind/phone')">
        <div class="sec-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
        </div>
        <div class="sec-info">
          <span class="sec-label">Telefone</span>
          <span class="sec-status" :class="{ done: hasPhone }">{{ hasPhone ? maskedPhone : 'Vincular' }}</span>
        </div>
        <span class="sec-arrow">›</span>
      </div>

      <div class="security-item" @click="$router.push('/security/bind/email')">
        <div class="sec-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <div class="sec-info">
          <span class="sec-label">Email</span>
          <span class="sec-status" :class="{ done: hasEmail }">{{ hasEmail ? maskedEmail : 'Vincular' }}</span>
        </div>
        <span class="sec-arrow">›</span>
      </div>

      <div class="security-item" @click="$router.push('/bindCPF')">
        <div class="sec-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div class="sec-info">
          <span class="sec-label">CPF</span>
          <span class="sec-status" :class="{ done: hasCpf }">{{ hasCpf ? 'Vinculado' : 'Vincular' }}</span>
        </div>
        <span class="sec-arrow">›</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { hasPhone, hasEmail, hasCpf, phone, email } = storeToRefs(userStore)

const hasAssetPwd = computed(() => !!userStore.details?.hasAssetPassword)
const maskedPhone = computed(() => {
  const p = phone.value || ''
  return p.length > 4 ? p.slice(0, 3) + '****' + p.slice(-2) : p
})
const maskedEmail = computed(() => {
  const e = email.value || ''
  const [local, domain] = e.split('@')
  if (!domain) return e
  return local.slice(0, 2) + '***@' + domain
})

onMounted(() => { userStore.fetchDetails() })
</script>

<style scoped>
.security-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }

.security-list { display: flex; flex-direction: column; gap: 2px; }
.security-item { display: flex; align-items: center; gap: 14px; padding: 16px 14px; background: var(--bg-card); border-radius: var(--radius-md); cursor: pointer; transition: var(--transition); }
.security-item:active { opacity: 0.7; }
.sec-icon { color: var(--purple-300); flex-shrink: 0; width: 24px; display: flex; align-items: center; justify-content: center; }
.sec-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.sec-label { font-size: 14px; font-weight: 600; }
.sec-status { font-size: 12px; color: var(--accent-yellow); }
.sec-status.done { color: var(--accent-green); }
.sec-arrow { font-size: 22px; color: var(--text-muted); }
</style>
