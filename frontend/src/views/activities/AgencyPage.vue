<template>
  <div class="agency-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>{{ activityName }}</h2>
      <button class="details-btn" @click="showDetails = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
      </button>
    </div>

    <div class="share-section">
      <h3>Convide Amigos</h3>
      <div class="share-icons">
        <button v-for="media in shareMedia" :key="media.type" class="media-btn" :class="media.type" @click="shareHandle(media.type)">
          <span class="media-icon">{{ media.icon }}</span>
          <span class="media-label">{{ media.label }}</span>
        </button>
      </div>

      <div class="share-url-area">
        <span class="url-label">Link de Convite</span>
        <div class="url-row">
          <span class="url-text">{{ shareUrl }}</span>
          <button class="copy-btn" @click="copyLink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          </button>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat">
          <span class="stat-val">{{ activityInfo.subordinate }}</span>
          <span class="stat-label">Convidados</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-val highlight">{{ activityInfo.validCount }}</span>
          <span class="stat-label">Válidos</span>
        </div>
      </div>
    </div>

    <div class="rewards-section">
      <div class="section-header">
        <span class="deco-icon">🎁</span>
        <h3>Recompensas por Convite</h3>
        <span class="deco-icon flip">🎁</span>
      </div>

      <div class="rewards-grid" :class="{ 'receive-mode': rewardShowMode === 'RECEIVE' }">
        <template v-if="rewardShowMode === 'RECEIVE'">
          <div v-for="item in rewardList" :key="item.uuid" class="receive-item">
            <div class="receive-condition">
              <p class="receive-count">≥{{ item.userCount }}</p>
              <span>convites válidos</span>
            </div>
            <div class="receive-amount" :class="{ opened: item.isOpen }">
              <p :class="{ light: item.isMeet }">{{ item.rewardAmount.includes('~') ? item.rewardAmount : '+' + item.rewardAmount }}</p>
              <span>bônus</span>
            </div>
            <div class="receive-action">
              <button
                class="receive-btn"
                :class="{ light: item.isMeet, opened: item.isOpen }"
                :disabled="item.isOpen || (!item.isMeet)"
                @click="openBoxHandle(item)"
              >
                {{ item.isOpen ? 'Recebido' : 'Receber' }}
              </button>
            </div>
          </div>
        </template>

        <template v-else>
          <div v-for="item in rewardList" :key="item.uuid" class="box-item" @click="openBoxHandle(item)">
            <div
              class="box-visual"
              :class="{
                light: item.isMeet,
                animate: item.showOpenAni,
                opened: item.isOpen,
                opening: item.opening
              }"
            >
              <span v-if="item.showOpenAni" class="box-emoji animate-open">
                {{ rewardShowMode === 'RED_PACKET' ? '🧧' : '🎁' }}
              </span>
              <span v-else-if="item.isOpen" class="box-emoji opened">
                {{ rewardShowMode === 'RED_PACKET' ? '🧧' : '🎉' }}
              </span>
              <span v-else class="box-emoji" :class="{ glow: item.isMeet }">
                {{ rewardShowMode === 'RED_PACKET' ? '🧧' : '🎁' }}
              </span>
            </div>
            <div class="box-amount" :class="{ light: item.isMeet, opened: item.isOpen }">
              <template v-if="item.rewardAmount.includes('~')">
                <span class="range-val">{{ item.rewardAmount.split('~')[0] }}</span>
                <span class="range-sep">~</span>
                <span class="range-val">{{ item.rewardAmount.split('~')[1] }}</span>
              </template>
              <span v-else>{{ item.rewardAmount }}</span>
            </div>
            <div class="box-condition">
              <span>Convide <strong>{{ item.userCount }}</strong> amigos</span>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div v-if="showValidCondition" class="conditions-section">
      <h3>Condições de Validação</h3>
      <p class="cond-desc">
        Para que um convite seja considerado válido, o convidado deve atender
        <strong v-if="conditionType === 'ALL'">todas</strong>
        <strong v-else>pelo menos uma</strong>
        das seguintes condições:
      </p>
      <div class="cond-list">
        <div v-for="cond in validConditions" :key="cond.key" class="cond-item">
          <span class="cond-label">{{ cond.label }}</span>
          <span class="cond-value">≥ {{ cond.value }}</span>
        </div>
      </div>
    </div>

    <div v-if="activityDescription" class="rules-section">
      <div class="rules-header">
        <span class="deco-line"></span>
        <h3>Regras</h3>
        <span class="deco-line"></span>
      </div>
      <p class="rules-text">{{ activityDescription }}</p>
    </div>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showDetails" class="modal-overlay" @click.self="showDetails = false">
          <div class="details-modal">
            <button class="modal-close" @click="showDetails = false">✕</button>
            <h3>Detalhes dos Convites</h3>
            <div v-if="detailRecords.length" class="detail-list">
              <div class="detail-header">
                <span>Usuário</span><span>Data</span><span>Status</span>
              </div>
              <div v-for="rec in detailRecords" :key="rec.id" class="detail-row">
                <span>{{ rec.user }}</span>
                <span class="detail-date">{{ rec.date }}</span>
                <span :class="['detail-status', rec.valid ? 'valid' : 'invalid']">
                  {{ rec.valid ? 'Válido' : 'Pendente' }}
                </span>
              </div>
            </div>
            <div v-else class="empty-details">Nenhum convite registrado</div>
          </div>
        </div>
      </Transition>

      <Transition name="modal-fade">
        <div v-if="showPrizeModal" class="modal-overlay" @click.self="showPrizeModal = false">
          <div class="prize-modal">
            <button class="modal-close" @click="showPrizeModal = false">✕</button>
            <div class="prize-celebration">
              <span class="prize-icon-big">🎉</span>
              <h3>Parabéns!</h3>
              <p class="prize-amount-big">{{ merchantCy }} {{ lastPrizeAmount }}</p>
              <p class="prize-desc">Bônus creditado na sua conta</p>
            </div>
            <button class="prize-confirm" @click="showPrizeModal = false">Confirmar</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activityName = ref('Convide e Ganhe')
