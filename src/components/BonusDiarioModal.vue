<template>
  <Teleport to="body">
    <Transition name="bonus-diario">
      <div v-if="show" class="bonus-diario-overlay" @click.self="close">
        <div class="bonus-diario-modal">
          <!-- Header com logo -->
          <div class="bonus-diario-header">
            <img :src="logoUrl" alt="" class="bonus-diario-logo" @error="e => (e.target.src = '/s5/app-icon/1222508/LOGO.jpg')" />
            <span class="bonus-diario-site">{{ siteName }}</span>
          </div>

          <!-- Mensagem principal -->
          <h2 class="bonus-diario-title">RESGATE CASH DIÁRIO SEM PARAR!</h2>
          <p class="bonus-diario-valor">VALOR MÁXIMO R$888</p>

          <!-- Dias -->
          <div class="bonus-diario-dias">
            <div class="bonus-diario-dia"><span class="dia-label">HOJE</span><span class="dia-code">A73311</span></div>
            <div class="bonus-diario-dia"><span class="dia-label">AMANHÃ</span><span class="dia-code">A73312</span></div>
            <div class="bonus-diario-dia"><span class="dia-label">DEPOIS DE AMANHÃ</span><span class="dia-code">A73313</span></div>
          </div>

          <!-- Cards de bônus -->
          <div class="bonus-diario-cards">
            <div class="bonus-diario-card">
              <ion-icon name="diamond" />
              <span>+R$99 REGISTRO</span>
            </div>
            <div class="bonus-diario-card">
              <ion-icon name="gift" />
              <span>BÔNUS DE REGISTRO +R$50</span>
            </div>
            <div class="bonus-diario-card">
              <ion-icon name="cash" />
              <span>CONVIDE 1 PESSOA E GANHE +R$50</span>
            </div>
            <div class="bonus-diario-card bonus-diario-card-wide">
              <span>TODO DIA É PRESENTE TODO DIA DE BÔNUS! CORRE QUE HOJE TEM!</span>
            </div>
            <div class="bonus-diario-card">
              <ion-icon name="ribbon" />
              <span>RECEBER UM BÔNUS +R$899</span>
            </div>
          </div>

          <!-- CTA -->
          <IonButton expand="block" class="bonus-diario-cta" @click="onCta">
            NÃO PERCA SEU PRÊMIO DIÁRIO!
          </IonButton>

          <!-- Timer -->
          <div class="bonus-diario-timer">{{ countdownFormatted }}</div>

          <!-- Checkbox -->
          <label class="bonus-diario-checkbox">
            <input v-model="semLembretes" type="checkbox" />
            <span>Sem lembretes hoje</span>
          </label>

          <!-- Botão fechar -->
          <button type="button" class="bonus-diario-close" @click="close" aria-label="Fechar">
            <ion-icon name="close" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { IonButton, IonIcon } from '@ionic/vue'
import { useSettings } from '@/composables/useSettings'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'cta'])

const { logoUrl, siteName } = useSettings()
const semLembretes = ref(false)
const countdownSeconds = ref(31 * 60 + 52) // 31:52

const countdownFormatted = computed(() => {
  const s = countdownSeconds.value
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map(v => String(v).padStart(2, '0')).join(':')
})

let countdownInterval = null

watch(() => props.show, (visible) => {
  if (visible) {
    countdownSeconds.value = 31 * 60 + 52
    countdownInterval = setInterval(() => {
      if (countdownSeconds.value > 0) countdownSeconds.value--
      else countdownSeconds.value = 24 * 60
    }, 1000)
  } else {
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
  }
}, { immediate: true })

function close() {
  if (semLembretes.value) {
    const today = new Date().toDateString()
    localStorage.setItem('bonus_diario_sem_lembretes', today)
  }
  emit('close')
}

function onCta() {
  emit('cta')
  close()
}
</script>

<style scoped>
.bonus-diario-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
}
.bonus-diario-modal {
  position: relative;
  max-width: 420px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  background: linear-gradient(180deg, #3d2463 0%, #2a1a4a 50%, #1e1335 100%);
  border-radius: 24px;
  padding: 24px;
  border: 2px solid rgba(236, 72, 153, 0.4);
  box-shadow: 0 0 40px rgba(168, 85, 247, 0.4), inset 0 0 30px rgba(99, 102, 241, 0.1);
}
.bonus-diario-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.bonus-diario-logo {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
}
.bonus-diario-site {
  font-family: var(--font-smooch);
  font-size: 1.5rem;
  font-weight: 800;
  color: #fbbf24;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}
.bonus-diario-title {
  font-family: var(--font-smooch);
  font-size: 1.1rem;
  font-weight: 800;
  color: #fff;
  text-align: center;
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.bonus-diario-valor {
  font-family: var(--font-smooch);
  font-size: 1.4rem;
  font-weight: 800;
  color: #fbbf24;
  text-align: center;
  margin: 0 0 16px;
}
.bonus-diario-dias {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.bonus-diario-dia {
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 10px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.dia-label { display: block; font-size: 0.7rem; color: rgba(255,255,255,0.8); margin-bottom: 4px; }
.dia-code { font-size: 0.85rem; font-weight: 700; color: #fbbf24; }
.bonus-diario-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}
.bonus-diario-card {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.bonus-diario-card ion-icon { font-size: 1.2rem; color: #fbbf24; flex-shrink: 0; }
.bonus-diario-card-wide { grid-column: 1 / -1; }
.bonus-diario-cta {
  --background: linear-gradient(135deg, #ec4899, #a855f7);
  --color: #fff;
  font-family: var(--font-smooch);
  font-weight: 700;
  font-size: 0.95rem;
  text-transform: uppercase;
  margin-bottom: 12px;
  box-shadow: 0 0 20px rgba(236, 72, 153, 0.5);
}
.bonus-diario-timer {
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  color: #fbbf24;
  margin-bottom: 12px;
}
.bonus-diario-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  justify-content: center;
}
.bonus-diario-checkbox input { accent-color: var(--primary); }
.bonus-diario-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.5);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
}
.bonus-diario-close:hover { background: rgba(139, 92, 246, 0.8); }

.bonus-diario-enter-active, .bonus-diario-leave-active { transition: opacity 0.25s ease; }
.bonus-diario-enter-from, .bonus-diario-leave-to { opacity: 0; }
.bonus-diario-enter-active .bonus-diario-modal, .bonus-diario-leave-active .bonus-diario-modal { transition: transform 0.25s ease; }
.bonus-diario-enter-from .bonus-diario-modal, .bonus-diario-leave-to .bonus-diario-modal { transform: scale(0.95); }
</style>
