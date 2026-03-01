<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="conv-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="$router.back()">
            <ion-icon name="chevron-back" />
          </ion-button>
        </ion-buttons>
        <ion-title>ConvidarCentro</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="conv-content">
      <div class="conv-tabs">
        <button
          type="button"
          class="conv-tab"
          :class="{ active: tabAtivo === 'link' }"
          @click="tabAtivo = 'link'"
        >
          Link de Convite
        </button>
        <button
          type="button"
          class="conv-tab"
          :class="{ active: tabAtivo === 'rede' }"
          @click="tabAtivo = 'rede'"
        >
          Rede de Agentes
        </button>
        <button
          type="button"
          class="conv-tab"
          :class="{ active: tabAtivo === 'desempenho' }"
          @click="tabAtivo = 'desempenho'"
        >
          Desempenho
        </button>
      </div>

      <!-- Tab Link de Convite -->
      <div v-show="tabAtivo === 'link'" class="conv-panel">
        <div class="conv-card">
          <h3 class="conv-card-title">Compartilhar Informação</h3>
          <p class="conv-id">ID de Indicação: {{ idIndicacao }}</p>
          <div class="conv-share-row">
            <div class="conv-qr-wrap">
              <img :src="qrCodeUrl" alt="QR Code" class="conv-qr" />
              <button type="button" class="conv-btn-salvar" @click="salvarQr">Salvar</button>
            </div>
            <div class="conv-link-wrap">
              <span class="conv-url">{{ linkConvite }}</span>
              <button type="button" class="conv-btn-copiar" @click="copiarLink">
                <ion-icon name="copy-outline" />
                Copiar
              </button>
            </div>
          </div>
          <div class="conv-socials">
            <a href="#" class="conv-social" @click.prevent="compartilhar('facebook')">f</a>
            <a href="#" class="conv-social conv-whatsapp" @click.prevent="compartilhar('whatsapp')">💬</a>
            <a href="#" class="conv-social conv-telegram" @click.prevent="compartilhar('telegram')">✈</a>
            <a href="#" class="conv-social" @click.prevent="compartilhar('instagram')">📷</a>
            <a href="#" class="conv-social" @click.prevent="compartilhar('twitter')">𝕏</a>
          </div>
        </div>

        <div class="conv-card">
          <div class="conv-card-header">
            <h3 class="conv-card-title">Comissão <ion-icon name="information-circle-outline" class="conv-info" /></h3>
            <button type="button" class="conv-btn-detalhes">Detalhes</button>
          </div>
          <div class="conv-comissao-valor">
            <span class="conv-comissao-label">Comissão Recebida</span>
            <span class="conv-comissao-rs">R$ {{ fmt(comissaoRecebida) }}</span>
            <span class="conv-trophy">🏆</span>
          </div>
          <div class="conv-comissao-hoje">
            <span>Comissão de Hoje: R$ {{ fmt(comissaoHoje) }}</span>
            <button type="button" class="conv-btn-receber" @click="receberComissaoHandler">Receber</button>
          </div>
        </div>

        <div class="conv-card">
          <div class="conv-card-header">
            <h3 class="conv-card-title">Meus dados</h3>
            <button type="button" class="conv-filter-btn">
              {{ filtroData }}
              <ion-icon name="chevron-down" />
            </button>
          </div>
          <div class="conv-subordinados">
            <span class="conv-sub-titulo">👥 Novos subordinados {{ novosSubordinados }}</span>
            <div class="conv-grid">
              <div class="conv-grid-item">
                <span>Novos subordinados diretos</span>
                <strong>{{ subDiretos }}</strong>
              </div>
              <div class="conv-grid-item">
                <span>Outros subordinados novos</span>
                <strong>{{ subOutros }}</strong>
              </div>
            </div>
          </div>
          <div class="conv-grid conv-grid-2">
            <div class="conv-grid-item">
              <span>Valor de depósito</span>
              <strong>{{ valorDeposito }}</strong>
            </div>
            <div class="conv-grid-item">
              <span>Número de depósitos</span>
              <strong>{{ numDepositos }}</strong>
            </div>
            <div class="conv-grid-item">
              <span>Valor do primeiro depósito</span>
              <strong>{{ valorPrimeiroDep }}</strong>
            </div>
            <div class="conv-grid-item">
              <span>Usuários 1º depósito</span>
              <strong>{{ usuariosPrimeiroDep }}</strong>
            </div>
            <div class="conv-grid-item">
              <span>Valor de saque</span>
              <strong>{{ valorSaque }}</strong>
            </div>
            <div class="conv-grid-item">
              <span>Número de saques</span>
              <strong>{{ numSaques }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Rede de Agentes -->
      <div v-show="tabAtivo === 'rede'" class="conv-panel">
        <div class="conv-card">
          <h3 class="conv-card-title">Rede de Agentes</h3>
          <p class="conv-rede-desc">
            Visualize sua rede de agentes e subordinados. O exemplo abaixo mostra como A desenvolveu B1, B2, B3; B1 desenvolveu C1, C2; B3 desenvolveu C3.
          </p>
          <div class="conv-rede-exemplo">
            <p><strong>Um exemplo é o seguinte:</strong></p>
            <p>Comissão de B1: (1000+2000) \* 1% = 30</p>
            <p>Comissão de B2: (0+0) \* 1% = 0</p>
            <p>Comissão B3: 20.000 \* 3% = 600</p>
            <p>Comissão de A: (500+3000+2000) \* 3% = 165 (direta) + (1000+2000) \* 2% = 60 (outras) = 225 total</p>
          </div>
        </div>
      </div>

      <!-- Tab Desempenho -->
      <div v-show="tabAtivo === 'desempenho'" class="conv-panel">
        <div class="conv-filters">
          <input v-model="filtroDataDesempenho" type="date" class="conv-input-date" />
          <div class="conv-input-wrap">
            <input v-model="filtroId" type="text" placeholder="ID" class="conv-input-id" />
            <ion-icon name="search" />
          </div>
        </div>
        <div class="conv-table-header">
          <span>ID</span>
          <span>Nº Subordinados</span>
          <span>Aposta</span>
          <span>Desempenho</span>
          <span>Depósito</span>
        </div>
        <div class="conv-empty">
          <div class="conv-empty-icon">📄</div>
          <p class="conv-empty-text">Sem Registros</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons
} from '@ionic/vue'
import { useAfiliado } from '@/composables/useAfiliado'
import { useToast } from '@/composables/useToast'

