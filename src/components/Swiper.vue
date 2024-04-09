<template>
  <div class="swiper-wrapper bg-[#0a0a0a]">
    <swiper-container
      class="swiper-container rounded-lg"
      :navigation="true"
      @swiperslidechange="onSlideChange"
      @swiperprogress="onProgress"
    >
      <swiper-slide
        v-for="(item, index) in mediaItems"
        :key="index"
        class="flex items-center justify-center"
      >
        <div class="w-full h-[300px] md:w-[768px] md:h-[432px] mx-auto">
          <template v-if="item.type === 'video'">
            <VideoPlayer
              :url="item.url"
              :name="item.name"
              :index="index"
              :isVideoMuted="isMuted"
              @mediaEnd="handleMediaEnd"
            />
          </template>
          <template v-else-if="item.type === 'image'">
            <img :src="item.url" />
          </template>
        </div>
      </swiper-slide>
    </swiper-container>
  </div>
  <Controls
    :countdown="countdown"
    :isPlaying="isPlaying"
    :isVideoMuted="isMuted"
    @requestPlayPause="togglePlayPause"
    @requestMute="toggleMute"
    @requestResumeAudioContext="resumeAudioContext"
  />
</template>

<script setup>
import useSwiper from "../composables/useSwiper";
import VideoPlayer from "./VideoPlayer.vue";
import Controls from "./Controls.vue";
import { onMounted } from "vue";
import { register } from "swiper/element/bundle";

register();

const {
  handleMediaEnd,
  togglePlayPause,
  onSlideChange,
  onProgress,
  toggleMute,
  resumeAudioContext,
  mediaItems,
  media,
  isMuted,
  isPlaying,
  countdown,
} = useSwiper();

onMounted(() => {
  const mediaElements = document.querySelectorAll(
    ".swiper-container video, .swiper-container img",
  );
  media.value = Array.from(mediaElements);
});
</script>

<style>
:root {
  /* add swiper css var overrides */
}

.intro-slide-visible.show-unmute-tip:before {
  content: "";
  @apply absolute top-0 left-0 w-full h-full bg-[#0a0a0a]/50 z-30;
}

.intro-slide-visible .swiper-container::part(button-prev),
.intro-slide-visible .swiper-container::part(button-next) {
  @apply hidden !important;
}

.swiper-container::part(button-prev),
.swiper-container::part(button-next) {
  @apply hidden md:flex !important;
}
</style>