const merchantCy = ref('R$')
const shareUrl = ref('https://a73.com/r/ABC123XYZ')
const showDetails = ref(false)
const showPrizeModal = ref(false)
const lastPrizeAmount = ref('0')
const rewardShowMode = ref('BOX')
const conditionType = ref('ALL')
const activityDescription = ref('Convide amigos para se registrarem e completarem as condições de validação. Cada amigo válido desbloqueia recompensas. Os bônus são creditados automaticamente.')

const activityInfo = ref({
  subordinate: 12,
  validCount: 8,
  rewardAmount: 350,
})

const shareMedia = [
  { type: 'whatsapp', icon: '📱', label: 'WhatsApp' },
  { type: 'telegram', icon: '✈️', label: 'Telegram' },
  { type: 'facebook', icon: '👤', label: 'Facebook' },
  { type: 'copy', icon: '📋', label: 'Copiar' },
]

const rewardList = ref([
  { uuid: '1', userCount: 3, rewardAmount: '10', isMeet: true, isOpen: true, showOpenAni: false, opening: false },
  { uuid: '2', userCount: 5, rewardAmount: '25', isMeet: true, isOpen: false, showOpenAni: false, opening: false },
  { uuid: '3', userCount: 10, rewardAmount: '50~100', isMeet: false, isOpen: false, showOpenAni: false, opening: false },
  { uuid: '4', userCount: 20, rewardAmount: '150', isMeet: false, isOpen: false, showOpenAni: false, opening: false },
  { uuid: '5', userCount: 50, rewardAmount: '300~500', isMeet: false, isOpen: false, showOpenAni: false, opening: false },
  { uuid: '6', userCount: 100, rewardAmount: '1000', isMeet: false, isOpen: false, showOpenAni: false, opening: false },
])

const showValidCondition = ref(true)

const validConditions = ref([
  { key: 'firstRecharge', label: '1ª Recarga', value: 'R$ 30' },
  { key: 'rechargeAmount', label: 'Recarga Total', value: 'R$ 100' },
  { key: 'validBet', label: 'Aposta Válida', value: 'R$ 200' },
])

const detailRecords = ref([
  { id: 1, user: 'U***7', date: '2026-04-01', valid: true },
  { id: 2, user: 'J***3', date: '2026-03-30', valid: true },
  { id: 3, user: 'M***9', date: '2026-03-28', valid: false },
  { id: 4, user: 'A***1', date: '2026-03-25', valid: true },
])

async function openBoxHandle(item) {
  if (item.isOpen || !item.isMeet || item.showOpenAni || item.opening) return
  item.opening = true
  item.showOpenAni = true

  await new Promise(r => setTimeout(r, 1500))

  const amount = item.rewardAmount.includes('~')
    ? Math.floor(Math.random() * (parseInt(item.rewardAmount.split('~')[1]) - parseInt(item.rewardAmount.split('~')[0])) + parseInt(item.rewardAmount.split('~')[0]))
    : parseInt(item.rewardAmount)

  item.isOpen = true
  item.showOpenAni = false
  item.opening = false
  item.rewardAmount = String(amount)
  lastPrizeAmount.value = amount.toLocaleString('pt-BR')
  showPrizeModal.value = true
}