const { linkConvite, idIndicacao, comissaoRecebida, comissaoHoje, subDiretos, subOutros, fmt, receberComissao, novosSubordinados, valorDeposito, numDepositos, valorPrimeiroDep, usuariosPrimeiroDep, valorSaque, numSaques } = useAfiliado()
const toast = useToast()

const tabAtivo = ref('link')
const qrCodeUrl = computed(() => `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(linkConvite.value)}`)

const filtroData = ref('Hoje')
const filtroDataDesempenho = ref('2026-02-27')
const filtroId = ref('')

function copiarLink() {
  navigator.clipboard?.writeText(linkConvite.value)
  toast.success('Link copiado!')
}
function salvarQr() {
  const a = document.createElement('a')
  a.href = qrCodeUrl.value
  a.download = 'qr-convite.png'
  a.click()
}
function compartilhar(rede) {
  const url = encodeURIComponent(linkConvite.value)
  const text = encodeURIComponent('Venha participar!')
  if (rede === 'whatsapp') window.open(`https://wa.me/?text=${text}%20${url}`, '_blank')
  else if (rede === 'telegram') window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank')
  else if (rede === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
  else if (rede === 'twitter') window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank')
}
function receberComissaoHandler() {
  const { state } = useAfiliado()
  const valor = state.value.comissaoPendente || state.value.comissaoHoje || state.value.coletavelRebate || 0
  if (valor <= 0) {
    toast.warning('Nenhuma comissão disponível para receber.')
    return
  }
  if (receberComissao(valor)) {
    toast.success(`Comissão R$ ${fmt(valor)} recebida!`)
  }
}
</script>

<style scoped>
.conv-toolbar {
  --background: #2d1f4e;
  --color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.conv-toolbar ion-button {
  --color: #fff;
}
.conv-content {
  --background: #2d1f4e;
}
.conv-tabs {
  display: flex;
  background: #3d2f5c;
  padding: 0 8px;
  overflow-x: auto;
}
.conv-tab {
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  color: #fff;
  font-size: 0.8rem;
  padding: 12px 6px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
}
.conv-tab.active {
  color: #fbbf24;
  border-bottom-color: #fbbf24;
}
.conv-panel {
  padding: 16px;
}
.conv-card {
  background: #3d2f5c;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}
.conv-card-title {
  color: #fff;
  font-size: 1rem;
  margin: 0 0 12px 0;
}
.conv-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.conv-card-header .conv-card-title {
  margin: 0;
}
.conv-id {
  color: #9ca3af;
  font-size: 0.9rem;
  margin: 0 0 16px 0;
}
.conv-share-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.conv-qr-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.conv-qr {
  width: 120px;
  height: 120px;
  background: #fff;
  padding: 8px;
  border-radius: 8px;
}
.conv-btn-salvar {
  background: #3b82f6;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
}
.conv-link-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.conv-url {
  color: #9ca3af;
  font-size: 0.8rem;
  word-break: break-all;
}
.conv-btn-copiar {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #5E2B87;
  color: #fbbf24;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  align-self: flex-start;
}
.conv-socials {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.conv-social {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4a3d6b;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  text-decoration: none;
}
.conv-whatsapp { background: #25d366; }
.conv-telegram { background: #0088cc; }
.conv-info {
  font-size: 1rem;
  color: #9ca3af;
  vertical-align: middle;
}
.conv-btn-detalhes {
  background: none;
  border: none;
  color: #fbbf24;
  font-size: 0.85rem;
  cursor: pointer;
}
.conv-comissao-valor {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.conv-comissao-label {
  color: #9ca3af;
  font-size: 0.9rem;
}
.conv-comissao-rs {
  color: #fbbf24;
  font-size: 1.5rem;
  font-weight: 800;
}
.conv-trophy {
  font-size: 1.5rem;
  margin-left: auto;
}
.conv-comissao-hoje {
  display: flex;
  align-items: center;
  gap: 12px;
}
.conv-comissao-hoje span {
  color: #fff;
  font-size: 0.9rem;
}
.conv-btn-receber {
  background: #22c55e;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.conv-filter-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #4a3d6b;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
}
.conv-sub-titulo {
  color: #fbbf24;
  font-size: 1rem;
  font-weight: 700;
  display: block;
  margin-bottom: 12px;
}
.conv-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.conv-grid-2 {
  margin-top: 16px;
}
.conv-grid-item {
  background: #4a3d6b;
  border-radius: 20px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.conv-grid-item span {
  color: #9ca3af;
  font-size: 0.8rem;
}
.conv-grid-item strong {
  color: #fff;
  font-size: 1rem;
}
.conv-rede-desc {
  color: #9ca3af;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 16px 0;
}
.conv-rede-exemplo {
  background: #4a3d6b;
  border-radius: 12px;
  padding: 16px;
}
.conv-rede-exemplo p {
  color: #fff;
  font-size: 0.85rem;
  margin: 0 0 8px 0;
}
.conv-rede-exemplo p:last-child {
  margin-bottom: 0;
}
.conv-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.conv-input-date {
  flex: 1;
  background: #3d2f5c;
  border: none;
  border-radius: 8px;
  padding: 12px;
  color: #fff;
  font-size: 0.9rem;
}
.conv-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #3d2f5c;
  border-radius: 8px;
  padding: 0 12px;
}
.conv-input-date {
  flex: 1;
  min-width: 0;
}
.conv-input-id {
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  color: #fff;
  padding: 12px 0;
  font-size: 0.9rem;
}
.conv-input-wrap ion-icon {
  color: #9ca3af;
  font-size: 1.2rem;
}
.conv-table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 8px;
  padding: 12px;
  background: #3d2f5c;
  border-radius: 8px;
  color: #9ca3af;
  font-size: 0.8rem;
  margin-bottom: 16px;
}
.conv-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
.conv-empty-icon {
  font-size: 4rem;
  opacity: 0.5;
  margin-bottom: 16px;
}
.conv-empty-text {
  color: #9ca3af;
  font-size: 1rem;
  margin: 0;
}
</style>
