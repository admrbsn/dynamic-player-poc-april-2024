import { ref } from "vue";

// TODO: bug where if you pause the video, mute, and unmute, the music starts playing.

// Web Audio API setup
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let audioSource = null;
let audioBuffer = null;
let isAudioPlaying = ref(false);
const gainNode = audioCtx.createGain();
gainNode.connect(audioCtx.destination);

// Load audio into buffer
async function loadAudio(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
}

// Play audio
function playAudio(isMuted, currentMediaIndex, mediaItems) {
  if (audioBuffer && !isAudioPlaying.value && currentMediaIndex >= 1) {
    if (audioSource) {
      audioSource.disconnect(); // Ensure clean start
    }
    audioSource = audioCtx.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(gainNode);
    audioSource.loop = true;
    // Set initial volume based on mute state and media type
    gainNode.gain.value = isMuted
      ? 0
      : mediaItems[currentMediaIndex].type === "image"
        ? 1.0
        : 0.1;
    audioSource.start(0);
    isAudioPlaying.value = true; // Update flag
    audioSource.onended = () => (isAudioPlaying.value = false); // Reset flag when audio ends
  }
}

// Stop audio
function stopAudio() {
  if (isAudioPlaying.value) {
    audioSource.stop();
    audioSource.disconnect();
    isAudioPlaying.value = false; // Update flag
  }
}

// Adjust audio volume
function adjustVolume(volume) {
  gainNode.gain.value = volume;
}

// Resume audio context for mobile
const resumeAudioContext = async () => {
  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }
};

export function useAudio() {
  return {
    loadAudio,
    playAudio,
    stopAudio,
    adjustVolume,
    resumeAudioContext,
    isAudioPlaying,
  };
}
