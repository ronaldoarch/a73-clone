<template>
  <div class="invite-cpf-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Convite com CPF</h2>
      <button class="record-btn" @click="showRecords = true">Registros</button>
    </div>

    <div class="invite-banner">
      <div class="banner-bg"></div>
      <div class="banner-inner">
        <h3>Convide Amigos com CPF</h3>
        <p>Ganhe bônus por cada amigo que vincular o CPF e depositar</p>
      </div>
    </div>

    <div class="available-section">
      <div class="avail-label">Bônus Disponível</div>
      <div class="avail-amount">
        <span class="avail-cy">R$</span>
        <span class="avail-val">{{ availableMoney }}</span>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-val">{{ cpfCount }}</span>
        <span class="stat-lbl">CPFs vinculados</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">{{ inviteCount }}</span>
        <span class="stat-lbl">Convites enviados</span>
      </div>
      <div class="stat-card">
        <span class="stat-val">R$ {{ totalEarned }}</span>
        <span class="stat-lbl">Total ganho</span>
      </div>
    </div>

    <div class="share-section">
      <h3>Compartilhar Link</h3>
      <div class="share-url-box">
        <span class="share-url">{{ shareUrl }}</span>
        <button class="copy-btn" @click="copyLink">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          Copiar
        </button>
      </div>
      <div class="share-buttons">
        <button class="share-btn whatsapp" @click="shareWA">WhatsApp</button>
        <button class="share-btn telegram" @click="shareTG">Telegram</button>
        <button class="share-btn sms" @click="shareSMS">SMS</button>
      </div>
    </div>

    <button
      class="claim-btn"
      :disabled="parseFloat(availableMoney) <= 0"
      @click="claimBonus"
    >
      {{ parseFloat(availableMoney) > 0 ? 'Coletar Bônus' : 'Convide mais amigos' }}
    </button>

    <div class="rules-section">
      <h3>Regras</h3>
      <ul>
        <li>Compartilhe seu link de convite com amigos</li>
        <li>Cada amigo que vincular o CPF gera um bônus</li>
        <li>Bônus adicional quando o amigo fizer o primeiro depósito</li>
        <li>O valor é creditado automaticamente na carteira</li>
        <li>Sem limite de convites</li>
      </ul>
    </div>

    <div v-if="showRecords" class="modal-overlay" @click.self="showRecords = false">
      <div class="records-modal">
        <div class="records-header">
          <h3>Registros de Convite</h3>
          <button class="modal-close" @click="showRecords = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="records-table-header">
          <span>ID</span><span>Data</span><span>Recarga</span><span>Aposta</span>
        </div>
        <div class="records-list" v-if="records.length">
          <div v-for="rec in records" :key="rec.id" class="record-row">
            <span>{{ rec.userId }}</span>
            <span>{{ rec.date }}</span>
            <span>{{ rec.recharge }}</span>
            <span>{{ rec.bet }}</span>
          </div>
        </div>
        <div v-else class="records-empty">Nenhum registro</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const availableMoney = ref('15,00')
const cpfCount = ref(3)
const inviteCount = ref(8)
const totalEarned = ref('45,00')
const shareUrl = ref('https://a73.com/r/user123')
const showRecords = ref(false)

const records = ref([
  { id: 1, userId: '8821', date: '01/04', recharge: 'R$ 50', bet: 'R$ 120' },
  { id: 2, userId: '9934', date: '30/03', recharge: 'R$ 100', bet: 'R$ 280' },
])

function copyLink() {
  navigator.clipboard?.writeText(shareUrl.value)
}
function shareWA() {
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl.value)}`, '_blank')
}
function shareTG() {
  window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl.value)}`, '_blank')
}
function shareSMS() {
  window.open(`sms:?body=${encodeURIComponent(shareUrl.value)}`)
}
function claimBonus() {
  if (parseFloat(availableMoney.value) <= 0) return
  availableMoney.value = '0,00'
}
</script>

<style scoped>
.invite-cpf-page {
  padding: 0 .75rem 6rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100vh;
}
.page-header { display: flex; align-items: center; padding: .75rem 0; gap: .75rem; }
.page-header h2 { flex: 1; font-size: 1.125rem; font-weight: 700; color: var(--ep-color-text-default); }
.back-btn { color: var(--ep-color-text-default); padding: .25rem; background: none; border: none; cursor: pointer; }
.record-btn {
  font-size: .75rem; color: var(--ep-color-text-selected);
  background: none; border: 1px solid var(--ep-color-text-selected);
  border-radius: 1rem; padding: .25rem .75rem; cursor: pointer;
}

.invite-banner { position: relative; border-radius: .75rem; overflow: hidden; margin-bottom: .75rem; }
.banner-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #059669, #22c55e, #4ade80); }
.banner-inner { position: relative; z-index: 1; padding: 1.25rem 1rem; text-align: center; }
.banner-inner h3 { font-size: 1.25rem; font-weight: 800; }
.banner-inner p { font-size: .75rem; color: rgba(255,255,255,.75); margin-top: .25rem; }

