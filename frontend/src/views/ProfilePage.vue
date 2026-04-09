<template>
  <div class="profile-page">
    <div v-if="!isLoggedIn" class="guest-state">
      <div class="guest-avatar">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <h2>Faça login para continuar</h2>
      <p>Acesse sua conta para ver seu perfil e saldo.</p>
      <button class="primary-btn" @click="$router.push('/login')">Entrar</button>
      <button class="secondary-btn" @click="$router.push('/register')">Criar Conta</button>
    </div>

    <div v-else class="profile-content">
      <!-- User Header -->
      <div class="profile-header">
        <div class="avatar-wrap" @click="showAvatarModal = true">
          <div class="avatar" v-if="userAvatar">
            <img :src="userAvatar" alt="" class="avatar-img" />
          </div>
          <div class="avatar" v-else>
            <span class="avatar-initial">{{ userInitial }}</span>
          </div>
          <div class="avatar-edit-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
        </div>
        <div class="user-meta">
          <h2 class="user-name">{{ displayName }}</h2>
          <div class="user-id-row">
            <span class="user-id">ID: {{ userId }}</span>
            <button class="copy-id" @click="copyUserId">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            </button>
          </div>
        </div>
        <button class="email-icon-btn" @click="$router.push('/notification')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <span v-if="mailCount > 0" class="email-badge">{{ mailCount > 99 ? '99+' : mailCount }}</span>
        </button>
      </div>

      <!-- Avatar Modal -->
      <div v-if="showAvatarModal" class="modal-overlay" @click.self="showAvatarModal = false">
        <div class="avatar-modal">
          <div class="modal-header">
            <button @click="showAvatarModal = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <h3>Alterar Avatar</h3>
            <div></div>
          </div>
          <div class="avatar-gender">
            <button :class="{ active: avatarGender === 1 }" @click="setAvatarGender(1)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="8" r="5"/><path d="M15 3l6 0M21 3v6"/></svg>
              Masculino
            </button>
            <button :class="{ active: avatarGender === 0 }" @click="setAvatarGender(0)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg>
              Feminino
            </button>
          </div>
          <div class="avatar-grid">
            <div
              v-for="i in 12"
              :key="`${avatarGender}-${i}`"
              class="avatar-option"
              :class="{ selected: selectedAvatar === `${avatarGender}_${i}` }"
              @click="selectedAvatar = `${avatarGender}_${i}`"
            >
              <img
                class="avatar-thumb"
                :src="avatarThumbUrl(i)"
                :alt="`Avatar ${i}`"
                loading="lazy"
              />
            </div>
          </div>
          <button class="avatar-confirm-btn" @click="confirmAvatar">Confirmar</button>
        </div>
      </div>

      <!-- Balance + Bonus Row -->
      <div class="balance-card">
        <div class="bal-top">
          <div class="bal-col">
            <span class="bal-label">Saldo</span>
            <div class="bal-value-row">
              <span class="bal-value">{{ currency }} {{ formattedBalance }}</span>
              <button class="bal-refresh" :class="{ spinning: refreshing }" @click="refreshBal">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="bal-divider"></div>
          <div class="bal-col">
            <span class="bal-label">Bônus</span>
            <span class="bal-bonus">{{ currency }} {{ formattedBonus }}</span>
          </div>
        </div>
        <div class="bal-actions">
          <button class="action-btn deposit" @click="$router.push('/main/deposito')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Depositar
          </button>
          <button class="action-btn withdraw" @click="$router.push('/withdraw/apply')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Sacar
          </button>
        </div>
      </div>

      <!-- VIP Card -->
      <div class="vip-card" @click="$router.push('/activity/vip')">
        <div class="vip-top">
          <div class="vip-left">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#FFD700"/></svg>
            <div>
              <span class="vip-level">VIP {{ vipLevel }}</span>
              <span class="vip-current">Nível Atual</span>
            </div>
          </div>
          <div class="vip-right">
            <span class="vip-detail-link">Ver Detalhes</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
        <div class="vip-progress">
          <div class="vip-bar">
            <div class="vip-bar-fill" :style="{ width: vipProgress + '%' }"></div>
          </div>
          <div class="vip-progress-labels">
            <span>VIP {{ vipLevel }}</span>
            <span v-if="vipNextLevel">VIP {{ vipNextLevel }}</span>
            <span v-else>Nível Máximo</span>
          </div>
        </div>
        <div v-if="vipNeedRecharge > 0" class="vip-condition">
          <span>Recarga necessária: {{ currency }} {{ fmtNum(vipNeedRecharge) }}</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <div class="nav-section">
        <div class="nav-item" v-for="item in menuItems" :key="item.label" @click="item.action">
          <div class="nav-icon-wrap" :style="{ background: item.color }">
            <span v-html="item.icon"></span>
          </div>
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
          <svg class="nav-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ep-color-text-weakest)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>

      <button class="logout-btn" @click="handleLogout">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sair da conta
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/user'
import { useSystemStore } from '../stores/system'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { trpcQuery } from '../utils/api'
import { getAvatarImagePath, parseAvatarSelectionUrl } from '../utils/avatarPaths'

