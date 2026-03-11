<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="bonus-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="$router.back()">
            <ion-icon name="chevron-back" />
          </ion-button>
        </ion-buttons>
        <ion-title>Indique amigos para receber bônus</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$router.push('/main/convidar/')">
            <ion-icon name="document-text" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="bonus-content">
      <!-- Banner CONVIDAR AMIGOS + Baú -->
      <div class="bonus-banner-wrap">
        <div class="bonus-banner-title">CONVIDAR AMIGOS</div>
        <div class="bonus-treasure-wrap">
          <ion-icon name="gift" class="bonus-treasure-icon" />
        </div>
      </div>

      <!-- Compartilhamento Rápido -->
      <div class="bonus-share-card">
        <div class="bonus-share-title">Compartilhamento Rápido</div>
        <div class="bonus-social-row">
          <a href="#" class="bonus-social" @click.prevent="compartilhar('facebook')">
            <ion-icon name="logo-facebook" />
          </a>
          <a href="#" class="bonus-social bonus-whatsapp" @click.prevent="compartilhar('whatsapp')">
            <ion-icon name="logo-whatsapp" />
          </a>
          <a href="#" class="bonus-social bonus-telegram" @click.prevent="compartilhar('telegram')">
            <ion-icon name="send" />
          </a>
          <a href="#" class="bonus-social" @click.prevent="compartilhar('instagram')">
            <ion-icon name="logo-instagram" />
          </a>
          <a href="#" class="bonus-social" @click.prevent="compartilhar('twitter')">
            <ion-icon name="logo-twitter" />
          </a>
          <a href="#" class="bonus-social bonus-tiktok" @click.prevent="compartilhar('tiktok')">
            <ion-icon name="logo-tiktok" />
          </a>
          <a href="#" class="bonus-social bonus-kwai" @click.prevent="compartilhar('kwai')">
            <ion-icon name="videocam" />
          </a>
          <a href="#" class="bonus-social bonus-youtube" @click.prevent="compartilhar('youtube')">
            <ion-icon name="logo-youtube" />
          </a>
        </div>
        <div class="bonus-link-row">
          <span class="bonus-link-label">Meu link:</span>
          <span class="bonus-link-url">{{ linkConvite }}</span>
          <ion-button fill="clear" size="small" class="bonus-copy-btn" @click="copiarLink">
            <ion-icon name="copy-outline" />
          </ion-button>
        </div>
        <div class="bonus-stats-row">
          <span class="bonus-stats-text">Meus subordinados diretos {{ subDiretos }} Pessoa (Válido {{ subValidos }} Pessoa)</span>
          <div class="bonus-stats-btns">
            <ion-button fill="solid" class="bonus-detalhes-btn" @click="$router.push('/main/convidar/')">
              Detalhes &gt;
            </ion-button>
            <ion-button fill="outline" size="small" class="bonus-simular-btn" @click="simularSubordinado">
              +1 demo
            </ion-button>
          </div>
        </div>
      </div>

      <!-- Recompensas por Convite -->
      <div class="bonus-rewards-section">
        <div class="bonus-rewards-title">Recompensas por Convite</div>
        <div class="bonus-rewards-grid">
          <div
            v-for="(r, i) in recompensas"
            :key="i"
            class="bonus-reward-card"
            :class="{ 'bonus-reward-disponivel': recompensasDisponiveis.some(d => d.pessoas === r.pessoas) }"
          >
            <div class="bonus-reward-chest">
              <ion-icon name="gift" />
            </div>
            <div class="bonus-reward-value">{{ r.valor }}</div>
            <div class="bonus-reward-promo">Promoção {{ r.pessoas }} Pessoa</div>
            <ion-button
              v-if="recompensasDisponiveis.some(d => d.pessoas === r.pessoas)"
              size="small"
              fill="solid"
              class="bonus-reward-btn"
              @click="reclamarRecompensa(r)"
            >
              Reclamar
            </ion-button>
          </div>
        </div>
      </div>

      <!-- Regras do evento -->
      <div class="bonus-regras">
        <div class="bonus-regras-block">
          <h4 class="bonus-regras-titulo">O que é o número de promoção efetiva?</h4>
          <p class="bonus-regras-sub">(Preenchendo as seguintes condições)</p>
          <div class="bonus-condicoes">
            <div class="bonus-cond-row">
              <span>Primeiro depósito do subordinado</span>
              <span class="bonus-cond-val">≥0.00</span>
            </div>
            <div class="bonus-cond-row">
              <span>Depósitos acumulados do subordinado</span>
              <span class="bonus-cond-val">≥30.00</span>
            </div>
            <div class="bonus-cond-row">
              <span>Quantidade de apostas acumuladas pelo subordinado</span>
              <span class="bonus-cond-val">≥600.00</span>
            </div>
            <div class="bonus-cond-row">
              <span>Dias acumulados de depósito do subordinado</span>
              <span class="bonus-cond-val">≥0</span>
            </div>
            <div class="bonus-cond-row">
              <span>Número acumulado de recargas dos subordinados</span>
              <span class="bonus-cond-val">≥0</span>
            </div>
          </div>
        </div>
        <div class="bonus-regras-block">
          <h4 class="bonus-regras-titulo">* Regras do evento *</h4>
          <ol class="bonus-regras-lista">
            <li>Convide amigos para reivindicar bônus. Quanto mais pessoas você convidar, mais bônus você receberá;</li>
            <li>Os bônus precisam ser reivindicados manualmente. Após a expiração, os bônus serão distribuídos automaticamente e podem ser aproveitados junto com bônus e comissões de outros agentes;</li>
            <li>Os bônus (excluindo o principal) exigem 0 vezes de apostas válidas para serem sacados;</li>
            <li>Somente o proprietário da conta pode realizar operações manuais normais, caso contrário, o bônus será cancelado ou deduzido, congelado ou até mesmo colocado na lista negra;</li>
            <li>Para evitar diferenças na compreensão do texto, a plataforma se reserva o direito final de interpretação desta atividade.</li>
          </ol>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { confetti } from '@/utils/confetti'
