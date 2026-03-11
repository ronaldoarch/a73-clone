<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="eventos-toolbar">
        <ion-title>Eventos</ion-title>
      </ion-toolbar>
      <!-- Tabs -->
      <div class="eventos-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="eventos-tab"
          :class="{ active: tabAtivo === tab.id }"
          @click="tabAtivo = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </ion-header>

    <ion-content :fullscreen="true" class="eventos-content">
      <!-- Aba Eventos -->
      <div v-show="tabAtivo === 'eventos'" class="eventos-pane">
        <div v-if="loading" class="eventos-loading">Carregando...</div>
        <div v-else-if="!promocoes.length" class="eventos-empty">
          Nenhuma promoção no momento.
        </div>
        <div v-else class="eventos-list">
          <div
            v-for="(p, i) in promocoes"
            :key="p.id || i"
            class="eventos-card"
            @click="abrirUrl(p)"
          >
            <div class="eventos-card-banner-wrap">
              <img
                :src="bannerSrc(p)"
                :alt="p.titulo || 'Promoção'"
                class="eventos-card-banner"
                @error="e => (e.target.src = '/s5/1770954153806/9999.jpg')"
              />
              <span class="eventos-card-status">{{ p.status || 'Em andamento' }}</span>
            </div>
            <p class="eventos-card-desc">{{ p.descricao || 'Clique para saber mais' }}</p>
            <ion-button size="small" class="eventos-card-btn" fill="solid">
              {{ p.status || 'Em andamento' }}
            </ion-button>
          </div>
        </div>
      </div>

      <!-- Aba Rebate -->
      <div v-show="tabAtivo === 'rebate'" class="eventos-pane">
        <div class="eventos-rebate">
          <div class="eventos-rebate-header">
            <span class="eventos-rebate-label">Crédito de Promocional</span>
            <span class="eventos-rebate-valor">{{ creditoPromo }}</span>
          </div>
          <div v-if="!rebateList.length" class="eventos-empty-state">
            <div class="eventos-empty-icon">
              <ion-icon name="document-text" />
            </div>
            <p>Sem Registros</p>
          </div>
          <div v-else class="eventos-rebate-list">
            <div
              v-for="(r, i) in rebateList"
              :key="i"
              class="eventos-rebate-item"
              @click="abrirRebate(r)"
            >
              <div class="eventos-rebate-icon">
                <ion-icon name="shield-checkmark" />
              </div>
              <div class="eventos-rebate-info">
                <span class="eventos-rebate-nome">{{ r.nome }}</span>
                <span class="eventos-rebate-desc">Espere {{ r.dias }} dias para obter {{ r.percentual }}%</span>
              </div>
              <ion-icon name="chevron-forward" class="eventos-rebate-arrow" />
            </div>
          </div>
        </div>
      </div>

      <!-- Aba VIP -->
      <div v-show="tabAtivo === 'vip'" class="eventos-pane">
        <div class="eventos-vip">
          <div class="eventos-vip-header">
            <span class="eventos-vip-label">Crédito de Promocional</span>
            <span class="eventos-vip-valor">{{ creditoPromo }}</span>
          </div>
          <div class="eventos-vip-status">
            <h3 class="eventos-vip-titulo">Nível Atual</h3>
            <div class="eventos-vip-progress-row">
              <div class="eventos-vip-level">
                <ion-icon name="shield-checkmark" class="eventos-vip-shield" />
                <span>VIP {{ nivelAtual }}</span>
                <span class="eventos-vip-nivel-label">Nível Atual</span>
              </div>
              <div class="eventos-vip-progress-wrap">
                <span class="eventos-vip-progress-text">Aposta necessária: {{ apostaAtual }} ({{ apostaAtual }}/{{ apostaProximo }})</span>
                <div class="eventos-vip-progress-bar">
                  <div class="eventos-vip-progress-fill" :style="{ width: progresso + '%' }"></div>
                </div>
              </div>
              <div class="eventos-vip-proximo">
                <ion-icon name="shield-checkmark" class="eventos-vip-shield" />
                <span>VIP {{ nivelAtual + 1 }}</span>
              </div>
              <ion-button class="eventos-vip-btn-coletar" fill="solid" @click="coletarVip">
                Coletar Tudo
              </ion-button>
            </div>
          </div>
          <h3 class="eventos-vip-lista-titulo">Lista de níveis VIP</h3>
          <div class="eventos-vip-subtabs">
            <button
              v-for="st in vipSubtabs"
              :key="st.id"
              type="button"
              class="eventos-vip-subtab"
              :class="{ active: vipSubAtivo === st.id }"
              @click="vipSubAtivo = st.id"
            >
              {{ st.label }}
            </button>
          </div>
          <div class="eventos-vip-tabela">
            <div class="eventos-vip-tabela-header">
              <span>Nível</span>
              <span>Aposta necessária</span>
              <span>Bônus</span>
            </div>
            <div
              v-for="nivel in niveisVipFormatados"
              :key="nivel.nivel"
              class="eventos-vip-tabela-row"
            >
              <div class="eventos-vip-nivel-cell">
                <ion-icon name="shield-checkmark" class="eventos-vip-row-shield" />
                <span>VIP {{ nivel.nivel }}</span>
              </div>
              <span class="eventos-vip-aposta-cell">{{ nivel.aposta }}</span>
              <span class="eventos-vip-bonus-cell">{{ nivel.bonus }}</span>
            </div>
          </div>
          <ion-button class="eventos-vip-btn-reclamar" expand="block" @click="reclamarVip">
            Reivindicar Recompensas de upgrade
          </ion-button>
        </div>
      </div>

      <!-- Aba Código de Resgate -->
      <div v-show="tabAtivo === 'codigo'" class="eventos-pane">
        <div class="eventos-codigo">
          <div class="eventos-codigo-banner">
            <img src="/assets.baixados/dhm.png" alt="Código de Resgate - Receba até bônus de R$8000" class="eventos-codigo-banner-img" />
          </div>
          <div class="eventos-codigo-form">
            <input
              v-model="codigoResgate"
              type="text"
              placeholder="Por favor, insira o código de resgate"
              class="eventos-codigo-input"
            />
            <ion-button class="eventos-codigo-btn" expand="block" @click="resgatarCodigo">
              Resgatar Bônus
            </ion-button>
          </div>
          <div class="eventos-codigo-share">
            <p class="eventos-codigo-share-titulo">Software de rede social multimídia</p>
            <p class="eventos-codigo-share-desc">Você pode compartilhar com mais amigos através dos seguintes métodos</p>
            <div class="eventos-codigo-social-row">
              <a href="#" class="eventos-codigo-social" @click.prevent="compartilhar('facebook')">
                <ion-icon name="logo-facebook" />
              </a>
              <a href="#" class="eventos-codigo-social" @click.prevent="compartilhar('telegram')">
                <ion-icon name="send" />
              </a>
              <a href="#" class="eventos-codigo-social" @click.prevent="compartilhar('whatsapp')">
                <ion-icon name="logo-whatsapp" />
              </a>
              <a href="#" class="eventos-codigo-social" @click.prevent="compartilhar('instagram')">
                <ion-icon name="logo-instagram" />
              </a>
              <a href="#" class="eventos-codigo-social" @click.prevent="compartilhar('twitter')">
                <ion-icon name="logo-twitter" />
              </a>
            </div>
          </div>
          <div class="eventos-codigo-instrucoes">
            <p>1. Os códigos de resgate podem ser obtidos nos canais oficiais da A73.COM nas redes sociais.</p>
            <p>2. Cada código só pode ser usado uma vez por usuário.</p>
          </div>
        </div>
      </div>

      <!-- Aba Histórico -->
      <div v-show="tabAtivo === 'historico'" class="eventos-pane">
        <div class="eventos-tabela-pane">
          <div class="eventos-tabela-header">
            <span class="eventos-tabela-bonus">Bônus: {{ bonusTotal }}</span>
          </div>
          <div class="eventos-tabela-wrap">
            <div class="eventos-tabela-colunas">
              <span>Tempo</span>
              <span>Nome do Evento</span>
              <span>Evento de Recompensa</span>
              <span>Fonte</span>
            </div>
            <div v-if="!historicoList.length" class="eventos-empty-state">
              <div class="eventos-empty-icon">
                <ion-icon name="document-text" />
              </div>
              <p>Sem Registros</p>
            </div>
            <div v-else class="eventos-tabela-rows">
              <div
                v-for="(h, i) in historicoList"
                :key="i"
                class="eventos-tabela-row"
              >
                <span>{{ h.tempo }}</span>
                <span>{{ h.nome }}</span>
                <span>{{ h.recompensa }}</span>
                <span>{{ h.fonte }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Aba Pendente -->
      <div v-show="tabAtivo === 'pendente'" class="eventos-pane">
        <div class="eventos-tabela-pane">
          <div class="eventos-tabela-header">
            <span class="eventos-tabela-bonus">Bônus: {{ bonusTotal }}</span>
          </div>
          <div class="eventos-tabela-wrap">
            <div class="eventos-tabela-colunas">
              <span>Tempo</span>
              <span>Nome do Evento</span>
              <span>Evento de Recompensa</span>
              <span>Fonte</span>
            </div>
            <div v-if="!pendenteList.length" class="eventos-empty-state">
              <div class="eventos-empty-icon">
                <ion-icon name="document-text" />
              </div>
              <p>Sem Registros</p>
            </div>
            <div v-else class="eventos-tabela-rows">
              <div
                v-for="(p, i) in pendenteList"
                :key="i"
                class="eventos-tabela-row"
              >
                <span>{{ p.tempo }}</span>
                <span>{{ p.nome }}</span>
                <span>{{ p.recompensa }}</span>
                <span>{{ p.fonte }}</span>
              </div>
            </div>
          </div>
          <ion-button class="eventos-pendente-btn" expand="block" @click="coletarTudo">
            Coletar Tudo
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/vue'
import { apiUrl } from '@/config/api'
import { useAfiliado } from '@/composables/useAfiliado'
import { useToast } from '@/composables/useToast'

const BASE_URL = typeof window !== 'undefined' ? (window.location.origin + window.location.pathname) : 'https://a73.com'

const tabAtivo = ref('eventos')
const tabs = [
  { id: 'eventos', label: 'Eventos' },
  { id: 'rebate', label: 'Rebate' },
  { id: 'vip', label: 'VIP' },
  { id: 'codigo', label: 'Código de Resgate' },
  { id: 'historico', label: 'Histórico' },
  { id: 'pendente', label: 'Pendente' }
]

const promocoes = ref([])
const loading = ref(true)
const codigoResgate = ref('')
const vipSubAtivo = ref('bonus')

const {
  vipProgresso,
  niveisVip,
  coletarVip: coletarVipApi,
  fmt,
  nivelVip,
} = useAfiliado()
const toast = useToast()

const creditoPromo = computed(() => '0.00 / 0.00000000')
const bonusTotal = computed(() => '0,00')

const nivelAtual = computed(() => nivelVip.value ?? 0)
const apostaAtual = computed(() => vipProgresso.value.apostaAtual)
const apostaProximo = computed(() => vipProgresso.value.apostaProximo)
const progresso = computed(() => vipProgresso.value.progresso)

const vipSubtabs = [
  { id: 'bonus', label: 'Bônus' },
  { id: 'diario', label: 'Bônus Diário' },
  { id: 'semanal', label: 'Bônus Semanal' },
  { id: 'mensal', label: 'Bônus Mensal' }
]

const niveisVipFormatados = computed(() => {
  const list = niveisVip || []
  return list.map(n => ({
    nivel: n.nivel,
    aposta: fmt(n.aposta),
    bonus: fmt(n.bonus),
  }))
})

const rebateList = ref([])
const historicoList = ref([])
const pendenteList = ref([])

function bannerSrc(p) {
  const url = p.bannerUrl || p.banner
  if (!url) return '/s5/1770954153806/9999.jpg'
  return url.startsWith('http') || url.startsWith('/') ? url : apiUrl(url)
}

function abrirUrl(p) {
  const url = p.url || p.link
  if (url && (url.startsWith('http') || url.startsWith('/'))) {
    if (url.startsWith('http')) window.open(url, '_blank')
    else window.location.href = url
  }
}

function abrirRebate() {}

async function coletarVip() {
  if (await coletarVipApi()) {
    toast.success('Bônus VIP coletado!')
  } else {
    toast.warning('Nenhum bônus disponível para coletar.')
  }
}

async function reclamarVip() {
  if (await coletarVipApi()) {
    toast.success('Recompensa de upgrade reclamada!')
  } else {
    toast.warning('Requisitos não atendidos ou bônus já reclamado.')
  }
}

function resgatarCodigo() {
  if (!codigoResgate.value.trim()) {
    toast.warning('Digite um código de resgate.')
    return
  }
  toast.success('Código enviado! Verifique em breve.')
}

function compartilhar(rede) {
  const pid = localStorage.getItem('a73_pid_ref') || '4180019537'
  const url = encodeURIComponent(`${BASE_URL}?pid=${pid}`)
  const text = encodeURIComponent('Venha participar!')
  if (rede === 'whatsapp') window.open(`https://wa.me/?text=${text}%20${url}`, '_blank')
  else if (rede === 'telegram') window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank')
  else if (rede === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
  else if (rede === 'twitter') window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank')
  else if (rede === 'instagram') window.open('https://www.instagram.com/', '_blank')
}

function coletarTudo() {
  toast.warning('Nenhum bônus pendente para coletar.')
}

onMounted(async () => {
  try {
    const r = await fetch(apiUrl('/api/promocoes'), { cache: 'no-store' })
    const data = await r.json()
    promocoes.value = Array.isArray(data) ? data : (data.promocoes || data.list || [])
  } catch (_) {
    promocoes.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.eventos-toolbar {
  --background: linear-gradient(135deg, #4a148c 0%, #6a1b9a 100%);
  --color: #fff;
}
.eventos-tabs {
  display: flex;
  overflow-x: auto;
  gap: 4px;
  padding: 8px 12px;
  background: rgba(0,0,0,0.2);
  -webkit-overflow-scrolling: touch;
}
.eventos-tab {
  flex-shrink: 0;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.9);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}
.eventos-tab.active {
  background: #fbbf24;
  color: #1a0a2e;
}
.eventos-content {
  --background: #1e1b4b;
}
.eventos-pane {
  padding: 16px;
  min-height: 100%;
}
.eventos-loading,
.eventos-empty {
  padding: 32px 20px;
  text-align: center;
  color: rgba(255,255,255,0.7);
}
.eventos-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.eventos-card {
  background: #2d2b30;
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid rgba(168, 85, 247, 0.3);
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  cursor: pointer;
}
.eventos-card-banner-wrap {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
}
.eventos-card-banner {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.eventos-card-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  background: rgba(0,0,0,0.6);
  border-radius: 12px;
  font-size: 0.75rem;
  color: #fbbf24;
}
.eventos-card-desc {
  padding: 12px 16px;
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.9);
}
.eventos-card-btn {
  margin: 0 16px 16px;
  --background: #5E2B87;
  --color: #fff;
}

/* Rebate */
.eventos-rebate-header,
.eventos-vip-header {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(91, 33, 182, 0.4);
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.eventos-rebate-label,
.eventos-vip-label {
  color: rgba(255,255,255,0.8);
  font-size: 0.9rem;
}
.eventos-rebate-valor,
.eventos-vip-valor {
  color: #fbbf24;
  font-weight: 700;
}
.eventos-rebate-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(91, 33, 182, 0.3);
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  border: 1px solid rgba(168, 85, 247, 0.3);
}
.eventos-rebate-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(251, 191, 36, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
  font-size: 1.2rem;
}
.eventos-rebate-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.eventos-rebate-nome {
  color: #fff;
  font-weight: 600;
}
.eventos-rebate-desc {
  color: rgba(255,255,255,0.7);
  font-size: 0.85rem;
}
.eventos-rebate-arrow {
  color: rgba(255,255,255,0.5);
  font-size: 1.2rem;
}

/* Empty state */
.eventos-empty-state {
  padding: 48px 20px;
  text-align: center;
  color: rgba(255,255,255,0.7);
}
.eventos-empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: rgba(168, 85, 247, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.5);
  font-size: 2rem;
}
.eventos-empty-state p {
  margin: 0;
  font-size: 1rem;
}

/* VIP */
.eventos-vip-titulo {
  color: #fff;
  font-size: 1rem;
  margin: 0 0 12px 0;
}
.eventos-vip-progress-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.eventos-vip-level,
.eventos-vip-proximo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #fff;
  font-size: 0.9rem;
}
.eventos-vip-shield {
  font-size: 1.5rem;
  color: #9ca3af;
}
.eventos-vip-nivel-label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.6);
}
.eventos-vip-progress-wrap {
  flex: 1;
  min-width: 0;
}
.eventos-vip-progress-text {
  display: block;
  color: rgba(255,255,255,0.8);
  font-size: 0.85rem;
  margin-bottom: 6px;
}
.eventos-vip-progress-bar {
  height: 8px;
  background: rgba(0,0,0,0.3);
  border-radius: 4px;
  overflow: hidden;
}
.eventos-vip-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24, #8b5cf6);
  border-radius: 4px;
  transition: width 0.3s;
}
.eventos-vip-btn-coletar {
  --background: #22c55e;
  --color: #fff;
  font-weight: 600;
}
.eventos-vip-status {
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(91, 33, 182, 0.3);
  border-radius: 16px;
  border: 1px solid rgba(168, 85, 247, 0.3);
}
.eventos-vip-lista-titulo {
  color: #fff;
  font-size: 1rem;
  margin: 0 0 12px 0;
}
.eventos-vip-subtabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.eventos-vip-subtab {
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.9);
  font-size: 0.85rem;
  cursor: pointer;
}
.eventos-vip-subtab.active {
  background: #8b5cf6;
  color: #fff;
}
.eventos-vip-tabela {
  background: rgba(91, 33, 182, 0.3);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}
