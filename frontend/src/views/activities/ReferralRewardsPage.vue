<template>
  <div class="referral-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Recompensas de Indicação</h2>
    </div>

    <div class="referral-banner">
      <div class="banner-bg"></div>
      <div class="banner-inner">
        <h3>Indique e Ganhe!</h3>
        <p>Ganhe bônus para cada amigo que se registrar e depositar</p>
        <div class="banner-stats">
          <div class="bstat">
            <span class="bstat-val">{{ totalInvited }}</span>
            <span class="bstat-lbl">Convidados</span>
          </div>
          <div class="bstat-divider"></div>
          <div class="bstat">
            <span class="bstat-val">R$ {{ totalEarned }}</span>
            <span class="bstat-lbl">Ganho</span>
          </div>
        </div>
      </div>
    </div>

    <div class="pool-section">
      <div class="pool-label">Bônus Disponível</div>
      <div class="pool-amount">R$ {{ availableBonus }}</div>
    </div>

    <div class="tiers-section">
      <h3>Metas de Indicação</h3>
      <div class="tiers-list">
        <div v-for="tier in tiers" :key="tier.count" class="tier-card" :class="{ reached: invited >= tier.count }">
          <div class="tier-left">
            <div class="tier-icon" :class="{ active: invited >= tier.count }">
              <svg v-if="invited >= tier.count" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <div class="tier-info">
              <span class="tier-target">{{ tier.count }} amigos</span>
              <div class="tier-progress-bar">
                <div class="tier-fill" :style="{ width: Math.min(100, (invited / tier.count) * 100) + '%' }"></div>
              </div>
            </div>
          </div>
          <span class="tier-reward">{{ tier.reward }}</span>
        </div>
      </div>
    </div>

    <div class="share-section">
      <h3>Compartilhar Link</h3>
      <div class="share-url-box">
        <span class="share-url">{{ shareUrl }}</span>
        <button class="copy-btn" @click="copyLink">Copiar</button>
      </div>
      <div class="share-buttons">
        <button class="share-btn whatsapp" @click="shareWhatsApp">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
          WhatsApp
        </button>
        <button class="share-btn telegram" @click="shareTelegram">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          Telegram
        </button>
      </div>
    </div>

    <button class="claim-btn" :disabled="parseFloat(availableBonus) <= 0" @click="claimReward">
      {{ parseFloat(availableBonus) > 0 ? 'Coletar Bônus' : 'Convide mais amigos' }}
    </button>

    <div class="rules-section">
      <h3>Regras</h3>
      <ul>
        <li>Compartilhe seu link exclusivo com amigos</li>
        <li>Ganhe bônus quando seus amigos se registrarem e depositarem</li>
        <li>Quanto mais amigos, maiores as recompensas</li>
        <li>O bônus é creditado automaticamente ao atingir cada meta</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const totalInvited = ref(4)
const totalEarned = ref('25,00')
const availableBonus = ref('5,00')
const invited = ref(4)
const shareUrl = ref('https://a73.com/r/user123')

const tiers = [
  { count: 1, reward: 'R$ 5' },
  { count: 3, reward: 'R$ 20' },
  { count: 5, reward: 'R$ 50' },
  { count: 10, reward: 'R$ 120' },
  { count: 20, reward: 'R$ 300' },
  { count: 50, reward: 'R$ 1.000' },
]

function copyLink() {
  navigator.clipboard?.writeText(shareUrl.value)
}
function shareWhatsApp() {
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl.value)}`, '_blank')
}
function shareTelegram() {
  window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl.value)}`, '_blank')
}
function claimReward() {
  if (parseFloat(availableBonus.value) <= 0) return
  availableBonus.value = '0,00'
}
</script>

