<template>
  <div class="vip-page">
    <header class="vip-topbar">
      <button type="button" class="vip-icon-btn" aria-label="Voltar" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <h1 class="vip-topbar-title">VIP</h1>
      <button type="button" class="vip-icon-btn" aria-label="Registro" @click="claimRecordHandle">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
      </button>
    </header>

    <div
      class="vip-card"
      :style="vipCardSurfaceStyle"
    >
      <div class="vip-card-inner">
        <div class="vip-card-head">
          <div class="vip-identity-block">
            <span class="vip-ribbon" aria-hidden="true">Nível Atual</span>
            <div class="vip-badge-row">
              <div class="vip-level-chip">
                <div class="vip-coin-wrap">
                  <img
                    v-if="medalOk"
                    class="vip-coin-img"
                    :src="vipMedalSrc"
                    alt=""
                    @error="medalOk = false"
                  />
                  <div v-else class="vip-coin-fallback" aria-hidden="true">
                    <svg class="vip-coin-svg" viewBox="0 0 64 64" fill="none">
                      <circle cx="32" cy="32" r="28" fill="url(#vipCoinBg)" stroke="#9ca3af" stroke-width="1.5" />
                      <path
                        fill="#6b7280"
                        d="M32 20l3.5 7 8-4.5-2.5 8.5H23l-2.5-8.5 8 4.5L32 20zm-7 18h14v3.5H25V38z"
                      />
                      <defs>
                        <radialGradient id="vipCoinBg" cx="35%" cy="35%" r="65%">
                          <stop offset="0%" stop-color="#f9fafb" />
                          <stop offset="55%" stop-color="#d1d5db" />
                          <stop offset="100%" stop-color="#6b7280" />
                        </radialGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div class="vip-pill">
                  <span class="vip-pill-text">VIP {{ vipLevelInfo.curVipLevel }}</span>
                </div>
              </div>
              <span class="vip-identity-label">Nível Atual</span>
            </div>
          </div>
          <button
            type="button"
            class="vip-collect-all"
            :class="{ 'vip-collect-all--on': claimBtnIsEnable }"
            :disabled="!claimBtnIsEnable"
            @click="bathReceiveHandle"
          >
            Coletar Tudo
          </button>
        </div>

        <div class="vip-progress-block">
          <div class="vip-progress-track">
            <div class="vip-progress-fill" :style="{ width: progressPercent + '%' }" />
            <div
              v-if="progressPercent > 2 && progressPercent < 98 && vipLevelInfo.nextVipLevel"
              class="vip-progress-knob"
              :style="{ left: progressPercent + '%' }"
            />
          </div>
          <div class="vip-progress-labels">
            <span class="vip-pl-left">VIP {{ vipLevelInfo.curVipLevel }}</span>
            <template v-if="vipLevelInfo.nextVipLevel">
              <div class="vip-pl-next">
                <span class="vip-shield" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V7l7-4z"
                      fill="url(#vipSh)"
                      stroke="#d1d5db"
                      stroke-width="1"
                    />
                    <defs>
                      <linearGradient id="vipSh" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#e5e7eb" />
                        <stop offset="100%" stop-color="#9ca3af" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <span>VIP {{ vipLevelInfo.nextVipLevel }}</span>
              </div>
            </template>
            <span v-else class="vip-pl-max">Nível Máximo</span>
          </div>
        </div>

        <div v-if="vipLevelInfo.nextVipLevel" class="vip-criteria">
          <p class="vip-criteria-title">Critérios de Promoção</p>
          <p v-if="Number(vipLevelInfo.rechargeRequirements) > 0" class="vip-criteria-line">
            <span class="vip-crit-bullet">•</span>
            Recarga necessária:
            <span class="vip-crit-accent">{{ merchantCy }} {{ formatAmount(vipLevelInfo.curRechargeAmount) }}</span>
            <span class="vip-crit-paren">
              ({{ formatAmount(vipLevelInfo.curRechargeAmount) }}/{{ formatAmount(vipLevelInfo.rechargeRequirements) }})
            </span>
          </p>
          <p v-if="Number(vipLevelInfo.betRequirements) > 0" class="vip-criteria-line">
            <span class="vip-crit-bullet">•</span>
            Aposta necessária:
            <span class="vip-crit-accent">{{ merchantCy }} {{ formatAmount(vipLevelInfo.curBetAmount) }}</span>
            <span class="vip-crit-paren">
              ({{ formatAmount(vipLevelInfo.curBetAmount) }}/{{ formatAmount(vipLevelInfo.betRequirements) }})
            </span>
          </p>
        </div>
        <p v-else class="vip-max-msg">Parabéns! Você atingiu o nível máximo VIP!</p>
      </div>
    </div>

    <h2 class="vip-section-title">Lista de níveis VIP</h2>

    <div class="tab-bar">
      <button
        v-for="tab in pageList"
        :key="tab.value"
        v-show="tab.isEnable"
        type="button"
        :class="['tab-btn', { active: curShowPage === tab.value }]"
        @click="curShowPage = tab.value"
      >
        {{ tab.title }}
        <span v-if="vipReceiveList.includes(tab.value)" class="tab-dot" />
      </button>
    </div>

    <template v-if="curShowPage !== 'LEVEL'">
      <div class="table-head">
        <span v-for="title in curPageTitles" :key="title" class="head-cell">{{ title }}</span>
      </div>

      <div class="vip-table">
        <div
          v-for="(row, idx) in curPageData"
          :key="row.level"
          class="table-row"
          :class="{ even: idx % 2 === 0, current: row.level === vipLevelInfo.curVipLevel }"
        >
          <div class="row-level">
            <template v-if="!vipRowIconFailed[row.level]">
              <img
                class="row-level-coin"
                :src="vipStore.getVipIconPath(row.level)"
                alt=""
                @error="markVipRowIconFailed(row.level)"
              />
            </template>
            <div v-else class="row-badge" :style="{ background: getLevelColor(row.level) }">
              <span>V{{ row.level }}</span>
            </div>
            <span class="row-level-num">VIP {{ row.level }}</span>
          </div>
          <div v-if="ifShowDeposit" class="row-cell">
            <span class="cell-val">{{ formatAmount(row.rechargeRequirement) }}</span>
            <template v-if="row.showRechargeProgress">
              <div class="cell-progress">
                <div
                  class="cp-fill"
                  :style="{
                    width:
                      Math.min(
                        100,
                        (row.rechargeRequirement
                          ? (vipLevelInfo.curRechargeAmount / row.rechargeRequirement) * 100
                          : 0)
                      ) + '%'
                  }"
                />
              </div>
              <span class="cell-sub">
                {{ formatAmount(vipLevelInfo.curRechargeAmount) }}/{{ formatAmount(row.rechargeRequirement) }}
              </span>
            </template>
          </div>
          <div v-if="ifShowBet" class="row-cell">
            <span class="cell-val">{{ formatAmount(row.betRequirement) }}</span>
            <template v-if="row.showBetProgress">
              <div class="cell-progress">
                <div
                  class="cp-fill"
                  :style="{
                    width:
                      Math.min(
                        100,
                        (row.betRequirement ? (vipLevelInfo.curBetAmount / row.betRequirement) * 100 : 0)
                      ) + '%'
                  }"
                />
              </div>
              <span class="cell-sub">
                {{ formatAmount(vipLevelInfo.curBetAmount) }}/{{ formatAmount(row.betRequirement) }}
              </span>
            </template>
          </div>
          <div class="row-cell reward-cell">
            <span>{{ formatAmount(row.reward || 0) }}</span>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="retention-section">
        <div class="retention-rules">
          <h4>Manutenção de Nível</h4>
          <p>Para manter seu nível VIP, é necessário atingir as condições de manutenção dentro do período de avaliação.</p>
          <p>Se as condições não forem atendidas, o nível será rebaixado gradualmente.</p>
          <p>O período de avaliação é de 30 dias.</p>
        </div>

        <div v-if="retentionLevel.length" class="retention-table">
          <div class="ret-head">
            <span>Nível</span>
            <span>Recarga Mín.</span>
            <span>Aposta Mín.</span>
          </div>
          <div v-for="row in retentionLevel" :key="row.level" class="ret-row">
            <span class="ret-level-cell">
              <template v-if="!retRowIconFailed[row.level]">
                <img
                  class="ret-level-coin"
                  :src="vipStore.getVipIconPath(row.level)"
                  alt=""
                  @error="markRetRowIconFailed(row.level)"
                />
              </template>
              <span v-else class="ret-badge" :style="{ background: getLevelColor(row.level) }">{{ row.level }}</span>
            </span>
            <span>{{ formatAmount(row.retentionRecharge) }}</span>
            <span>{{ formatAmount(row.retentionBet) }}</span>
          </div>
        </div>
      </div>
    </template>

    <div class="vip-rules">
      <h4 class="vip-rules-title">Instruções sobre regras VIP</h4>
      <div class="vip-rules-scroll">
        <section class="vip-rules-section">
          <h5 class="vip-rules-h">Padrão da promoção</h5>
          <p class="vip-rules-p">
            Ao cumprir os requisitos de recarga ou de apostas válidas, você pode avançar de nível VIP e receber os
            bônus de promoção correspondentes. Os bônus podem ser recebidos periodicamente.
          </p>
        </section>
        <section v-if="pageStatus.DAILY" class="vip-rules-section">
          <h5 class="vip-rules-h">Bônus diário</h5>
          <p class="vip-rules-p">
            Para receber, é necessário atingir diariamente os requisitos de depósito e de apostas válidas do seu nível
            atual. Se vários níveis forem alcançados em sequência, apenas o bônus do nível atual é obtido. Os bônus em
            tempo real podem ser reclamados conforme disponibilidade.
          </p>
        </section>
        <section v-if="pageStatus.WEEKLY" class="vip-rules-section">
          <h5 class="vip-rules-h">Bônus semanal</h5>
          <p class="vip-rules-p">
            Mesma lógica do bônus diário, avaliada no período semanal, com requisitos de depósito e apostas válidas do
            nível atual.
          </p>
        </section>
        <section v-if="pageStatus.MONTHLY" class="vip-rules-section">
          <h5 class="vip-rules-h">Bônus mensal</h5>
          <p class="vip-rules-p">
            Mesma lógica do bônus diário, avaliada no período mensal, com requisitos de depósito e apostas válidas do
            nível atual.
          </p>
        </section>
        <section class="vip-rules-section">
          <h5 class="vip-rules-h">Tempo de expiração da recompensa</h5>
          <p class="vip-rules-p">
            As recompensas devem ser reclamadas manualmente. Bônus não reclamados após o prazo são invalidados
            imediatamente.
          </p>
        </section>
        <section class="vip-rules-section">
          <h5 class="vip-rules-h">Instruções para auditoria</h5>
          <p class="vip-rules-p">
            Os bônus VIP só podem ser sacados após cumprir requisito de rollover de
            <strong>1x</strong> em apostas válidas. As apostas válidas para este fim ficam restritas aos provedores de
            slots:
            <span class="vip-rules-providers">
              PG, JDB, PP, CP, FaChai, POPOK, PLAYSON, RUBYPLAY, inout, PANDA, Spribe, FASTSPIN, Tada, G759, TOPPLAYER.
            </span>
          </p>
        </section>
        <section class="vip-rules-section">
          <h5 class="vip-rules-h">Declaração de atividade</h5>
          <p class="vip-rules-p">
            Esta funcionalidade destina-se ao uso normal da conta pelo titular. É proibido aluguel de conta, apostas sem
            risco (arbitragem, cross-betting, apostas de baixa probabilidade), arbitragem maliciosa, uso de robôs ou
            softwares, ou exploração de falhas. A plataforma reserva-se o direito de banir contas e confiscar bônus e
            ganhos em caso de violação.
          </p>
        </section>
        <section class="vip-rules-section">
          <h5 class="vip-rules-h">Explicação</h5>
          <p class="vip-rules-p">
            Ao receber recompensas VIP, você declara concordar com todas as condições acima. A plataforma reserva-se o
            direito de interpretação final desta atividade.
          </p>
        </section>
      </div>
      <button
        type="button"
        class="vip-rules-upgrade-btn"
        :class="{ 'vip-rules-upgrade-btn--on': claimBtnIsEnable }"
        :disabled="!claimBtnIsEnable"
        @click="bathReceiveHandle"
      >
        Reclamar recompensa de upgrade
      </button>
    </div>

    <div v-if="showReceiveBtn" class="bottom-bar">
      <button
        type="button"
        class="receive-btn"
        :class="{ enabled: receiveBtnIsEnable }"
        :disabled="!receiveBtnIsEnable"
        @click="receiveHandle"
      >
        {{ receiveBtnIsEnable ? `Coletar ${curShowPage}` : 'Sem bônus disponível' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useVip } from '../composables/useVip'
import { useVipStore } from '../stores/vip'

const vipStore = useVipStore()
const medalOk = ref(true)
const vipRowIconFailed = ref({})
const retRowIconFailed = ref({})

function markVipRowIconFailed(level) {
  vipRowIconFailed.value = { ...vipRowIconFailed.value, [level]: true }
}
function markRetRowIconFailed(level) {
  retRowIconFailed.value = { ...retRowIconFailed.value, [level]: true }
}

const {
  vipLevelInfo,
  curShowPage,
  claimBtnIsEnable,
  showReceiveBtn,
  receiveBtnIsEnable,
  ifShowDeposit,
  ifShowBet,
  pageStatus,
  vipReceiveList,
  pageList,
  curPageTitles,
  curPageData,
  retentionLevel,
  merchantCy,
  bathReceiveHandle,
  receiveHandle,
  claimRecordHandle,
  formatAmount
} = useVip()

const progressPercent = computed(() => {
  const fp = vipLevelInfo.firstLevelProgress
  if (fp != null && !Number.isNaN(fp)) {
    return Math.min(100, Math.max(0, fp * 100))
  }
  const r = vipLevelInfo.rechargeRequirements || 0
  const b = vipLevelInfo.betRequirements || 0
  const rechargeP = r ? vipLevelInfo.curRechargeAmount / r : 0
  const betP = b ? vipLevelInfo.curBetAmount / b : 0
  return Math.min(100, ((rechargeP + betP) / 2) * 100)
})

const vipMedalSrc = computed(() => vipStore.getVipIconPath(vipLevelInfo.curVipLevel))

watch(vipMedalSrc, () => {
  medalOk.value = true
})

const vipCardSurfaceStyle = computed(() => {
  const bgUrl = vipStore.getVipBgPath(vipLevelInfo.curVipLevel)
  return {
    backgroundImage: `url(${bgUrl})`,
    backgroundSize: '100% auto',
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat'
  }
})

const levelColors = [
  '#6b7280', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#14b8a6', '#a855f7',
  '#dc2626', '#fbbf24'
]
function getLevelColor(level) {
  return levelColors[level] || levelColors[0]
}
</script>

<style scoped>
.vip-page {
  min-height: 100vh;
  padding: 0 0 6.5rem;
  background: #0c0a12;
  color: #fff;
}

/* ── Cabeçalho roxo (original) ── */
.vip-topbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem;
  padding: 0.65rem 0.75rem;
  background: linear-gradient(180deg, #4a1f7a 0%, #321056 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.vip-topbar-title {
  flex: 1;
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-align: center;
  color: #fff;
}

.vip-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.35rem;
  height: 2.35rem;
  padding: 0;
  border: none;
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
  cursor: pointer;
}

