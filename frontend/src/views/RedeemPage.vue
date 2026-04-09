<template>
  <div class="redeem-page">
    <header class="redeem-topbar">
      <button type="button" class="redeem-icon-btn" aria-label="Voltar" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <h1 class="redeem-topbar-title">Código de resgate</h1>
    </header>

    <div class="redeem-banner-wrap">
      <img
        class="redeem-banner"
        src="/first/redeem/banner.png"
        alt="Código de resgate — siga o canal oficial e receba bônus"
        decoding="async"
      />
    </div>

    <div class="redeem-body">
      <input
        v-model="code"
        type="text"
        class="redeem-input"
        maxlength="64"
        autocomplete="off"
        autocapitalize="characters"
        placeholder="Por favor, insira o código de resgate"
        @keyup.enter="handleRedeem"
      />

      <button
        type="button"
        class="redeem-submit"
        :disabled="!code.trim() || loading"
        @click="handleRedeem"
      >
        {{ loading ? 'Aguarde…' : 'Resgatar bônus' }}
      </button>

      <p v-if="message" class="redeem-feedback" :class="{ 'redeem-feedback--ok': isSuccess }">{{ message }}</p>

      <section class="redeem-social" aria-label="Redes oficiais">
        <h2 class="redeem-social-title">Software de rede social multimídia</h2>
        <p class="redeem-social-desc">
          Você pode compartilhar com mais amigos através dos seguintes métodos
        </p>
        <div class="redeem-social-row">
          <a
            v-for="s in socialLinks"
            :key="s.name"
            class="redeem-social-link"
            :href="s.href"
            target="_blank"
            rel="noopener noreferrer"
            :title="s.name"
          >
            <img class="redeem-social-icon" :src="s.icon" :alt="s.name" />
          </a>
        </div>
      </section>

      <section class="redeem-rules">
        <ol class="redeem-rules-list">
          <li>
            O código de resgate é uma atividade de troca de moeda promovida pela plataforma.
          </li>
          <li>
            Siga o canal oficial no Telegram, WhatsApp, Instagram, Facebook e X (Twitter) da A73.COM para
            receber os códigos de resgate.
          </li>
          <li>
            Os códigos de resgate serão divulgados em horários não fixos todos os dias. Outras atividades
            também serão regularmente lançadas em outros horários.
          </li>
          <li>Torne-se um agente da A73.COM e receba códigos de resgate exclusivos.</li>
        </ol>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { toastError } from '../utils/toast'

const authStore = useAuthStore()
const code = ref('')
const loading = ref(false)
const message = ref('')
const isSuccess = ref(false)

const socialLinks = [
  { name: 'Facebook', href: 'https://www.facebook.com/', icon: '/first/redeem/social-facebook.png' },
  { name: 'Telegram', href: 'https://t.me/', icon: '/first/redeem/social-telegram.png' },
  { name: 'WhatsApp', href: 'https://wa.me/', icon: '/first/redeem/social-whatsapp.png' },
  { name: 'Instagram', href: 'https://www.instagram.com/', icon: '/first/redeem/social-instagram.png' },
  { name: 'X', href: 'https://x.com/', icon: '/first/redeem/social-x.png' }
]

async function handleRedeem() {
  const c = code.value.trim()
  if (!c || loading.value) return
  if (!authStore.token) {
    message.value = 'Faça login para resgatar o código.'
    isSuccess.value = false
    toastError('Faça login para resgatar.')
    return
  }
  loading.value = true
  message.value = ''
  try {
    const res = await fetch('/api/coupon/redeem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authStore.token
      },
      body: JSON.stringify({ code: c })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.ok) {
      const msg = data.error || data.message || 'Código inválido ou expirado.'
      message.value = msg
      isSuccess.value = false
      toastError(msg)
      return
    }
    message.value = data.message || 'Código resgatado com sucesso!'
    isSuccess.value = true
    code.value = ''
  } catch (e) {
    const msg = e?.message || 'Erro de rede. Tente novamente.'
    message.value = msg
    isSuccess.value = false
    toastError(msg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.redeem-page {
  min-height: 100vh;
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
  background: #1a0f2e;
  color: #fff;
}

.redeem-topbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem;
  background: linear-gradient(180deg, #4a1f7a 0%, #321056 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.redeem-topbar-title {
  flex: 1;
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-align: center;
  color: #fff;
}

.redeem-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.35rem;
  height: 2.35rem;
  padding: 0;
  border: none;
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.25);
  color: #fde047;
  cursor: pointer;
}

.redeem-icon-btn:active {
  transform: scale(0.96);
}

.redeem-banner-wrap {
  margin: 0;
  padding: 0;
  background: #12081f;
  line-height: 0;
}

.redeem-banner {
  display: block;
  width: 100%;
  height: auto;
  vertical-align: top;
}

.redeem-body {
  padding: 1rem 0.85rem 1.25rem;
  max-width: 28rem;
  margin: 0 auto;
}

.redeem-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.85rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(192, 168, 255, 0.45);
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.redeem-input::placeholder {
  color: rgba(255, 255, 255, 0.38);
  font-weight: 500;
}

.redeem-input:focus {
  outline: none;
  border-color: #c4b5fd;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.25);
}

.redeem-submit {
  width: 100%;
  padding: 0.95rem 1rem;
  border: none;
  border-radius: 0.55rem;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: #1a1e12;
  background: linear-gradient(180deg, #d4ff3f 0%, #a3e635 45%, #84cc16 100%);
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.12s, filter 0.2s;
}

.redeem-submit:hover:not(:disabled) {
  filter: brightness(1.05);
}

.redeem-submit:active:not(:disabled) {
  transform: scale(0.99);
}

.redeem-submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: grayscale(0.2);
}

.redeem-feedback {
  margin: 0.85rem 0 0;
  font-size: 0.78rem;
  font-weight: 700;
  text-align: center;
  color: #fca5a5;
}

.redeem-feedback--ok {
  color: #86efac;
}

.redeem-social {
  margin-top: 1.75rem;
  text-align: center;
}

.redeem-social-title {
  margin: 0 0 0.35rem;
  font-size: 0.82rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.92);
}

.redeem-social-desc {
  margin: 0 0 1rem;
  font-size: 0.68rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.5);
  padding: 0 0.25rem;
}

.redeem-social-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.redeem-social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.1rem;
  height: 3.1rem;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
  transition: transform 0.15s;
}

.redeem-social-link:active {
  transform: scale(0.95);
}

.redeem-social-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.redeem-rules {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.redeem-rules-list {
  margin: 0;
  padding-left: 1.15rem;
  font-size: 0.65rem;
  line-height: 1.6;
  color: rgba(196, 181, 253, 0.88);
}

.redeem-rules-list li {
  margin-bottom: 0.55rem;
}

.redeem-rules-list li:last-child {
  margin-bottom: 0;
}
</style>
