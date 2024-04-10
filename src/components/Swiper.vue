<template>
  <div class="swiper-wrapper py-3 bg-black">
    <!-- Main Swiper -->
    <swiper-container
      class="swiper-container"
      :navigation="true"
      :thumbs="{ swiper: '.thumbs-swiper' }"
      @swiperslidechange="onSlideChange"
      @swiperprogress="onProgress"
    >
      <swiper-slide
        v-for="(item, index) in mediaItems"
        :key="`main-${index}`"
        class="flex items-center justify-center"
      >
        <div class="w-full h-[300px] md:w-[768px] md:h-[432px] mx-auto rounded overflow-hidden">
          <template v-if="item.type === 'video'">
            <VideoPlayer
              :url="item.url"
              :name="item.name"
              :index="index"
              :isVideoMuted="isMuted"
              :showCaptions="showCaptions"
              @mediaEnd="handleMediaEnd"
            />
          </template>
          <template v-else-if="item.type === 'image'">
            <img :src="item.url" />
          </template>
        </div>
      </swiper-slide>
    </swiper-container>
    <!-- Thumbnails Swiper -->
    <swiper-container
      class="thumbs-swiper w-full md:w-[768px] mt-2"
      :slides-per-view="6"
      :space-between="8"
      :free-mode="true"
      :watch-slides-progress="true"
    >
      <swiper-slide
        v-for="(item, index) in mediaItems"
        :key="`thumb-${index}`"
        class="transition-transform transition-opacity duration-100 hover:scale-105 cursor-pointer"
      >
        <img :src="item.thumbnail" :alt="`Thumbnail ${index+1}`" class="w-full h-full object-cover rounded overflow-hidden">
        <div v-if="item.name" class="absolute bottom-0 left-0 w-full h-8 flex items-end pb-1 px-1 bg-gradient-to-t from-black/50 to-transparent text-white text-[10px] font-semibold">{{ item.name }}</div>
      </swiper-slide>
    </swiper-container>
  </div>
  <Controls
    :countdown="countdown"
    :isPlaying="isPlaying"
    :isVideoMuted="isMuted"
    :showCaptions="showCaptions"
    @requestPlayPause="togglePlayPause"
    @requestMute="toggleMute"
    @requestToggleCaptions="toggleCaptions"
    @requestResumeAudioContext="resumeAudioContext"
  />
</template>

<script setup>
import useSwiper from "../composables/useSwiper";
import VideoPlayer from "./VideoPlayer.vue";
import Controls from "./Controls.vue";
import { ref, onMounted } from "vue";
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

const showCaptions = ref(false);
const toggleCaptions = () => {
  showCaptions.value = !showCaptions.value;
};

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
  --swiper-navigation-color: #fff;
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

.thumbs-swiper::part(container) {
  @apply overflow-visible;
}

.thumbs-swiper swiper-slide.swiper-slide-thumb-active:before {
  content: "";
  @apply absolute w-full h-full rounded shadow-[inset_0_0_0_2px_rgba(255,255,255,1.0)];
}

.thumbs-swiper swiper-slide:not(.swiper-slide-thumb-active) {
  @apply opacity-75;
}

.thumbs-swiper swiper-slide:not(.swiper-slide-thumb-active):hover {
  @apply opacity-100;
}
</style>
