<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="comissao-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="$router.back()">
            <ion-icon name="chevron-back" />
          </ion-button>
        </ion-buttons>
        <ion-title>Comissão 5%</ion-title>
      </ion-toolbar>
      <!-- Tabs -->
      <div class="comissao-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="comissao-tab"
          :class="{ active: tabAtivo === tab.id }"
          @click="tabAtivo = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </ion-header>

    <ion-content :fullscreen="true" class="comissao-content">
      <!-- Pode ser coletado hoje -->
      <div class="comissao-coletar-wrap">
        <span class="comissao-coletar-label">Pode ser coletado hoje:</span>
        <span class="comissao-coletar-valor">R$ {{ fmt(coletavelRebate) }}</span>
      </div>

      <div class="comissao-layout">
        <!-- Coluna esquerda: Slot + botões -->
        <div class="comissao-side">
          <div class="comissao-slot-card">
            <div class="comissao-slot-logo">777</div>
            <span class="comissao-slot-label">Slot</span>
          </div>
          <ion-button class="comissao-btn-receber" @click="receber">
            Receber
          </ion-button>
          <ion-button class="comissao-btn-historico" @click="historico">
            Histórico
          </ion-button>
        </div>

        <!-- Coluna direita: Lista de jogos -->
        <div class="comissao-lista">
          <div
            v-for="(jogo, i) in jogos"
            :key="i"
            class="comissao-card"
            @click="abrirDetalhe(jogo)"
          >
            <div class="comissao-card-left">
              <div class="comissao-card-logo">{{ jogo.logo }}</div>
              <div class="comissao-card-info">
                <div class="comissao-card-row">
                  <span>Aposta {{ jogo.aposta }}</span>
                  <span>Taxa de reembolso {{ jogo.taxa }}%</span>
                </div>
                <div class="comissao-card-row">
                  <span>Aposte 1,00 para receber <strong class="comissao-destaque">{{ jogo.receber }}%</strong></span>
                  <span>Coletável <strong class="comissao-destaque">{{ jogo.coletavel }}</strong></span>
                </div>
              </div>
            </div>
            <ion-icon name="chevron-forward" class="comissao-card-arrow" />
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAfiliado } from '@/composables/useAfiliado'
import { useToast } from '@/composables/useToast'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons
} from '@ionic/vue'

const router = useRouter()
const { coletavelRebate, fmt, receberComissao } = useAfiliado()
const toast = useToast()

const tabAtivo = ref('rebate')

const tabs = [
  { id: 'eventos', label: 'Eventos' },
  { id: 'rebate', label: 'Rebate' },
  { id: 'vip', label: 'VIP' },
  { id: 'codigo', label: 'Código de Resgate' },
  { id: 'historico', label: 'Histórico' },
  { id: 'pend', label: 'Pend' },
]

const jogos = [
  { logo: 'CP', provider: 'CP', aposta: '0,00', taxa: '0,00', receber: '0,30', coletavel: '0,00' },
  { logo: 'FC', provider: 'FaChai', aposta: '0,00', taxa: '0,00', receber: '0,30', coletavel: '0,00' },
  { logo: 'PG', provider: 'PG', aposta: '0,00', taxa: '0,00', receber: '0,30', coletavel: '0,00' },
  { logo: 'JB', provider: 'JDB', aposta: '0,00', taxa: '0,00', receber: '0,30', coletavel: '0,00' },
  { logo: 'IN', provider: 'inout', aposta: '0,00', taxa: '0,00', receber: '0,30', coletavel: '0,00' },
  { logo: 'FS', provider: 'FASTSPIN', aposta: '0,00', taxa: '0,00', receber: '0,30', coletavel: '0,00' },
  { logo: 'DD', provider: 'PANDA', aposta: '0,00', taxa: '0,00', receber: '0,30', coletavel: '0,00' },
  { logo: 'PP', provider: 'PP', aposta: '0,00', taxa: '0,00', receber: '0,30', coletavel: '0,00' },
  { logo: 'CQ9', provider: 'PANDA', aposta: '0,00', taxa: '0,00', receber: '0,30', coletavel: '0,00' },
]

async function receber() {
  const valor = coletavelRebate.value ?? 0
  if (valor <= 0) {
    toast.warning('Nenhum valor disponível para receber.')
    return
  }
  if (await receberComissao(valor)) {
    toast.success(`R$ ${fmt(valor)} recebido!`)
  }
}
function historico() {
  router.push('/main/convidar/')
}
function abrirDetalhe(jogo) {
  router.push({ path: '/main/taxa-reembolso/', query: { provider: jogo.provider } })
}
</script>

<style scoped>
.comissao-toolbar {
  --background: #2d1f4e;
  --color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.comissao-toolbar ion-button {
  --color: #fff;
}
.comissao-tabs {
  display: flex;
  overflow-x: auto;
  padding: 0 12px;
  background: rgba(0,0,0,0.3);
  gap: 4px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.comissao-tabs::-webkit-scrollbar { display: none; }
.comissao-tab {
  flex-shrink: 0;
  background: none;
  border: none;
  color: rgba(255,255,255,0.7);
  font-size: 0.85rem;
  padding: 12px 10px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
}
.comissao-tab.active {
  color: #fff;
  font-weight: 600;
  border-bottom-color: #fef3c7;
}

.comissao-content {
  --background: linear-gradient(180deg, #310d54 0%, #4a148c 50%, #310d54 100%);
}

.comissao-coletar-wrap {
  padding: 16px 16px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.comissao-coletar-label {
  color: #e5e7eb;
  font-size: 0.95rem;
}
.comissao-coletar-valor {
  color: #fef3c7;
  font-size: 1.1rem;
  font-weight: 800;
}

.comissao-layout {
  display: flex;
  gap: 12px;
  padding: 0 16px 24px;
}
.comissao-side {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100px;
}
.comissao-slot-card {
  background: rgba(91, 33, 182, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(168, 85, 247, 0.4);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100%;
}
.comissao-slot-logo {
  font-family: var(--font-smooch);
  font-size: 1.5rem;
  font-weight: 800;
  color: #fef3c7;
}
.comissao-slot-label {
  font-size: 0.8rem;
  color: #9ca3af;
}
.comissao-btn-receber {
  --background: #22c55e;
  --color: #fff;
  font-weight: 700;
  width: 100%;
  border-radius: 12px;
}
.comissao-btn-historico {
  --background: #fbbf24;
  --color: #1a1a1a;
  font-weight: 700;
  width: 100%;
  border-radius: 12px;
}

.comissao-lista {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.comissao-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: rgba(91, 33, 182, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  cursor: pointer;
  transition: background 0.2s;
}
.comissao-card:hover {
  background: rgba(91, 33, 182, 0.7);
}
.comissao-card-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
.comissao-card-logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(168, 85, 247, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.comissao-card-info {
  flex: 1;
  min-width: 0;
}
.comissao-card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #e5e7eb;
}
.comissao-card-row:first-child {
  margin-bottom: 4px;
}
.comissao-destaque {
  color: #fef3c7 !important;
  font-weight: 700;
}
.comissao-card-arrow {
  color: #9ca3af;
  font-size: 1.2rem;
  flex-shrink: 0;
}
</style>
