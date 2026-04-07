<template>
  <div class="unavailable-page">
    <div class="unavailable-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke-width="2" stroke="#e53e3e"/>
      </svg>
    </div>
    <h2 class="title">{{ t('title') }}</h2>
    <p class="desc">{{ t('desc', { domain: hostname }) }}</p>
    <p class="dns-code">DNS_PROBE_FINISHED_NXDOMAIN</p>
    <div class="actions">
      <button class="reload-btn" @click="reload">{{ t('reload') }}</button>
    </div>
  </div>
</template>

<script setup>
const hostname = window.location.hostname

const translations = {
  'pt-BR': {
    title: 'Domínio Indisponível',
    desc: 'O domínio {domain} não está disponível no momento. Tente novamente mais tarde.',
    reload: 'Tentar novamente'
  },
  en: {
    title: 'Domain Unavailable',
    desc: 'The domain {domain} is currently unavailable. Please try again later.',
    reload: 'Try again'
  }
}

const lang = navigator.language?.startsWith('pt') ? 'pt-BR' : 'en'
const strings = translations[lang] || translations.en

function t(key, params = {}) {
  let str = strings[key] || key
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(`{${k}}`, v)
  }
  return str
}

function reload() { window.location.reload() }
</script>

<style scoped>
.unavailable-page {
  min-height: 100%; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 2.5rem 1.5rem; text-align: center;
  background: var(--ep-color-background-fill-body-default, #0E1E3D);
}

.unavailable-icon { color: var(--ep-color-text-weakest); opacity: .5; margin-bottom: 1.5rem; }

.title {
  font-size: 1.25rem; font-weight: 800;
  color: var(--ep-color-text-default); margin-bottom: .5rem;
}

.desc {
  font-size: .8125rem; color: var(--ep-color-text-weak);
  line-height: 1.6; margin-bottom: .75rem; max-width: 18rem;
}

.dns-code {
  font-size: .6875rem; font-family: monospace;
  color: var(--ep-color-text-weakest); opacity: .6; margin-bottom: 1.5rem;
}

.actions { display: flex; justify-content: center; }

.reload-btn {
  padding: .625rem 2rem; border-radius: var(--ep-border-radius-l, .5rem);
  background: transparent; color: var(--ep-color-text-weak);
  border: 1.5px solid var(--ep-color-border-default);
  font-size: .8125rem; font-weight: 600; transition: all .15s;
}
.reload-btn:active { background: rgba(255,255,255,.05); }
</style>
