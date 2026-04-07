<template>
  <div class="spread-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Centro de Agente</h2>
    </div>

    <!-- Agent Level Card -->
    <div class="agent-level-card">
      <div class="level-bg">
        <div class="level-info">
          <div class="level-badge">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="var(--accent-yellow)"/>
            </svg>
            <span class="level-num">LV {{ store.agentLevel }}</span>
          </div>
          <div class="level-right">
            <span class="level-title">Nível de Agente</span>
            <span class="level-subtitle" @click="$router.push('/mlmAgent/agentLevel')">
              Ver detalhes
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Commission Card -->
    <div class="commission-card">
      <div class="comm-top">
        <div class="comm-info">
          <span class="comm-label">Comissão Disponível</span>
          <span class="comm-value">R$ {{ fmt(store.availableCommission) }}</span>
        </div>
        <button class="claim-btn" :disabled="store.availableCommission <= 0 || claiming" @click="handleClaim">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {{ claiming ? 'Resgatando...' : 'Resgatar' }}
        </button>
      </div>
      <div class="comm-grid">
        <div class="comm-stat">
          <span class="cs-value">R$ {{ fmt(store.weekCommission) }}</span>
          <span class="cs-label">Comissão Semanal</span>
        </div>
        <div class="comm-stat">
          <span class="cs-value">R$ {{ fmt(store.totalCommission) }}</span>
          <span class="cs-label">Comissão Total</span>
        </div>
        <div class="comm-stat">
          <span class="cs-value">{{ store.directCount }}</span>
          <span class="cs-label">Diretos</span>
        </div>
        <div class="comm-stat">
          <span class="cs-value">{{ store.teamCount }}</span>
          <span class="cs-label">Equipe</span>
        </div>
      </div>
    </div>

    <!-- Team Subordinate Info -->
    <div class="team-section">
      <h3 class="section-title">Dados de Hoje</h3>
      <div class="team-cards">
        <div class="team-card">
          <div class="tc-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-yellow)" stroke-width="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            <span>Subordinados Diretos</span>
          </div>
          <div class="tc-grid">
            <div class="tc-item">
              <span class="tc-val">{{ store.directSubordinate.memberCount }}</span>
              <span class="tc-lbl">Novos Membros</span>
            </div>
            <div class="tc-item">
              <span class="tc-val">{{ store.directSubordinate.rechargeCount }}</span>
              <span class="tc-lbl">Depositantes</span>
            </div>
            <div class="tc-item">
              <span class="tc-val">R$ {{ fmt(store.directSubordinate.rechargeAmount) }}</span>
              <span class="tc-lbl">Valor Depósitos</span>
            </div>
            <div class="tc-item">
              <span class="tc-val">{{ store.directSubordinate.firstRechargeCount }}</span>
              <span class="tc-lbl">1º Depósito</span>
            </div>
          </div>
        </div>

        <div class="team-card">
          <div class="tc-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <span>Equipe</span>
          </div>
          <div class="tc-grid">
            <div class="tc-item">
              <span class="tc-val">{{ store.teamSubordinate.memberCount }}</span>
              <span class="tc-lbl">Novos Membros</span>
            </div>
            <div class="tc-item">
              <span class="tc-val">{{ store.teamSubordinate.rechargeCount }}</span>
              <span class="tc-lbl">Depositantes</span>
            </div>
            <div class="tc-item">
              <span class="tc-val">R$ {{ fmt(store.teamSubordinate.rechargeAmount) }}</span>
              <span class="tc-lbl">Valor Depósitos</span>
            </div>
            <div class="tc-item">
              <span class="tc-val">{{ store.teamSubordinate.firstRechargeCount }}</span>
              <span class="tc-lbl">1º Depósito</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Invite Link -->
    <div class="invite-section">
      <h3 class="section-title">Seu Link de Convite</h3>
      <div class="invite-link-box">
        <input readonly :value="store.inviteLink" class="invite-input" />
        <button class="copy-btn" @click="copyLink">{{ copied ? '✓ Copiado' : 'Copiar' }}</button>
      </div>
      <div class="share-btns">
        <button class="share-btn whatsapp" @click="shareWhatsApp">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </button>
        <button class="share-btn telegram" @click="shareTelegram">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0 12 12 0 0011.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          Telegram
        </button>
      </div>
    </div>

    <!-- Quick Navigation -->
    <div class="spread-nav">
      <div class="nav-item" v-for="nav in navItems" :key="nav.path" @click="$router.push(nav.path)">
        <div class="nav-left">
          <div class="nav-icon" :style="{ background: nav.color }">
            <component :is="nav.iconComponent" />
          </div>
          <span class="nav-label">{{ nav.label }}</span>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ep-color-text-weakest)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </div>

    <!-- History Link -->
    <button class="history-link" @click="$router.push('/report?type=statement')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      Ver Relatório de Comissões
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, h } from 'vue'
import { useAgentStore } from '../stores/agent'

