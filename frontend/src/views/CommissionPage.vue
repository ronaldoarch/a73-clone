<template>
  <div class="commission-page">
    <h2 class="page-title">Comissão</h2>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">0</span>
        <span class="stat-label">Convites</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">R$ 0,00</span>
        <span class="stat-label">Comissão Total</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">R$ 0,00</span>
        <span class="stat-label">Disponível</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">R$ 0,00</span>
        <span class="stat-label">Já Sacado</span>
      </div>
    </div>

    <div class="invite-card">
      <h3>Convide amigos e ganhe!</h3>
      <p>Compartilhe seu link e ganhe comissão por cada amigo que se cadastrar e depositar.</p>
      <div class="invite-link-box">
        <input readonly :value="inviteLink" class="invite-input" />
        <button class="copy-btn" @click="copyLink">{{ copied ? '✓ Copiado' : 'Copiar' }}</button>
      </div>
    </div>

    <div class="rules-card">
      <h3>Como funciona</h3>
      <div class="rule-item">
        <span class="rule-num">1</span>
        <span>Compartilhe seu link de convite</span>
      </div>
      <div class="rule-item">
        <span class="rule-num">2</span>
        <span>Amigo se cadastra e faz depósito</span>
      </div>
      <div class="rule-item">
        <span class="rule-num">3</span>
        <span>Você recebe comissão automática</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const inviteLink = ref(window.location.origin + '/register?ref=user123')
const copied = ref(false)

function copyLink() {
  navigator.clipboard.writeText(inviteLink.value).then(() => {
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  })
}
</script>

<style scoped>
.commission-page { padding: 16px 12px; }
.page-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.stat-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 16px;
  text-align: center;
}

.stat-value { display: block; font-size: 18px; font-weight: 800; margin-bottom: 4px; }
.stat-label { font-size: 11px; color: var(--text-muted); }

.invite-card {
  background: linear-gradient(135deg, #4c1d95, #7c3aed);
  border-radius: var(--radius-lg);
  padding: 20px 16px;
  margin-bottom: 16px;
}

.invite-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.invite-card p { font-size: 12px; color: rgba(255,255,255,0.75); margin-bottom: 14px; line-height: 1.4; }

.invite-link-box {
  display: flex;
  gap: 8px;
}

.invite-input {
  flex: 1;
  padding: 10px 12px;
  background: rgba(255,255,255,0.15);
  border-radius: var(--radius-sm);
  color: #fff;
  font-size: 12px;
}

.copy-btn {
  padding: 10px 16px;
  background: var(--accent-yellow);
  color: #000;
  font-weight: 700;
  font-size: 13px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.rules-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 18px 16px;
}

.rules-card h3 { font-size: 15px; font-weight: 700; margin-bottom: 14px; }

.rule-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.rule-num {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: var(--purple-500);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
</style>
