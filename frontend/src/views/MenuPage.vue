<template>
  <div class="menu-page">
    <h2 class="page-title">Menu</h2>

    <div class="menu-sections">
      <div class="menu-section">
        <h3 class="section-label">Jogos</h3>
        <div class="menu-grid">
          <div v-for="item in gameMenus" :key="item.label" class="menu-tile" @click="handleClick(item)">
            <div class="tile-icon" v-html="item.icon"></div>
            <span class="tile-label">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <div class="menu-section">
        <h3 class="section-label">Financeiro</h3>
        <div class="menu-grid">
          <div v-for="item in finMenus" :key="item.label" class="menu-tile" @click="handleClick(item)">
            <div class="tile-icon" v-html="item.icon"></div>
            <span class="tile-label">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <div class="menu-section">
        <h3 class="section-label">Conta</h3>
        <div class="menu-grid">
          <div v-for="item in accountMenus" :key="item.label" class="menu-tile" @click="handleClick(item)">
            <div class="tile-icon" v-html="item.icon"></div>
            <span class="tile-label">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <div class="menu-section">
        <h3 class="section-label">Suporte</h3>
        <div class="menu-grid">
          <div v-for="item in supportMenus" :key="item.label" class="menu-tile" @click="handleClick(item)">
            <div class="tile-icon" v-html="item.icon"></div>
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

const svg = (d) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${d}</svg>`

const gameMenus = [
  { icon: svg('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/>'), label: 'Populares', path: '/main/inicio' },
  { icon: svg('<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>'), label: 'Favoritos', path: '/game/search/POPULAR' },
  { icon: svg('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'), label: 'Recentes', path: '/game/search/POPULAR' },
  { icon: svg('<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>'), label: 'Slots', path: '/game/category/ELECTRONIC/0' },
  { icon: svg('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>'), label: 'Ao Vivo', path: '/game/category/LIVE/0' },
  { icon: svg('<circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>'), label: 'Todos', path: '/game/search/POPULAR' }
]

const finMenus = [
  { icon: svg('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>'), label: 'Depositar', path: '/main/deposito' },
  { icon: svg('<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>'), label: 'Sacar', path: '/withdraw/apply' },
  { icon: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>'), label: 'Relatórios', path: '/report' },
  { icon: svg('<path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="16" r="2"/>'), label: 'Carteira', path: '/main/perfil' }
]

const accountMenus = [
  { icon: svg('<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>'), label: 'Perfil', path: '/main/perfil' },
  { icon: svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'), label: 'Segurança', path: '/security' },
  { icon: svg('<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>'), label: 'Notificações', path: '/notification' },
  { icon: svg('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>'), label: 'Convidar', path: '/spread' }
]

const supportMenus = [
  { icon: svg('<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5"/>'), label: 'FAQ', path: null },
  { icon: svg('<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>'), label: 'Chat', path: null },
  { icon: svg('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'), label: 'Email', path: null },
  { icon: svg('<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>'), label: 'Download', path: '/download' }
]

function handleClick(item) {
  if (item.path) router.push(item.path)
}
</script>

<style scoped>
.menu-page {
  padding: 1rem .75rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100%;
}
.page-title {
  font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;
  color: var(--ep-color-text-default);
}

.menu-sections { display: flex; flex-direction: column; gap: 1.25rem; }

.section-label {
  font-size: .75rem; font-weight: 600;
  color: var(--ep-color-text-weakest);
  text-transform: uppercase; letter-spacing: .5px;
  margin-bottom: .5rem;
}

.menu-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: .5rem; }

.menu-tile {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: .375rem; padding: .875rem .375rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: var(--ep-border-radius-l, .5rem);
  cursor: pointer; transition: all .2s ease;
  border: 1px solid var(--ep-color-border-default);
}
.menu-tile:active { opacity: 0.7; transform: scale(0.96); }

.tile-icon {
  display: flex; align-items: center; justify-content: center;
  color: var(--ep-color-icon-brand-primary);
}
.tile-label {
  font-size: .625rem; font-weight: 500;
  color: var(--ep-color-text-weak); text-align: center;
}
</style>