.vip-icon-btn:last-child {
  color: #fde047;
}

.vip-icon-btn:active {
  transform: scale(0.96);
}

/* ── Cartão principal = arte levelBg (formato “degrau” no topo) ── */
.vip-card {
  margin: 0 0.75rem 1.25rem;
  padding: 0;
  border-radius: 0;
  background: none;
  box-shadow: none;
  overflow: visible;
  filter: drop-shadow(0 10px 28px rgba(0, 0, 0, 0.55));
}

.vip-card-inner {
  padding: 0.85rem 0.95rem 1.15rem;
  background: transparent;
  overflow: visible;
  /* contraste do texto sobre o PNG */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.75);
}

.vip-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.vip-identity-block {
  position: relative;
  padding-top: 0.35rem;
}

.vip-ribbon {
  position: absolute;
  top: -0.15rem;
  left: -0.25rem;
  z-index: 2;
  padding: 0.15rem 0.45rem;
  border-radius: 0.2rem;
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #fff;
  background: linear-gradient(180deg, #f87171 0%, #dc2626 100%);
  box-shadow: 0 2px 6px rgba(220, 38, 38, 0.45);
}

.vip-badge-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding-top: 0.5rem;
  flex-wrap: wrap;
}

/* Moeda sobreposta à pílula “VIP N” (layout original) */
.vip-level-chip {
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.vip-coin-wrap {
  position: relative;
  z-index: 2;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  margin-right: -1.42rem;
}

.vip-coin-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.5));
}

