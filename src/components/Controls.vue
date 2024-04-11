<template>
  <div
    class="absolute top-3 left-0 right-0 bottom-0 w-1/2 h-[300px] md:w-[768px] md:h-[368px] bg-transparent z-30 flex items-center justify-center mx-auto"
  >
    <!-- Captions -->
    <button
      @click="toggleCaptions"
      :class="{ 'visible': !isPlaying }"
      class="toggle-captions absolute -right-10 md:right-12 bottom-[12.5%] md:-bottom-8 bg-transparent z-30"
    >
      <img :src="captionsIcon" alt="Toggle captions." class="w-4 h-4" />
    </button>
    <!-- Mute -->
    <button
      @click="toggleMute"
      :class="{ 'visible': !isPlaying }"
      class="toggle-mute absolute -right-16 md:right-6 bottom-[12.5%] md:-bottom-8 bg-transparent text-white rounded z-30"
    >
      <component :is="muteIconComponent" class="w-4 h-4 text-white" />
    </button>
    <!-- Mobile unmute tootltip -->
    <div
      class="tooltip hidden absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 w-[150%] max-w-96 p-4 bg-white text-[#0a0a0a] rounded-lg shadow-lg text-center z-30"
    >
      <strong class="block mb-1.5 text-sm font-semibold">Ready to Watch?</strong>
      <p class="mb-1 opacity-75 text-sm leading-snug">
        Please unmute your device to start enjoying this Tribute.
      </p>
    </div>
    <div
      v-if="countdown > 0"
      class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center mr-[-50%] md:mr-0 bg-white text-[#0a0a0a] rounded-full text-xs font-semibold opacity-75"
    >
      {{ countdown }}
    </div>
    <!-- Full-size div for toggling play and pause -->
    <div
      @click="togglePlayPause"
      class="group absolute top-0 left-0 w-full h-[calc(100%-60px)] md:h-full flex items-center justify-center z-20 transition-opacity cursor-pointer"
    >
      <component
        :is="iconComponent"
        class="h-16 mt-[60px] text-white opacity-0 group-hover:opacity-50 transition-opacity override-opacity"
      />
    </div>
  </div>
</template>


<script setup>
import { computed } from "vue";
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/vue/24/solid";
import ccOn from '@/assets/cc-on.svg';
import ccOff from '@/assets/cc-off.svg';

const props = defineProps({
  countdown: Number,
  isPlaying: Boolean,
  isVideoMuted: Boolean,
  showCaptions: Boolean,
});

const emits = defineEmits(["toggle", "toggleMute"]);

const iconComponent = computed(() => (props.isPlaying ? PauseIcon : PlayIcon));
const captionsIcon = computed(() => props.showCaptions ? ccOn : ccOff);
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

const toggleCaptions = () => {
  emits("requestToggleCaptions");
};
</script>

<style scoped>
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

.toggle-captions, .toggle-mute {
  opacity: 0;
  visibility: hidden;
  transition: visibility 0s linear 1.25s, opacity 0.75s linear 0.5s;
}

.visible {
  opacity: 1;
  visibility: visible;
  transition: visibility 0s linear 0s, opacity 0.25s linear;
}

.override-opacity:hover {
    opacity: 100% !important;
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
