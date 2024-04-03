<template>
  <video
    preload="auto"
    :src="url"
    @ended="handleMediaEnd"
    ref="videoRef"
    playsinline
    :muted="isVideoMuted"
  ></video>
  <button @click="toggleMute" class="absolute right-3 bottom-3 py-1.5 px-3 rounded bg-black text-white">{{ isVideoMuted ? 'Unmute' : 'Mute' }}</button>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import Hls from 'hls.js';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  url: String,
  index: Number,
});

const emits = defineEmits(['mediaEnd']);
const videoRef = ref(null);
const isVideoMuted = inject('isMuted');

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
    isVideoMuted.value = !isVideoMuted.value;
  }
};

const handleMediaEnd = () => {
  emits('mediaEnd', props.index);
};

onMounted(() => {
  setupHls();
});
</script>
