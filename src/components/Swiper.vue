<template>
  <div class="swiper-wrapper md:py-3 md:bg-black">
    <div class="relative">
      <!-- Main Swiper -->
      <swiper-container
        class="swiper-container"
        :navigation="true"
        :slides-per-view="'auto'"
        :centered-slides="true"
        :space-between="8"
        :thumbs="{ swiper: '.thumbs-swiper' }"
        @swiperslidechange="onSlideChange"
        @swiperprogress="onProgress"
      >
        <swiper-slide
          v-for="(item, index) in mediaItems"
          :key="`main-${index}`"
          class="md:w-[768px] flex items-center justify-center cursor-pointer"
          @click="togglePlayPause"
          @mouseover="() => hoverSwiper = true"
          @mouseleave="() => hoverSwiper = false"
          @touchstart="() => hoverSwiper = true"
          @touchend="() => hoverSwiper = false"
        >
          <div class="w-full h-[300px] md:w-[768px] md:h-[432px] mx-auto rounded overflow-hidden">
            <template v-if="item.type === 'video'">
              <VideoPlayer
                :url="item.url"
                :name="item.name"
                :index="index"
                :isPlaying="isPlaying"
                :isVideoMuted="isMuted"
                :showCaptions="showCaptions"
                @videoDuration="handleVideoDuration"
                @updateCurrentTime="updateCurrentTime"
                @mediaEnd="handleMediaEnd"
              />
            </template>
            <template v-else-if="item.type === 'image'">
              <img :src="item.url" />
            </template>
          </div>
        </swiper-slide>
      </swiper-container>
      <Controls
        :hoverSwiper="hoverSwiper"
        :countdown="countdown"
        :currentDuration="videoDurations[currentMediaIndex]"
        :currentTime="videoCurrentTimes[currentMediaIndex] || 0"
        :isPlaying="isPlaying"
        :isVideoMuted="isMuted"
        :showCaptions="showCaptions"
        @requestMute="toggleMute"
        @requestToggleCaptions="toggleCaptions"
        @requestResumeAudioContext="resumeAudioContext"
      />
    </div>
    <div class="relative">
    <!-- Thumbnails Swiper -->
    <swiper-container
      class="thumbs-swiper w-full md:w-[768px] mt-2"
      :space-between="8"
      :free-mode="true"
      :watch-slides-progress="true"
      :slides-per-view="3"
      :breakpoints="{
        '768': {
          slidesPerView: 4,
        },
        '1024': {
          slidesPerView: 5,
        },
      }"
    >
      <swiper-slide
        v-for="(item, index) in mediaItems"
        :key="`thumb-${index}`"
        class="transition-transform transition-opacity duration-100 cursor-pointer"
      >
        <img :src="item.thumbnail" :alt="`Thumbnail ${index+1}`" class="w-full h-full object-cover rounded overflow-hidden">
        <div v-if="item.name" class="absolute bottom-0 left-0 w-full h-8 flex items-end pb-1 px-1 text-white text-[10px] font-semibold">
          <span class="py-1 px-2 bg-black rounded-full">{{ item.name }}</span>
        </div>
      </swiper-slide>
    </swiper-container>
  </div>
  </div>
</template>

<script setup>
import useSwiper from "../composables/useSwiper";
import VideoPlayer from "./VideoPlayer.vue";
import Controls from "./Controls.vue";
import { ref, reactive, onMounted } from "vue";
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
  currentMediaIndex,
} = useSwiper();

const videoDurations = reactive({});
const videoCurrentTimes = reactive({});
const showCaptions = ref(false);
const hoverSwiper = ref(false);

const handleVideoDuration = ({ index, duration }) => {
  videoDurations[index] = duration;
};

const updateCurrentTime = ({ index, currentTime }) => {
  videoCurrentTimes[index] = currentTime;
};

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

.swiper-container::part(button-prev),
.swiper-container::part(button-next) {
  @apply hidden md:flex !important;
}

.swiper-container::part(button-prev) {
  @apply left-[calc(50%-448px)] w-4 opacity-25 hover:opacity-100;
}


.swiper-container::part(button-next) {
  @apply right-[calc(50%-448px)] w-4 opacity-25 hover:opacity-100;
}

.swiper-container swiper-slide:not(.swiper-slide-active) {
  @apply opacity-50;
}

.swiper-container swiper-slide:not(.swiper-slide-active) .name {
  @apply hidden;
}

.thumbs-swiper swiper-slide.swiper-slide-thumb-active:before {
  content: "";
  @apply absolute w-full h-full rounded shadow-[inset_0_0_0_2px_rgba(0,0,0,1.0)] md:shadow-[inset_0_0_0_2px_rgba(255,255,255,1.0)] z-30;
}

.thumbs-swiper swiper-slide:not(.swiper-slide-thumb-active) {
  @apply opacity-75;
}

.thumbs-swiper swiper-slide:not(.swiper-slide-thumb-active):hover {
  @apply opacity-100;
}
</style>
