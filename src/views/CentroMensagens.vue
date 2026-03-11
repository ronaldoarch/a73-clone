<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="centro-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="$router.back()">
            <ion-icon name="chevron-back" />
          </ion-button>
        </ion-buttons>
        <ion-title>Centro de Mensagens</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="centro-content">
      <div class="centro-tabs">
        <button
          type="button"
          class="centro-tab"
          :class="{ active: tabAtivo === 'suporte' }"
          @click="tabAtivo = 'suporte'"
        >
          Suporte
        </button>
        <button
          type="button"
          class="centro-tab"
          :class="{ active: tabAtivo === 'notificacao' }"
          @click="tabAtivo = 'notificacao'"
        >
          Notificação
          <span v-if="notifCount > 0" class="centro-tab-badge">{{ notifCount }}</span>
        </button>
        <button
          type="button"
          class="centro-tab"
          :class="{ active: tabAtivo === 'anuncio' }"
          @click="tabAtivo = 'anuncio'"
        >
          Anúncio
        </button>
      </div>

      <!-- Tab Suporte -->
      <div v-show="tabAtivo === 'suporte'" class="centro-panel">
        <div class="centro-card centro-card-grande">
          <div class="centro-card-ilustracao">👩‍💼</div>
          <div class="centro-card-body">
            <h3 class="centro-card-titulo">Apoio on-line <span class="destaque">7x24 horas</span></h3>
            <p class="centro-card-desc">
              Serviço ao cliente disponível para ajudar a solucionar problemas e responder a dúvidas apresentadas.
            </p>
            <button type="button" class="centro-btn-contato" @click="contatoSuporte">Contato</button>
          </div>
        </div>

        <div class="centro-card centro-card-linha">
          <div class="centro-card-icon centro-icon-telegram">✈</div>
          <div class="centro-card-info">
            <strong>Serviço Telegram</strong>
            <span>Apoio on-line 7x24 horas</span>
          </div>
          <button type="button" class="centro-btn-contato" @click="contatoTelegram">Contato</button>
        </div>

        <div class="centro-card centro-card-linha">
          <div class="centro-card-icon centro-icon-whatsapp">💬</div>
          <div class="centro-card-info">
            <strong>Canal oficial do WhatsApp</strong>
            <span>Siga e receba recompensas</span>
          </div>
          <button type="button" class="centro-btn-contato" @click="contatoWhatsApp">Contato</button>
        </div>

        <div class="centro-card centro-card-linha">
          <div class="centro-card-icon centro-icon-telegram">✈</div>
          <div class="centro-card-info">
            <strong>Canal Oficial do Telegram</strong>
            <span>Siga e receba recompensas</span>
          </div>
          <button type="button" class="centro-btn-contato" @click="contatoTelegram">Contato</button>
        </div>
      </div>

      <!-- Tab Notificação -->
      <div v-show="tabAtivo === 'notificacao'" class="centro-panel">
        <div class="centro-leia-btn-wrap">
          <button type="button" class="centro-leia-btn" @click="marcarTodasLidas">
            <ion-icon name="chatbubble-outline" />
            Leia com um clique
          </button>
        </div>
        <div class="centro-lista">
          <div
            v-for="(msg, i) in notificacoes"
            :key="i"
            class="centro-msg-card"
            :class="{ unread: !msg.lida }"
          >
            <div class="centro-msg-icon">📢</div>
            <div class="centro-msg-body">
              <h4 class="centro-msg-titulo">{{ msg.titulo }}</h4>
              <span class="centro-msg-data">{{ msg.data }}</span>
              <p class="centro-msg-desc">{{ msg.descricao }}</p>
            </div>
            <span v-if="!msg.lida" class="centro-msg-dot" />
          </div>
        </div>
      </div>

      <!-- Tab Anúncio -->
      <div v-show="tabAtivo === 'anuncio'" class="centro-panel centro-panel-empty">
        <div class="centro-empty-icon">📄</div>
        <p class="centro-empty-text">Sem Registros</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons
} from '@ionic/vue'

const tabAtivo = ref('suporte')
const notifCount = ref(5)

