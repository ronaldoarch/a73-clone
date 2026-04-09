<template>
  <div class="pds">
    <div class="pds-partners">
      <div class="pds-partners-hero">
        <div class="pds-partners-hero-main">
          <p class="pds-partners-watermark">PARTNERS</p>
          <div class="pds-partners-hero-top" aria-hidden="true" />
          <div class="pds-partners-center">
            <span class="pds-deco-line pds-deco-line--left" aria-hidden="true" />
            <div class="pds-yellow-hex">
              <img class="pds-yellow-hex-icon" src="/assets/home/download-5.png" alt="" />
            </div>
            <span class="pds-deco-line pds-deco-line--right" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div class="pds-partners-card">
        <img
          class="pds-partners-img"
          src="/assets/home/33333.jpg"
          alt=""
          loading="lazy"
        />
      </div>
    </div>

    <div v-if="!bannerClosed" class="pds-app-card">
      <div class="pds-banner">
        <img
          class="pds-banner-bg"
          src="/assets/home/download-2.png"
          alt=""
          aria-hidden="true"
        />
        <div class="pds-banner-scrim" aria-hidden="true" />
        <button type="button" class="pds-close" aria-label="Fechar" @click="closeBanner">
          ×
        </button>
        <div class="pds-banner-inner">
          <div class="pds-banner-copy">
            <h3 class="pds-banner-title">Baixar o aplicativo</h3>
            <p class="pds-banner-desc">
              Baixe e instale o aplicativo no seu desktop para uma experiência de jogo mais fluida
            </p>
          </div>
          <div class="pds-banner-santa-wrap">
            <img
              class="pds-banner-santa"
              src="/assets/home/download-3.png"
              alt=""
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div class="pds-stores">
        <div class="pds-stores-inner">
          <div class="pds-thumb-wrap" aria-hidden="true">
            <img class="pds-thumb" src="/assets/home/download-5.png" alt="" />
            <span class="pds-thumb-dot" />
          </div>
          <button type="button" class="pds-store-btn" @click="goDownload">
            <svg class="pds-icon pds-icon--android" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.3-.16-.69-.04-.85.26l-1.86 3.22c-1.44-.65-3.05-1.01-4.76-1.01-1.71 0-3.32.36-4.76 1.01L5.1 5.71c-.16-.3-.55-.42-.85-.26-.3.16-.42.54-.26.85L5.84 9.48C2.84 11.08.94 14.11.94 17.5h22.12c0-3.39-1.9-6.42-4.9-8.02zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"
              />
            </svg>
            Android
          </button>
          <button type="button" class="pds-store-btn" @click="goDownload">
            <svg class="pds-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
              />
            </svg>
            iOS
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const bannerClosed = ref(typeof sessionStorage !== 'undefined' && sessionStorage.getItem('pds_banner_closed') === '1')

function closeBanner() {
  bannerClosed.value = true
  sessionStorage.setItem('pds_banner_closed', '1')
}

function goDownload() {
  router.push('/download')
}
</script>

<style scoped>
.pds {
  margin-top: 0.65rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.55rem;
}

/* —— PARTNERS: faixa topo (marca d’água + hex amarelo + linhas) —— */
.pds-partners {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.45rem;
}

.pds-partners-hero {
  width: 100%;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
}

.pds-partners-hero-main {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 5.65rem;
  background: #12061f;
}

/* Meia superior um pouco mais clara + “V” suave */
.pds-partners-hero-top {
  position: absolute;
  inset: 0 0 35% 0;
  background: linear-gradient(180deg, #352060 0%, #2a1848 70%, transparent 100%);
  clip-path: polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%);
  pointer-events: none;
}

.pds-partners-watermark {
  position: absolute;
  top: 0.42rem;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  font-size: clamp(1.2rem, 6.2vw, 1.75rem);
  font-weight: 900;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.13);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}

.pds-partners-center {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.05rem;
  padding: 0 0.25rem;
}

.pds-deco-line {
  width: min(42vw, 7.75rem);
  height: 3px;
  flex-shrink: 0;
  border-radius: 2px;
}

/* Esquerda: sai do hex e sobe em direção à borda esquerda */
.pds-deco-line--left {
  background: linear-gradient(270deg, transparent, rgba(253, 224, 71, 0.25), rgba(217, 249, 157, 0.78));
  transform: rotate(10deg);
  transform-origin: right center;
}

/* Direita: simétrica, sobe em direção à borda direita */
.pds-deco-line--right {
  background: linear-gradient(90deg, transparent, rgba(253, 224, 71, 0.25), rgba(217, 249, 157, 0.78));
  transform: rotate(-10deg);
  transform-origin: left center;
}

