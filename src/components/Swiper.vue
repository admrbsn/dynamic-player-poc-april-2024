<template>
  <div class="swiper-wrapper">
    <swiper-container
      class="swiper-container"
      :navigation="true"
      :pagination="{
        type: 'progressbar',
      }"
      :effect="'fade'"
      @swiperslidechange="onSlideChange"
      @swiperprogress="onProgress"
    >
      <swiper-slide
        v-for="(item, index) in mediaItems"
        :key="index"
        class="h-dvh flex items-center justify-center"
      >
        <template v-if="item.type === 'video'">
          <VideoPlayer
            :url="item.url"
            :index="index"
            @mediaEnd="handleMediaEnd"
          />
        </template>
        <template v-else-if="item.type === 'image'">
          <img :src="item.url" />
        </template>
      </swiper-slide>
    </swiper-container>
  </div>
  <HoverControls
    :countdown="countdown"
    :isPlaying="isPlaying"
    @toggle="togglePlayPause"
  />
</template>

<script setup>
import useSwiper from '../composables/useSwiper';
import VideoPlayer from './VideoPlayer.vue';
import HoverControls from './HoverControls.vue';
import { onMounted } from 'vue';
import { register } from 'swiper/element/bundle';

register();

const {
  mediaItems,
  media,
  isPlaying,
  countdown,
  handleMediaEnd,
  togglePlayPause,
  onSlideChange,
  onProgress,
} = useSwiper();

onMounted(() => {
  const mediaElements = document.querySelectorAll('video, img');
  media.value = Array.from(mediaElements);
});
</script>

<style>
.intro-slide-visible .swiper-container::part(button-prev),
.intro-slide-visible .swiper-container::part(button-next) {
  @apply hidden !important;
}

.swiper-container::part(button-prev),
.swiper-container::part(button-next) {
  @apply hidden md:flex !important;
}

swiper-slide video,
swiper-slide img {
  @apply w-full h-[300px] md:w-[768px] md:h-[432px] mx-auto object-cover;
}
</style>
