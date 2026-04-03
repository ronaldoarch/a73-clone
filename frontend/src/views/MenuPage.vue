<template>
  <div class="menu-page">
    <h2 class="page-title">Menu</h2>

    <div class="menu-sections">
      <div class="menu-section">
        <h3 class="section-label">Jogos</h3>
        <div class="menu-grid">
          <div v-for="item in gameMenus" :key="item.label" class="menu-tile" @click="handleClick(item)">
            <span class="tile-icon">{{ item.icon }}</span>
            <span class="tile-label">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <div class="menu-section">
        <h3 class="section-label">Financeiro</h3>
        <div class="menu-grid">
          <div v-for="item in finMenus" :key="item.label" class="menu-tile" @click="handleClick(item)">
            <span class="tile-icon">{{ item.icon }}</span>
            <span class="tile-label">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <div class="menu-section">
        <h3 class="section-label">Conta</h3>
        <div class="menu-grid">
          <div v-for="item in accountMenus" :key="item.label" class="menu-tile" @click="handleClick(item)">
            <span class="tile-icon">{{ item.icon }}</span>
            <span class="tile-label">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <div class="menu-section">
        <h3 class="section-label">Suporte</h3>
        <div class="menu-grid">
          <div v-for="item in supportMenus" :key="item.label" class="menu-tile" @click="handleClick(item)">
            <span class="tile-icon">{{ item.icon }}</span>
            <span class="tile-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const gameMenus = [
  { icon: '🔥', label: 'Populares', path: '/main/inicio' },
  { icon: '⭐', label: 'Favoritos' },
  { icon: '🕒', label: 'Recentes' },
  { icon: '🎰', label: 'Slots' },
  { icon: '🃏', label: 'Ao Vivo' },
  { icon: '🎮', label: 'Todos os Jogos' }
]

const finMenus = [
  { icon: '💰', label: 'Depositar', path: '/main/deposito' },
  { icon: '💸', label: 'Sacar' },
  { icon: '📊', label: 'Transações' },
  { icon: '🎁', label: 'Bônus' }
]

const accountMenus = [
  { icon: '👤', label: 'Perfil', path: '/main/perfil' },
  { icon: '🔒', label: 'Segurança' },
  { icon: '🔔', label: 'Notificações' },
  { icon: '👥', label: 'Indicar Amigos', path: '/main/comissao' }
]

const supportMenus = [
  { icon: '❓', label: 'FAQ' },
  { icon: '💬', label: 'Chat ao Vivo' },
  { icon: '📧', label: 'Email' },
  { icon: '📱', label: 'Telegram' }
]

function handleClick(item) {
  if (item.path) {
    router.push(item.path)
  }
}
</script>

<style scoped>
.menu-page { padding: 16px 12px; background: var(--bg-secondary); min-height: 100%; }
.page-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }

.menu-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.menu-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 8px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
}

.menu-tile:active { opacity: 0.7; transform: scale(0.96); }

.tile-icon { font-size: 24px; }
.tile-label { font-size: 11px; font-weight: 500; color: var(--text-secondary); text-align: center; }
</style>