.eventos-vip-tabela-header {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(0,0,0,0.2);
  color: rgba(255,255,255,0.9);
  font-size: 0.85rem;
  font-weight: 600;
}
.eventos-vip-tabela-row {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: 8px;
  padding: 10px 16px;
  margin: 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.9);
  font-size: 0.85rem;
}
.eventos-vip-tabela-row:last-child {
  border-bottom: none;
}
.eventos-vip-nivel-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.eventos-vip-row-shield {
  font-size: 1.2rem;
  color: #9ca3af;
}
.eventos-vip-btn-reclamar {
  --background: #22c55e;
  --color: #fff;
  font-weight: 600;
}

/* Código de Resgate */
.eventos-codigo-banner {
  border-radius: 20px;
  margin-bottom: 20px;
  overflow: hidden;
}
.eventos-codigo-banner-img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}
.eventos-codigo-form {
  margin-bottom: 20px;
}
.eventos-codigo-input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(168, 85, 247, 0.4);
  background: rgba(91, 33, 182, 0.3);
  color: #fff;
  font-size: 1rem;
  margin-bottom: 12px;
  box-sizing: border-box;
}
.eventos-codigo-input::placeholder {
  color: rgba(255,255,255,0.5);
}
.eventos-codigo-btn {
  --background: #22c55e;
  --color: #fff;
  font-weight: 600;
}
.eventos-codigo-share {
  padding: 20px;
  background: rgba(91, 33, 182, 0.3);
  border-radius: 16px;
  margin-bottom: 20px;
  border: 1px solid rgba(168, 85, 247, 0.3);
}
.eventos-codigo-share-titulo {
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}
.eventos-codigo-share-desc {
  color: rgba(255,255,255,0.8);
  font-size: 0.9rem;
  margin: 0 0 16px 0;
}
.eventos-codigo-social-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}
.eventos-codigo-social {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #4a3d6b;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 1.2rem;
}
.eventos-codigo-social ion-icon {
  font-size: 22px;
}
.eventos-codigo-instrucoes {
  color: rgba(255,255,255,0.7);
  font-size: 0.9rem;
  line-height: 1.6;
}
.eventos-codigo-instrucoes p {
  margin: 0 0 8px 0;
}

/* Histórico / Pendente */
.eventos-tabela-pane {
  padding: 0;
}
.eventos-tabela-header {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(91, 33, 182, 0.4);
  border-radius: 12px;
}
.eventos-tabela-bonus {
  color: #fbbf24;
  font-weight: 700;
  font-size: 1rem;
}
.eventos-tabela-wrap {
  background: rgba(91, 33, 182, 0.3);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}
.eventos-tabela-colunas {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1.2fr 1fr;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(0,0,0,0.2);
  color: rgba(255,255,255,0.9);
  font-size: 0.85rem;
  font-weight: 600;
}
.eventos-tabela-row {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1.2fr 1fr;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.9);
  font-size: 0.85rem;
}
.eventos-pendente-btn {
  --background: #22c55e;
  --color: #fff;
  font-weight: 600;
}
</style>
