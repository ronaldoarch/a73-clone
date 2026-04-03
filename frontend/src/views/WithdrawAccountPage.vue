<template>
  <div class="wa-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Contas de Saque</h2>
      <button class="add-btn" @click="$router.push('/withdrawalBindAccount')">+ Adicionar</button>
    </div>

    <div v-if="accounts.length" class="account-list">
      <div v-for="acct in accounts" :key="acct.id" class="account-item">
        <div class="acct-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
        </div>
        <div class="acct-details">
          <span class="acct-type">{{ acct.type || 'PIX' }}</span>
          <span class="acct-key">{{ acct.key || acct.pixKey || '***' }}</span>
        </div>
      </div>
    </div>
    <Empty v-else type="data" text="Nenhuma conta cadastrada">
      <button class="add-account-btn" @click="$router.push('/withdrawalBindAccount')">Adicionar conta</button>
    </Empty>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useWithdrawStore } from '../stores/withdraw'
import { storeToRefs } from 'pinia'
import Empty from '../components/Empty.vue'

const store = useWithdrawStore()
const { bankAccounts: accounts } = storeToRefs(store)

onMounted(() => { store.fetchBankAccounts() })
</script>

<style scoped>
.wa-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }
.add-btn { font-size: 13px; color: var(--purple-200); font-weight: 600; }
.account-list { display: flex; flex-direction: column; gap: 8px; }
.account-item { display: flex; align-items: center; gap: 14px; padding: 16px; background: var(--bg-card); border-radius: var(--radius-md); }
.acct-icon { color: var(--purple-300); }
.acct-details { flex: 1; }
.acct-type { display: block; font-size: 14px; font-weight: 600; margin-bottom: 2px; }
.acct-key { font-size: 12px; color: var(--text-muted); }
.add-account-btn { margin-top: 12px; padding: 10px 24px; border-radius: var(--radius-md); background: var(--purple-500); color: #fff; font-size: 14px; font-weight: 600; }
</style>
