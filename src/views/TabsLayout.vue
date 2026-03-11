<template>
  <ion-tabs>
    <ion-router-outlet />
    <ion-tab-bar slot="bottom" class="main-tab-bar">
      <!-- Tabs ocultos para rotas sem botão visível - evita TypeError a[h] is not a function -->
      <ion-tab-button tab="login" href="/main/login/" class="tab-hidden" />
      <ion-tab-button tab="register" href="/main/register/" class="tab-hidden" />
      <ion-tab-button tab="promo" href="/main/promo/" class="tab-hidden" />
      <ion-tab-button tab="withdraw" href="/main/withdraw/" class="tab-hidden" />
      <ion-tab-button tab="saque-senha" href="/main/saque-senha/" class="tab-hidden" />
      <ion-tab-button tab="centro-mensagens" href="/main/centro-mensagens/" class="tab-hidden" />
      <ion-tab-button tab="relatorios" href="/main/relatorios/" class="tab-hidden" />
      <ion-tab-button tab="convidar" href="/main/convidar/" class="tab-hidden" />
      <ion-tab-button tab="comissao" href="/main/comissao/" class="tab-hidden" />
      <ion-tab-button tab="taxa-reembolso" href="/main/taxa-reembolso/" class="tab-hidden" />
      <ion-tab-button tab="misterioso" href="/main/misterioso/" class="tab-hidden" />
      <ion-tab-button tab="vip" href="/main/vip/" class="tab-hidden" />
      <ion-tab-button tab="jogos" href="/main/jogos/" class="tab-hidden" />
      <!-- Tabs visíveis -->
      <ion-tab-button tab="inicio" href="/main/inicio/">
        <ion-icon name="ribbon" />
        <ion-label>Início</ion-label>
      </ion-tab-button>
      <ion-tab-button tab="entrar" href="/main/entrar/">
        <ion-icon name="wallet" />
        <ion-label>Depósito</ion-label>
      </ion-tab-button>
      <ion-tab-button tab="roleta" href="/main/inicio/" class="tab-roleta-btn">
        <div class="tab-roleta">
          <div class="tab-roleta-inner">
            <ion-icon name="flame" class="tab-roleta-icon" />
          </div>
        </div>
        <ion-label class="tab-roleta-label"></ion-label>
      </ion-tab-button>
      <ion-tab-button tab="perfil" href="/main/perfil/">
        <span class="tab-perfil-wrap">
          <ion-icon name="person" />
          <span class="tab-perfil-badge" />
        </span>
        <ion-label>Perfil</ion-label>
      </ion-tab-button>
      <ion-tab-button tab="menu" href="/main/menu/">
        <ion-icon name="menu" />
        <ion-label>Menu</ion-label>
      </ion-tab-button>
    </ion-tab-bar>
  </ion-tabs>
</template>

<script setup>
import { IonTabs, IonTabBar, IonTabButton, IonRouterOutlet, IonLabel, IonIcon } from '@ionic/vue'
</script>

<style scoped>
.main-tab-bar {
  --background: #fff;
  --color: #4b5563;
  --color-selected: #a855f7;
  --ion-tab-bar-color: #4b5563;
  --ion-tab-bar-color-selected: #a855f7;
  border-top: 1px solid rgba(0,0,0,0.1);
}
.main-tab-bar ion-tab-button {
  --color: #4b5563;
  --color-selected: #a855f7;
}
.main-tab-bar ion-tab-button ion-icon {
  font-size: 24px;
}
.main-tab-bar ion-tab-button[aria-selected="true"] ion-icon,
.main-tab-bar ion-tab-button[aria-selected="true"] ion-label {
  color: #a855f7 !important;
}
.main-tab-bar ion-tab-button:not([aria-selected="true"]) ion-icon,
.main-tab-bar ion-tab-button:not([aria-selected="true"]) ion-label {
  color: #4b5563 !important;
}
/* Garantir ícones visíveis - fallback */
.main-tab-bar ion-tab-button ion-icon {
  opacity: 1;
  fill: currentColor;
}
.tab-perfil-wrap {
  position: relative;
  display: inline-flex;
}
.tab-perfil-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  animation: a73-pulse 2s ease-in-out infinite;
}
.tab-roleta-btn {
  --padding-top: 8px;
  --padding-bottom: 4px;
  margin-top: -4px;
}
.tab-roleta-btn::part(native) {
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
.tab-roleta {
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  max-width: 48px;
  max-height: 48px;
  aspect-ratio: 1;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  box-sizing: border-box;
  padding: 6px;
  background-color: #14b8a6;
  background-image:
    linear-gradient(45deg, #a855f7 25%, transparent 25%),
    linear-gradient(-45deg, #a855f7 25%, transparent 25%),
    linear-gradient(45deg, #a855f7 25%, transparent 25%),
    linear-gradient(-45deg, #a855f7 25%, transparent 25%);
  background-size: 8px 8px;
  background-position: 0 0, 4px 0, 4px -4px, 0 4px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: roleta-spin 1.2s linear infinite;
}
.tab-roleta-inner {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  border-radius: 50%;
  background: #fef3c7;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: roleta-spin-reverse 1.2s linear infinite;
}
.tab-roleta-icon {
  font-size: 24px;
  color: #374151;
}
@keyframes roleta-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes roleta-spin-reverse {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}
.tab-roleta-label {
  display: none;
}
/* Tabs ocultos: mantém no DOM para Ionic encontrar, evita TypeError a[h] is not a function */
.tab-hidden {
  visibility: hidden;
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}
.tab-roleta-btn .tab-roleta {
  flex-shrink: 0;
  align-self: center;
}
</style>
