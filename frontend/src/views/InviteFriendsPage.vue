<template>
  <div class="invite-page">
    <header class="invite-header">
      <button type="button" class="invite-back" aria-label="Voltar" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <h1 class="invite-header-title">Indique amigos para receber bônus</h1>
      <button type="button" class="invite-header-clip" aria-label="Copiar link" @click="copyLink">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      </button>
    </header>

    <div class="invite-hero">
      <img
        class="invite-hero-bg"
        src="/assets/invite-friends/bg-poster-MfnJ14N2.png"
        alt=""
      />
      <p class="invite-hero-plaque-title">CONVIDAR AMIGOS</p>
      <img
        class="invite-hero-fg"
        src="/assets/invite-friends/treasure-poster-lWaxh_YZ.png"
        alt=""
      />
    </div>

    <section class="invite-block invite-block--share">
      <div class="invite-title-bar invite-title-bar--share">
        <img class="invite-title-bar-bg" src="/assets/invite-friends/bar-title-B7k57w00.png" alt="" />
        <span class="invite-title-bar-text invite-title-bar-text--share">Compartilhamento Rápido</span>
      </div>
      <div class="invite-social-row">
        <button
          v-for="s in socials"
          :key="s.name"
          type="button"
          class="invite-social-btn"
          :class="`invite-social-btn--${s.theme}`"
          :aria-label="s.name"
          @click="openShare(s)"
        >
          <span class="invite-social-ico" v-html="s.icon" />
        </button>
      </div>
      <div class="invite-link-block">
        <span class="invite-link-label">Meu link:</span>
        <span class="invite-link-url">{{ displayLink }}</span>
        <button type="button" class="invite-copy-ico" aria-label="Copiar" @click="copyLink">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        </button>
      </div>

      <div class="invite-share-stats" role="group" aria-label="Resumo de indicações">
        <div class="invite-stats-inner">
          <p class="invite-stats-line">
            Meus subordinados diretos <strong class="invite-stats-num">{{ directTotal }}</strong> Pessoa
          </p>
          <p class="invite-stats-line invite-stats-line--second">
            (Válido <strong class="invite-stats-num">{{ validTotal }}</strong> Pessoa)
          </p>
        </div>
        <button type="button" class="invite-details-btn" @click="$router.push('/spread')">
          Detalhes &gt;
        </button>
      </div>
    </section>

    <section class="invite-block invite-block--rewards">
      <div class="invite-title-bar invite-title-bar--rewards">
        <img class="invite-title-bar-bg" src="/assets/invite-friends/bar-title-B7k57w00.png" alt="" />
        <span class="invite-title-bar-text invite-title-bar-text--rewards">Recompensas por Convite</span>
      </div>
      <div class="invite-reward-rows">
        <div v-for="(row, rowIdx) in rewardRows" :key="`row-${rowIdx}`" class="invite-reward-fileira">
          <div class="invite-reward-row-chests">
            <div
              v-for="tier in row"
              :key="`chest-${tier.people}-${tier.amount}`"
              class="invite-reward-cell invite-reward-cell--chest"
            >
              <div class="invite-reward-stage">
                <img class="invite-reward-chest" src="/assets/invite-friends/treasure-c1VM6Hn0.png" alt="" />
              </div>
            </div>
          </div>
          <div class="invite-reward-bench-stack">
            <img
              class="invite-reward-row-bench"
              src="/assets/invite-friends/bg-reward-stage-BApFjLwQ.svg"
              alt=""
            />
            <div class="invite-reward-row-details invite-reward-row-details--over-bench">
              <div
                v-for="tier in row"
                :key="`detail-${tier.people}-${tier.amount}`"
                class="invite-reward-cell invite-reward-cell--details"
              >
                <p class="invite-reward-amount">{{ tier.amount }}</p>
                <p class="invite-reward-meta">
                  Promoção <span class="invite-reward-milestone">{{ tier.people }}</span>
                </p>
                <p class="invite-reward-unit">Pessoas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="invite-block invite-block--rules-info" aria-labelledby="invite-promo-conditions-title">
      <div class="invite-promo-conditions">
        <h2 id="invite-promo-conditions-title" class="invite-info-lead">
          O que é o número de promoção efetiva? (Preenchendo as seguintes condições)
        </h2>
        <ul class="invite-condition-list" role="list">
          <li v-for="(row, idx) in promotionConditions" :key="idx" class="invite-condition-row">
            <span class="invite-condition-label">{{ row.label }}</span>
            <span
              class="invite-condition-value"
              :class="{ 'invite-condition-value--accent': row.accent }"
            >{{ row.value }}</span>
          </li>
        </ul>
      </div>

      <div class="invite-event-rules">
        <div class="invite-rules-head">
          <span class="invite-rules-head-deco" aria-hidden="true" />
          <h2 id="invite-event-rules-title" class="invite-rules-title">Regras do evento</h2>
          <span class="invite-rules-head-deco invite-rules-head-deco--flip" aria-hidden="true" />
        </div>
        <ol class="invite-rules-list invite-rules-list--active" aria-labelledby="invite-event-rules-title">
          <li v-for="(rule, idx) in eventRules" :key="idx" class="invite-rules-item">{{ rule }}</li>
        </ol>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAgentStore } from '../stores/agent'
