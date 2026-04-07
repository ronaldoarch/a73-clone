<template>
  <div class="partner-section" v-if="showAny">
    <div v-if="socialLinks.length" class="partner-block">
      <h4 class="partner-title">Redes Sociais</h4>
      <div class="partner-icons">
        <a
          v-for="link in socialLinks"
          :key="link.name"
          :href="link.url"
          target="_blank"
          class="social-btn"
          :style="{ background: link.color }"
        >
          <span class="social-initial">{{ link.name.charAt(0) }}</span>
        </a>
      </div>
    </div>

    <div v-if="gameProviders.length" class="partner-block">
      <h4 class="partner-title">Provedores de Jogos</h4>
      <div class="partner-logo-grid">
        <div v-for="prov in gameProviders" :key="prov" class="provider-badge">
          {{ prov }}
        </div>
      </div>
    </div>

    <div v-if="paymentMethods.length" class="partner-block">
      <h4 class="partner-title">Métodos de Pagamento</h4>
      <div class="partner-logo-grid">
        <div v-for="pm in paymentMethods" :key="pm" class="payment-badge">
          {{ pm }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  showSocial: { type: Boolean, default: true },
  showProviders: { type: Boolean, default: true },
  showPayments: { type: Boolean, default: true }
})

const socialLinks = computed(() => {
  if (!props.showSocial) return []
  return [
    { name: 'Telegram', url: 'https://t.me/a73support', color: '#0088cc' },
    { name: 'WhatsApp', url: '#', color: '#25D366' },
    { name: 'Instagram', url: '#', color: '#E4405F' },
    { name: 'Facebook', url: '#', color: '#1877F2' }
  ]
})

const gameProviders = computed(() => {
  if (!props.showProviders) return []
  return ['PG Soft', 'Pragmatic', 'Evolution', 'Spribe', 'Hacksaw', 'NetEnt', 'Microgaming', 'Play\'n GO']
})

const paymentMethods = computed(() => {
  if (!props.showPayments) return []
  return ['PIX', 'Boleto', 'TED', 'USDT']
})

const showAny = computed(() => socialLinks.value.length || gameProviders.value.length || paymentMethods.value.length)
</script>

<style scoped>
.partner-section {
  padding: .75rem;
}

.partner-block {
  margin-bottom: 1rem;
}

.partner-title {
  font-size: .6875rem; font-weight: 600;
  color: var(--ep-color-text-weakest);
  text-transform: uppercase; letter-spacing: .5px;
  margin-bottom: .5rem; text-align: center;
}

.partner-icons {
  display: flex; justify-content: center; gap: .625rem;
  flex-wrap: wrap;
}

.social-btn {
  width: 2rem; height: 2rem; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  text-decoration: none; transition: transform .15s;
  box-shadow: 0 2px 6px rgba(0,0,0,.25);
}
.social-btn:active { transform: scale(.9); }
.social-initial { font-size: .75rem; font-weight: 800; color: #fff; }

.partner-logo-grid {
  display: flex; flex-wrap: wrap; justify-content: center; gap: .375rem;
}

.provider-badge, .payment-badge {
  padding: .25rem .5rem; border-radius: .25rem;
  font-size: .5625rem; font-weight: 600;
  color: var(--ep-color-text-weakest);
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.06);
}
</style>
