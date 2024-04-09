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
    controls
    disablepictureinpicture
    controlslist="nodownload noplaybackrate"
    :src="url"
    :muted="isVideoMuted"
    @loadeddata="videoLoaded"
    @ended="handleMediaEnd"
  ></video>
  <div v-if="name" class="absolute bottom-4 ml-4 py-2 px-4 bg-white text-black rounded text-xl font-semibold">{{ name }}</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Hls from "hls.js";
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  url: String,
  name: String,
  index: Number,
  isVideoMuted: Boolean,
});

const emits = defineEmits(["mediaEnd"]);
const videoRef = ref(null);
const isLoading = ref(true);

const setupHls = () => {
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(props.url);
    hls.attachMedia(videoRef.value);
  } else if (videoRef.value.canPlayType("application/vnd.apple.mpegurl")) {
    videoRef.value.src = props.url;
  }
  isLoading.value = true;
};

const videoLoaded = () => {
  isLoading.value = false;
};

const handleMediaEnd = () => {
  emits("mediaEnd", props.index);
};

onMounted(() => {
  setupHls();
});
</script>

<style>
.intro-slide-visible video {
  @apply bg-[#78cdbf];
}

.loader {
  animation: rotation 1s linear infinite;
  border-bottom-color: #ff6e6c;
}

/* webkit video controls */
video::-webkit-media-controls-play-button,
video::-webkit-media-controls-fullscreen-button,
video::-webkit-media-controls-mute-button,
video::-webkit-media-controls-toggle-closed-captions-button,
video::-webkit-media-controls-volume-slider {
  @apply hidden;
}
video::-webkit-media-controls-timeline {
  @apply mr-12;
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