.vip-coin-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vip-coin-svg {
  width: 100%;
  height: 100%;
}

.vip-pill {
  padding: 0.42rem 0.95rem 0.42rem 1.75rem;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    #d1d5db 0%,
    #e5e7eb 12%,
    #6b7280 42%,
    #3f3f46 88%,
    #27272a 100%
  );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    0 2px 8px rgba(0, 0, 0, 0.35);
}

.vip-pill-text {
  font-size: 0.8rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.06em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  white-space: nowrap;
}

.vip-identity-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.42);
}

.vip-collect-all {
  flex-shrink: 0;
  margin-top: 0.25rem;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 800;
  border: 1px solid rgba(167, 139, 250, 0.55);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.35);
  cursor: not-allowed;
}

.vip-collect-all--on {
  border-color: transparent;
  background: linear-gradient(135deg, #d4ff3f, #a3e635);
  color: #1a1e2e;
  cursor: pointer;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.2);
}

.vip-collect-all--on:active {
  transform: scale(0.98);
}

/* Progresso */
.vip-progress-block {
  margin-bottom: 1rem;
}

.vip-progress-track {
  position: relative;
  height: 0.45rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: visible;
}

.vip-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #a1a1aa, #e5e7eb 40%, #fbbf24);
  transition: width 0.45s ease;
}

