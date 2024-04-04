<template>
  <div class="swiper-wrapper bg-[#0a0a0a]">
    <swiper-container
      class="swiper-container rounded-lg"
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
        class="flex items-center justify-center"
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
          <img :src="item.url" />
        </template>
      </swiper-slide>
    </swiper-container>
  </div>
  <Controls
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
import Controls from './Controls.vue';
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
  --swiper-pagination-color: #0a0a0a;
  --swiper-navigation-color: #fff;
}

.intro-slide-visible.show-unmute-tip:before {
  content: "";
  @apply absolute top-0 left-0 w-full h-full bg-[#0a0a0a]/20 z-30;
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
  @apply md:w-[768px] top-[calc(50%+146px)] md:top-[calc(50%+212px)] left-1/2 transform -translate-x-1/2;
}

swiper-slide video,
swiper-slide img {
  @apply w-full h-[300px] md:w-[768px] md:h-[432px] mx-auto object-cover;
}
</style>