.available-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1.25rem; margin-bottom: .75rem;
  text-align: center; border: 1px solid var(--ep-color-border-default);
}
.avail-label { font-size: .75rem; color: var(--ep-color-text-weakest); margin-bottom: .25rem; }
.avail-amount { display: flex; align-items: baseline; justify-content: center; gap: .25rem; }
.avail-cy { font-size: 1rem; font-weight: 600; color: var(--accent-green, #22c55e); }
.avail-val { font-size: 2rem; font-weight: 900; color: var(--accent-green, #22c55e); }

.stats-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: .5rem;
  margin-bottom: .75rem;
}
.stat-card {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .5rem; padding: .75rem .5rem; text-align: center;
  border: 1px solid var(--ep-color-border-default);
}
.stat-val { display: block; font-size: 1rem; font-weight: 800; color: var(--ep-color-text-default); }
.stat-lbl { font-size: .5625rem; color: var(--ep-color-text-weakest); }

.share-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-bottom: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.share-section h3 { font-size: .875rem; font-weight: 700; margin-bottom: .625rem; color: var(--ep-color-text-default); }
.share-url-box {
  display: flex; align-items: center; gap: .5rem;
  padding: .5rem; background: rgba(255,255,255,.03);
  border-radius: .375rem; margin-bottom: .625rem;
}
.share-url { flex: 1; font-size: .6875rem; color: var(--ep-color-text-weakest); word-break: break-all; }
.copy-btn {
  display: flex; align-items: center; gap: .25rem;
  padding: .25rem .5rem; border-radius: .375rem;
  font-size: .6875rem; font-weight: 600;
  background: var(--gradient-primary); color: var(--ep-color-text-inverse, #0E1E3D);
  border: none; cursor: pointer; white-space: nowrap;
}
.share-buttons { display: flex; gap: .375rem; }
.share-btn {
  flex: 1; padding: .5rem; border-radius: .375rem;
  font-size: .75rem; font-weight: 600; color: #fff;
  border: none; cursor: pointer; text-align: center;
}
.share-btn.whatsapp { background: #25D366; }
.share-btn.telegram { background: #0088cc; }
.share-btn.sms { background: #6b7280; }

.claim-btn {
  width: 100%; padding: .875rem; border-radius: .5rem;
  font-size: 1rem; font-weight: 700; border: none; cursor: pointer;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff; transition: all .2s;
}
.claim-btn:active:not(:disabled) { transform: scale(.97); }
.claim-btn:disabled { opacity: .4; cursor: default; }

.rules-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-top: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.rules-section h3 { font-size: .875rem; font-weight: 700; margin-bottom: .625rem; color: var(--ep-color-text-default); }
.rules-section ul { list-style: none; padding: 0; margin: 0; }
.rules-section li {
  font-size: .75rem; color: var(--ep-color-text-weakest);
  padding: .375rem 0 .375rem 1rem; position: relative; line-height: 1.5;
}
.rules-section li::before {
  content: ''; position: absolute; left: 0; top: .625rem;
  width: .25rem; height: .25rem; border-radius: 50%;
  background: var(--accent-green, #22c55e);
}

.modal-overlay {
  position: fixed; inset: 0; z-index: 10000;
  background: rgba(0,0,0,.65);
  display: flex; align-items: center; justify-content: center; padding: 1.5rem;
}
.modal-close {
  position: absolute; top: .75rem; right: .75rem;
  color: var(--ep-color-text-weakest); background: none; border: none; cursor: pointer;
}
.records-modal {
  position: relative; width: 100%; max-width: 22rem;
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: 1rem; max-height: 70vh; overflow: hidden;
  border: 1px solid var(--ep-color-border-default);
  animation: modalIn .3s ease;
  display: flex; flex-direction: column;
}
.records-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; border-bottom: 1px solid var(--ep-color-border-default);
}
.records-header h3 { font-size: 1rem; font-weight: 700; color: var(--ep-color-text-default); }
.records-table-header {
  display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;
  padding: .5rem 1.25rem; font-size: .6875rem; font-weight: 600;
  color: var(--ep-color-text-weakest); background: rgba(255,255,255,.03);
}
.records-list { padding: 0 1.25rem; overflow-y: auto; flex: 1; }
.record-row {
  display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;
  padding: .625rem 0; font-size: .75rem;
  border-bottom: 1px solid rgba(255,255,255,.04);
  color: var(--ep-color-text-default);
}
.records-empty { padding: 2rem; text-align: center; color: var(--ep-color-text-weakest); font-size: .8125rem; }

@keyframes modalIn {
  from { transform: scale(.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
