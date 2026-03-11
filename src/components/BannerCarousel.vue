<template>
  <div class="banner-section banner-carousel">
    <div class="banner-neon-frame">
      <Swiper
        :modules="[Pagination, Autoplay]"
        :slides-per-view="1"
        :space-between="0"
        :loop="effectiveSlides.length > 1"
        :autoplay="effectiveSlides.length > 1 ? { delay: 4000, disableOnInteraction: false } : false"
        :pagination="effectiveSlides.length > 1 ? { clickable: true } : false"
        class="banner-swiper"
      >
        <SwiperSlide v-for="(slide, i) in effectiveSlides" :key="i">
          <div class="banner-slide">
            <img
              :src="slide.img"
              :alt="slide.alt"
              class="banner-img"
              loading="lazy"
              @error="e => (e.target.src = fallbackImg)"
            />
            <div class="banner-overlay">
              <span class="banner-text-main">{{ slide.title }}</span>
              <IonButton
                v-if="slide.cta"
                size="small"
                color="warning"
                class="banner-saque-btn"
                @click="$emit('cta-click', slide)"
              >
                {{ slide.cta }}
              </IonButton>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { IonButton } from '@ionic/vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'

const props = defineProps({
  slides: {
    type: Array,
    default: () => []
  },
  fallbackImg: {
    type: String,
    default: '/s5/1770954153806/9999.jpg'
  }
})

defineEmits(['cta-click'])

const effectiveSlides = computed(() => {
  const s = props.slides || []
  if (s.length === 0) {
    return [{ img: props.fallbackImg, alt: 'Banner', title: '', cta: null }]
  }
  return s
})
</script>

<style scoped>
.banner-section {
  position: relative;
  width: 100%;
  padding: 12px 16px;
}
.banner-neon-frame {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  border: 2px solid transparent;
  background: linear-gradient(var(--bg), var(--bg)) padding-box,
    linear-gradient(135deg, #ec4899, #a855f7, #6366f1, #ec4899) border-box;
  box-shadow:
    0 0 20px rgba(236, 72, 153, 0.5),
    0 0 40px rgba(168, 85, 247, 0.35),
    0 0 60px rgba(99, 102, 241, 0.2),
    inset 0 0 30px rgba(99, 102, 241, 0.08);
}
.banner-swiper {
  width: 100%;
  border-radius: 22px;
  overflow: hidden;
}
.banner-swiper :deep(.swiper-pagination) {
  bottom: 12px;
}
.banner-swiper :deep(.swiper-pagination-bullet) {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 1;
  transition: all 0.3s ease;
}
.banner-swiper :deep(.swiper-pagination-bullet-active) {
  width: 24px;
  border-radius: 4px;
  background: var(--primary, #f59e0b);
}
.banner-slide {
  position: relative;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
  border-radius: 22px;
}
.banner-img {
  width: 100%;
  height: auto;
  min-height: 180px;
  max-height: 280px;
  object-fit: cover;
  display: block;
  opacity: 0.95;
  border-radius: 20px;
}
.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 14px 18px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
}
.banner-text-main {
  font-family: var(--font-smooch);
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-shadow: 0 0 10px rgba(168, 85, 247, 0.5), 0 1px 2px rgba(0, 0, 0, 0.5);
}
.banner-saque-btn {
  --background: linear-gradient(135deg, #ec4899, #a855f7);
  --color: #fff;
  font-family: var(--font-smooch);
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  box-shadow: 0 0 15px rgba(236, 72, 153, 0.5);
}
</style>
