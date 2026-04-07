<template>
  <Teleport to="body">
    <Transition name="packet-fade">
      <div v-if="visible" class="packet-overlay" @click.self="closeModal">
        <div class="packet-container">
          <div class="packet-top">
            <div class="packet-glow"></div>
            <div class="packet-title">{{ activityName || 'Pacote de Bônus' }}</div>
            <button class="packet-close" @click="closeModal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="packet-body">
            <div class="packet-amount-area">
              <div v-if="rewardAmount" class="packet-reward">
                <span class="packet-currency">R$</span>
                <span class="packet-amount">{{ formatAmount(rewardAmount) }}</span>
              </div>
              <div v-else class="packet-mystery">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
            </div>

            <div class="packet-info">
              <p class="packet-desc">
                {{ maxTimes > 0 ? `${maxTimes}x por dia • Máx R$ ${formatAmount(maxAmount)}` : '' }}
              </p>
            </div>

            <div v-if="timeSlots.length" class="packet-times">
              <div
                v-for="(slot, idx) in timeSlots"
                :key="idx"
                class="time-slot"
                :class="{ passed: slot.passed, current: slot.current }"
              >
                {{ slot.label }}
              </div>
            </div>

            <button
              class="packet-claim-btn"
              :class="{ disabled: !canClaim, shiny: canClaim }"
              :disabled="!canClaim"
              @click="handleClaim"
            >
              {{ claimText }}
            </button>

            <div class="packet-rules">
              <p v-for="(rule, i) in rules" :key="i">{{ rule }}</p>
            </div>
          </div>

          <div class="packet-bottom-decor"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

const props = defineProps({
  activityId: { type: [String, Number], default: '' },
  activityName: { type: String, default: '' },
  maxAmount: { type: Number, default: 0 },
  maxTimes: { type: Number, default: 0 },
  timeConfig: { type: Array, default: () => [] },
  canReceive: { type: Boolean, default: true }
})

const emit = defineEmits(['close', 'claim'])

const visible = ref(false)
const rewardAmount = ref(null)
const countdown = ref('')
const isInTimeWindow = ref(false)
let countdownTimer = null

const canClaim = computed(() => isInTimeWindow.value && props.canReceive && !rewardAmount.value)

const claimText = computed(() => {
  if (rewardAmount.value) return 'Já Coletado'
  if (!isInTimeWindow.value && countdown.value) return `Aguarde ${countdown.value}`
  if (!isInTimeWindow.value) return 'Fora do Horário'
  return 'Coletar'
})

