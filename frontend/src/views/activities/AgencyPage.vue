<template>
  <div class="activity-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
      <h2>Agência</h2>
    </div>
    <div class="act-banner" style="background:linear-gradient(135deg,#7c3aed,#a855f7)">
      <h3>🏢 Torne-se um Agente!</h3>
      <p>Ganhe comissões convencendo amigos a jogar no A73.</p>
    </div>
    <div class="agency-benefits">
      <div class="benefit" v-for="b in benefits" :key="b.title">
        <span class="b-icon">{{ b.icon }}</span>
        <div><h4>{{ b.title }}</h4><p>{{ b.desc }}</p></div>
      </div>
    </div>
    <button class="action-btn" @click="$router.push('/spread')">Começar Agora</button>
  </div>
</template>
<script setup>
const benefits = [
  { icon: '💰', title: 'Comissão Vitalícia', desc: 'Receba comissão enquanto seus convidados jogarem' },
  { icon: '📈', title: 'Sem Limite', desc: 'Convide quantas pessoas quiser' },
  { icon: '🏆', title: 'Níveis de Agente', desc: 'Suba de nível e ganhe taxas melhores' },
]
</script>
<style scoped>
.activity-page { padding: 0 12px 24px; background: var(--bg-secondary); min-height: 100%; }
.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; }
.back-btn { color: var(--text-primary); padding: 4px; }
.act-banner { border-radius: var(--radius-lg); padding: 20px 16px; margin-bottom: 16px; text-align: center; }
.act-banner h3 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.act-banner p { font-size: 12px; color: rgba(255,255,255,0.8); }
.agency-benefits { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.benefit { display: flex; align-items: flex-start; gap: 12px; padding: 14px; background: var(--bg-card); border-radius: var(--radius-md); }
.b-icon { font-size: 28px; flex-shrink: 0; }
.benefit h4 { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
.benefit p { font-size: 12px; color: var(--text-muted); }
.action-btn { width: 100%; padding: 14px; border-radius: var(--radius-md); background: linear-gradient(135deg, #a855f7, #7c3aed); color: #fff; font-size: 16px; font-weight: 700; }
</style>