const auth = useAuthStore()
const userStore = useUserStore()
const systemStore = useSystemStore()
const router = useRouter()

const { isLoggedIn } = storeToRefs(auth)
const { userDetails, assets, mailCount } = storeToRefs(userStore)

const currency = computed(() => systemStore.currency || 'R$')
const vipLevel = ref(0)
const vipNextLevel = ref(null)
const vipProgress = ref(0)
const vipNeedRecharge = ref(0)
const refreshing = ref(false)
const showAvatarModal = ref(false)
const avatarGender = ref(1)
const selectedAvatar = ref('')

const userAvatar = computed(() => userDetails.value?.avatar || '')

function avatarThumbUrl(slotIndex) {
  return getAvatarImagePath(avatarGender.value === 1, slotIndex)
}

function setAvatarGender(g) {
  const m = selectedAvatar.value.match(/^(\d+)_(\d+)$/)
  const idx = m ? Number(m[2]) : 1
  avatarGender.value = g
  selectedAvatar.value = `${g}_${Number.isFinite(idx) ? idx : 1}`
}

function syncAvatarSelectionFromProfile() {
  const parsed = parseAvatarSelectionUrl(userDetails.value?.avatar || '')
  if (parsed) {
    avatarGender.value = parsed.gender
    selectedAvatar.value = `${parsed.gender}_${parsed.index}`
  } else {
    selectedAvatar.value = `${avatarGender.value}_1`
  }
}

watch(showAvatarModal, (open) => {
  if (open) syncAvatarSelectionFromProfile()
})

function confirmAvatar() {
  if (!selectedAvatar.value) {
    syncAvatarSelectionFromProfile()
  }
  const m = selectedAvatar.value.match(/^(\d+)_(\d+)$/)
  const g = m ? Number(m[1]) : avatarGender.value
  const idx = m ? Number(m[2]) : 1
  const url = getAvatarImagePath(g === 1, idx)
  const d = userDetails.value
  if (d) {
    userStore.setUser({ ...d, avatar: url })
  }
  showAvatarModal.value = false
}