function shareHandle(type) {
  const text = encodeURIComponent(`Junte-se a nós! ${shareUrl.value}`)
  const urls = {
    whatsapp: `https://api.whatsapp.com/send?text=${text}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl.value)}&text=${text}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`,
    copy: null,
  }
  if (type === 'copy') {
    copyLink()
    return
  }
  window.open(urls[type], '_blank')
}

function copyLink() {
  navigator.clipboard?.writeText(shareUrl.value)
}
</script>

<style scoped>
.agency-page {
  padding: 0 12px 24px;
  background: linear-gradient(180deg, #1a0a33 0%, #0f172a 40%);
  min-height: 100vh;
}

.page-header { display: flex; align-items: center; padding: 12px 0; gap: 12px; }
.page-header h2 { flex: 1; font-size: 18px; font-weight: 700; color: #fff; }
.back-btn, .details-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(255,255,255,0.08); color: #fff; border: none; cursor: pointer;
}

.share-section {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  border-radius: 16px; padding: 20px 16px; margin-bottom: 16px;
}
.share-section h3 { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 14px; text-align: center; }

.share-icons { display: flex; gap: 8px; justify-content: center; margin-bottom: 16px; }
.media-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 10px 14px; border-radius: 12px; background: rgba(255,255,255,0.15);
  border: none; cursor: pointer; transition: transform 0.15s; min-width: 64px;
}
.media-btn:active { transform: scale(0.95); }
.media-icon { font-size: 22px; }
.media-label { font-size: 10px; color: rgba(255,255,255,0.9); font-weight: 600; }

.share-url-area { margin-bottom: 14px; }
.url-label { font-size: 11px; color: rgba(255,255,255,0.6); margin-bottom: 4px; display: block; }
.url-row {
  display: flex; align-items: center; gap: 8px;
  background: rgba(0,0,0,0.2); border-radius: 10px; padding: 8px 12px;
}
.url-text { flex: 1; font-size: 11px; color: rgba(255,255,255,0.7); word-break: break-all; }
.copy-btn {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(255,255,255,0.15); color: #fff; border: none; cursor: pointer;
}