import { useAfiliado } from '@/composables/useAfiliado'
import { useToast } from '@/composables/useToast'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons
} from '@ionic/vue'

const {
  linkConvite,
  subDiretos,
  subValidos,
  recompensasPromo,
  recompensasDisponiveis,
  fmt,
  reclamarBonusPromo,
  addSubordinadoValido,
} = useAfiliado()
const toast = useToast()

const recompensas = recompensasPromo.map(r => ({ valor: fmt(r.valor), pessoas: r.pessoas }))

function copiarLink() {
  navigator.clipboard?.writeText(linkConvite.value)
  confetti({ count: 30 })
}
async function reclamarRecompensa(r) {
  if (await reclamarBonusPromo(r.pessoas)) {
    confetti()
    toast.success(`Bônus R$ ${r.valor} reclamado!`)
  } else {
    toast.warning('Recompensa já reclamada ou subordinados insuficientes.')
  }
}
function simularSubordinado() {
  addSubordinadoValido()
  toast.success('+1 subordinado válido (demo)')
}
function compartilhar(rede) {
  const url = encodeURIComponent(linkConvite.value)
  const text = encodeURIComponent('Venha participar!')
  if (rede === 'whatsapp') window.open(`https://wa.me/?text=${text}%20${url}`, '_blank')
  else if (rede === 'telegram') window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank')
  else if (rede === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
  else if (rede === 'twitter') window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank')
  else if (rede === 'instagram') window.open(`https://www.instagram.com/`, '_blank')
  else if (rede === 'tiktok') window.open(`https://www.tiktok.com/`, '_blank')
  else if (rede === 'youtube') window.open(`https://www.youtube.com/`, '_blank')
  else if (rede === 'kwai') window.open(`https://www.kwai.com/`, '_blank')
}
</script>

<style scoped>
.bonus-toolbar {
  --background: #2d1f4e;
  --color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.bonus-toolbar ion-button {
  --color: #fff;
}
.bonus-toolbar ion-title {
  font-size: 0.95rem;
  font-weight: 600;
}
.bonus-content {
  --background: linear-gradient(180deg, #4D087B 0%, #3d0a5f 50%, #4D087B 100%);
}

/* Banner CONVIDAR AMIGOS */
.bonus-banner-wrap {
  margin: 16px;
  padding: 24px 20px;
  background: linear-gradient(135deg, #3d1a5c 0%, #2d0f45 100%);
  border-radius: 20px;
  border: 1px solid rgba(168, 85, 247, 0.4);
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
  text-align: center;
}
.bonus-banner-title {
  font-family: var(--font-smooch);
  font-size: 1.2rem;
  font-weight: 800;
  color: #fbbf24;
  letter-spacing: 0.1em;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
  margin-bottom: 16px;
}
.bonus-treasure-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
}
.bonus-treasure-icon {
  font-size: 80px;
  color: #fbbf24;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
}

/* Compartilhamento Rápido */
.bonus-share-card {
  margin: 0 16px 20px;
  padding: 20px;
  background: rgba(91, 33, 182, 0.4);
  border-radius: 20px;
  border: 1px solid rgba(168, 85, 247, 0.5);
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.25);
}
.bonus-share-title {
  font-family: var(--font-smooch);
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 14px;
  text-align: center;
}
.bonus-social-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 16px;
}
.bonus-social {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #4a3d6b;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: transform 0.2s;
}
.bonus-social ion-icon {
  font-size: 22px;
}
.bonus-social:hover {
  transform: scale(1.1);
}
.bonus-whatsapp { background: #25d366; }
.bonus-telegram { background: #0088cc; }
.bonus-tiktok { background: #000; }
.bonus-kwai { background: #e31e24; }
.bonus-youtube { background: #ff0000; }
.bonus-link-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.bonus-link-label {
  color: #9ca3af;
  font-size: 0.9rem;
}
.bonus-link-url {
  color: #60a5fa;
  font-size: 0.85rem;
  word-break: break-all;
  flex: 1;
  min-width: 0;
}
.bonus-copy-btn {
  --padding-start: 8px;
  --padding-end: 8px;
  --color: #fbbf24;
}
.bonus-stats-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.bonus-stats-text {
  color: #e5e7eb;
  font-size: 0.9rem;
}
.bonus-stats-btns {
  display: flex;
  gap: 8px;
  align-items: center;
}
.bonus-detalhes-btn {
  --background: #fbbf24;
  --color: #1a1a1a;
  font-weight: 700;
  font-size: 0.85rem;
}
.bonus-simular-btn {
  --border-color: #22c55e;
  --color: #22c55e;
  font-size: 0.75rem;
}

/* Recompensas */
.bonus-rewards-section {
  margin: 0 16px 24px;
}
.bonus-rewards-title {
  font-family: var(--font-smooch);
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
  text-align: center;
}
.bonus-rewards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.bonus-reward-card {
  background: rgba(91, 33, 182, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(168, 85, 247, 0.4);
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.bonus-reward-chest {
  color: #fbbf24;
  font-size: 28px;
}
.bonus-reward-value {
  font-family: var(--font-smooch);
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
}
.bonus-reward-promo {
  font-size: 0.65rem;
  color: #9ca3af;
  text-align: center;
  line-height: 1.2;
}
.bonus-reward-disponivel {
  border-color: #22c55e;
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);
}
.bonus-reward-btn {
  --background: #22c55e;
  --color: #fff;
  font-size: 0.75rem;
  margin-top: 4px;
}

/* Regras */
.bonus-regras {
  margin: 0 16px 32px;
  padding: 20px;
  background: rgba(91, 33, 182, 0.3);
  border-radius: 16px;
  border: 1px solid rgba(168, 85, 247, 0.3);
}
.bonus-regras-block {
  margin-bottom: 20px;
}
.bonus-regras-block:last-child {
  margin-bottom: 0;
}
.bonus-regras-titulo {
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}
.bonus-regras-sub {
  color: #9ca3af;
  font-size: 0.85rem;
  margin: 0 0 12px 0;
}
.bonus-condicoes {
  background: rgba(74, 61, 107, 0.5);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
}
.bonus-cond-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  color: #e5e7eb;
  font-size: 0.85rem;
}
.bonus-cond-row:last-child {
  border-bottom: none;
}
.bonus-cond-val {
  color: #22d3ee;
  font-weight: 600;
}
.bonus-regras-lista {
  color: #e5e7eb;
  font-size: 0.9rem;
  line-height: 1.6;
  padding-left: 20px;
  margin: 0;
}
.bonus-regras-lista li {
  margin-bottom: 8px;
}
</style>
