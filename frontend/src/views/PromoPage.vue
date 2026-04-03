<template>
  <div class="promo-page">
    <h2 class="page-title">Promoções</h2>

    <div class="promo-list">
      <div v-for="promo in promos" :key="promo.id" class="promo-card" :style="{ background: promo.bg }">
        <div class="promo-badge">{{ promo.badge }}</div>
        <h3 class="promo-name">{{ promo.title }}</h3>
        <p class="promo-desc">{{ promo.description }}</p>
        <div class="promo-footer">
          <span class="promo-bonus">{{ promo.bonus }}</span>
          <button class="promo-btn">Participar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const promos = [
  {
    id: 1,
    badge: '🎁 Bônus',
    title: 'Bônus de Primeiro Depósito',
    description: 'Faça seu primeiro depósito e ganhe até R$ 99 em bônus para jogar!',
    bonus: 'Até R$ 99',
    bg: 'linear-gradient(135deg, #4c1d95, #7c3aed)'
  },
  {
    id: 2,
    badge: '🔄 Diário',
    title: 'Check-in Diário',
    description: 'Faça check-in todos os dias e acumule recompensas incríveis!',
    bonus: 'Recompensas diárias',
    bg: 'linear-gradient(135deg, #1e3a5f, #3b82f6)'
  },
  {
    id: 3,
    badge: '🎰 Cashback',
    title: 'Cashback Semanal',
    description: 'Receba até 10% de cashback nas suas apostas da semana.',
    bonus: 'Até 10%',
    bg: 'linear-gradient(135deg, #5b2145, #ec4899)'
  },
  {
    id: 4,
    badge: '👥 Convite',
    title: 'Convide Amigos',
    description: 'Ganhe R$ 5 por cada amigo que se cadastrar e depositar.',
    bonus: 'R$ 5 por convite',
    bg: 'linear-gradient(135deg, #1a4731, #22c55e)'
  },
  {
    id: 5,
    badge: '🏆 VIP',
    title: 'Recompensas VIP',
    description: 'Suba de nível e desbloqueie bônus exclusivos e atendimento prioritário.',
    bonus: 'Exclusivo',
    bg: 'linear-gradient(135deg, #78350f, #f59e0b)'
  }
]
</script>

<style scoped>
.promo-page { padding: 16px 12px; background: var(--bg-secondary); min-height: 100%; }
.page-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }

.promo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.promo-card {
  border-radius: var(--radius-lg);
  padding: 18px 16px;
  position: relative;
  overflow: hidden;
}

.promo-badge {
  display: inline-block;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(4px);
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 8px;
}

.promo-name {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.promo-desc {
  font-size: 12px;
  color: rgba(255,255,255,0.75);
  margin-bottom: 14px;
  line-height: 1.4;
}

.promo-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.promo-bonus {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-yellow);
}

.promo-btn {
  padding: 7px 18px;
  border-radius: var(--radius-md);
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  transition: var(--transition);
}

.promo-btn:active { opacity: 0.7; transform: scale(0.96); }
</style>