const notificacoes = ref([
  {
    titulo: '「A73227」 Código da Sorte',
    data: '2026-02-27 19:11:37',
    descricao: 'Aposte seu depósito e tenha a oportunidade de receber um presente misterioso de até R$8888, participe já!',
    lida: false
  },
  {
    titulo: '[A73227]Resgatar código',
    data: '2026-02-27 10:10:37',
    descricao: 'Aproveite o desconto de comissão de até 5%, alcançando o objetivo de ganhar um milhão por mês!',
    lida: false
  },
  {
    titulo: '「A73226」 Código da Sorte',
    data: '2026-02-26 19:10:49',
    descricao: 'Não deixe passar essa oportunidade! Ganhe prêmios de R$50 a R$500000 convidando amigos!',
    lida: false
  },
  {
    titulo: '[A73226]Resgatar código',
    data: '2026-02-26 10:18:47',
    descricao: '*Convide amigos para ajudar no saque e receba 100R$ grátis*',
    lida: false
  },
  {
    titulo: 'Recompensas exclusivas para membros',
    data: '2026-02-25 22:04:37',
    descricao: 'Diariamente: Ganhe ate 899 reais! Recarregue todos os dias e desbloqueie recompensas exclusivas e limitadas!...',
    lida: false
  }
])

function contatoSuporte() {
  window.open('https://wa.me/', '_blank')
}
function contatoWhatsApp() {
  window.open('https://wa.me/', '_blank')
}
function contatoTelegram() {
  window.open('https://t.me/', '_blank')
}
function marcarTodasLidas() {
  notificacoes.value = notificacoes.value.map(m => ({ ...m, lida: true }))
  notifCount.value = 0
}
</script>

<style scoped>
.centro-toolbar {
  --background: #2d1f4e;
  --color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.centro-toolbar ion-button {
  --color: #fff;
}
.centro-content {
  --background: #2d1f4e;
}
.centro-tabs {
  display: flex;
  background: #3d2f5c;
  padding: 0 8px;
  gap: 4px;
}
.centro-tab {
  flex: 1;
  background: none;
  border: none;
  color: #fff;
  font-size: 0.95rem;
  padding: 14px 8px;
  cursor: pointer;
  position: relative;
  border-bottom: 3px solid transparent;
}
.centro-tab.active {
  color: #fbbf24;
  border-bottom-color: #fbbf24;
}
.centro-tab-badge {
  position: absolute;
  top: 6px;
  right: 8px;
  background: #ef4444;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
}
.centro-panel {
  padding: 20px;
}
.centro-card-grande {
  display: flex;
  gap: 16px;
  background: #3d2f5c;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}
.centro-card-ilustracao {
  width: 80px;
  height: 80px;
  background: #4a3d6b;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  flex-shrink: 0;
}
.centro-card-body {
  flex: 1;
  min-width: 0;
}
.centro-card-titulo {
  color: #fff;
  font-size: 1rem;
  margin: 0 0 8px 0;
}
.centro-card-titulo .destaque {
  color: #fbbf24;
}
.centro-card-desc {
  color: #9ca3af;
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0 0 12px 0;
}
.centro-btn-contato {
  background: #5E2B87;
  color: #fbbf24;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
}
.centro-card-linha {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #3d2f5c;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}
.centro-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}
.centro-icon-telegram {
  background: #0088cc;
  color: #fff;
}
.centro-icon-whatsapp {
  background: #25d366;
  color: #fff;
}
.centro-card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.centro-card-info strong {
  color: #fff;
  font-size: 0.95rem;
}
.centro-card-info span {
  color: #9ca3af;
  font-size: 0.8rem;
}
.centro-leia-btn-wrap {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
.centro-leia-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #5E2B87;
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
}
.centro-leia-btn ion-icon {
  font-size: 1rem;
}
.centro-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.centro-msg-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #3d2f5c;
  border-radius: 12px;
  padding: 16px;
  position: relative;
}
.centro-msg-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}
.centro-msg-body {
  flex: 1;
  min-width: 0;
}
.centro-msg-titulo {
  color: #fff;
  font-size: 0.95rem;
  margin: 0 0 4px 0;
}
.centro-msg-data {
  color: #9ca3af;
  font-size: 0.75rem;
}
.centro-msg-desc {
  color: #b0b0b0;
  font-size: 0.85rem;
  margin: 8px 0 0 0;
  line-height: 1.3;
}
.centro-msg-dot {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
}
.centro-panel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 280px;
}
.centro-empty-icon {
  font-size: 4rem;
  opacity: 0.5;
  margin-bottom: 16px;
}
.centro-empty-text {
  color: #9ca3af;
  font-size: 1rem;
  margin: 0;
}
</style>
