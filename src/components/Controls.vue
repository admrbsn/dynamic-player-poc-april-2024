<template>
  <!-- Control bar -->
  <div
    :class="{ 'controls-visible': controlsVisible }"
    class="controls absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[calc(100%-16px)] md:w-[752px] flex items-center justify-between p-2 bg-black/90 rounded z-30"
    @mouseover="mouseOverControls = true"
    @mouseleave="mouseOverControls = false"
  >
    <!-- Duration -->
    <span v-if="currentDuration" class="w-20 -mt-[1px] text-white text-xs">{{
      displayTime
    }}</span>

    <!-- Scrubber -->
    <div class="w-full h-1 bg-white/25 rounded-full">
      <div
        class="w-0 h-full bg-white rounded-full"
        :style="{ width: progressBarWidth }"
      ></div>
    </div>

    <div class="w-20 flex items-center justify-end gap-x-3">
      <!-- Captions -->
      <button @click="toggleCaptions" class="toggle-captions">
        <img :src="captionsIcon" alt="Toggle captions." class="w-4 h-4" />
      </button>
      <!-- Mute -->
      <button @click="toggleMute" class="toggle-mute text-white rounded">
        <component :is="muteIconComponent" class="w-4 h-4 text-white" />
      </button>
    </div>
  </div>

  <!-- Mobile unmute tootltip -->
  <div
    class="tooltip hidden absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 w-[150%] max-w-96 p-4 bg-white text-[#0a0a0a] rounded-lg shadow-lg text-center z-30"
  >
    <strong class="block mb-1.5 text-sm font-semibold">Ready to Watch?</strong>
    <p class="mb-1 opacity-75 text-sm leading-snug">
      Please unmute your device to start enjoying this Tribute.
    </p>
  </div>

  <!-- Countdown for images-->
  <div
    v-if="countdown > 0"
    class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center mr-[-50%] md:mr-0 bg-white text-[#0a0a0a] rounded-full text-xs font-semibold opacity-75"
  >
    {{ countdown }}
  </div>

  <!-- Play and pause -->
  <component
    :is="iconComponent"
    :class="{ 'play-pause-visible': controlsVisible }"
    class="play-pause absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 h-16 text-white pointer-events-none opacity-50 z-30"
  />
</template>

<script setup>
import { ref, computed } from "vue";
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/vue/24/solid";
import ccOn from "@/assets/cc-on.svg";
import ccOff from "@/assets/cc-off.svg";

const props = defineProps({
  hoverSwiper: Boolean,
  countdown: Number,
  isPlaying: Boolean,
  isVideoMuted: Boolean,
  currentDuration: Number,
  currentTime: Number,
  showCaptions: Boolean,
});

const emits = defineEmits([
  "requestMute",
  "requestResumeAudioContext",
  "requestToggleCaptions",
]);

const mouseOverControls = ref(false);

const controlsVisible = computed(() => {
  return props.hoverSwiper || mouseOverControls.value;
});
const iconComponent = computed(() => (props.isPlaying ? PauseIcon : PlayIcon));
const captionsIcon = computed(() => (props.showCaptions ? ccOn : ccOff));
const muteIconComponent = computed(() =>
  props.isVideoMuted ? SpeakerXMarkIcon : SpeakerWaveIcon,
);

const toggleMute = () => {
  emits("requestMute");
  emits("requestResumeAudioContext");
};

const toggleCaptions = () => {
  emits("requestToggleCaptions");
};

const formatDuration = (duration) => {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  } else {
    return `:${seconds.toString().padStart(2, "0")}`;
  }
};

const displayTime = computed(() => {
  return `${formatDuration(props.currentTime)} / ${formatDuration(props.currentDuration)}`;
});

const progressBarWidth = computed(() => {
  if (props.currentDuration > 0 && props.currentTime >= 0) {
    const percentage = (props.currentTime / props.currentDuration) * 100;
    return `${percentage}%`;
  }
  return "0%";
});
</script>

<style scoped>
.swiper-wrapper.intro-slide-visible.show-unmute-tip + div > .tooltip {
  @apply block !important;
}

.swiper-wrapper.intro-slide-visible.show-unmute-tip + div > .toggle-mute {
  animation: pulse 1.5s infinite;
  @apply block !important;
}

.controls,
.play-pause {
  opacity: 0;
  visibility: hidden;
  transition:
    visibility 0.25s,
    opacity 0.25s;
}

.controls-visible,
.play-pause-visible {
  opacity: 1;
  visibility: visible;
  transition:
    visibility 0s,
    opacity 0.25s;
}

@keyframes pulse {
  0% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 20px rgba(255, 255, 255, 0);
  }
  100% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}
</style>