function fmtNum(val) {
  return Number(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function refreshBal() {
  if (refreshing.value) return
  refreshing.value = true
  try { await userStore.fetchAssets() } catch {}
  setTimeout(() => { refreshing.value = false }, 1000)
}

function copyUserId() {
  navigator.clipboard?.writeText(String(userId.value)).catch(() => {})
}

const displayName = computed(() =>
  userDetails.value?.nickname || userDetails.value?.account || auth.account || 'Usuário'
)
const userId = computed(() => userDetails.value?.userId || userDetails.value?.id || '---')
const userInitial = computed(() => (displayName.value || 'U').charAt(0).toUpperCase())

const balanceValue = computed(() => Number(assets.value?.balance ?? assets.value?.gold ?? 0) / 100)
const formattedBalance = computed(() => fmtNum(balanceValue.value))

const bonusValue = computed(() => Number(assets.value?.totalRewardAmountChange ?? 0) / 100)
const formattedBonus = computed(() => fmtNum(bonusValue.value))

const commission = computed(() => Number(assets.value?.commission ?? 0) / 100)

const svgReport = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>'
const svgInvite = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>'
const svgRedeem = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M20 12V8H6a2 2 0 010-4h12V2"/><path d="M4 6v12a2 2 0 002 2h14v-4"/><path d="M18 12a2 2 0 00-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>'
const svgSecurity = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
const svgNotif = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>'
const svgSupport = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5"/></svg>'

const menuItems = computed(() => [
  { icon: svgNotif, label: 'Suporte', color: 'linear-gradient(135deg,#6366f1,#8b5cf6)', badge: mailCount.value > 0 ? mailCount.value : null, action: () => router.push('/notification') },
  { icon: svgReport, label: 'Relatórios', color: 'linear-gradient(135deg,#3b82f6,#2563eb)', action: () => router.push('/report') },
  { icon: svgInvite, label: 'Convidar Amigos', color: 'linear-gradient(135deg,#f59e0b,#d97706)', action: () => router.push('/spread') },
  { icon: svgRedeem, label: 'Resgatar', color: 'linear-gradient(135deg,#10b981,#059669)', action: () => router.push('/Redeem') },
  { icon: svgSecurity, label: 'Segurança', color: 'linear-gradient(135deg,#f43f5e,#e11d48)', action: () => router.push('/security') },
  { icon: svgSupport, label: 'Ajuda e Suporte', color: 'linear-gradient(135deg,#14b8a6,#0d9488)', action: () => {} }
])

function handleLogout() {
  auth.removeToken()
  userStore.clearUser()
  router.push('/main/inicio')
}

onMounted(async () => {
  if (isLoggedIn.value) {
    userStore.fetchDetails().catch(() => {})
    userStore.fetchAssets().catch(() => {})
    try {
      const data = await trpcQuery('vip.info', {})
      if (data?.curVipLevel != null) {
        vipLevel.value = data.curVipLevel
        vipNextLevel.value = data.nextVipLevel ?? null
        vipProgress.value = Math.min(100, (data.firstLevelProgress ?? 0) * 100)
        vipNeedRecharge.value = (data.rechargeRequirements ?? 0) / 100
      }
    } catch {}
  }
})
</script>

<style scoped>
.profile-page {
  padding: .75rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100%;
}

.guest-state {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 2.5rem 1.25rem; gap: .625rem;
}
.guest-avatar { color: var(--ep-color-text-weakest); margin-bottom: .5rem; }
.guest-state h2 { font-size: 1.125rem; font-weight: 700; color: var(--ep-color-text-default); }
.guest-state p { font-size: .8125rem; color: var(--ep-color-text-weakest); margin-bottom: .75rem; }
.primary-btn {
  width: 100%; padding: .75rem; border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--gradient-primary); color: var(--ep-color-text-inverse, #0E1E3D);
  font-size: .9375rem; font-weight: 700;
}
.secondary-btn {
  width: 100%; padding: .75rem; border-radius: var(--ep-border-radius-l, .5rem);
  border: 1.5px solid var(--ep-color-border-default); color: var(--ep-color-text-default);
  font-size: .9375rem; font-weight: 600;
}

.profile-header {
  display: flex; align-items: center; gap: .875rem;
  margin-bottom: 1rem; padding: .5rem 0;
}
.avatar-wrap { position: relative; cursor: pointer; }
.avatar {
  width: 3.5rem; height: 3.5rem; border-radius: 50%;
  background: var(--gradient-primary); display: flex; align-items: center;
  justify-content: center; border: 2.5px solid var(--accent-yellow, #fbbf24);
  overflow: hidden;
}
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-initial { font-size: 1.5rem; font-weight: 800; color: var(--ep-color-text-inverse, #0E1E3D); }
.avatar-edit-badge {
  position: absolute; bottom: -2px; right: -2px;
  width: 1.25rem; height: 1.25rem; border-radius: 50%;
  background: var(--gradient-primary); display: flex; align-items: center;
  justify-content: center; border: 2px solid var(--ep-color-background-fill-body-default);
}
.email-icon-btn {
  position: relative; color: var(--ep-color-text-weakest); padding: .25rem;
}
.email-badge {
  position: absolute; top: -4px; right: -4px;
  background: #F44336; color: #fff; font-size: .5rem; font-weight: 700;
  padding: 1px 4px; border-radius: .5rem; min-width: .75rem; text-align: center;
}
.user-meta { flex: 1; }

/* Avatar Modal */
.modal-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center;
  padding: .75rem;
}
.avatar-modal {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: var(--ep-border-radius-xl, 1rem); padding: 1.25rem;
  width: 100%; max-width: var(--max-width, 480px);
  box-sizing: border-box;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1rem;
}
.modal-header h3 {
  font-size: 1rem; font-weight: 700; color: var(--ep-color-text-default);
}
.modal-header button { color: var(--ep-color-text-weakest); }
.avatar-gender {
  display: flex; gap: .5rem; margin-bottom: 1rem;
}
.avatar-gender button {
  flex: 1; padding: .5rem; border-radius: .5rem; text-align: center;
  background: var(--ep-color-background-fill-surface-lowered);
  color: var(--ep-color-text-weak); font-size: .8125rem; font-weight: 600;
  border: 1px solid var(--ep-color-border-default); transition: all .2s;
  display: flex; align-items: center; justify-content: center; gap: .375rem;
}
.avatar-gender button.active {
  background: var(--gradient-primary); color: var(--ep-color-text-inverse, #0E1E3D);
  border-color: transparent;
}
.avatar-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: .5rem;
  max-height: 18rem; overflow-y: auto; margin-bottom: 1rem;
}
.avatar-option {
  aspect-ratio: 1; border-radius: .5rem; overflow: hidden;
  border: 2px solid transparent; cursor: pointer; transition: border-color .2s;
  background: var(--ep-color-background-fill-surface-lowered);
  display: flex; align-items: center; justify-content: center;
}
.avatar-option.selected { border-color: var(--ep-color-text-selected); box-shadow: 0 0 0 1px var(--ep-color-text-selected); }
.avatar-thumb {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.avatar-confirm-btn {
  width: 100%; padding: .75rem; border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--gradient-primary); color: var(--ep-color-text-inverse, #0E1E3D);
  font-size: .875rem; font-weight: 700;
}
.user-name { font-size: 1.125rem; font-weight: 700; color: var(--ep-color-text-default); margin-bottom: 2px; }
.user-id-row { display: flex; align-items: center; gap: .375rem; }
.user-id { font-size: .75rem; color: var(--ep-color-text-weakest); }
.copy-id { color: var(--ep-color-text-weakest); padding: 2px; }

.balance-card {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border: 1px solid var(--ep-color-border-default);
  border-radius: var(--ep-border-radius-l, .5rem);
  padding: 1rem; margin-bottom: .75rem;
}
.bal-top { display: flex; align-items: stretch; margin-bottom: .875rem; }
.bal-col { flex: 1; }
.bal-label { display: block; font-size: .75rem; color: var(--ep-color-text-weakest); margin-bottom: .25rem; }
.bal-value-row { display: flex; align-items: center; gap: .375rem; }
.bal-value { font-size: 1.375rem; font-weight: 800; color: var(--ep-color-text-default); }
.bal-refresh { color: var(--ep-color-text-weakest); padding: 2px; }
.bal-refresh.spinning { animation: bal-spin .8s linear infinite; }
@keyframes bal-spin { to { transform: rotate(360deg); } }
.bal-divider { width: 1px; background: var(--ep-color-border-default); margin: 0 .875rem; }
.bal-bonus { font-size: 1rem; font-weight: 700; color: var(--ep-accent-green, #17C964); }

.bal-actions { display: flex; gap: .5rem; }
.action-btn {
  flex: 1; padding: .625rem; border-radius: var(--ep-border-radius-l, .5rem);
  font-size: .875rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; gap: .375rem;
}
.action-btn.deposit { background: var(--gradient-primary); color: var(--ep-color-text-inverse, #0E1E3D); }
.action-btn.withdraw {
  background: rgba(255,255,255,.04); color: var(--ep-color-text-default);
  border: 1px solid var(--ep-color-border-default);
}

.vip-card {
  background: linear-gradient(135deg, #78350f, #92400e);
  border-radius: var(--ep-border-radius-l, .5rem);
  padding: 1rem; margin-bottom: .75rem; cursor: pointer;
  position: relative; overflow: hidden;
}
.vip-card::after {
  content: ''; position: absolute; top: -60%; right: -20%;
  width: 180px; height: 180px; border-radius: 50%;
  background: rgba(255,215,0,.08);
}
.vip-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: .75rem; position: relative; z-index: 1; }
.vip-left { display: flex; align-items: center; gap: .625rem; }
.vip-level { display: block; font-size: 1rem; font-weight: 800; color: #FFD700; }
.vip-current { display: block; font-size: .6875rem; color: rgba(255,255,255,.6); }
.vip-right { display: flex; align-items: center; gap: .25rem; position: relative; z-index: 1; }
.vip-detail-link { font-size: .75rem; color: rgba(255,255,255,.7); }
.vip-right svg { color: rgba(255,255,255,.5); }

.vip-progress { margin-bottom: .5rem; position: relative; z-index: 1; }
.vip-bar {
  height: .375rem; background: rgba(0,0,0,.25); border-radius: .1875rem;
  overflow: hidden; margin-bottom: .25rem;
}
.vip-bar-fill {
  height: 100%; border-radius: .1875rem;
  background: linear-gradient(90deg, #fbbf24, #FFD700);
  transition: width .4s ease;
}
.vip-progress-labels {
  display: flex; justify-content: space-between;
  font-size: .625rem; color: rgba(255,255,255,.5);
}
.vip-condition {
  font-size: .6875rem; color: rgba(255,255,255,.6);
  position: relative; z-index: 1;
}

.nav-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border: 1px solid var(--ep-color-border-default);
  border-radius: var(--ep-border-radius-l, .5rem);
  overflow: hidden; margin-bottom: .75rem;
}
.nav-item {
  display: flex; align-items: center; gap: .75rem;
  padding: .875rem 1rem; cursor: pointer; transition: background .15s;
  border-bottom: 1px solid rgba(255,255,255,.03);
}
.nav-item:last-child { border-bottom: none; }
.nav-item:active { background: rgba(255,255,255,.03); }
.nav-icon-wrap {
  width: 2rem; height: 2rem; border-radius: .5rem;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.nav-label { flex: 1; font-size: .875rem; font-weight: 500; color: var(--ep-color-text-default); }
.nav-badge {
  background: #F44336; color: #fff; font-size: .625rem; font-weight: 700;
  padding: .125rem .375rem; border-radius: .625rem; min-width: 1.125rem; text-align: center;
}
.nav-arrow { flex-shrink: 0; }

.logout-btn {
  width: 100%; padding: .75rem; border-radius: var(--ep-border-radius-l, .5rem);
  background: rgba(245,34,45,.06); border: 1px solid rgba(245,34,45,.2);
  color: var(--ep-light-accent-color-red, #F5222D);
  font-size: .875rem; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: .375rem;
}
</style>
