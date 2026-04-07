<template>
  <Transition name="mine-pop">
    <div v-if="visible" class="mine-widget" @click="goToMine">
      <button class="mine-close" @click.stop="dismiss" aria-label="Fechar">×</button>
      <div class="mine-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6.4 4.8 2.4-7.2-6-4.8h7.6z" fill="#FFE44D" stroke="#D4960A" stroke-width=".5"/>
        </svg>
      </div>
      <div class="mine-label">Mina<br/>Misteriosa</div>
      <div class="mine-timer">{{ formattedTime }}</div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const visible = ref(false)
const countdown = ref(0)
let timer = null

function resetCountdown() {
  countdown.value = 3600 + Math.floor(Math.random() * 7200)
}

const formattedTime = computed(() => {
  const h = Math.floor(countdown.value / 3600)
  const m = Math.floor((countdown.value % 3600) / 60)
  const s = countdown.value % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

function goToMine() {
  router.push('/activity/mine')
}

function dismiss() {
  visible.value = false
  sessionStorage.setItem('mine_dismissed', '1')
}

onMounted(() => {
  if (sessionStorage.getItem('mine_dismissed')) return
  resetCountdown()
  visible.value = true
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      resetCountdown()
    }
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.mine-widget {
  position: fixed;
  right: .5rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 9997;
  width: 3.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .125rem;
  background: linear-gradient(180deg, #4C1D95 0%, #2D1B69 100%);
  border: 1.5px solid rgba(255, 228, 77, .3);
  border-radius: .75rem;
  padding: .625rem .25rem .5rem;
  box-shadow: 0 4px 20px rgba(76, 29, 149, .5), 0 0 12px rgba(255, 228, 77, .15);
  cursor: pointer;
  transition: transform .2s ease;
}
.mine-widget:active {
  transform: translateY(-50%) scale(.95);
}

.mine-close {
  position: absolute;
  top: -.375rem;
  right: -.375rem;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, .6);
  color: rgba(255, 255, 255, .7);
  font-size: .75rem;
  line-height: 1;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.mine-icon {
  animation: mine-pulse 2s ease-in-out infinite;
}

.mine-label {
  font-size: .5rem;
  font-weight: 700;
  color: #FFE44D;
  text-align: center;
  line-height: 1.2;
  letter-spacing: .3px;
}

.mine-timer {
  font-size: .5625rem;
  font-weight: 700;
  color: #fff;
  background: rgba(0, 0, 0, .3);
  border-radius: .25rem;
  padding: .125rem .25rem;
  font-family: 'Share Tech', monospace;
  letter-spacing: .5px;
}

@keyframes mine-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.mine-pop-enter-active { transition: all .4s cubic-bezier(.34, 1.56, .64, 1); }
.mine-pop-leave-active { transition: all .2s ease-in; }
.mine-pop-enter-from { transform: translateY(-50%) translateX(100%); opacity: 0; }
.mine-pop-leave-to { transform: translateY(-50%) translateX(100%); opacity: 0; }
</style>