const store = useAgentStore()
const copied = ref(false)
const claiming = ref(false)

function fmt(val) {
  const num = Number(val) || 0
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const IconSub = { render: () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', 'stroke-width': 2, innerHTML: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/>' }) }
const IconComm = { render: () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', 'stroke-width': 2, innerHTML: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>' }) }
const IconRules = { render: () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', 'stroke-width': 2, innerHTML: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>' }) }
const IconLevel = { render: () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', 'stroke-width': 2, innerHTML: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' }) }
const IconRate = { render: () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', 'stroke-width': 2, innerHTML: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>' }) }
const IconBoard = { render: () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', 'stroke-width': 2, innerHTML: '<path d="M8 21h8m-4-4v4M6 17h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z"/>' }) }
const IconInvite = { render: () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', 'stroke-width': 2, innerHTML: '<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>' }) }

const navItems = [
  { label: 'Link de Convite', path: '/mlmAgent/invitation', color: 'linear-gradient(135deg,#6366f1,#8b5cf6)', iconComponent: IconInvite },
  { label: 'Subordinados', path: '/mlmAgent/subordinate', color: 'linear-gradient(135deg,#f59e0b,#d97706)', iconComponent: IconSub },
  { label: 'Detalhes da Comissão', path: '/mlmAgent/commissionDetail', color: 'linear-gradient(135deg,#10b981,#059669)', iconComponent: IconComm },
  { label: 'Regras de Convite', path: '/mlmAgent/invitationRules', color: 'linear-gradient(135deg,#3b82f6,#2563eb)', iconComponent: IconRules },
  { label: 'Níveis de Agente', path: '/mlmAgent/agentLevel', color: 'linear-gradient(135deg,#f43f5e,#e11d48)', iconComponent: IconLevel },
  { label: 'Taxas de Comissão', path: '/mlmAgent/commissionRate', color: 'linear-gradient(135deg,#14b8a6,#0d9488)', iconComponent: IconRate },
  { label: 'Classificação', path: '/mlmAgent/leaderBord', color: 'linear-gradient(135deg,#a855f7,#7c3aed)', iconComponent: IconBoard },
]

function copyLink() {
  navigator.clipboard.writeText(store.inviteLink).then(() => {
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  })
}

function shareWhatsApp() {
  window.open(`https://wa.me/?text=${encodeURIComponent('Jogue e ganhe bônus! ' + store.inviteLink)}`, '_blank')
}

function shareTelegram() {
  window.open(`https://t.me/share/url?url=${encodeURIComponent(store.inviteLink)}&text=${encodeURIComponent('Jogue e ganhe bônus!')}`, '_blank')
}

async function handleClaim() {
  claiming.value = true
  try {
    await store.claimCommission()
    store.fetchAgentInfo()
  } catch (e) {
    console.error('Claim failed:', e)
  } finally {
    claiming.value = false
  }
}

onMounted(() => { store.fetchAgentInfo() })
</script>

<style scoped>
.spread-page {
  padding: 0 .75rem 1.5rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100%;
}
.page-header { display: flex; align-items: center; padding: .75rem 0; gap: .75rem; }
.page-header h2 { flex: 1; font-size: 1.125rem; font-weight: 700; color: var(--ep-color-text-default); }
.back-btn { color: var(--ep-color-text-default); padding: 4px; }

.agent-level-card { margin-bottom: .75rem; }
.level-bg {
  background: linear-gradient(135deg, #4c1d95, #7c3aed);
  border-radius: var(--ep-border-radius-l, .5rem);
  padding: 1.25rem 1rem;
  position: relative;
  overflow: hidden;
}
.level-bg::after {
  content: ''; position: absolute; top: -50%; right: -20%;
  width: 200px; height: 200px; border-radius: 50%;
  background: rgba(255,255,255,.05);
}
.level-info { display: flex; align-items: center; gap: .875rem; position: relative; z-index: 1; }
.level-badge {
  display: flex; flex-direction: column; align-items: center;
  gap: .125rem;
}
.level-num { font-size: .8125rem; font-weight: 800; color: var(--accent-yellow, #fbbf24); }
.level-right { flex: 1; }
.level-title { display: block; font-size: 1rem; font-weight: 700; color: #fff; }
.level-subtitle {
  display: flex; align-items: center; gap: 2px;
  font-size: .75rem; color: rgba(255,255,255,.7); cursor: pointer;
  margin-top: 2px;
}

.commission-card {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border: 1px solid var(--ep-color-border-default);
  border-radius: var(--ep-border-radius-l, .5rem);
  padding: 1rem; margin-bottom: .75rem;
}
.comm-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: .875rem; }
.comm-label { display: block; font-size: .75rem; color: var(--ep-color-text-weakest); margin-bottom: .25rem; }
.comm-value { font-size: 1.5rem; font-weight: 800; color: var(--ep-accent-green, #17C964); }
.claim-btn {
  display: flex; align-items: center; gap: .375rem;
  padding: .625rem 1rem; border-radius: var(--ep-border-radius-l, .5rem);
  background: linear-gradient(135deg, var(--ep-accent-green, #17C964), #059669);
  color: #fff; font-size: .8125rem; font-weight: 700;
  white-space: nowrap;
}
.claim-btn:disabled { opacity: .4; }
.comm-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .5rem; }
.comm-stat {
  background: rgba(255,255,255,.03); border-radius: .375rem;
  padding: .625rem .5rem; text-align: center;
}
.cs-value { display: block; font-size: .875rem; font-weight: 700; color: var(--ep-color-text-default); margin-bottom: .125rem; }
.cs-label { font-size: .6875rem; color: var(--ep-color-text-weakest); }

.section-title {
  font-size: .9375rem; font-weight: 700; color: var(--ep-color-text-default);
  margin-bottom: .625rem;
}
.team-section { margin-bottom: .75rem; }
.team-cards { display: flex; flex-direction: column; gap: .5rem; }
.team-card {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border: 1px solid var(--ep-color-border-default);
  border-radius: var(--ep-border-radius-l, .5rem);
  padding: .875rem;
}
.tc-header {
  display: flex; align-items: center; gap: .5rem;
  font-size: .8125rem; font-weight: 600; color: var(--ep-color-text-default);
  margin-bottom: .75rem; padding-bottom: .5rem;
  border-bottom: 1px solid var(--ep-color-border-default);
}
.tc-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .5rem; }
.tc-item { text-align: center; padding: .375rem 0; }
.tc-val { display: block; font-size: .875rem; font-weight: 700; color: var(--ep-color-text-default); }
.tc-lbl { font-size: .6875rem; color: var(--ep-color-text-weakest); }

.invite-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border: 1px solid var(--ep-color-border-default);
  border-radius: var(--ep-border-radius-l, .5rem);
  padding: 1rem; margin-bottom: .75rem;
}
.invite-link-box { display: flex; gap: .5rem; margin-bottom: .625rem; }
.invite-input {
  flex: 1; padding: .625rem .75rem;
  background: rgba(255,255,255,.04); border: 1px solid var(--ep-color-border-default);
  border-radius: .375rem; color: var(--ep-color-text-default);
  font-size: .75rem;
}
.copy-btn {
  padding: .625rem 1rem; background: var(--gradient-primary);
  color: var(--ep-color-text-inverse, #0E1E3D);
  font-weight: 700; font-size: .8125rem;
  border-radius: .375rem; white-space: nowrap;
}
.share-btns { display: flex; gap: .5rem; }
.share-btn {
  flex: 1; padding: .5rem; border-radius: .375rem;
  font-size: .8125rem; font-weight: 600; color: #fff;
  display: flex; align-items: center; justify-content: center; gap: .375rem;
}
.share-btn.whatsapp { background: #25d366; }
.share-btn.telegram { background: #0088cc; }

.spread-nav {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border: 1px solid var(--ep-color-border-default);
  border-radius: var(--ep-border-radius-l, .5rem);
  overflow: hidden; margin-bottom: .75rem;
}
.nav-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: .875rem 1rem; cursor: pointer; transition: background .15s;
  border-bottom: 1px solid rgba(255,255,255,.03);
}
.nav-item:last-child { border-bottom: none; }
.nav-item:active { background: rgba(255,255,255,.03); }
.nav-left { display: flex; align-items: center; gap: .75rem; }
.nav-icon {
  width: 2rem; height: 2rem; border-radius: .5rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.nav-label { font-size: .875rem; font-weight: 500; color: var(--ep-color-text-default); }

.history-link {
  display: flex; align-items: center; justify-content: center; gap: .375rem;
  width: 100%; padding: .75rem; border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--ep-color-background-fill-surface-raised-L1);
  border: 1px solid var(--ep-color-border-default);
  color: var(--ep-color-text-weak); font-size: .8125rem; font-weight: 600;
}
</style>
