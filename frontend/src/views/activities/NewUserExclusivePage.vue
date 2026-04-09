<template>
  <div class="newuser-page">
    <div class="page-header">
      <button type="button" class="back-btn" aria-label="Voltar" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <h2 class="page-title">Exclusivo para Novos Usuários</h2>
    </div>
    <NovosUsuarioRoulettePanel variant="page" />
  </div>
</template>

<script setup>
import NovosUsuarioRoulettePanel from '../../components/NovosUsuarioRoulettePanel.vue'
</script>

<style scoped>
.newuser-page {
  padding: 0 0.75rem 6rem;
  min-height: 100vh;
  background:
    linear-gradient(180deg, rgba(30, 11, 62, 0.75) 0%, rgba(10, 3, 24, 0.92) 100%),
    #2d0a52 url('/assets/roleta-novos/content-bg-CYDrskB_.png') center top / cover no-repeat fixed;
  color: #fff;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  gap: 0.75rem;
}

.page-title {
  flex: 1;
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.back-btn {
  color: #fff;
  padding: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
}
</style>