import { toastSuccess } from '../utils/toast'

const agentStore = useAgentStore()
const { inviteLink, agentData } = storeToRefs(agentStore)

const displayLink = computed(() => inviteLink.value || `${window.location.origin}/`)

const directTotal = computed(() => agentData.value?.histDirectCnt ?? 0)
const validTotal = computed(() => agentData.value?.validDirectCnt ?? agentData.value?.dayDirectRechargeCnt ?? 0)

const rewardTiers = [
  { people: 1, amount: '50,00' },
  { people: 2, amount: '50,00' },
  { people: 3, amount: '50,00' },
  { people: 4, amount: '50,00' },
  { people: 5, amount: '50,00' },
  { people: 10, amount: '100,00' },
  { people: 25, amount: '200,00' },
  { people: 50, amount: '400,00' },
  { people: 75, amount: '700,00' },
  { people: 100, amount: '1.200,00' },
  { people: 125, amount: '1.800,00' },
  { people: 150, amount: '2.500,00' },
  { people: 200, amount: '2.500,00' },
  { people: 250, amount: '2.500,00' },
  { people: 300, amount: '2.500,00' },
  { people: 350, amount: '2.500,00' },
  { people: 400, amount: '2.500,00' },
  { people: 450, amount: '2.500,00' },
  { people: 500, amount: '3.000,00' },
  { people: 600, amount: '4.000,00' },
  { people: 750, amount: '5.500,00' },
  { people: 900, amount: '7.500,00' },
  { people: 1100, amount: '10.000,00' },
  { people: 1300, amount: '13.000,00' },
  { people: 1600, amount: '18.000,00' },
  { people: 2000, amount: '25.000,00' },
  { people: 2500, amount: '35.000,00' },
  { people: 3000, amount: '48.000,00' },
  { people: 3600, amount: '65.000,00' },
  { people: 4200, amount: '85.000,00' },
  { people: 5000, amount: '110.000,00' },
  { people: 6000, amount: '140.000,00' },
  { people: 7200, amount: '175.000,00' },
  { people: 8500, amount: '215.000,00' },
  { people: 10000, amount: '260.000,00' },
  { people: 12000, amount: '310.000,00' },
  { people: 13500, amount: '360.000,00' },
  { people: 15000, amount: '400.000,00' },
  { people: 16500, amount: '430.000,00' },
  { people: 17500, amount: '455.000,00' },
  { people: 18500, amount: '475.000,00' },
  { people: 19500, amount: '490.000,00' },
  { people: 20000, amount: '500.000,00' }
]

const rewardRows = computed(() => {
  const rows = []
  for (let i = 0; i < rewardTiers.length; i += 4) {
    rows.push(rewardTiers.slice(i, i + 4))
  }
  return rows
})

const promotionConditions = [
  { label: 'Primeiro depósito do subordinado', value: '≥0.00', accent: true },
  { label: 'Depósitos acumulados do subordinado', value: '≥30.00', accent: true },
  { label: 'Quantidade de apostas acumuladas pelo subordinado', value: '≥600.00', accent: true },
  { label: 'Dias acumulados de depósito do subordinado', value: '≥0', accent: false },
  { label: 'Número acumulado de recargas dos subordinados', value: '≥0', accent: false }
]

const eventRules = [
  'Convide amigos para reivindicar bônus. Quanto mais pessoas você convidar, mais bônus você receberá;',
  'Os bônus precisam ser reivindicados manualmente. Após a expiração, os bônus serão distribuídos automaticamente e podem ser aproveitados junto com bônus e comissões de outros agentes;',
  'Os bônus (excluindo o principal) exigem 0 vezes de apostas válidas para serem sacados;',
  'Somente o proprietário da conta pode realizar operações manuais normais, caso contrário, o bônus será cancelado ou deduzido, congelado ou até mesmo colocado na lista negra;',
  'Para evitar diferenças na compreensão do texto, a plataforma se reserva o direito final de interpretação desta atividade.'
]

