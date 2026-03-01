<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="misterioso-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="$router.back()">
            <ion-icon name="chevron-back" />
          </ion-button>
        </ion-buttons>
        <ion-title>Evento de Bônus Misterioso...</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="misterioso-content">
      <!-- Prêmio principal -->
      <div class="misterioso-hero">
        <span class="misterioso-tag">Recompensa Quíntupla</span>
        <h2 class="misterioso-titulo">Prêmio Misterioso</h2>
        <span class="misterioso-valor">R$ 8.888,00</span>
        <div class="misterioso-prize-wrap">
          <ion-icon name="gift" class="misterioso-prize-icon" />
        </div>
        <div class="misterioso-btn-wrap a73-shimmer">
          <ion-button class="misterioso-btn-reclamar" fill="solid" @click="reclamar">
            Reclamar
          </ion-button>
        </div>
        <div class="misterioso-gifts-row">
          <div
            v-for="(g, i) in 5"
            :key="i"
            class="misterioso-gift"
            :class="{ active: diaAtivo === dias[i] }"
          >
            <ion-icon name="gift" />
          </div>
        </div>
      </div>

      <!-- Seleção de dias -->
      <div class="misterioso-dias">
        <button
          v-for="d in dias"
          :key="d"
          type="button"
          class="misterioso-dia-btn"
          :class="{ active: diaAtivo === d }"
          @click="diaAtivo = d"
        >
          Dia {{ d }}
          <ion-icon v-if="diaAtivo === d" name="chevron-down" class="misterioso-dia-arrow" />
        </button>
      </div>

      <!-- Momento de reclamar -->
      <div class="misterioso-claim-section">
        <p class="misterioso-claim-label">O momento em que os bônus podem ser reclamados:</p>
        <span class="misterioso-claim-data">{{ momentoReclamar }}</span>
        <span class="misterioso-valor-grande">R$ 8.888,00</span>
        <span class="misterioso-premio-tag">Prêmio Misterioso</span>
      </div>

      <!-- Dados da conta -->
      <div class="misterioso-dados">
        <div class="misterioso-dado-row">
          <ion-icon name="time-outline" />
          <span>Hora de registo: {{ horaRegistoFmt }}</span>
        </div>
        <div class="misterioso-dado-row">
          <ion-icon name="cash-outline" />
          <span>Depósito total de {{ diaAtivo }} Dias: {{ depositoTotal }}</span>
        </div>
        <div class="misterioso-divider"></div>
        <div class="misterioso-dado-grid">
          <div class="misterioso-dado-item">
            <span class="misterioso-dado-label">Âmbito do depósito</span>
            <span class="misterioso-dado-val">R$ 30,00</span>
          </div>
          <div class="misterioso-dado-item">
            <span class="misterioso-dado-label">Prêmio Misterioso</span>
            <span class="misterioso-dado-val destaque">R$ 0,30-88,00</span>
          </div>
        </div>
      </div>

      <!-- Tabela depósito x prêmio -->
      <div class="misterioso-tabela">
        <div
          v-for="(row, i) in tabelaPremios"
          :key="i"
          class="misterioso-tabela-row"
        >
          <span>R$ {{ row.deposito }}</span>
          <span class="misterioso-tabela-premio">R$ {{ row.premio }}</span>
        </div>
      </div>

      <!-- Regras -->
      <div class="misterioso-regras">
        <h4 class="misterioso-regras-titulo">* Regras do evento *</h4>
        <ol class="misterioso-regras-lista">
          <li>Durante o evento, os membros que se inscreverem ativamente para participar do evento, concluírem depósitos e apostas válidas, podem receber bônus correspondentes;</li>
          <li>O evento será reiniciado no 32º dia após o registro. O bônus deve ser coletado manualmente e será cancelado após o vencimento;</li>
          <li>O bônus (excluindo o principal) requer 1 vezes de apostas válidas para sacar;</li>
          <li>Somente o proprietário da conta pode realizar operações manuais normais, caso contrário, o bônus será cancelado ou deduzido, congelado ou até mesmo colocado na lista negra;</li>
          <li>Para evitar diferenças na compreensão do texto, a plataforma se reserva o direito final de interpretação desta atividade.</li>
        </ol>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons
} from '@ionic/vue'
import { confetti } from '@/utils/confetti'
import { useAfiliado } from '@/composables/useAfiliado'
import { useToast } from '@/composables/useToast'

const { depositoMisterioso, horaRegisto, misteriosoElegivel, reclamarMisterioso, fmt, tabelaMisterioso } = useAfiliado()
const toast = useToast()

const diaAtivo = ref(3)
const dias = [2, 3, 7, 15, 30]
const momentoReclamar = ref('2026-02-27 00:00:00')
const depositoTotal = computed(() => fmt(depositoMisterioso.value ?? 0))
const horaRegistoFmt = computed(() => horaRegisto.value || new Date().toISOString().slice(0, 19).replace('T', ' '))