.pds-yellow-hex {
  width: 2.95rem;
  height: 2.95rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: polygon(50% 2%, 93% 27%, 93% 73%, 50% 98%, 7% 73%, 7% 27%);
  background: linear-gradient(155deg, #fef9c3 0%, #facc15 42%, #ca8a04 88%, #a16207 100%);
  box-shadow:
    inset 0 0.08rem 0.12rem rgba(255, 255, 255, 0.55),
    inset 0 -0.06rem 0.1rem rgba(0, 0, 0, 0.12),
    0 3px 10px rgba(0, 0, 0, 0.35);
}

.pds-yellow-hex-icon {
  width: 1.72rem;
  height: 1.72rem;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.pds-partners-card {
  width: 100%;
  padding: 0.5rem 0.4rem 0.6rem;
  border-radius: 0.55rem;
  border: 1px solid rgba(0, 0, 0, 0.35);
  overflow: hidden;
  background-color: rgba(18, 6, 31, 0.92);
  background-image:
    linear-gradient(
      125deg,
      transparent 55%,
      rgba(124, 58, 237, 0.12) 72%,
      rgba(167, 139, 250, 0.18) 88%,
      transparent 100%
    ),
    repeating-linear-gradient(
      -19deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.028) 10px,
      rgba(255, 255, 255, 0.028) 11px
    ),
    repeating-linear-gradient(
      19deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.022) 10px,
      rgba(255, 255, 255, 0.022) 11px
    );
}

.pds-partners-img {
  display: block;
  width: 100%;
  max-width: 21rem;
  height: auto;
  margin: 0 auto;
  object-fit: contain;
  object-position: center;
}

/* —— Cartão app: fundo download-2 + Papai Noel download-3 + botões —— */
.pds-app-card {
  border-radius: 0.55rem;
  overflow: visible;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.pds-banner {
  position: relative;
  overflow: visible;
  min-height: 5.85rem;
  padding-bottom: 1.1rem;
  background: #3a1b5c;
  border-radius: 0.55rem 0.55rem 0 0;
}

.pds-banner-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: 0;
}

/* Contraste à esquerda para o texto sobre download-2 */
.pds-banner-scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgba(18, 6, 31, 0.78) 0%,
    rgba(18, 6, 31, 0.35) 42%,
    rgba(18, 6, 31, 0.06) 62%,
    transparent 82%
  );
}

.pds-close {
  position: absolute;
  top: 0.28rem;
  right: 0.4rem;
  z-index: 5;
  width: 1.55rem;
  height: 1.55rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(234, 88, 12, 0.85);
  color: #fff;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
}

.pds-close:hover {
  background: rgba(251, 146, 60, 0.95);
}

.pds-banner-inner {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.2rem;
  padding: 0.55rem 0.85rem 0.35rem 0.65rem;
  padding-right: 0.35rem;
  min-height: 5.85rem;
  overflow: visible;
}

.pds-banner-copy {
  flex: 1;
  min-width: 0;
  max-width: 50%;
  align-self: center;
  padding: 0.1rem 0.15rem 0.85rem 0;
}

.pds-banner-santa-wrap {
  flex: 0 0 auto;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  width: 50%;
  max-width: 11.5rem;
  margin-bottom: -1.35rem;
  position: relative;
  z-index: 2;
  pointer-events: none;
}

.pds-banner-santa {
  display: block;
  width: auto;
  max-width: none;
  height: clamp(7.25rem, 38vw, 9.25rem);
  object-fit: contain;
  object-position: right bottom;
  filter: drop-shadow(0 3px 14px rgba(0, 0, 0, 0.4));
}

.pds-banner-title {
  margin: 0 0 0.25rem;
  font-size: 0.8rem;
  font-weight: 800;
  line-height: 1.2;
  color: #fff;
  text-shadow:
    0 0 12px rgba(0, 0, 0, 0.65),
    0 1px 3px rgba(0, 0, 0, 0.9);
}

.pds-banner-desc {
  margin: 0;
  font-size: 0.6rem;
  font-weight: 500;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.98);
  text-shadow:
    0 0 10px rgba(0, 0, 0, 0.6),
    0 1px 2px rgba(0, 0, 0, 0.85);
}

/* —— Joinha + botões (faixa roxa do mesmo cartão) —— */
.pds-app-card .pds-stores {
  position: relative;
  z-index: 4;
  background: #12061f;
  border-top: 1px solid rgba(0, 0, 0, 0.35);
  border-radius: 0 0 0.55rem 0.55rem;
}

.pds-stores {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 0.55rem 0.45rem 0.55rem;
  margin: 0;
}

.pds-stores-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.pds-thumb-wrap {
  position: relative;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pds-thumb {
  display: block;
  width: 2rem;
  height: 2rem;
  object-fit: contain;
}

.pds-thumb-dot {
  position: absolute;
  top: -0.05rem;
  right: -0.05rem;
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 50%;
  background: #ef4444;
  border: 2px solid #1a0b2e;
  box-sizing: content-box;
}

.pds-store-btn {
  flex: 0 1 auto;
  min-width: 6.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(167, 139, 250, 0.55);
  background: rgba(40, 15, 75, 0.9);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.pds-store-btn:active {
  transform: scale(0.98);
}

.pds-icon {
  width: 1.05rem;
  height: 1.05rem;
  flex-shrink: 0;
}

.pds-icon--android {
  color: #3ddc84;
}
</style>
