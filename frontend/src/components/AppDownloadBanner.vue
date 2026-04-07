<template>
  <div class="download-bar" v-if="visible">
    <button class="bar-close" @click="dismiss" aria-label="Fechar">
      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
    </button>

    <div class="bar-icon">
      <img src="/assets/download/download-4.png" alt="App" />
    </div>

    <div class="bar-text">
      <span class="bar-line1">Baixe Nosso APP,</span>
      <span class="bar-line2">Ganhe Super Prêmios! 🎊</span>
    </div>

    <div class="bar-emojis">💰🎊🎁</div>

    <button class="bar-install" @click="goDownload">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 4v13m0 0l-4-4m4 4l4-4"/><path d="M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2"/></svg>
      <span>Instalar</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const visible = ref(!sessionStorage.getItem('download_bar_closed'))

function dismiss() {
  visible.value = false
  sessionStorage.setItem('download_bar_closed', '1')
}

function goDownload() {
  router.push('/download')
}
</script>

<style scoped>
.download-bar {
  display: flex;
  align-items: center;
  gap: .625rem;
  background: #18254E;
  padding: .5rem .625rem .5rem 2rem;
  position: relative;
  z-index: 101;
  flex-shrink: 0;
  min-height: 3rem;
}

.bar-close {
  position: absolute;
  top: 50%;
  left: .5rem;
  transform: translateY(-50%);
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, .15);
  color: rgba(255, 255, 255, .6);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  padding: 0;
}
.bar-close:active {
  background: rgba(255, 255, 255, .25);
}

.bar-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: .625rem;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .4);
  border: 1.5px solid rgba(255, 255, 255, .1);
}
.bar-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.bar-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: .0625rem;
}

.bar-line1 {
  font-size: .8125rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
  white-space: nowrap;
}

.bar-line2 {
  font-size: .8125rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
  white-space: nowrap;
}

.bar-emojis {
  font-size: 1rem;
  flex-shrink: 0;
  line-height: 1;
  letter-spacing: 1px;
}

.bar-install {
  display: flex;
  align-items: center;
  gap: .25rem;
  padding: .4375rem 1rem;
  background: linear-gradient(180deg, #FFE44D 0%, #F5C84C 50%, #E8B230 100%);
  border-radius: 624.9375rem;
  border: none;
  color: #1a1a2e;
  font-size: .8125rem;
  font-weight: 800;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(245, 200, 76, .35);
  cursor: pointer;
  transition: all .15s ease;
}
.bar-install:active {
  opacity: .85;
  transform: scale(.96);
}
.bar-install svg {
  stroke: #1a1a2e;
}
</style>