function reclamar() {
  if (reclamarMisterioso()) {
    confetti()
    toast.success('Prêmio misterioso reclamado!')
  } else {
    toast.warning('Depósito mínimo R$ 30,00 necessário ou prêmio já reclamado.')
  }
}
const tabelaPremios = tabelaMisterioso.map(t => ({
  deposito: fmt(t.deposito),
  premio: `${fmt(t.premioMin)}-${fmt(t.premioMax)}`,
}))
</script>

<style scoped>
.misterioso-toolbar {
  --background: #2d1f4e;
  --color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.misterioso-toolbar ion-button {
  --color: #fff;
}

.misterioso-content {
  --background: linear-gradient(180deg, #310d54 0%, #4a148c 40%, #310d54 100%);
}

.misterioso-hero {
  padding: 20px 16px;
  text-align: center;
}
.misterioso-tag {
  display: inline-block;
  background: #3b82f6;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 20px;
  margin-bottom: 12px;
}
.misterioso-titulo {
  color: #fff;
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0 0 8px 0;
}
.misterioso-valor {
  display: block;
  color: #f97316;
  font-size: 1.8rem;
  font-weight: 900;
  margin-bottom: 16px;
}
.misterioso-prize-wrap {
  margin-bottom: 16px;
}
.misterioso-prize-icon {
  font-size: 64px;
  color: #fbbf24;
  filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.5));
}
.misterioso-btn-wrap {
  position: relative;
  border-radius: 12px;
  margin-bottom: 16px;
  display: inline-block;
}
.misterioso-btn-reclamar {
  --background: #9ca3af;
  --color: #1a1a1a;
  font-weight: 700;
  border-radius: 12px;
}
.misterioso-gifts-row {
  display: flex;
  justify-content: center;
  gap: 12px;
}
.misterioso-gift {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(91, 33, 182, 0.5);
  border: 1px solid rgba(168, 85, 247, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}
.misterioso-gift ion-icon {
  font-size: 22px;
}
.misterioso-gift.active {
  background: rgba(251, 191, 36, 0.3);
  border-color: #fbbf24;
  color: #fbbf24;
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.4);
}

.misterioso-dias {
  display: flex;
  gap: 8px;
  padding: 0 16px 20px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.misterioso-dia-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(91, 33, 182, 0.5);
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 12px;
  padding: 10px 16px;
  color: #e5e7eb;
  font-size: 0.9rem;
  cursor: pointer;
}
.misterioso-dia-btn.active {
  background: rgba(251, 191, 36, 0.25);
  border-color: #fbbf24;
  color: #fef3c7;
  font-weight: 700;
}
.misterioso-dia-arrow {
  font-size: 1rem;
}

.misterioso-claim-section {
  padding: 20px 16px;
  text-align: center;
  background: rgba(0,0,0,0.2);
  margin: 0 16px 20px;
  border-radius: 20px;
  border: 1px solid rgba(168, 85, 247, 0.3);
}
.misterioso-claim-label {
  color: #9ca3af;
  font-size: 0.9rem;
  margin: 0 0 8px 0;
}
.misterioso-claim-data {
  display: block;
  color: #e5e7eb;
  font-size: 0.95rem;
  margin-bottom: 12px;
}
.misterioso-valor-grande {
  display: block;
  color: #fef3c7;
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 8px;
}
.misterioso-premio-tag {
  display: inline-block;
  background: rgba(255,255,255,0.15);
  color: #fff;
  font-size: 0.85rem;
  padding: 6px 16px;
  border-radius: 20px;
}

.misterioso-dados {
  margin: 0 16px 20px;
  padding: 16px;
  background: rgba(91, 33, 182, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(168, 85, 247, 0.3);
}
.misterioso-dado-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #e5e7eb;
  font-size: 0.9rem;
  margin-bottom: 10px;
}
.misterioso-dado-row ion-icon {
  font-size: 1.2rem;
  color: #9ca3af;
}
.misterioso-divider {
  height: 1px;
  background: rgba(255,255,255,0.15);
  margin: 14px 0;
}
.misterioso-dado-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.misterioso-dado-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.misterioso-dado-label {
  color: #9ca3af;
  font-size: 0.85rem;
}
.misterioso-dado-val {
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
}
.misterioso-dado-val.destaque {
  color: #fef3c7;
}

.misterioso-tabela {
  margin: 0 16px 20px;
  background: rgba(91, 33, 182, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  overflow: hidden;
}
.misterioso-tabela-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  color: #e5e7eb;
  font-size: 0.9rem;
}
.misterioso-tabela-row:last-child {
  border-bottom: none;
}
.misterioso-tabela-premio {
  color: #fef3c7;
  font-weight: 600;
  text-align: right;
}

.misterioso-regras {
  margin: 0 16px 32px;
  padding: 20px;
  background: rgba(91, 33, 182, 0.3);
  border-radius: 16px;
  border: 1px solid rgba(168, 85, 247, 0.3);
}
.misterioso-regras-titulo {
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-align: center;
}
.misterioso-regras-lista {
  color: #e5e7eb;
  font-size: 0.9rem;
  line-height: 1.6;
  padding-left: 20px;
  margin: 0;
}
.misterioso-regras-lista li {
  margin-bottom: 10px;
}
</style>
