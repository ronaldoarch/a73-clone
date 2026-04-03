<template>
  <div class="spread-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Convide e Ganhe</h2>
    </div>

    <div class="spread-banner">
      <h3>Ganhe comissão por cada amigo!</h3>
      <p>Convide amigos, ganhe R$ por cada depósito que eles fizerem.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">{{ totalSubordinates }}</span>
        <span class="stat-label">Convidados</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ todayNewSubs }}</span>
        <span class="stat-label">Hoje</span>
      </div>
      <div class="stat-card highlight">
        <span class="stat-value">R$ {{ totalCommission.toFixed(2) }}</span>
        <span class="stat-label">Comissão Total</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">R$ {{ availableCommission.toFixed(2) }}</span>
        <span class="stat-label">Disponível</span>
      </div>
    </div>

    <div class="invite-section">
      <h3>Seu link de convite</h3>
      <div class="invite-link-box">
        <input readonly :value="inviteLink" class="invite-input" />
        <button class="copy-btn" @click="copyLink">{{ copied ? '✓' : 'Copiar' }}</button>
      </div>
      <div class="share-btns">
        <button class="share-btn whatsapp" @click="shareWhatsApp">WhatsApp</button>
        <button class="share-btn telegram" @click="shareTelegram">Telegram</button>
      </div>
    </div>

    <button class="claim-commission" :disabled="availableCommission <= 0" @click="handleClaim">
      Resgatar Comissão
    </button>

    <div class="spread-nav">
      <div class="nav-item" v-for="nav in navItems" :key="nav.path" @click="$router.push(nav.path)">
        <span class="nav-label">{{ nav.label }}</span>
        <span class="nav-arrow">›</span>
      </div>
    </div>

    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAgentStore } from '../stores/agent'
import { storeToRefs } from 'pinia'

const store = useAgentStore()
const { totalCommission, availableCommission, totalSubordinates, todayNewSubs, inviteLink } = storeToRefs(store)

const copied = ref(false)

const navItems = [
  { label: 'Subordinados', path: '/mlmAgent/subordinate' },
  { label: 'Detalhes da Comissão', path: '/mlmAgent/commissionDetail' },
  { label: 'Regras de Convite', path: '/mlmAgent/invitationRules' },
  { label: 'Níveis de Agente', path: '/mlmAgent/agentLevel' },
  { label: 'Taxas de Comissão', path: '/mlmAgent/commissionRate' },
  { label: 'Classificação', path: '/mlmAgent/leaderBord' },
]

function copyLink() {
  navigator.clipboard.writeText(inviteLink.value).then(() => {
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  })
}

function shareWhatsApp() {
  window.open(`https://wa.me/?text=${encodeURIComponent('Jogue no A73 e ganhe bônus! ' + inviteLink.value)}`, '_blank')
}

function shareTelegram() {
  window.open(`https://t.me/share/url?url=${encodeURIComponent(inviteLink.value)}&text=${encodeURIComponent('Jogue no A73 e ganhe bônus!')}`, '_blank')
}

async function handleClaim() {
  try {
    await store.claimCommission()
    alert('Comissão resgatada com sucesso!')
    store.fetchAgentInfo()
  } catch (e) {
    alert(e.message || 'Erro ao resgatar')
  }
}

onMounted(() => { store.fetchAgentInfo() })
</script>

<style scoped>
.spread-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }

.spread-banner { background: linear-gradient(135deg, #4c1d95, #7c3aed); border-radius: var(--radius-lg); padding: 20px 16px; margin-bottom: 16px; }
.spread-banner h3 { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
.spread-banner p { font-size: 13px; color: rgba(255,255,255,0.75); }

.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px; }
.stat-card { background: var(--bg-card); border-radius: var(--radius-md); padding: 14px; text-align: center; }
.stat-card.highlight { background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(124,34,206,0.2)); border: 1px solid rgba(168,85,247,0.3); }
.stat-value { display: block; font-size: 18px; font-weight: 800; margin-bottom: 4px; }
.stat-label { font-size: 11px; color: var(--text-muted); }

.invite-section { background: var(--bg-card); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 12px; }
.invite-section h3 { font-size: 14px; font-weight: 600; margin-bottom: 10px; }
.invite-link-box { display: flex; gap: 8px; margin-bottom: 10px; }
.invite-input { flex: 1; padding: 10px; background: var(--bg-input); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 12px; }
.copy-btn { padding: 10px 16px; background: var(--accent-yellow); color: #000; font-weight: 700; font-size: 13px; border-radius: var(--radius-sm); white-space: nowrap; }
.share-btns { display: flex; gap: 8px; }
.share-btn { flex: 1; padding: 10px; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; color: #fff; }
.share-btn.whatsapp { background: #25d366; }
.share-btn.telegram { background: #0088cc; }

.claim-commission { width: 100%; padding: 14px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--accent-green), #16a34a); color: #fff; font-size: 16px; font-weight: 700; margin-bottom: 16px; }
.claim-commission:disabled { opacity: 0.4; }

.spread-nav { background: var(--bg-card); border-radius: var(--radius-lg); overflow: hidden; }
.nav-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; cursor: pointer; transition: var(--transition); border-bottom: 1px solid rgba(255,255,255,0.04); }
.nav-item:last-child { border-bottom: none; }
.nav-item:active { opacity: 0.7; }
.nav-label { font-size: 14px; font-weight: 500; }
.nav-arrow { font-size: 20px; color: var(--text-muted); }
</style>