<style scoped>
.referral-page {
  padding: 0 .75rem 6rem;
  background: var(--ep-color-background-fill-body-default);
  min-height: 100vh;
}
.page-header { display: flex; align-items: center; padding: .75rem 0; gap: .75rem; }
.page-header h2 { flex: 1; font-size: 1.125rem; font-weight: 700; color: var(--ep-color-text-default); }
.back-btn { color: var(--ep-color-text-default); padding: .25rem; background: none; border: none; cursor: pointer; }

.referral-banner { position: relative; border-radius: .75rem; overflow: hidden; margin-bottom: .75rem; }
.banner-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #6366f1 100%); }
.banner-inner { position: relative; z-index: 1; padding: 1.25rem 1rem; text-align: center; }
.banner-inner h3 { font-size: 1.25rem; font-weight: 800; }
.banner-inner p { font-size: .75rem; color: rgba(255,255,255,.75); margin-top: .25rem; margin-bottom: .75rem; }
.banner-stats { display: flex; justify-content: center; align-items: center; gap: 1rem; }
.bstat { text-align: center; }
.bstat-val { display: block; font-size: 1.25rem; font-weight: 800; }
.bstat-lbl { font-size: .625rem; color: rgba(255,255,255,.7); }
.bstat-divider { width: 1px; height: 1.5rem; background: rgba(255,255,255,.2); }

.pool-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-bottom: .75rem;
  text-align: center; border: 1px solid var(--ep-color-border-default);
}
.pool-label { font-size: .75rem; color: var(--ep-color-text-weakest); margin-bottom: .25rem; }
.pool-amount { font-size: 1.5rem; font-weight: 900; color: var(--accent-yellow, #fbbf24); }

.tiers-section {
  background: var(--ep-color-background-fill-surface-raised-L1);
  border-radius: .75rem; padding: 1rem; margin-bottom: .75rem;
  border: 1px solid var(--ep-color-border-default);
}
.tiers-section h3 { font-size: .875rem; font-weight: 700; margin-bottom: .625rem; color: var(--ep-color-text-default); }
.tiers-list { display: flex; flex-direction: column; gap: .375rem; }
.tier-card {
  display: flex; align-items: center; justify-content: space-between;
  padding: .625rem; border-radius: .5rem; background: rgba(255,255,255,.02);
}
.tier-card.reached { background: rgba(59,130,246,.06); }
.tier-left { display: flex; align-items: center; gap: .5rem; flex: 1; }
.tier-icon {
  width: 2rem; height: 2rem; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,.05); color: var(--ep-color-text-weakest);
}
.tier-icon.active { background: #3b82f6; }
.tier-info { flex: 1; }
.tier-target { font-size: .8125rem; font-weight: 600; color: var(--ep-color-text-default); display: block; }
.tier-progress-bar {
  height: .25rem; background: rgba(255,255,255,.06); border-radius: .125rem;
  margin-top: .25rem; overflow: hidden;
}
.tier-fill { height: 100%; background: #3b82f6; border-radius: .125rem; transition: width .4s; }
.tier-reward { font-size: .875rem; font-weight: 800; color: var(--accent-yellow, #fbbf24); }

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
  padding: .25rem .625rem; border-radius: .375rem;
  font-size: .6875rem; font-weight: 600;
  background: var(--gradient-primary); color: var(--ep-color-text-inverse, #0E1E3D);
  border: none; cursor: pointer; white-space: nowrap;
}
.share-buttons { display: flex; gap: .5rem; }
.share-btn {
  flex: 1; display: flex; align-items: center; justify-content: center;
  gap: .375rem; padding: .625rem; border-radius: .5rem;
  font-size: .8125rem; font-weight: 600; color: #fff;
  border: none; cursor: pointer;
}
.share-btn.whatsapp { background: #25D366; }
.share-btn.telegram { background: #0088cc; }

.claim-btn {
  width: 100%; padding: .875rem; border-radius: .5rem;
  font-size: 1rem; font-weight: 700; border: none; cursor: pointer;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
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
  background: #3b82f6;
}
</style>
