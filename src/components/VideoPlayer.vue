<template>
  <div
    v-if="isLoading"
    class="loader absolute top-[calc(50%-24px)] left-[calc(50%-24px)] transform -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-4 border-white border-b-transparent animate-spin"
  ></div>
  <video
    ref="videoRef"
    preload="auto"
    class="bg-black"
    playsinline
    :src="url"
    :muted="isVideoMuted"
    @loadeddata="videoLoaded"
    @ended="handleMediaEnd"
  ></video>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Hls from "hls.js";
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  url: String,
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

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