const timeSlots = computed(() => {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMin = now.getMinutes()

  return props.timeConfig.map(tc => {
    const h = tc.hour ?? 0
    const dur = tc.durationIn ?? 0
    const endH = h + Math.floor(dur / 60)
    const endM = dur % 60
    const label = `${String(h).padStart(2, '0')}:00-${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
    const passed = currentHour > endH || (currentHour === endH && currentMin >= endM)
    const current = currentHour >= h && (currentHour < endH || (currentHour === endH && currentMin < endM))
    return { label, passed, current }
  }).sort((a, b) => a.label.localeCompare(b.label))
})

const rules = computed(() => {
  const r = []
  if (props.maxTimes) r.push(`Pode ser coletado ${props.maxTimes}x por dia`)
  if (props.maxAmount) r.push(`Máximo de R$ ${formatAmount(props.maxAmount)} por vez`)
  r.push('O bônus estará disponível durante os horários indicados')
  return r
})

function formatAmount(val) {
  return Number(val / 100 || val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function show() {
  visible.value = true
  checkTimeWindow()
}

function closeModal() {
  visible.value = false
  emit('close')
  clearInterval(countdownTimer)
}

function handleClaim() {
  if (!canClaim.value) return
  emit('claim', props.activityId)
}

function checkTimeWindow() {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()

  const active = props.timeConfig.find(tc => {
    const start = tc.hour ?? 0
    const dur = tc.durationIn ?? 0
    const endTotal = start * 60 + dur
    const currentTotal = h * 60 + m
    return currentTotal >= start * 60 && currentTotal < endTotal
  })

  isInTimeWindow.value = !!active

  if (!active) {
    startCountdown()
  }
}

function startCountdown() {
  clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    const now = new Date()
    const nextSlot = props.timeConfig.find(tc => {
      const start = (tc.hour ?? 0) * 60
      const current = now.getHours() * 60 + now.getMinutes()
      return current < start
    })
    if (nextSlot) {
      const targetMin = (nextSlot.hour ?? 0) * 60
      const currentMin = now.getHours() * 60 + now.getMinutes()
      const diff = (targetMin - currentMin) * 60 - now.getSeconds()
      if (diff <= 0) {
        isInTimeWindow.value = true
        clearInterval(countdownTimer)
        countdown.value = ''
        return
      }
      const hh = Math.floor(diff / 3600)
      const mm = Math.floor((diff % 3600) / 60)
      const ss = diff % 60
      countdown.value = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
    } else {
      countdown.value = ''
      clearInterval(countdownTimer)
    }
  }, 1000)
}

onBeforeUnmount(() => clearInterval(countdownTimer))

defineExpose({ show, closeModal })
</script>

<style scoped>
.packet-overlay {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(0,0,0,.7); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
}

.packet-container {
  width: 100%; max-width: 20rem;
  background: linear-gradient(180deg, #b91c1c 0%, #991b1b 40%, #1a0505 100%);
  border-radius: 1rem; position: relative; overflow: hidden;
  box-shadow: 0 16px 48px rgba(185,28,28,.4), inset 0 1px 0 rgba(255,255,255,.15);
}

.packet-top {
  position: relative; padding: 1.25rem 1rem .75rem; text-align: center;
}

.packet-glow {
  position: absolute; top: -2rem; left: 50%; transform: translateX(-50%);
  width: 8rem; height: 8rem; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,215,0,.3) 0%, transparent 70%);
  pointer-events: none;
}

.packet-title {
  font-size: 1.125rem; font-weight: 800; color: #fbbf24;
  text-shadow: 0 2px 4px rgba(0,0,0,.3);
  position: relative; z-index: 1;
}

.packet-close {
  position: absolute; top: .75rem; right: .75rem;
  width: 1.75rem; height: 1.75rem; border-radius: 50%;
  background: rgba(0,0,0,.3); color: rgba(255,255,255,.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 2;
}

.packet-body { padding: 0 1rem 1.25rem; }

.packet-amount-area {
  display: flex; justify-content: center; align-items: center;
  padding: 1rem 0; min-height: 5rem;
}

.packet-reward { text-align: center; }
.packet-currency {
  font-size: .875rem; font-weight: 600; color: #fbbf24; vertical-align: top;
}
.packet-amount {
  font-size: 2rem; font-weight: 800; color: #fbbf24;
  text-shadow: 0 2px 8px rgba(0,0,0,.3);
}

.packet-mystery { color: #fbbf24; opacity: .6; }

.packet-info { text-align: center; margin-bottom: .75rem; }
.packet-desc { font-size: .6875rem; color: rgba(255,255,255,.5); }

.packet-times {
  display: flex; flex-wrap: wrap; gap: .375rem; justify-content: center;
  margin-bottom: 1rem; max-height: 3.5rem; overflow-y: auto;
}
.time-slot {
  padding: .25rem .5rem; border-radius: .25rem;
  font-size: .625rem; font-weight: 600;
  background: rgba(255,255,255,.08); color: #fbbf24;
}
.time-slot.passed { color: rgba(255,255,255,.25); }
.time-slot.current {
  background: rgba(251,191,36,.2);
  border: 1px solid rgba(251,191,36,.4);
}

.packet-claim-btn {
  width: 100%; padding: .75rem; border-radius: .5rem;
  font-size: .9375rem; font-weight: 800; text-transform: uppercase;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #78350f; transition: all .2s; margin-bottom: .75rem;
}
.packet-claim-btn.shiny {
  animation: packet-glow-btn 2s ease-in-out infinite;
}
.packet-claim-btn.disabled {
  background: rgba(255,255,255,.1); color: rgba(255,255,255,.3);
  cursor: not-allowed;
}

.packet-rules {
  font-size: .5625rem; color: rgba(255,255,255,.35); line-height: 1.5;
}
.packet-rules p { margin-bottom: .125rem; }
.packet-rules p::before { content: '• '; }

.packet-bottom-decor {
  height: 2.5rem;
  background: linear-gradient(180deg, transparent, rgba(0,0,0,.3));
}

@keyframes packet-glow-btn {
  0%, 100% { box-shadow: 0 0 10px rgba(251,191,36,.3); }
  50% { box-shadow: 0 0 20px rgba(251,191,36,.6); }
}

.packet-fade-enter-active, .packet-fade-leave-active {
  transition: opacity .3s ease;
}
.packet-fade-enter-active .packet-container, .packet-fade-leave-active .packet-container {
  transition: transform .3s ease;
}
.packet-fade-enter-from, .packet-fade-leave-to { opacity: 0; }
.packet-fade-enter-from .packet-container { transform: scale(.85) translateY(30px); }
.packet-fade-leave-to .packet-container { transform: scale(.95); }
</style>
