<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="rel-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="$router.back()">
            <ion-icon name="chevron-back" />
          </ion-button>
        </ion-buttons>
        <ion-title>Relatórios</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="rel-content">
      <div class="rel-tabs">
        <button
          type="button"
          class="rel-tab"
          :class="{ active: tabAtivo === 'detalhes' }"
          @click="tabAtivo = 'detalhes'"
        >
          Detalhes da Conta
        </button>
        <button
          type="button"
          class="rel-tab"
          :class="{ active: tabAtivo === 'recordes' }"
          @click="tabAtivo = 'recordes'"
        >
          Recordes de Apostas
        </button>
        <button
          type="button"
          class="rel-tab"
          :class="{ active: tabAtivo === 'esportiva' }"
          @click="tabAtivo = 'esportiva'"
        >
          Aposta Esportiva
        </button>
      </div>

      <div class="rel-filters">
        <button type="button" class="rel-filter-btn" @click="toggleFiltro('periodo')">
          {{ filtroPeriodo }}
          <ion-icon :name="abertoPeriodo ? 'chevron-up' : 'chevron-down'" />
        </button>
        <button
          type="button"
          class="rel-filter-btn"
          :class="{ active: abertoTipos && tabAtivo === 'detalhes' }"
          @click="toggleFiltro('tipos')"
        >
          {{ tabAtivo === 'detalhes' ? filtroTipo : 'Todos Tipos' }}
          <ion-icon :name="abertoTipos ? 'chevron-up' : 'chevron-down'" />
        </button>
        <button
          type="button"
          class="rel-filter-btn"
          @click="toggleFiltro(tabAtivo === 'detalhes' ? 'detalhes' : 'plataforma')"
        >
          {{ tabAtivo === 'detalhes' ? 'Todos Detalhes' : filtroPlataforma }}
          <ion-icon :name="(tabAtivo === 'detalhes' ? abertoDetalhes : abertoPlataforma) ? 'chevron-up' : 'chevron-down'" />
        </button>
      </div>

      <!-- Grid de tipos (apenas Detalhes da Conta) -->
      <div v-if="tabAtivo === 'detalhes' && abertoTipos" class="rel-tipos-grid">
        <button
          v-for="t in tiposDetalhes"
          :key="t"
          type="button"
          class="rel-tipo-btn"
          :class="{ active: filtroTipo === t }"
          @click="selecionarTipo(t)"
        >
          {{ t }}
        </button>
      </div>

      <div class="rel-body">
        <div class="rel-empty">
          <div class="rel-empty-icon">📄</div>
          <p class="rel-empty-text">Sem Registros</p>
        </div>
      </div>

      <div class="rel-footer">
        <template v-if="tabAtivo === 'detalhes'">
          <div class="rel-footer-item">
            <span>Depósito Acumulado:</span>
            <span class="rel-valor verde">{{ depositoAcumulado }}</span>
          </div>
          <div class="rel-footer-item">
            <span>Total de retirada:</span>
            <span class="rel-valor vermelho">{{ totalRetirada }}</span>
          </div>
          <div class="rel-footer-item">
            <span>Total de bônus acumulados:</span>
            <span class="rel-valor laranja">{{ totalBonus }}</span>
          </div>
        </template>
        <template v-else>
          <div class="rel-footer-item">
            <span>Acumulado de Apostas:</span>
            <span class="rel-valor">{{ acumuladoApostas }}</span>
          </div>
          <div class="rel-footer-item">
            <span>Apostas Eficazes Cumulativas:</span>
            <span class="rel-valor laranja">{{ apostasEficazes }}</span>
          </div>
          <div class="rel-footer-item">
            <span>Cumulativo de Ganho/Perda:</span>
            <span class="rel-valor laranja">{{ ganhoPerda }}</span>
          </div>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons
} from '@ionic/vue'

const tabAtivo = ref('detalhes')
const filtroPeriodo = ref('Hoje')
const filtroTipo = ref('Todos Tipos')
const filtroPlataforma = ref('Todas Plataformas')
const abertoPeriodo = ref(false)
const abertoTipos = ref(false)
const abertoPlataforma = ref(false)
const abertoDetalhes = ref(false)

const tiposDetalhes = [
  'Todos Tipos',
  'Depósito de Membro',
  'Saque',
  'Eventos',
  'Troca de fundos',
  'Cofre box',
  'Comissão',
  'Tarefas'
]

const depositoAcumulado = ref('0,00')
const totalRetirada = ref('0,00')
const totalBonus = ref('0,00')
const acumuladoApostas = ref('0')
const apostasEficazes = ref('0,00')
const ganhoPerda = ref('0,00')

function toggleFiltro(qual) {
  abertoPeriodo.value = qual === 'periodo' ? !abertoPeriodo.value : false
  abertoTipos.value = qual === 'tipos' ? !abertoTipos.value : false
  abertoPlataforma.value = qual === 'plataforma' ? !abertoPlataforma.value : false
  abertoDetalhes.value = qual === 'detalhes' ? !abertoDetalhes.value : false
}

function selecionarTipo(t) {
  filtroTipo.value = t
  abertoTipos.value = false
}
</script>

<style scoped>
.rel-toolbar {
  --background: #2d1f4e;
  --color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.rel-toolbar ion-button {
  --color: #fff;
}
.rel-content {
  --background: #2d1f4e;
}
.rel-tabs {
  display: flex;
  background: #3d2f5c;
  padding: 0 8px;
  overflow-x: auto;
}
.rel-tab {
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  color: #fff;
  font-size: 0.8rem;
  padding: 12px 6px;
  cursor: pointer;
  position: relative;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
}
.rel-tab.active {
  color: #fbbf24;
  border-bottom-color: #fbbf24;
}
.rel-filters {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  flex-wrap: wrap;
}
.rel-filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #3d2f5c;
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
}
.rel-filter-btn.active {
  background: #5E2B87;
  color: #fbbf24;
}
.rel-filter-btn ion-icon {
  font-size: 0.9rem;
}
.rel-tipos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 0 16px 16px;
}
.rel-tipo-btn {
  background: #3d2f5c;
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
}
.rel-tipo-btn.active {
  background: #5E2B87;
  color: #fbbf24;
}
.rel-body {
  padding: 20px;
  min-height: 200px;
}
.rel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 240px;
}
.rel-empty-icon {
  font-size: 4rem;
  opacity: 0.5;
  margin-bottom: 16px;
}
.rel-empty-text {
  color: #9ca3af;
  font-size: 1rem;
  margin: 0;
}
.rel-footer {
  padding: 20px 16px 28px;
  border-top: 1px solid rgba(255,255,255,0.1);
}
.rel-footer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: #fff;
  font-size: 0.9rem;
}
.rel-footer-item:last-child {
  margin-bottom: 0;
}
.rel-valor {
  font-weight: 700;
}
.rel-valor.verde {
  color: #22c55e;
}
.rel-valor.vermelho {
  color: #ef4444;
}
.rel-valor.laranja {
  color: #f59e0b;
}
</style>
