<template>
  <div
    class="absolute top-3 left-0 right-0 bottom-0 w-1/2 h-[300px] md:w-[768px] md:h-[432px] bg-transparent z-30 flex items-center justify-center mx-auto"
    @mouseenter="hover = true" @mouseleave="hover = false"
  >
    <div :class="{ 'controls-visible': !isPlaying || hover }" class="controls absolute bottom-2 w-[calc(100%-16px)] flex items-center justify-between p-2 bg-black/90 rounded">
      <!-- Duration -->
      <span v-if="currentDuration" class="w-20 -mt-[1px] text-white text-xs">{{ displayTime }}</span>

      <!-- Scrubber -->
      <div class="w-full h-1 bg-white/25 rounded-full">
        <div class="w-0 h-full bg-white rounded-full" :style="{ width: progressBarWidth }"></div>
      </div>
      
      <div class="w-20 flex items-center justify-end gap-x-3">
        <!-- Captions -->
        <button
          @click="toggleCaptions"
          class="toggle-captions"
        >
          <img :src="captionsIcon" alt="Toggle captions." class="w-4 h-4" />
        </button>
        <!-- Mute -->
        <button
          @click="toggleMute"
          class="toggle-mute text-white rounded"
        >
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
    <div
      v-if="countdown > 0"
      class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center mr-[-50%] md:mr-0 bg-white text-[#0a0a0a] rounded-full text-xs font-semibold opacity-75"
    >
      {{ countdown }}
    </div>
    <!-- Full-size div for toggling play and pause -->
    <div
      @click="togglePlayPause"
      class="group absolute top-0 left-0 w-full h-full flex items-center justify-center z-20 transition-opacity cursor-pointer"
    >
      <component
        :is="iconComponent"
        class="h-16 text-white opacity-0 group-hover:opacity-50 transition-opacity override-opacity"
      />
    </div>
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
import ccOn from '@/assets/cc-on.svg';
import ccOff from '@/assets/cc-off.svg';

const props = defineProps({
  countdown: Number,
  isPlaying: Boolean,
  isVideoMuted: Boolean,
  currentDuration: Number,
  currentTime: Number,
  showCaptions: Boolean,
});
const hover = ref(false);

const emits = defineEmits(["requestPlayPause", "requestMute", "requestResumeAudioContext", "requestToggleCaptions"]);

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

const formatDuration = (duration) => {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `:${seconds.toString().padStart(2, '0')}`; 
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
  return '0%';
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

.swiper-wrapper.intro-slide-visible.show-unmute-tip + div .toggle-play-pause {
  @apply opacity-60 pointer-events-none !important;
}

.controls {
  opacity: 0;
  visibility: invisible;
  transition: visibility 0.25s linear 0.25s, opacity 0.25s linear 0.25s;
}

.controls-visible {
  opacity: 1;
  visibility: visible;
  transition: visibility 0.25s linear 0.25s, opacity 0.25s linear 0.25s;
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
