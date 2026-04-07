<template>
  <div ref="containerRef" class="spine-container" :style="containerStyle"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

const props = defineProps({
  jsonUrl: { type: String, default: '' },
  skelUrl: { type: String, default: '' },
  atlasUrl: { type: String, required: true },
  animation: { type: String, default: 'idle' },
  skin: { type: String, default: 'default' },
  loop: { type: Boolean, default: true },
  width: { type: [String, Number], default: '100%' },
  height: { type: [String, Number], default: '300px' },
  premultipliedAlpha: { type: Boolean, default: true },
  backgroundColor: { type: String, default: 'transparent' }
})

const emit = defineEmits(['ready', 'error', 'complete'])

const containerRef = ref(null)
let player = null

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

async function initPlayer() {
  if (!containerRef.value) return

  try {
    const spine = await import('@esotericsoftware/spine-player')

    const config = {
      skelUrl: props.skelUrl || undefined,
      jsonUrl: props.jsonUrl || undefined,
      atlasUrl: props.atlasUrl,
      animation: props.animation,
      premultipliedAlpha: props.premultipliedAlpha,
      backgroundColor: props.backgroundColor,
      showControls: false,
      alpha: true,
      success: (p) => {
        player = p
        if (props.skin && props.skin !== 'default') {
          try { p.skeleton.setSkinByName(props.skin) } catch {}
        }
        emit('ready', p)
      },
      error: (_, msg) => {
        console.warn('[SpineAnimation] Error:', msg)
        emit('error', msg)
      }
    }

    new spine.SpinePlayer(containerRef.value, config)
  } catch (e) {
    console.warn('[SpineAnimation] Failed to load spine-player:', e.message)
    emit('error', e.message)
  }
}

watch(() => props.animation, (newAnim) => {
  if (player && newAnim) {
    try {
      player.setAnimation(newAnim, props.loop)
    } catch {}
  }
})

onMounted(() => initPlayer())

onUnmounted(() => {
  if (player?.dispose) {
    try { player.dispose() } catch {}
  }
  player = null
})
</script>

<style scoped>
.spine-container {
  position: relative;
  overflow: hidden;
}
.spine-container :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
}
</style>
