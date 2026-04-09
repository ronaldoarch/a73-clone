<template>
  <section class="profit-ranking" aria-labelledby="profit-ranking-title">
    <div class="pr-header">
      <div class="pr-hex">
        <img
          class="pr-trophy"
          src="/assets/ranking/ranking-top-icon-36-B4d1dsRL.png"
          width="36"
          height="36"
          alt=""
        />
      </div>
      <h2 id="profit-ranking-title" class="pr-title">★ Ranking de Lucro ★</h2>
    </div>

    <div class="pr-podium" role="list">
      <div
        v-for="slot in podiumSlots"
        :key="slot.rank"
        class="pr-slot"
        :class="`pr-slot--${slot.rank}`"
        role="listitem"
        :aria-label="`${slot.rank}º lugar`"
      >
        <div class="pr-slot-inner">
          <div
            class="pr-podium-art"
            :class="`pr-podium-art--r${slot.rank}`"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>

    <div class="pr-table-wrap">
      <div class="pr-table-head">
        <span>Posição</span>
        <span>Membro</span>
        <span>Quantia</span>
      </div>
      <p v-if="rankingLoading" class="pr-table-status">Carregando ranking…</p>
      <p v-else-if="!tableRows.length" class="pr-table-status">Nenhum dado no ranking ainda.</p>
      <template v-else>
        <div
          v-for="row in tableRows"
          :key="row.pos"
          class="pr-table-row"
        >
          <span class="pr-col-pos">{{ String(row.pos).padStart(2, '0') }}</span>
          <div class="pr-col-member">
            <span class="pr-row-avatar" :style="{ background: row.avatarBg }" aria-hidden="true" />
            <span>{{ row.member }}</span>
          </div>
          <span class="pr-col-amount">{{ row.amount }}</span>
        </div>
      </template>
    </div>

    <div class="pr-strip-carousel" aria-hidden="true">
      <div class="pr-strip-track">
        <img class="pr-strip-img" src="/assets/ranking/download.jpg" alt="" />
        <img class="pr-strip-img" src="/assets/ranking/download.jpg" alt="" />
      </div>
    </div>

    <PartnersDownloadStrip />
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import PartnersDownloadStrip from './PartnersDownloadStrip.vue'

/** Ordem no pódio: 2º | 1º | 3º — cada rank usa a coluna correspondente do spritesheet */
const podiumSlots = [{ rank: 2 }, { rank: 1 }, { rank: 3 }]

const rankingLoading = ref(true)
const tableRows = ref([])

function avatarGradient(seed) {
  let h = 0
  const s = String(seed || '')
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0
  const hue1 = h % 360
  const hue2 = (hue1 + 42) % 360
  return `linear-gradient(145deg, hsl(${hue1} 68% 58%), hsl(${hue2} 72% 38%))`
}

async function loadRanking() {
  rankingLoading.value = true
  try {
    const res = await fetch('/api/ranking?limit=20')
    const data = await res.json().catch(() => ({}))
    const list = Array.isArray(data.list) ? data.list : []
    tableRows.value = list.map((row) => ({
      pos: row.pos,
      member: row.user ?? '****',
      amount: row.amount ?? '0,00',
      avatarBg: avatarGradient(row.user || String(row.pos)),
    }))
  } catch {
    tableRows.value = []
  } finally {
    rankingLoading.value = false
  }
}

onMounted(loadRanking)
</script>

