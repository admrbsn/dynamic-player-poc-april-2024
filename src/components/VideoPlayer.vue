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
    controlslist="nofullscreen nodownload noremoteplayback noplaybackrate"
    :class="{ 'show-controls': !isPlaying }"
    :src="url"
    :muted="isVideoMuted"
    @loadeddata="videoLoaded"
    @ended="handleMediaEnd"
  ></video>
  <div v-if="name" :class="{ 'visible': isPlaying }" class="video-name absolute bottom-3 h-[46px] flex items-center ml-[10px] px-4 bg-white text-black rounded text-xl font-semibold">{{ name }}</div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import Hls from "hls.js";

const props = defineProps({
  url: String,
  name: String,
  index: Number,
  isPlaying: Boolean,
  isVideoMuted: Boolean,
  showCaptions: Boolean,
});

const emits = defineEmits(["mediaEnd"]);
const videoRef = ref(null);
const isLoading = ref(true);
let hls = null;

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
};

const handleMediaEnd = () => {
  emits("mediaEnd", props.index);
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

onMounted(() => {
  setupHls();
});
</script>

<style scoped>
.intro-slide-visible video {
  @apply bg-[#78cdbf];
}

.loader {
  animation: rotation 1s linear infinite;
  border-bottom-color: #ff6e6c;
}

.video-name {
  opacity: 0;
  visibility: hidden;
}

.visible {
  opacity: 1;
  visibility: visible;
  transition: visibility 0s linear 0.5s, opacity 0.5s linear 1.0s;
}

/* webkit video controls */
video::-webkit-media-controls-play-button,
video::-webkit-media-controls-fullscreen-button,
video::-webkit-media-controls-mute-button,
video::-webkit-media-controls-toggle-closed-captions-button,
video::-webkit-media-controls-volume-slider,
video::-webkit-media-controls-overflow-button {
  @apply hidden;
}

video::-webkit-media-controls {
  opacity: 0;
  visibility: hidden;
  transition: visibility 0s linear 1.25s, opacity 0.75s linear 0.5s;
}

video.show-controls::-webkit-media-controls {
  opacity: 1;
  visibility: visible;
  transition: visibility 0s linear 0s, opacity 0.25s linear;
}

video::-webkit-media-controls-panels {
  @apply transition-none;
}

video::-webkit-media-controls-panel {
  @apply bg-none bg-black h-12 absolute w-[calc(100%-20px)] bottom-0 left-0 m-2.5 rounded;
}

video::-webkit-media-controls-current-time-display,
video::-webkit-media-controls-time-remaining-display {
  @apply pb-2.5 text-xs leading-none;
}

video::-webkit-media-controls-timeline {
  @apply -mb-2;
}

video::-webkit-media-controls-volume-control-container {
  @apply left-10 bg-black z-20;
}

video::-webkit-media-text-track-display {
  @apply top-auto bottom-2.5 left-1/2 -translate-x-1/2 w-fit p-3 rounded-none !important;
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
