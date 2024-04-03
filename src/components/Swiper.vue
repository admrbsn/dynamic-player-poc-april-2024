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
            :isVideoMuted="isMuted"
            @mediaEnd="handleMediaEnd"
          />
        </template>
        <template v-else-if="item.type === 'image'">
          <img :src="item.url" class="rounded-lg" />
        </template>
      </swiper-slide>
    </swiper-container>
  </div>
  <HoverControls
    :countdown="countdown"
    :isPlaying="isPlaying"
    :isVideoMuted="isMuted"
    @requestPlayPause="togglePlayPause"
    @requestMute="toggleMute"
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
  isMuted,
  isPlaying,
  countdown,
  handleMediaEnd,
  togglePlayPause,
  onSlideChange,
  onProgress,
  toggleMute,
} = useSwiper();

onMounted(() => {
  const mediaElements = document.querySelectorAll('.swiper-container video, .swiper-container img');
  media.value = Array.from(mediaElements);
});
</script>

<style>
:root {
  --swiper-pagination-color: #000;
  --swiper-navigation-color: #000;
}

.intro-slide-visible.show-unmute-tip:before {
  content: "";
  @apply absolute top-0 left-0 w-full h-full bg-black/20 z-30;
}

.intro-slide-visible .swiper-container::part(button-prev),
.intro-slide-visible .swiper-container::part(button-next) {
  @apply hidden !important;
}

.swiper-container::part(button-prev),
.swiper-container::part(button-next) {
  @apply hidden md:flex !important;
}

.swiper-container::part(pagination) {
  @apply md:w-[768px] top-[calc(50%+150px)] md:top-[calc(50%+216px)] left-1/2 transform -translate-x-1/2;
}

swiper-slide video,
swiper-slide img {
  @apply w-full h-[300px] md:w-[768px] md:h-[432px] mx-auto object-cover;
}
</style>
