<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="taxa-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="$router.back()">
            <ion-icon name="chevron-back" />
          </ion-button>
        </ion-buttons>
        <ion-title>Taxa de reembolso</ion-title>
      </ion-toolbar>

      <!-- Filtros -->
      <div class="taxa-filtros">
        <button type="button" class="taxa-filtro-btn" @click="mostrarSlot = !mostrarSlot">
          <span>Slot</span>
          <ion-icon :name="mostrarSlot ? 'chevron-up' : 'chevron-down'" />
        </button>
        <button type="button" class="taxa-filtro-btn" @click="mostrarProvider = !mostrarProvider">
          <span>{{ providerSelecionado }}</span>
          <ion-icon :name="mostrarProvider ? 'chevron-up' : 'chevron-down'" />
        </button>
        <div class="taxa-headers">
          <span>Aposta</span>
          <span>Taxa de reembolso</span>
        </div>
      </div>
    </ion-header>

    <ion-content :fullscreen="true" class="taxa-content">
      <!-- Grid de provedores -->
      <div class="taxa-providers-grid">
        <button
          v-for="p in providers"
          :key="p"
          type="button"
          class="taxa-provider-btn"
          :class="{ selected: providerSelecionado === p }"
          @click="selecionarProvider(p)"
        >
          {{ p }}
        </button>
      </div>

      <!-- Lista de apostas e taxas -->
      <div class="taxa-lista">
        <div
          v-for="(item, i) in taxas"
          :key="i"
          class="taxa-row"
        >
          <span class="taxa-slot">Slot</span>
          <span class="taxa-prov">{{ providerSelecionado }}</span>
          <span class="taxa-aposta">{{ item.aposta }}</span>
          <span class="taxa-valor">{{ item.taxa }}%</span>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons
} from '@ionic/vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mostrarSlot = ref(false)
const mostrarProvider = ref(false)
const providerSelecionado = ref('PANDA')

const providers = [
  'PG', 'Tada', 'JDB', 'Spribe', 'PP', 'CP', 'G759', 'FaChai',
  'POPOK', 'PLAYSON', 'RUBYPLAY', 'inout', 'FASTSPIN', 'PANDA',
]

const taxas = [
  { aposta: '10.000.000,00', taxa: '5,00' },
  { aposta: '5.000.000,00', taxa: '1,00' },
  { aposta: '3.000.000,00', taxa: '0,90' },
  { aposta: '1.000.000,00', taxa: '0,80' },
  { aposta: '500.000,00', taxa: '0,50' },
  { aposta: '100.000,00', taxa: '0,40' },
  { aposta: '1,00', taxa: '0,30' },
]

function selecionarProvider(p) {
  providerSelecionado.value = p
}

onMounted(() => {
  const pre = route.query.provider
  if (pre && providers.includes(pre)) {
    providerSelecionado.value = pre
  } else if (pre) {
    const mapped = mapProvider(pre)
    if (providers.includes(mapped)) {
      providerSelecionado.value = mapped
    }
  }
})

function mapProvider(logo) {
  const map = { CP: 'CP', PG: 'PG', PP: 'PP', FS: 'FASTSPIN', IN: 'inout', CQ9: 'CQ9', DD: 'DD', FC: 'FaChai', JB: 'JDB' }
  return map[logo] || 'PANDA'
}
</script>

<style scoped>
.taxa-toolbar {
  --background: #2d1f4e;
  --color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.taxa-toolbar ion-button {
  --color: #fff;
}

.taxa-filtros {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(0,0,0,0.2);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.taxa-filtro-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(91, 33, 182, 0.5);
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 12px;
  padding: 10px 14px;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
}
.taxa-filtro-btn ion-icon {
  font-size: 1rem;
}
.taxa-headers {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 24px;
  color: #9ca3af;
  font-size: 0.85rem;
}

.taxa-content {
  --background: linear-gradient(180deg, #310d54 0%, #4a148c 50%, #310d54 100%);
}

.taxa-providers-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 16px;
}
.taxa-provider-btn {
  background: rgba(91, 33, 182, 0.5);
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 12px;
  padding: 12px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.taxa-provider-btn:hover {
  background: rgba(91, 33, 182, 0.7);
}
.taxa-provider-btn.selected {
  background: #fef3c7;
  color: #4D087B;
  border-color: #fbbf24;
}

.taxa-lista {
  padding: 0 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.taxa-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr 1fr;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(91, 33, 182, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(168, 85, 247, 0.3);
}
.taxa-slot, .taxa-prov {
  color: #e5e7eb;
  font-size: 0.9rem;
}
.taxa-aposta {
  color: #f97316;
  font-size: 0.9rem;
  font-weight: 600;
}
.taxa-valor {
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
}
</style>
