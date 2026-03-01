<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/main/inicio/" />
        </ion-buttons>
        <ion-title>Original SPA</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="ion-padding">
        <p>Original SPA</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonHeader, IonToolbar, IonContent, IonTitle, IonButtons, IonBackButton } from '@ionic/vue'
</script>
