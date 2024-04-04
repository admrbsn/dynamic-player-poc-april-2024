<template>
  <video
    preload="auto"
    :src="url"
    @ended="handleMediaEnd"
    ref="videoRef"
    playsinline
    :muted="isVideoMuted"
  ></video>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Hls from 'hls.js';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  url: String,
  index: Number,
  isVideoMuted: Boolean,
});

const emits = defineEmits(['mediaEnd']);
const videoRef = ref(null);

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
  emits('requestToggleMute');
};

const handleMediaEnd = () => {
  emits('mediaEnd', props.index);
};

onMounted(() => {
  setupHls();
});
</script>
