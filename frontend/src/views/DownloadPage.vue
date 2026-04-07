<template>
  <div class="download-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>Baixar APP</h2>
    </div>

    <div class="hero-banner">
      <img src="/assets/download/download-4.png" alt="A73 - O melhor app de jogos" class="hero-img" />
      <div class="hero-overlay">
        <img src="/assets/download/download.png" alt="A73" class="hero-app-icon" />
        <div class="hero-text">
          <h1>A73.COM</h1>
          <p>O melhor app de jogos do Brasil</p>
        </div>
      </div>
    </div>

    <div class="app-showcase">
      <div class="app-rating">
        <span class="stars">⭐⭐⭐⭐⭐</span>
        <span class="rating-text">4.8 (12.5k avaliações)</span>
      </div>
      <p class="app-desc">Slots, ao vivo, esportes e mais! Jogue onde e quando quiser.</p>
    </div>

    <div class="download-options">
      <button class="dl-btn android" @click="downloadAPK">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.3-.16-.69-.04-.85.26l-1.86 3.22c-1.44-.65-3.05-1.01-4.76-1.01-1.71 0-3.32.36-4.76 1.01L5.1 5.71c-.16-.3-.55-.42-.85-.26-.3.16-.42.54-.26.85L5.84 9.48C2.84 11.08.94 14.11.94 17.5h22.12c0-3.39-1.9-6.42-4.9-8.02zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/>
        </svg>
        Baixar para Android
      </button>

      <button class="dl-btn pwa" @click="installPWA">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
        Instalar PWA
      </button>
    </div>

    <div class="promo-banner">
      <img src="/assets/ui/banner-promo.jpg" alt="Promoção A73" class="promo-img" />
    </div>

    <div class="features-list">
      <h3>Recursos</h3>
      <div class="feature-item" v-for="f in features" :key="f.title">
        <span class="feat-icon">{{ f.icon }}</span>
        <div class="feat-info">
          <h4>{{ f.title }}</h4>
          <p>{{ f.desc }}</p>
        </div>
      </div>
    </div>

    <div class="install-guide">
      <h3>Como instalar o PWA</h3>
      <div class="guide-steps">
        <div class="guide-step" v-for="(step, i) in guideSteps" :key="i">
          <div class="step-header">
            <span class="step-num">{{ i + 1 }}</span>
            <span class="step-text">{{ step.text }}</span>
          </div>
          <div class="step-screenshot">
            <img :src="step.img" :alt="step.text" loading="lazy" />
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h3>Veja como é fácil</h3>
      <div class="demo-gif-wrapper">
        <img src="/assets/download/download-2.gif" alt="Demonstração de instalação" class="demo-gif" loading="lazy" />
      </div>
    </div>

    <div class="app-screenshots">
      <h3>Screenshots</h3>
      <div class="screenshots-scroll">
        <img src="/assets/download/download.jpg" alt="Screenshot do app" class="screenshot-item" loading="lazy" />
        <img src="/assets/download/download (4).png" alt="Promoções" class="screenshot-item" loading="lazy" />
      </div>
    </div>
  </div>
</template>

<script setup>
const features = [
  { icon: '🎰', title: '1000+ Jogos', desc: 'Slots, ao vivo, pesca, esportes e mais' },
  { icon: '⚡', title: 'Saques Rápidos', desc: 'Saque via PIX em minutos' },
  { icon: '🎁', title: 'Bônus Diários', desc: 'Check-in e recompensas todos os dias' },
  { icon: '🔒', title: 'Seguro', desc: 'Criptografia e proteção de dados' }
]

const guideSteps = [
  {
    text: 'Abra o A73.com no seu navegador (Chrome/Safari)',
    img: '/assets/download/download-2.png'
  },
  {
    text: 'Toque nos 3 pontos (⋮) ou no ícone de compartilhar',
    img: '/assets/download/download-3.png'
  },
  {
    text: 'Selecione "Adicionar à tela inicial" e confirme',
    img: '/assets/download/download-1.gif'
  }
]

function downloadAPK() {
  alert('Download do APK será disponibilizado em breve!')
}

function installPWA() {
  if (window.deferredPrompt) {
    window.deferredPrompt.prompt()
  } else {
    alert('Abra no navegador e adicione à tela inicial!')
  }
}
</script>

<style scoped>
.download-page {
  padding: 0 12px 24px;
  background: var(--bg-secondary);
  min-height: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 12px 0;
  gap: 12px;
}

.page-header h2 {
  flex: 1;
  font-size: 18px;
  font-weight: 700;
}

.back-btn {
  color: var(--text-primary);
  padding: 4px;
}

/* Hero Banner */
.hero-banner {
  position: relative;
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  margin-bottom: 16px;
  aspect-ratio: 16 / 9;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
}

.hero-app-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.hero-text h1 {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
}

.hero-text p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 2px;
}

/* App Showcase */
.app-showcase {
  text-align: center;
  padding: 8px 0 16px;
}

.app-rating {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 6px;
}

.stars {
  font-size: 14px;
}

.rating-text {
  font-size: 12px;
  color: var(--text-muted);
}

.app-desc {
  font-size: 13px;
  color: var(--text-secondary);
}

/* Download Buttons */
.download-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.dl-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  border-radius: var(--radius-md, 8px);
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  transition: transform 0.15s;
}

.dl-btn.android {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.dl-btn.pwa {
  background: linear-gradient(135deg, var(--purple-400, #a855f7), var(--purple-600, #9333ea));
}

.dl-btn:active {
  transform: scale(0.98);
}

/* Promo Banner */
.promo-banner {
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  margin-bottom: 16px;
}

.promo-img {
  width: 100%;
  display: block;
}

/* Features */
.features-list {
  margin-bottom: 16px;
}

.features-list h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: var(--radius-md, 8px);
  margin-bottom: 6px;
}

.feat-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.feat-info h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}

.feat-info p {
  font-size: 12px;
  color: var(--text-muted);
}

/* Install Guide */
.install-guide {
  background: var(--bg-card);
  border-radius: var(--radius-lg, 12px);
  padding: 16px;
  margin-bottom: 16px;
}

.install-guide h3 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 12px;
}

.guide-step {
  margin-bottom: 16px;
}

.guide-step:last-child {
  margin-bottom: 0;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--purple-500, #a855f7);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.step-text {
  font-size: 13px;
  color: var(--text-secondary);
}

.step-screenshot {
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-left: 40px;
}

.step-screenshot img {
  width: 100%;
  display: block;
}

/* Demo Section */
.demo-section {
  margin-bottom: 16px;
}

.demo-section h3 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 12px;
}

.demo-gif-wrapper {
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--bg-card);
}

.demo-gif {
  width: 100%;
  display: block;
}

/* Screenshots Carousel */
.app-screenshots {
  margin-bottom: 16px;
}

.app-screenshots h3 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 12px;
}

.screenshots-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
}

.screenshots-scroll::-webkit-scrollbar {
  display: none;
}

.screenshot-item {
  flex-shrink: 0;
  width: 75%;
  border-radius: var(--radius-md, 8px);
  object-fit: cover;
  scroll-snap-align: start;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