.vip-progress-knob {
  position: absolute;
  top: 50%;
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 50%;
  background: linear-gradient(180deg, #fff 0%, #d1d5db 100%);
  border: 2px solid #fbbf24;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

.vip-progress-labels {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.45rem;
  font-size: 0.65rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
}

.vip-pl-next {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.85);
}

.vip-shield {
  display: flex;
  align-items: center;
}

.vip-pl-max {
  color: #facc15;
  font-weight: 800;
}

/* Critérios */
.vip-criteria {
  font-size: 0.68rem;
  line-height: 1.45;
  padding-top: 0.35rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.vip-criteria-title {
  margin: 0 0 0.4rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
}

.vip-criteria-line {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.75);
}

.vip-crit-bullet {
  margin-right: 0.2rem;
  color: rgba(255, 255, 255, 0.4);
}

.vip-crit-accent {
  font-weight: 800;
  color: #fb923c;
  margin: 0 0.15rem;
}

.vip-crit-paren {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.62rem;
}

.vip-max-msg {
  margin: 0.5rem 0 0;
  font-size: 0.78rem;
  font-weight: 700;
  text-align: center;
  color: #facc15;
  line-height: 1.4;
}

/* Lista */
.vip-section-title {
  margin: 0 0.75rem 0.75rem;
  font-size: 1rem;
  font-weight: 800;
  color: #fff;
}

.tab-bar {
  display: flex;
  gap: 0.35rem;
  margin: 0 0.75rem 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
  -webkit-overflow-scrolling: touch;
}

.tab-btn {
  position: relative;
  padding: 0.45rem 0.95rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.tab-btn.active {
  background: linear-gradient(135deg, #6d28d9, #7c3aed);
  color: #fff;
  border-color: transparent;
}

.tab-dot {
  position: absolute;
  top: 0.2rem;
  right: 0.25rem;
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 50%;
  background: #ef4444;
}

.table-head {
  display: grid;
  grid-template-columns: 3rem repeat(3, 1fr);
  margin: 0 0.75rem;
  padding: 0.55rem 0.65rem;
  font-size: 0.62rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 0.65rem 0.65rem 0 0;
  text-align: center;
}

.head-cell {
  white-space: nowrap;
}

.vip-table {
  margin: 0 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0 0 0.65rem 0.65rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-top: none;
}

.table-row {
  display: grid;
  grid-template-columns: 3rem repeat(3, 1fr);
  padding: 0.55rem 0.65rem;
  font-size: 0.62rem;
  text-align: center;
  align-items: center;
  color: rgba(255, 255, 255, 0.72);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.table-row.even {
  background: rgba(255, 255, 255, 0.02);
}

.table-row.current {
  background: rgba(124, 58, 237, 0.15);
}

.row-level {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.12rem;
  min-width: 0;
}

.row-level-coin {
  width: 2.35rem;
  height: 2.35rem;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.45));
}

.row-level-num {
  font-size: 0.48rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1;
  white-space: nowrap;
}

.row-badge {
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  font-weight: 800;
  color: #fff;
}

.row-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}

.cell-val {
  font-size: 0.62rem;
}

.cell-progress {
  width: 80%;
  height: 0.2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.cp-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #16a34a);
  border-radius: 2px;
}

.cell-sub {
  font-size: 0.55rem;
  color: rgba(255, 255, 255, 0.35);
}

.reward-cell span {
  color: #fbbf24;
  font-weight: 800;
}

.retention-section {
  margin: 0 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.retention-rules {
  margin-bottom: 1rem;
}

.retention-rules h4 {
  font-size: 0.85rem;
  font-weight: 800;
  margin: 0 0 0.5rem;
}

.retention-rules p {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.55;
  margin: 0.25rem 0;
}

.retention-table {
  overflow: hidden;
  border-radius: 0.5rem;
}

.ret-head {
  display: grid;
  grid-template-columns: 3rem 1fr 1fr;
  padding: 0.5rem 0.65rem;
  font-size: 0.6rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.06);
  text-align: center;
}

.ret-row {
  display: grid;
  grid-template-columns: 3rem 1fr 1fr;
  padding: 0.5rem 0.65rem;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.ret-level-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ret-level-coin {
  width: 1.85rem;
  height: 1.85rem;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
}

.ret-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  font-size: 0.55rem;
  font-weight: 800;
  color: #fff;
}

.vip-rules {
  margin: 0 0.75rem calc(1rem + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(180deg, #4a1f6f 0%, #3a1858 100%);
  border-radius: 0.75rem;
  padding: 1rem 0.95rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.vip-rules-title {
  font-size: 0.92rem;
  font-weight: 800;
  margin: 0 0 0.75rem;
  color: #fff;
  letter-spacing: 0.02em;
}

.vip-rules-scroll {
  max-height: min(52vh, 28rem);
  overflow-y: auto;
  padding-right: 0.25rem;
  margin-bottom: 1rem;
  -webkit-overflow-scrolling: touch;
}

.vip-rules-scroll::-webkit-scrollbar {
  width: 4px;
}

.vip-rules-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.vip-rules-section {
  margin-bottom: 0.85rem;
}

.vip-rules-section:last-of-type {
  margin-bottom: 0;
}

.vip-rules-h {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.92);
}

.vip-rules-p {
  margin: 0;
  font-size: 0.65rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.72);
}

.vip-rules-p strong {
  color: #fde68a;
  font-weight: 800;
}

.vip-rules-providers {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.62rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.45;
}

.vip-rules-upgrade-btn {
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.78rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.45);
  background: rgba(0, 0, 0, 0.25);
  cursor: not-allowed;
  transition: background 0.2s, color 0.2s, transform 0.15s;
}

.vip-rules-upgrade-btn--on {
  background: linear-gradient(180deg, #8f9e3a 0%, #6b7a2e 100%);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.2);
}

.vip-rules-upgrade-btn--on:active {
  transform: scale(0.99);
}

.vip-rules-upgrade-btn:disabled {
  opacity: 0.85;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.65rem 0.85rem;
  padding-bottom: max(0.65rem, env(safe-area-inset-bottom));
  background: rgba(12, 10, 18, 0.94);
  backdrop-filter: blur(10px);
  z-index: 100;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.receive-btn {
  width: 100%;
  padding: 0.85rem;
  border-radius: 0.65rem;
  font-size: 0.9rem;
  font-weight: 800;
  border: none;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.35);
}

.receive-btn.enabled {
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  color: #fff;
  cursor: pointer;
}

.receive-btn:disabled {
  cursor: not-allowed;
}
</style>
