<template>
  <div
    v-if="isLoading"
    class="loader absolute top-[calc(50%-24px)] left-[calc(50%-24px)] transform -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-4 border-white border-b-transparent animate-spin"
  ></div>
  <video
    ref="videoRef"
    preload="auto"
    class="w-full h-full object-cover bg-black"
    playsinline
    :class="{ 'show-controls': !isPlaying }"
    :src="url"
    :muted="isVideoMuted"
    @loadedmetadata="videoLoaded"
    @ended="handleMediaEnd"
  ></video>
  <div v-if="name" :class="{ 'name-visible': isPlaying }" class="video-name absolute bottom-3 h-[46px] flex items-center ml-[10px] px-4 bg-white text-black rounded text-xl font-semibold">{{ name }}</div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import Hls from "hls.js";

const props = defineProps({
  url: String,
  name: String,
  index: Number,
  isPlaying: Boolean,
  isVideoMuted: Boolean,
  showCaptions: Boolean,
});

const emits = defineEmits(["mediaEnd", "videoDuration", "updateCurrentTime"]);
const videoRef = ref(null);
const isLoading = ref(true);
let hls = null;
let playbackInterval = null;
let frameId = null;

const setupHls = () => {
  if (Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(props.url);
    hls.attachMedia(videoRef.value);
    hls.on(Hls.Events.MANIFEST_LOADED, () => {
      if (props.showCaptions) {
        enableCaptions();
      }
    });
  } else if (videoRef.value.canPlayType('application/vnd.apple.mpegurl')) {
    videoRef.value.src = props.url;
  }
  isLoading.value = true;
};

const enableCaptions = () => {
  const englishTrackIndex = hls.subtitleTracks.findIndex(track => track.lang === 'en-x-autogen');
  console.log("English track index:", englishTrackIndex);
  if (englishTrackIndex !== -1) {
    hls.subtitleTrack = englishTrackIndex;
  }
};

const disableCaptions = () => {
  hls.subtitleTrack = -1;
};

const videoLoaded = () => {
  isLoading.value = false;
  nextTick(() => {
    const duration = videoRef.value.duration;
    emits("videoDuration", { index: props.index, duration });
    updateCurrentTime();
  });
};

const handleMediaEnd = () => {
    emits("mediaEnd", props.index);
    if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
    }
    setTimeout(() => {
    }, 100);
};


const updateCurrentTime = () => {
  const currentTime = videoRef.value.currentTime;
  emits("updateCurrentTime", { index: props.index, currentTime });
  frameId = requestAnimationFrame(updateCurrentTime);
};

watch(() => props.showCaptions, (newVal) => {
  if (hls) {
    if (newVal) {
      enableCaptions();
    } else {
      disableCaptions();
    }
  }
});

watch(() => props.isPlaying, (newVal) => {
  if (newVal) {
      frameId = requestAnimationFrame(updateCurrentTime);
  } else {
      if (frameId !== null) {
          cancelAnimationFrame(frameId);
          frameId = null;
      }
  }
});

onMounted(() => {
  setupHls();
});

onUnmounted(() => {
  if (frameId !== null) {
      cancelAnimationFrame(frameId);
  }
});
</script>

<style scoped>
.intro-slide-visible video {
  @apply bg-[#78cdbf];
}

.loader {
  animation: rotation 1s linear infinite;
  border-bottom-color: black;
}

.video-name {
  opacity: 0;
  visibility: hidden;
}

.name-visible {
  opacity: 1;
  visibility: visible;
  transition: visibility 0s linear 1s, opacity 1s linear 1.5s;
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
