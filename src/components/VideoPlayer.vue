<template>
  <video
    preload="auto"
    :src="url"
    @ended="handleMediaEnd"
    ref="videoRef"
    playsinline
    muted="muted"
  ></video>
  <button @click="toggleMute" class="absolute right-3 bottom-3 py-1.5 px-3 rounded bg-black text-white">{{ isVideoMuted ? 'Unmute' : 'Mute' }}</button>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Hls from 'hls.js';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  url: String,
  index: Number,
});

const emits = defineEmits(['mediaEnd']);
const videoRef = ref(null);
const isVideoMuted = ref(true);

const setupHls = () => {
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(props.url);
    hls.attachMedia(videoRef.value);
  } else if (videoRef.value.canPlayType('application/vnd.apple.mpegurl')) {
    videoRef.value.src = props.url;
  }
};

const toggleMute = () => {
  if (videoRef.value) {
    videoRef.value.muted = !videoRef.value.muted;
    isVideoMuted.value = videoRef.value.muted;
  }
};

const handleMediaEnd = () => {
  emits('mediaEnd', props.index);
};

onMounted(() => {
  setupHls();
});
</script>