const socials = [
  {
    name: 'Facebook',
    theme: 'facebook',
    icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    buildUrl: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`
  },
  {
    name: 'WhatsApp',
    theme: 'whatsapp',
    icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>',
    buildUrl: (u) => `https://api.whatsapp.com/send?text=${encodeURIComponent(u)}`
  },
  {
    name: 'Telegram',
    theme: 'telegram',
    icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
    buildUrl: (u) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent('Convide e ganhe!')}`
  },
  {
    name: 'Instagram',
    theme: 'instagram',
    icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
    buildUrl: (u) => `https://www.instagram.com/`
  },
  {
    name: 'X',
    theme: 'x',
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    buildUrl: (u) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}`
  },
  {
    name: 'TikTok',
    theme: 'tiktok',
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>',
    buildUrl: (u) => u
  },
  {
    name: 'Kwai',
    theme: 'kwai',
    icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8.5 5.5h7a4.5 4.5 0 014.5 4.5v4a4.5 4.5 0 01-4.5 4.5h-7A4.5 4.5 0 014 14v-4a4.5 4.5 0 014.5-4.5zm0 2A2.5 2.5 0 006 10v4a2.5 2.5 0 002.5 2.5h7a2.5 2.5 0 002.5-2.5v-4a2.5 2.5 0 00-2.5-2.5h-7zm2.25 2.2l4.5 2.6a.5.5 0 010 .86l-4.5 2.6A.5.5 0 0110 15.1V8.9a.5.5 0 01.75-.43z"/></svg>',
    buildUrl: (u) => u
  },
  {
    name: 'YouTube',
    theme: 'youtube',
    icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    buildUrl: (u) => `https://www.youtube.com/share?url=${encodeURIComponent(u)}`
  }
]

