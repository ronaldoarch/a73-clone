<template>
  <div class="wa-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Minhas Contas</h2>
    </div>

    <!-- Tabs -->
    <div v-if="tabs.length > 1" class="tab-bar">
      <button
        v-for="tab in tabs" :key="tab.id"
        class="tab-item" :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >{{ tab.name }}</button>
    </div>

    <!-- Account List -->
    <div v-if="filteredAccounts.length" class="account-list">
      <label
        v-for="acct in filteredAccounts" :key="acct.id || acct.key"
        class="account-item" :class="{ selected: selectedDefault === (acct.relatedCode || acct.id) }"
      >
        <div class="acct-left">
          <div class="acct-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="5" width="20" height="14" rx="2.5"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
              <circle cx="18" cy="15" r="1"/>
            </svg>
          </div>
          <div class="acct-details">
            <span class="acct-type">{{ acct.type || acct.valueType || 'PIX' }}</span>
            <span class="acct-key">{{ maskKey(acct.key || acct.value || acct.pixKey || '') }}</span>
            <span v-if="acct.holderName || acct.realName" class="acct-holder">{{ acct.holderName || acct.realName }}</span>
          </div>
        </div>
        <div class="acct-right">
          <input
            type="radio"
            name="default-account"
            class="radio-default"
            :checked="selectedDefault === (acct.relatedCode || acct.id)"
            @change="setDefault(acct)"
          />
          <span class="default-label">Padrão</span>
        </div>
      </label>
    </div>

    <div v-else class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ep-color-text-weakest)" stroke-width="1.5">
        <rect x="2" y="5" width="20" height="14" rx="2.5"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
        <path d="M12 14v2m0 0v0"/>
      </svg>
      <span class="empty-text">Nenhuma conta cadastrada</span>
    </div>

    <!-- Add Account Button -->
    <div class="add-section">
      <button class="add-account-btn" @click="$router.push('/withdrawalBindAccount')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Adicionar Conta
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWithdrawStore } from '../stores/withdraw'
import { storeToRefs } from 'pinia'

const store = useWithdrawStore()
const { bankAccounts: accounts } = storeToRefs(store)

const activeTab = ref('all')
const selectedDefault = ref(null)

const tabs = computed(() => {
  const types = new Set()
  accounts.value.forEach(a => {
    const t = a.type || a.valueType || 'PIX'
    types.add(t)
  })
  if (types.size <= 1) return [{ id: 'all', name: 'Todos' }]
  return [
    { id: 'all', name: 'Todos' },
    ...Array.from(types).map(t => ({ id: t, name: t }))
  ]
})

const filteredAccounts = computed(() => {
  if (activeTab.value === 'all') return accounts.value
  return accounts.value.filter(a => (a.type || a.valueType || 'PIX') === activeTab.value)
})

function maskKey(key) {
  if (!key || key.length <= 6) return key || '***'
  return key.slice(0, 3) + '***' + key.slice(-3)
}

function setDefault(acct) {
  selectedDefault.value = acct.relatedCode || acct.id
}

onMounted(() => {
  store.fetchBankAccounts()
  const def = accounts.value.find(a => a.isDefault)
  if (def) selectedDefault.value = def.relatedCode || def.id
})
</script>

<style scoped>
.wa-page {
  padding: 0 .75rem 1.5rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100%;
}
.page-header { display: flex; align-items: center; padding: .75rem 0; gap: .75rem; }
.page-header h2 { flex: 1; font-size: 1.125rem; font-weight: 700; color: var(--ep-color-text-default); }
.back-btn { color: var(--ep-color-text-default); padding: 4px; }

.tab-bar {
  display: flex; gap: .375rem; margin-bottom: .75rem;
  overflow-x: auto; -webkit-overflow-scrolling: touch;
}
.tab-item {
  padding: .5rem 1rem; border-radius: 1.25rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border: 1px solid var(--ep-color-border-default);
  color: var(--ep-color-text-weak); font-size: .8125rem;
  font-weight: 600; white-space: nowrap; transition: all .2s;
}
.tab-item.active {
  background: var(--gradient-primary);
  color: var(--ep-color-text-inverse, #0E1E3D);
  border-color: transparent;
}

.account-list { display: flex; flex-direction: column; gap: .5rem; }
.account-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem; background: var(--ep-color-background-fill-surface-raised-L1);
  border: 1px solid var(--ep-color-border-default);
  border-radius: var(--ep-border-radius-l, .5rem);
  cursor: pointer; transition: all .2s;
}
.account-item.selected {
  border-color: var(--ep-color-border-brand, var(--ep-accent-green, #17C964));
  background: rgba(23,201,100,.05);
}
.acct-left { display: flex; align-items: center; gap: .75rem; }
.acct-icon-wrap {
  width: 2.75rem; height: 2.75rem; border-radius: .5rem;
  background: linear-gradient(135deg, rgba(99,102,241,.15), rgba(139,92,246,.15));
  display: flex; align-items: center; justify-content: center;
  color: var(--ep-color-text-selected);
}
.acct-details { display: flex; flex-direction: column; }
.acct-type { font-size: .875rem; font-weight: 600; color: var(--ep-color-text-default); }
.acct-key { font-size: .75rem; color: var(--ep-color-text-weakest); margin-top: 1px; }
.acct-holder { font-size: .6875rem; color: var(--ep-color-text-weak); margin-top: 1px; }

.acct-right { display: flex; align-items: center; gap: .375rem; }
.radio-default {
  width: 1.125rem; height: 1.125rem;
  accent-color: var(--ep-accent-green, #17C964);
  cursor: pointer;
}
.default-label { font-size: .6875rem; color: var(--ep-color-text-weakest); }

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 3rem 1rem; gap: .75rem;
}
.empty-text { font-size: .875rem; color: var(--ep-color-text-weakest); }

.add-section { padding-top: 1rem; }
.add-account-btn {
  width: 100%; padding: .875rem;
  border-radius: var(--ep-border-radius-l, .5rem);
  background: var(--gradient-primary);
  color: var(--ep-color-text-inverse, #0E1E3D);
  font-size: .9375rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; gap: .5rem;
}
</style>
