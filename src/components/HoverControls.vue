<template>
  <button
    @click="toggleMute"
    class="absolute top-3 right-3 py-1.5 px-3 rounded bg-black text-white z-30"
  >
    <component :is="muteIconComponent" class="w-6 h-6 text-white" />
  </button>
  <div
    class="
      absolute
      top-1/2
      left-1/2
      transform
      -translate-x-1/2 -translate-y-1/2
      w-1/2 h-[300px]
      md:w-[768px] md:h-[432px]
      bg-transparent
      z-10
    "
    @mouseover="handleMouseOver"
    @mouseleave="handleMouseLeave"
    @touchstart="handleMouseOver"
    @touchend="handleMouseLeave"
  >
    <div
      v-if="countdown > 0"
      class="
        absolute
        top-3
        right-3
        w-7
        h-7
        flex
        items-center
        justify-center
        mr-[-50%]
        md:mr-0
        bg-white
        text-black
        rounded-full
        text-xs
        font-semibold
        opacity-75
      "
    >
      {{ countdown }}
    </div>
    <button
      @click="togglePlayPause"
      class="
        absolute
        top-1/2
        left-1/2
        transform
        -translate-x-1/2 -translate-y-1/2
        z-20
      "
    >
      <component
        :is="iconComponent"
        class="
          h-16
          w-16
          p-4
          bg-white
          rounded-full
          opacity-75
          hover:opacity-100
          transition-opacity
        "
      />
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/vue/24/solid';

const props = defineProps({
  countdown: Number,
  isPlaying: Boolean,
  isVideoMuted: Boolean,
});

const emits = defineEmits(['toggle', 'toggleMute']);
const isHovering = ref(false);
const iconComponent = computed(() => (props.isPlaying ? PauseIcon : PlayIcon));
const muteIconComponent = computed(() => props.isVideoMuted ? SpeakerWaveIcon : SpeakerXMarkIcon);

const handleMouseOver = () => {
  isHovering.value = true;
};

const handleMouseLeave = () => {
  isHovering.value = false;
};

const togglePlayPause = () => {
  emits('toggle');
};

const toggleMute = () => {
  emits('requestToggleMute');
};
</script>
