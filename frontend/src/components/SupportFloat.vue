<template>
  <Teleport to="body">
    <a
      class="support-float"
      href="javascript:void(0)"
      @click.prevent="openSupport"
    >
      <span class="support-dot" aria-hidden="true" />
      <img
        src="/assets/fluantenocanto/support-CYuFZ6dc.png?v=1"
        alt="Suporte"
        draggable="false"
      />
    </a>
  </Teleport>
</template>

<script setup>
function openSupport() {
  window.open('https://t.me/a73support', '_blank')
}
</script>

<style scoped>
/* Suporte: só este fica no canto INFERIOR ESQUERDO da coluna do app (não misturar com a mina). */
.support-float {
  position: fixed;
  top: auto;
  right: auto;
  bottom: calc(5.5rem + env(safe-area-inset-bottom, 0px));
  left: calc((100vw - min(100vw, var(--max-width, 480px))) / 2 + 0.35rem + env(safe-area-inset-left, 0px));
  width: 3.25rem;
  height: 3.25rem;
  z-index: 9999;
  filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.4));
  transition: transform 0.2s ease;
}

.support-dot {
  position: absolute;
  top: 0.05rem;
  right: 0.05rem;
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 0 2px rgba(15, 11, 46, 0.95);
  z-index: 1;
  pointer-events: none;
}

.support-float:active {
  transform: scale(0.92);
}

.support-float img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  pointer-events: none;
  user-select: none;
}
</style>
