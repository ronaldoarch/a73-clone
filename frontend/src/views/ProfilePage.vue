<template>
  <div class="profile-page">
    <!-- Not logged in -->
    <div v-if="!isLoggedIn" class="guest-state">
      <div class="guest-avatar">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <h2>Faça login para continuar</h2>
      <p>Acesse sua conta para ver seu perfil e saldo.</p>
      <button class="primary-btn" @click="$router.push('/login')">Entrar</button>
      <button class="secondary-btn" @click="$router.push('/register')">Criar Conta</button>
    </div>

    <!-- Logged in -->
    <div v-else class="profile-content">
      <div class="profile-header">
        <div class="avatar">
          <span>{{ (user?.account || 'U').charAt(0).toUpperCase() }}</span>
        </div>
        <div class="user-info">
          <h2>{{ user?.account || 'Usuário' }}</h2>
          <span class="user-id">ID: {{ user?.id || '---' }}</span>
        </div>
      </div>

      <div class="balance-card">
        <div class="balance-row">
          <span class="balance-label">Saldo disponível</span>
          <span class="balance-value">R$ 0,00</span>
        </div>
        <div class="balance-actions">
          <button class="action-btn deposit" @click="$router.push('/main/deposito')">Depositar</button>
          <button class="action-btn withdraw" @click="$router.push('/withdraw/apply')">Sacar</button>
        </div>
      </div>

      <div class="menu-list">
        <div
          class="menu-item"
          v-for="item in menuItems"
          :key="item.label"
          @click="item.path && $router.push(item.path)"
        >
          <span class="menu-icon" v-html="item.icon"></span>
          <span class="menu-label">{{ item.label }}</span>
          <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>

      <button class="logout-btn" @click="handleLogout">Sair da conta</button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const { isLoggedIn, user } = storeToRefs(auth)
const router = useRouter()

const menuItems = [
  { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>', label: 'Histórico de Apostas', path: '/report' },
  { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', label: 'Histórico de Transações', path: '/report' },
  { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>', label: 'Notificações', path: '/notification' },
  { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>', label: 'Segurança', path: '/security' },
  { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5"/></svg>', label: 'Ajuda e Suporte', path: null }
]

function handleLogout() {
  auth.logout()
  router.push('/main/inicio')
}
</script>

<style scoped>
.profile-page {
  padding: 1rem .75rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100%;
}

.guest-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.5rem 1.25rem;
  gap: .625rem;
}

.guest-avatar {
  color: var(--ep-color-text-weakest);
  margin-bottom: .5rem;
}

.guest-state h2 {
  font-size: 1.125rem;
  font-weight: var(--ep-font-weight-bold, 700);
  color: var(--ep-color-text-default);
}

.guest-state p {
  font-size: var(--ep-font-size-s, .8125rem);
  color: var(--ep-color-text-weakest);
  margin-bottom: .75rem;
}

.primary-btn {
  width: 100%;
  padding: .75rem;
  border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--gradient-primary);
  color: var(--ep-color-text-inverse, #0E1E3D);
  font-size: var(--ep-font-size-m, .9375rem);
  font-weight: var(--ep-font-weight-bold, 700);
}

.secondary-btn {
  width: 100%;
  padding: .75rem;
  border-radius: var(--ep-border-radius-l, .5rem);
  border: 1.5px solid var(--ep-color-border-default);
  color: var(--ep-color-text-default);
  font-size: var(--ep-font-size-m, .9375rem);
  font-weight: var(--ep-font-weight-semi-bold, 600);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: .875rem;
  margin-bottom: 1.25rem;
}

.avatar {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.375rem;
  font-weight: var(--ep-font-weight-bold, 700);
  color: var(--ep-color-text-inverse, #0E1E3D);
}

.user-info h2 {
  font-size: 1.125rem;
  font-weight: var(--ep-font-weight-bold, 700);
  color: var(--ep-color-text-default);
}

.user-id {
  font-size: var(--ep-font-size-s, .75rem);
  color: var(--ep-color-text-weakest);
}

.balance-card {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: var(--ep-border-radius-surface-large, 1rem);
  padding: 1.125rem 1rem;
  margin-bottom: 1.25rem;
  border: 1px solid var(--ep-color-border-default);
}

.balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: .875rem;
}

.balance-label {
  font-size: var(--ep-font-size-s, .8125rem);
  color: var(--ep-color-text-weakest);
}

.balance-value {
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--ep-color-text-default);
  font-family: var(--font-display);
}

.balance-actions {
  display: flex;
  gap: .625rem;
}

.action-btn {
  flex: 1;
  padding: .625rem;
  border-radius: var(--ep-border-radius-l, .5rem);
  font-size: var(--ep-font-size-m, .875rem);
  font-weight: var(--ep-font-weight-bold, 700);
  transition: all .2s ease;
}

.action-btn.deposit {
  background: var(--gradient-primary);
  color: var(--ep-color-text-inverse, #0E1E3D);
}

.action-btn.withdraw {
  background: var(--ep-color-background-fill-surface-lowered);
  color: var(--ep-color-text-default);
  border: 1px solid var(--ep-color-border-default);
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 1.5rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .875rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: var(--ep-border-radius-l, .5rem);
  cursor: pointer;
  transition: all .2s ease;
  border: 1px solid var(--ep-color-border-default);
  color: var(--ep-color-text-weak);
}

.menu-item:active {
  opacity: 0.7;
}

.menu-icon {
  display: flex;
  align-items: center;
  color: var(--ep-color-icon-brand-primary);
}

.menu-label {
  flex: 1;
  font-size: var(--ep-font-size-m, .875rem);
  font-weight: var(--ep-font-weight-medium, 500);
  color: var(--ep-color-text-default);
}

.menu-arrow {
  color: var(--ep-color-text-weakest);
}

.logout-btn {
  width: 100%;
  padding: .75rem;
  border-radius: var(--ep-border-radius-l, .5rem);
  background: rgba(245,34,45,.08);
  border: 1px solid rgba(245,34,45,.25);
  color: var(--ep-light-accent-color-red, #F5222D);
  font-size: var(--ep-font-size-m, .875rem);
  font-weight: var(--ep-font-weight-semi-bold, 600);
}
</style>
