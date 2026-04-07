<template>
  <div v-if="visible" class="bonus-pool-wrap" @click="$router.push('/main/promo')">
    <div class="bonus-pool-banner">
      <img class="bp-bg" src="/assets/jackpot/bg.png" alt="Jackpot" />
      <img class="bp-coins" src="/assets/jackpot/coins.png" alt="" />

      <div class="bp-value-bar">
        <span class="bp-arrow">❯</span>
        <span class="bp-amount">
          <span v-for="(ch, i) in displayChars" :key="i"
            class="bp-char" :class="{
              'bp-sep': ch === '.' || ch === ',',
              'bp-num': ch !== '.' && ch !== ','
            }">{{ ch }}</span>
        </span>
        <span class="bp-arrow">❮</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useBonusPool } from '../utils/bonusPool'

const visible = ref(true)
const { money, start, stop } = useBonusPool()

const baseValue = 139522934.76
const poolValue = computed(() => {
  return money.value > 0 ? money.value / 100 : baseValue + Math.random() * 1000
})

const displayAmount = computed(() => {
  return poolValue.value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
})

const displayChars = computed(() => displayAmount.value.split(''))

onMounted(() => { start() })
onBeforeUnmount(() => { stop() })
</script>

<style scoped>
.bonus-pool-wrap {
  margin: .625rem 0;
  cursor: pointer;
}

.bonus-pool-banner {
  position: relative;
  border-radius: .75rem;
  overflow: hidden;
  background: linear-gradient(135deg, #1a0533, #2d1065);
}

.bp-bg {
  width: 100%;
  height: auto;
  display: block;
}

.bp-coins {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  z-index: 2;
  animation: coins-float 3s ease-in-out infinite;
}

.bp-value-bar {
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: .5rem;
  z-index: 3;
  padding: 0;
  white-space: nowrap;
}

.bp-arrow {
  font-size: 1.25rem;
  font-weight: 900;
  color: #FFD700;
  line-height: 1;
  text-shadow: 0 0 10px rgba(255, 215, 0, .6);
}

.bp-amount {
  display: flex;
  align-items: baseline;
}

.bp-char {
  display: inline-block;
  font-weight: 900;
  color: #fff;
  font-family: var(--font-mono, 'Share Tech Mono', monospace);
  text-shadow: 0 2px 10px rgba(0, 0, 0, .7);
}

.bp-num {
  font-size: 2.25rem;
  letter-spacing: 1px;
}

.bp-sep {
  color: rgba(255, 255, 255, .6);
  font-size: 1.5rem;
}

@keyframes coins-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
</style>
