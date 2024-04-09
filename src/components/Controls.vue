<template>
  <div
    class="absolute top-0 left-0 right-0 bottom-0 w-1/2 h-[300px] md:w-[768px] md:h-[432px] bg-transparent z-30 flex items-center justify-center mx-auto"
  >
    <button
      @click="toggleMute"
      class="toggle-mute absolute right-[calc(-50%+12px)] md:right-3 bottom-3 py-1.5 px-3 rounded bg-[#0a0a0a]/75 text-white z-30 hover:bg-[#0a0a0a] transition-opacity"
    >
      <component :is="muteIconComponent" class="w-6 h-6 text-white" />
    </button>
    <div
      class="tooltip hidden absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 w-[150%] max-w-96 p-4 bg-white text-[#0a0a0a] rounded shadow-lg text-center z-30"
    >
      <strong class="block mb-1.5 font-semibold">Ready to Watch?</strong>
      <p class="mb-1 opacity-75 leading-snug">
        Please unmute your device to start enjoying this Tribute.
      </p>
    </div>
    <div
      v-if="countdown > 0"
      class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center mr-[-50%] md:mr-0 bg-white text-[#0a0a0a] rounded-full text-xs font-semibold opacity-75"
    >
      {{ countdown }}
    </div>
    <!-- Commented out the original play-pause button
    <button
      @click="togglePlayPause"
      class="toggle-play-pause z-30"
    >
      <component
        :is="iconComponent"
        class="h-9 w-14 p-2 bg-[#0a0a0a]/75 text-white rounded hover:bg-[#0a0a0a] transition-opacity"
      />
    </button>
    -->
    <!-- New full-size div for toggling play and pause -->
    <div
      @click="togglePlayPause"
      class="absolute top-0 left-0 w-full h-full z-20 cursor-pointer"
    ></div>
  </div>
</template>


<script setup>
import { ref, computed } from "vue";
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/vue/24/solid";

const props = defineProps({
  countdown: Number,
  isPlaying: Boolean,
  isVideoMuted: Boolean,
});

const emits = defineEmits(["toggle", "toggleMute"]);
const iconComponent = computed(() => (props.isPlaying ? PauseIcon : PlayIcon));
const muteIconComponent = computed(() =>
  props.isVideoMuted ? SpeakerXMarkIcon : SpeakerWaveIcon,
);

const togglePlayPause = () => {
  emits("requestPlayPause");
};

const toggleMute = () => {
  emits("requestMute");
  emits("requestResumeAudioContext");
};
</script>

<style>
.swiper-wrapper.intro-slide-visible.show-unmute-tip + div > .tooltip {
  @apply block !important;
}

.swiper-wrapper.intro-slide-visible.show-unmute-tip + div > .toggle-mute {
  animation: pulse 1.5s infinite;
  @apply block !important;
}

.swiper-wrapper.intro-slide-visible.show-unmute-tip + div .toggle-play-pause {
  @apply opacity-60 pointer-events-none !important;
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