function openShare(s) {
  const u = displayLink.value
  const url = s.buildUrl(u)
  if (url === u) {
    toastSuccess('Copie o link e publique na rede.')
    copyLink()
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

function copyLink() {
  const t = displayLink.value
  navigator.clipboard?.writeText(t).then(() => toastSuccess('Link copiado.')).catch(() => {})
}

onMounted(() => {
  agentStore.fetchAgentInfo()
})
</script>

<style scoped>
.invite-page {
  min-height: 100vh;
  padding: 0 0.75rem 5rem;
  background: linear-gradient(180deg, #1a0b2e 0%, #0f0620 45%, #16082a 100%);
  color: #fff;
}

.invite-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0 0.5rem;
  position: sticky;
  top: 0;
  z-index: 20;
  background: linear-gradient(180deg, rgba(26, 11, 46, 0.98) 70%, transparent);
}

.invite-back,
.invite-header-clip {
  flex-shrink: 0;
  padding: 0.35rem;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;
  border-radius: 0.35rem;
}

.invite-header-title {
  flex: 1;
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.25;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.invite-hero {
  position: relative;
  margin: 0 -0.75rem 0.65rem;
  border-radius: 0.75rem 0.75rem 0.65rem 0.65rem;
  overflow: hidden;
  line-height: 0;
}

/* Cenário completo (trono / sala) — atrás */
.invite-hero-bg {
  width: 100%;
  height: auto;
  display: block;
  vertical-align: top;
}

/* Baú por cima, centrado na zona do chão à frente do trono */
.invite-hero-fg {
  position: absolute;
  left: 50%;
  bottom: 9%;
  transform: translateX(-50%);
  width: auto;
  max-width: min(52%, 10.5rem);
  height: auto;
  pointer-events: none;
  object-fit: contain;
  z-index: 1;
}

/* Título na placa escura entre as velas (topo do poster) */
.invite-hero-plaque-title {
  position: absolute;
  left: 50%;
  top: 43%;
  transform: translate(-50%, -50%);
  z-index: 2;
  margin: 0;
  width: 72%;
  max-width: 14rem;
  text-align: center;
  font-size: clamp(0.62rem, 3.4vw, 0.88rem);
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #f8edd8;
  text-shadow:
    0 1px 0 rgba(0, 0, 0, 0.9),
    0 2px 10px rgba(0, 0, 0, 0.65),
    0 0 14px rgba(251, 191, 36, 0.25);
  pointer-events: none;
  line-height: 1.2;
}

.invite-block {
  border-radius: 0.65rem;
  border: 1px solid rgba(125, 211, 252, 0.35);
  background: rgba(30, 20, 60, 0.55);
  padding: 0.65rem 0.6rem 0.85rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  overflow: visible;
}

/* Faixa “Compartilhamento Rápido” sobe e ultrapassa o topo do card */
.invite-block--share {
  margin-top: 0.5rem;
  padding-top: 0.55rem;
  background: linear-gradient(180deg, #1e2258 0%, #16193e 55%, #14173a 100%);
  border: 1px solid rgba(110, 186, 255, 0.48);
  box-shadow:
    0 6px 28px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
}

.invite-title-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  margin: 0 0 0.75rem;
  overflow: visible;
}

.invite-title-bar--share {
  margin-top: -1.75rem;
  margin-bottom: 0.85rem;
}

.invite-title-bar--share .invite-title-bar-bg {
  top: 44%;
  transform: translate(-50%, -50%) scale(1.1);
}

.invite-title-bar-text--share {
  transform: translateY(-0.92rem);
}

.invite-title-bar-bg {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(1.1);
  width: 100%;
  height: auto;
  object-fit: contain;
  pointer-events: none;
}

.invite-title-bar-text {
  position: relative;
  z-index: 1;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.invite-social-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem;
  margin-bottom: 0.85rem;
}

.invite-social-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
}

.invite-social-btn--facebook {
  background: #1877f2;
  color: #fff;
}

.invite-social-btn--whatsapp {
  background: #25d366;
  color: #fff;
}

.invite-social-btn--telegram {
  background: #2aabee;
  color: #fff;
}

.invite-social-btn--instagram {
  background: linear-gradient(135deg, #f58529 0%, #dd2a7b 45%, #8134af 75%, #515bd4 100%);
  color: #fff;
}

.invite-social-btn--x {
  background: #000;
  color: #fff;
}

.invite-social-btn--tiktok {
  background: #000;
  color: #fff;
}

.invite-social-btn--kwai {
  background: #ff6a00;
  color: #fff;
}

.invite-social-btn--youtube {
  background: #fff;
  color: #ff0000;
  border: 1px solid #e6e6e6;
}

.invite-social-ico :deep(svg) {
  display: block;
}

.invite-link-block {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  font-size: 0.72rem;
  padding: 0.5rem 0.55rem;
  border-radius: 0.45rem;
  background: rgba(0, 0, 0, 0.38);
  border: 1px solid rgba(90, 160, 255, 0.22);
}

.invite-link-label {
  flex-shrink: 0;
  font-weight: 800;
  color: #fff;
}

.invite-link-url {
  flex: 1;
  min-width: 0;
  word-break: break-all;
  color: #d4ff3f;
  font-weight: 600;
}

.invite-copy-ico {
  flex-shrink: 0;
  padding: 0.2rem;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;
  border-radius: 0.25rem;
}

/* Rodapé do mesmo card: partilha + estatísticas */
.invite-share-stats {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-top: 0.75rem;
  padding: 0.8rem 0.35rem 0.15rem;
  border-top: 1px solid rgba(110, 186, 255, 0.32);
  border-radius: 0 0 0.45rem 0.45rem;
  background: rgba(10, 12, 36, 0.65);
}

.invite-stats-inner {
  flex: 1;
  min-width: 0;
}

.invite-stats-line {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.45;
  font-weight: 700;
  color: #fff;
}

.invite-stats-num {
  color: #ffb52e;
  font-weight: 800;
}

.invite-stats-line--second {
  margin-top: 0.15rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: #fff;
}

.invite-details-btn {
  flex-shrink: 0;
  padding: 0.45rem 0.75rem;
  border-radius: 0.45rem;
  border: none;
  background: #d4ff3f;
  color: #1a1e4f;
  font-weight: 800;
  font-size: 0.72rem;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.18);
}

.invite-block--rewards {
  background: linear-gradient(180deg, #1e2258 0%, #16193e 55%, #14173a 100%);
  border: 1px solid rgba(110, 186, 255, 0.48);
  box-shadow:
    0 6px 28px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
}

.invite-title-bar--rewards {
  margin-bottom: 0.65rem;
}

.invite-title-bar-text--rewards {
  color: #fff;
  transform: translateY(-0.72rem);
  text-shadow:
    0 0 1px #fb923c,
    0 1px 2px rgba(0, 0, 0, 0.85);
}

.invite-reward-rows {
  display: flex;
  flex-direction: column;
  gap: 0.62rem;
}

.invite-reward-fileira {
  display: flex;
  flex-direction: column;
}

.invite-reward-row-chests {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.48rem 0.12rem;
  align-items: end;
}

.invite-reward-bench-stack {
  position: relative;
  z-index: 1;
  width: 100%;
  margin-top: -0.48rem;
}

.invite-reward-row-details {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.48rem 0.12rem;
}

.invite-reward-row-details--over-bench {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
  align-items: center;
  justify-items: center;
  padding: 0 0.15rem;
  pointer-events: none;
}

.invite-reward-row-details--over-bench .invite-reward-amount {
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.85),
    0 0 8px rgba(0, 0, 0, 0.45);
}

.invite-reward-row-details--over-bench .invite-reward-meta,
.invite-reward-row-details--over-bench .invite-reward-unit {
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.9),
    0 0 1px rgba(0, 0, 0, 0.8);
}

.invite-reward-cell {
  text-align: center;
}

.invite-reward-cell--chest {
  padding: 0.2rem 0.02rem 0;
}

.invite-reward-cell--details {
  padding: 0 0.04rem;
  max-width: 100%;
}

/* Um SVG de palco por fileira (4 baús), como banco comum — texto por cima */
.invite-reward-row-bench {
  position: relative;
  z-index: 0;
  width: 100%;
  height: auto;
  object-fit: contain;
  object-position: center bottom;
  display: block;
  flex-shrink: 0;
}

.invite-reward-stage {
  position: relative;
  width: 100%;
  max-width: 6rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.invite-reward-chest {
  position: relative;
  z-index: 1;
  width: 72%;
  max-width: 4.15rem;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
}

.invite-reward-amount {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 800;
  color: #fb923c;
  line-height: 1.2;
}

.invite-reward-meta {
  margin: 0.14rem 0 0;
  font-size: 0.7rem;
  line-height: 1.2;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
}

.invite-reward-milestone {
  color: #4ade80;
  font-weight: 800;
}

.invite-reward-unit {
  margin: 0.08rem 0 0;
  font-size: 0.64rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.78);
}

.invite-block--rules-info {
  margin-top: 0.5rem;
  padding: 0.75rem 0.55rem 0.95rem;
  background: linear-gradient(180deg, #1e2258 0%, #16193e 55%, #14173a 100%);
  border: 1px solid rgba(110, 186, 255, 0.48);
  box-shadow:
    0 6px 28px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
}

.invite-info-lead {
  margin: 0 0 0.65rem;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.96);
  text-align: center;
}

.invite-condition-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.invite-condition-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(125, 211, 252, 0.22);
  font-size: 0.62rem;
  line-height: 1.35;
}