<style scoped>
.profit-ranking {
  margin: 1rem 0 0.5rem;
  padding: 1rem 0.65rem 1.2rem;
  border-radius: 0.75rem;
  background-color: var(--color-home-lower-bg, #200943);
  background-image:
    radial-gradient(ellipse 120% 80% at 50% -20%, rgba(139, 92, 246, 0.22), transparent 55%),
    repeating-linear-gradient(
      -19deg,
      transparent,
      transparent 11px,
      rgba(255, 255, 255, 0.025) 11px,
      rgba(255, 255, 255, 0.025) 12px
    ),
    repeating-linear-gradient(
      19deg,
      transparent,
      transparent 11px,
      rgba(255, 255, 255, 0.02) 11px,
      rgba(255, 255, 255, 0.02) 12px
    );
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.pr-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.85rem;
}

.pr-hex {
  width: 2.75rem;
  height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: polygon(50% 2%, 93% 27%, 93% 73%, 50% 98%, 7% 73%, 7% 27%);
  background: linear-gradient(145deg, #fff6d8, #e8c85a 40%, #a67418 85%, #4a3208);
  box-shadow: inset 0 0.06rem 0.1rem rgba(255, 255, 255, 0.35);
}

.pr-trophy {
  width: 2.25rem;
  height: 2.25rem;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
}

.pr-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  color: #f5d54a;
  text-shadow:
    0 0 12px rgba(245, 213, 74, 0.35),
    0 1px 2px rgba(0, 0, 0, 0.5);
  text-align: center;
}

/* Pódio: 2º | 1º | 3º */
.pr-podium {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  gap: 0.35rem;
  margin-bottom: 1rem;
  padding: 0 0.15rem;
}

.pr-slot {
  flex: 1;
  min-width: 0;
  max-width: 6.75rem;
}

.pr-slot--1 {
  order: 2;
  transform: scale(1.05);
  z-index: 2;
}

.pr-slot--2 {
  order: 1;
  transform: translateY(2rem);
}

.pr-slot--3 {
  order: 3;
  transform: translateY(2rem);
}

.pr-slot-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Arte única: ranking-avatar-border-25 (3 colunas no arquivo) */
.pr-podium-art {
  width: 100%;
  max-width: 6.75rem;
  margin: 0 auto;
  aspect-ratio: 31 / 100;
  background-image: url('/assets/ranking/ranking-avatar-border-25-BLNRyXyc.png');
  background-repeat: no-repeat;
  background-size: 300% auto;
  filter: drop-shadow(0 3px 10px rgba(0, 0, 0, 0.4));
}

.pr-podium-art--r1 {
  background-position: 0% top;
}

.pr-podium-art--r2 {
  background-position: 50% top;
}

.pr-podium-art--r3 {
  background-position: 100% top;
}

/* Tabela */
.pr-table-wrap {
  border-radius: 0.5rem;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.pr-table-head,
.pr-table-row {
  display: grid;
  grid-template-columns: 3.25rem 1fr auto;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.5rem;
}

.pr-table-head {
  font-size: 0.65rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.45);
  text-transform: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.pr-table-status {
  margin: 0;
  padding: 0.65rem 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.pr-table-row {
  font-size: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.pr-table-row:last-child {
  border-bottom: none;
}

.pr-col-pos {
  font-weight: 800;
  color: #f5d54a;
  font-variant-numeric: tabular-nums;
}

.pr-col-member {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.pr-row-avatar {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.pr-col-amount {
  font-weight: 800;
  color: #fff;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/*
 * Faixa de provedores — carrossel em loop.
 * Faixas horizontais muito largas ficavam minúsculas com width:100% + contain;
 * aqui a altura manda e a largura segue o aspect ratio (width: auto).
 */
.pr-strip-carousel {
  overflow: hidden;
  width: calc(100% + 1.3rem);
  max-width: none;
  margin: 0.85rem -0.65rem 0;
  padding: 0.25rem 0;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.15);
}

.pr-strip-track {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  width: max-content;
  animation: pr-strip-marquee 28s linear infinite;
}

.pr-strip-img {
  display: block;
  flex-shrink: 0;
  height: clamp(3rem, 15vw, 5.5rem);
  width: auto;
  max-width: none;
}

@keyframes pr-strip-marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pr-strip-track {
    animation: none;
    width: 100%;
    max-width: 100%;
  }

  .pr-strip-img {
    width: 100%;
    height: auto;
    max-height: clamp(2.85rem, 14vw, 5rem);
    object-fit: contain;
  }

  .pr-strip-img:last-child {
    display: none;
  }
}
</style>
