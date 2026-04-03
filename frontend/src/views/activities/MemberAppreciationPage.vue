<template>
  <div class="member-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Agradecimento ao Membro</h2>
    </div>
    <div class="appreciation-banner">
      <h3>🎉 Obrigado por fazer parte!</h3>
      <p>Como membro valioso, você tem acesso a recompensas exclusivas.</p>
    </div>
    <div class="rewards-list">
      <div v-for="reward in rewards" :key="reward.day" class="reward-card" :class="{ claimed: reward.claimed, available: reward.available }">
        <span class="reward-day">Dia {{ reward.day }}</span>
        <span class="reward-amount">{{ reward.amount }}</span>
        <button v-if="reward.available && !reward.claimed" class="claim-btn" @click="claim(reward)">Coletar</button>
        <span v-else-if="reward.claimed" class="claimed-text">✓</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const rewards = ref([
  { day: 1, amount: 'R$ 2', claimed: true, available: true },
  { day: 2, amount: 'R$ 3', claimed: true, available: true },
  { day: 3, amount: 'R$ 5', claimed: false, available: true },
  { day: 5, amount: 'R$ 10', claimed: false, available: false },
  { day: 7, amount: 'R$ 20', claimed: false, available: false },
  { day: 14, amount: 'R$ 50', claimed: false, available: false },
  { day: 30, amount: 'R$ 100', claimed: false, available: false },
])
function claim(reward) { reward.claimed = true; alert(`Coletou ${reward.amount}!`) }
</script>

<style scoped>
.member-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }
.appreciation-banner { background: linear-gradient(135deg, #9333ea, #c084fc); border-radius: var(--radius-lg); padding: 20px 16px; text-align: center; margin-bottom: 16px; }
.appreciation-banner h3 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.appreciation-banner p { font-size: 12px; color: rgba(255,255,255,0.8); }
.rewards-list { display: flex; flex-direction: column; gap: 8px; }
.reward-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: var(--bg-card); border-radius: var(--radius-md); }
.reward-card.available { border-left: 3px solid var(--accent-yellow); }
.reward-card.claimed { opacity: 0.6; }
.reward-day { font-size: 13px; color: var(--text-muted); min-width: 50px; }
.reward-amount { flex: 1; font-size: 16px; font-weight: 700; color: var(--accent-yellow); }
.claim-btn { padding: 6px 16px; border-radius: 20px; background: var(--accent-green); color: #fff; font-size: 12px; font-weight: 700; }
.claimed-text { color: var(--accent-green); font-size: 16px; font-weight: 700; }
</style>