.invite-condition-row:last-child {
  border-bottom: none;
  padding-bottom: 0.15rem;
}

.invite-condition-label {
  flex: 1;
  min-width: 0;
  color: rgba(255, 255, 255, 0.92);
  font-weight: 600;
  text-align: left;
}

.invite-condition-value {
  flex-shrink: 0;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.95);
}

.invite-condition-value--accent {
  color: #f5a623;
  text-shadow: 0 0 10px rgba(245, 166, 35, 0.35);
}

.invite-event-rules {
  margin-top: 0.95rem;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(125, 211, 252, 0.28);
}

.invite-rules-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  margin-bottom: 0.55rem;
}

.invite-rules-head-deco {
  width: 1.75rem;
  height: 2px;
  border-radius: 1px;
  background: linear-gradient(90deg, transparent, rgba(147, 197, 253, 0.95));
  transform: skewX(-32deg);
  opacity: 0.95;
}

.invite-rules-head-deco--flip {
  background: linear-gradient(270deg, transparent, rgba(147, 197, 253, 0.95));
  transform: skewX(32deg);
}

.invite-rules-title {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.invite-rules-list {
  margin: 0;
  padding-left: 1rem;
}

.invite-rules-list--active {
  opacity: 1;
}

.invite-rules-list--active .invite-rules-item {
  color: #fff;
  font-weight: 600;
  opacity: 1;
}

.invite-rules-item {
  margin: 0 0 0.55rem;
  padding-left: 0.2rem;
  font-size: 0.62rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.96);
}

.invite-rules-item:last-child {
  margin-bottom: 0;
}
</style>