.stats-row {
  display: flex; align-items: center; justify-content: center; gap: 20px;
}
.stat { text-align: center; }
.stat-val { display: block; font-size: 22px; font-weight: 900; color: #fff; }
.stat-val.highlight { color: #fbbf24; }
.stat-label { font-size: 11px; color: rgba(255,255,255,0.6); }
.stat-divider { width: 1px; height: 30px; background: rgba(255,255,255,0.2); }

.rewards-section { margin-bottom: 16px; }
.section-header {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  margin-bottom: 14px;
}
.section-header h3 { font-size: 16px; font-weight: 700; color: #fff; }
.deco-icon { font-size: 18px; }
.deco-icon.flip { transform: scaleX(-1); }

.rewards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.rewards-grid.receive-mode { grid-template-columns: 1fr; }

.box-item {
  background: rgba(255,255,255,0.04); border-radius: 12px;
  padding: 14px 6px; text-align: center; cursor: pointer;
  transition: transform 0.2s; border: 1px solid transparent;
}
.box-item:active { transform: scale(0.95); }
.box-visual { margin-bottom: 6px; }
.box-visual.light .box-emoji { filter: none; }
.box-visual .box-emoji { font-size: 36px; filter: grayscale(0.6) brightness(0.6); display: block; }
.box-visual .box-emoji.glow { filter: none; animation: box-glow 2s ease-in-out infinite; }
.box-visual .box-emoji.opened { filter: none; }
.box-visual .box-emoji.animate-open { animation: open-bounce 0.5s ease; }
@keyframes box-glow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); filter: drop-shadow(0 0 8px rgba(168,85,247,0.5)); }
}
@keyframes open-bounce {
  0% { transform: scale(1); }
  30% { transform: scale(1.3) rotate(10deg); }
  60% { transform: scale(0.9) rotate(-5deg); }
  100% { transform: scale(1) rotate(0deg); }
}
.box-visual.opened .box-emoji { opacity: 0.5; }
.box-amount {
  font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.4);
  margin-bottom: 4px;
}
.box-amount.light { color: #22c55e; }
.box-amount.opened { color: rgba(255,255,255,0.3); }
.range-val { display: block; font-size: 11px; }
.range-sep { font-size: 10px; }
.box-condition { font-size: 10px; color: rgba(255,255,255,0.4); }
.box-condition strong { color: rgba(255,255,255,0.6); }

.receive-item {
  display: flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,0.04); border-radius: 12px;
  padding: 14px; margin-bottom: 8px;
}
.receive-condition { flex: 1; }
.receive-count { font-size: 18px; font-weight: 800; color: #fff; }
.receive-condition span { font-size: 11px; color: rgba(255,255,255,0.5); }
.receive-amount { flex: 1; text-align: center; }
.receive-amount p { font-size: 16px; font-weight: 700; color: rgba(255,255,255,0.4); }
.receive-amount p.light { color: #22c55e; }
.receive-amount.opened p { color: rgba(255,255,255,0.3); text-decoration: line-through; }
.receive-amount span { font-size: 11px; color: rgba(255,255,255,0.4); }
.receive-action { flex-shrink: 0; }
.receive-btn {
  padding: 8px 18px; border-radius: 20px; font-size: 12px; font-weight: 700;
  border: none; cursor: pointer;
  background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.3);
}
.receive-btn.light {
  background: linear-gradient(135deg, #a855f7, #7c3aed); color: #fff; cursor: pointer;
}
.receive-btn.opened {
  background: rgba(34,197,94,0.15); color: #22c55e; cursor: default;
}
.receive-btn:disabled { cursor: not-allowed; }

.conditions-section {
  background: rgba(255,255,255,0.04); border-radius: 14px;
  padding: 16px; margin-bottom: 16px;
}
.conditions-section h3 { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 8px; }
.cond-desc { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 12px; line-height: 1.5; }
.cond-desc strong { color: #fbbf24; }
.cond-list { display: flex; flex-direction: column; gap: 6px; }
.cond-item {
  display: flex; justify-content: space-between; padding: 10px 14px;
  background: rgba(255,255,255,0.04); border-radius: 10px;
  font-size: 13px; color: rgba(255,255,255,0.7);
}
.cond-value { font-weight: 700; color: #fbbf24; }

.rules-section {
  background: rgba(255,255,255,0.04); border-radius: 12px; padding: 14px;
  margin-bottom: 16px;
}
.rules-header {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  margin-bottom: 10px;
}
.rules-header h3 { font-size: 14px; font-weight: 700; color: #fff; }
.deco-line { width: 30px; height: 2px; background: rgba(255,255,255,0.15); border-radius: 1px; }
.rules-text { font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.7; white-space: pre-wrap; }

.modal-overlay {
  position: fixed; inset: 0; z-index: 10010;
  background: rgba(0,0,0,0.75); display: flex;
  align-items: center; justify-content: center; backdrop-filter: blur(4px);
}
.modal-close {
  position: absolute; top: 12px; right: 12px;
  background: none; border: none; color: rgba(255,255,255,0.5); font-size: 18px; cursor: pointer;
}

.details-modal {
  position: relative; background: linear-gradient(180deg, #2d1b69, #0f172a);
  border-radius: 20px; padding: 24px; min-width: 320px; max-height: 80vh;
  overflow-y: auto; border: 1px solid rgba(168,85,247,0.3);
}
.details-modal h3 { text-align: center; font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 16px; }
.detail-header {
  display: grid; grid-template-columns: 1fr 1fr 80px;
  padding: 8px 0; font-size: 11px; font-weight: 600;
  color: rgba(255,255,255,0.4); border-bottom: 1px solid rgba(255,255,255,0.06);
}
.detail-row {
  display: grid; grid-template-columns: 1fr 1fr 80px;
  padding: 10px 0; font-size: 12px; color: rgba(255,255,255,0.7);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.detail-date { color: rgba(255,255,255,0.4); }
.detail-status { font-weight: 600; text-align: center; }
.detail-status.valid { color: #22c55e; }
.detail-status.invalid { color: #fbbf24; }
.empty-details { text-align: center; padding: 30px; color: rgba(255,255,255,0.4); font-size: 13px; }

.prize-modal {
  position: relative; background: linear-gradient(180deg, #2d1b69, #0f172a);
  border-radius: 20px; padding: 32px 24px; min-width: 280px;
  border: 1px solid rgba(168,85,247,0.3); text-align: center;
}
.prize-celebration { margin-bottom: 20px; }
.prize-icon-big { font-size: 56px; display: block; margin-bottom: 8px; }
.prize-celebration h3 { font-size: 20px; font-weight: 800; color: #fbbf24; margin-bottom: 8px; }
.prize-amount-big { font-size: 28px; font-weight: 900; color: #22c55e; margin-bottom: 4px; }
.prize-desc { font-size: 12px; color: rgba(255,255,255,0.5); }
.prize-confirm {
  width: 100%; padding: 12px; border-radius: 12px;
  background: linear-gradient(135deg, #a855f7, #7c3aed); color: #fff;
  font-size: 15px; font-weight: 700; border: none; cursor: pointer;
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
