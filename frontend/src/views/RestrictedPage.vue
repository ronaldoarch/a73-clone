<template>
  <div class="restricted-page">
    <div class="restricted-content">
      <div class="restricted-icon">🚫</div>
      <h2>Acesso Restrito</h2>
      <p>Esta página não está disponível na sua região ou o acesso foi restringido.</p>
      <button class="home-btn" @click="$router.push('/main/inicio')">Voltar ao Início</button>
    </div>
  </div>
</template>

<style scoped>
.restricted-page { min-height: 100%; display: flex; align-items: center; justify-content: center; padding: 40px 20px; background: var(--bg-secondary); }
.restricted-content { text-align: center; }
.restricted-icon { font-size: 64px; margin-bottom: 16px; }
.restricted-content h2 { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
.restricted-content p { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; line-height: 1.5; }
.home-btn { padding: 12px 32px; border-radius: var(--radius-md); background: var(--purple-500); color: #fff; font-size: 15px; font-weight: 700; }
</style>
