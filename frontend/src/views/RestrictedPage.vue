<template>
  <div class="restricted-page">
    <div class="restricted-content">
      <div class="restricted-icon-wrap">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke-width="2"/>
        </svg>
      </div>
      <h2>Acesso Restrito</h2>
      <p class="desc">Seu endereço IP não está dentro do escopo dos nossos serviços. Por favor, altere para um IP de outra região.</p>
      <p class="sub-desc">Pedimos desculpas pelo transtorno.</p>

      <div class="action-btns">
        <button class="home-btn" @click="$router.push('/main/inicio')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          </svg>
          Voltar ao Início
        </button>
        <button class="reload-btn" @click="reload">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
          </svg>
          Tentar Novamente
        </button>
      </div>

      <div class="support-section">
        <span class="support-label">Suporte Técnico:</span>
        <a href="https://t.me/a73support" target="_blank" class="support-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.75 3.99-1.74 6.65-2.89 7.97-3.44 3.8-1.58 4.59-1.86 5.1-1.87.11 0 .37.03.54.17.14.12.18.28.2.45-.01.06.01.24 0 .38z"/></svg>
          Telegram
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
function reload() {
  window.location.reload()
}
</script>

<style scoped>
.restricted-page {
  min-height: 100%; display: flex; align-items: center; justify-content: center;
  padding: 2.5rem 1.5rem;
  background: var(--ep-color-background-fill-body-default, #0E1E3D);
}

.restricted-content { text-align: center; max-width: 20rem; }

.restricted-icon-wrap {
  color: var(--ep-color-text-weakest); opacity: .5; margin-bottom: 1.5rem;
  display: flex; justify-content: center;
}

.restricted-content h2 {
  font-size: 1.375rem; font-weight: 800;
  color: var(--ep-color-text-default); margin-bottom: .75rem;
}

.desc {
  font-size: .8125rem; color: var(--ep-color-text-weak);
  line-height: 1.6; margin-bottom: .5rem;
}

.sub-desc {
  font-size: .75rem; color: var(--ep-color-text-weakest);
  margin-bottom: 1.5rem;
}

.action-btns { display: flex; flex-direction: column; gap: .625rem; margin-bottom: 1.5rem; }

.home-btn, .reload-btn {
  display: flex; align-items: center; justify-content: center; gap: .5rem;
  padding: .75rem 1.5rem; border-radius: var(--ep-border-radius-l, .5rem);
  font-size: .8125rem; font-weight: 600;
  transition: all .15s;
}

.home-btn {
  background: var(--gradient-primary, linear-gradient(135deg, #18aaff, #7c3aed));
  color: #fff;
}
.home-btn:active { opacity: .8; transform: scale(0.97); }

.reload-btn {
  background: transparent; color: var(--ep-color-text-weak);
  border: 1.5px solid var(--ep-color-border-default);
}
.reload-btn:active { background: rgba(255,255,255,.05); }

.support-section {
  display: flex; align-items: center; justify-content: center; gap: .5rem;
  padding-top: 1rem; border-top: 1px solid var(--ep-color-border-default);
}

.support-label {
  font-size: .6875rem; color: var(--ep-color-text-weakest);
}

.support-link {
  display: flex; align-items: center; gap: .25rem;
  font-size: .6875rem; font-weight: 600;
  color: #0088cc; text-decoration: none;
}
.support-link:active { opacity: .7; }
</style>
