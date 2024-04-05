import { mediaItems } from "../mediaItems.js";
import { ref, onMounted } from "vue";
import { register } from "swiper/element/bundle";

register();

export default function useSwiper() {
  // Web Audio API setup
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let audioSource = null;
  let audioBuffer = null;
  let isAudioPlaying = false;
  const gainNode = audioCtx.createGain();
  gainNode.connect(audioCtx.destination);

  // Load audio into buffer
  async function loadAudio(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    // Autoplay on desktop after loading, if not on mobile
    if (!isMobile.value) playAudio();
  }

  // Play audio
  function playAudio() {
    if (audioBuffer && !isAudioPlaying && currentMediaIndex.value >= 1) {
      if (audioSource) {
        audioSource.disconnect(); // Ensure clean start
      }
      audioSource = audioCtx.createBufferSource();
      audioSource.buffer = audioBuffer;
      audioSource.connect(gainNode);
      audioSource.loop = true;
      // Set initial volume based on mute state and media type
      gainNode.gain.value = isMuted.value
        ? 0
        : mediaItems[currentMediaIndex.value].type === "image"
          ? 1.0
          : 0.1;
      audioSource.start(0);
      isAudioPlaying = true; // Update flag
      audioSource.onended = () => (isAudioPlaying = false); // Reset flag when audio ends
    }
  }

  // Stop audio
  function stopAudio() {
    if (isAudioPlaying) {
      audioSource.stop();
      audioSource.disconnect();
      isAudioPlaying = false; // Update flag
    }
  }

  // Adjust audio volume
  function adjustVolume(volume) {
    gainNode.gain.value = volume;
  }

  const audioCtxState = ref(audioCtx.state);

  const resumeAudioContext = async () => {
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
      audioCtxState.value = audioCtx.state; // Manually update the reactive property
    }
    console.log("audio ctx state", audioCtxState.value); // Now reactive
    console.log("audio ctx state direct", audioCtx.state); // Always accurate
  };
  

  const media = ref([]);
  const currentMediaIndex = ref(0);
  const isPlaying = ref(false);
  const autoAdvanceTimer = ref(null);
  const countdown = ref(0);
  const remainingTime = ref(0);
  const isMobile = ref(
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ),
  );
  const isMuted = ref(isMobile.value);
  const hasSlideChanged = ref(false);

  const onSlideChange = (event) => {
    const swiper = event.target.swiper;
    const newIndex = swiper.activeIndex;
    const newMedia = mediaItems[newIndex];
    currentMediaIndex.value = newIndex;
    hasSlideChanged.value = true;

    // Adjust the audio volume based on the slide type directly using the Web Audio API
    const volume = newMedia.type === "image" ? 1.0 : 0.1; // Set volume based on slide type
    if (isAudioPlaying) {
      adjustVolume(volume); // Directly adjust volume if audio is playing
    }

    // This condition ensures audio plays only when the swiper index is beyond the first slide
    if (newIndex >= 1) {
      playAudio();
    } else {
      // Optionally, stop the audio if you want to reset it when navigating back to the first slide
      stopAudio();
    }

    // Clear any existing auto-advance timer
    if (autoAdvanceTimer.value) {
      clearInterval(autoAdvanceTimer.value);
      autoAdvanceTimer.value = null;
    }

    // Start a new timer for image slides
    if (newMedia.type === "image") {
      const newMediaDuration = newMedia.duration || 5;
      countdown.value = newMediaDuration;
      remainingTime.value = newMediaDuration;
      startImageTimer(newIndex);
    }
    // For video slides, ensure video playback and manage countdown/reset
    else if (newMedia.type === "video") {
      countdown.value = 0;
      remainingTime.value = 0;
      // Directly play the video associated with the new slide
      const newVideo = media.value[newIndex];
      newVideo
        .play()
        .catch((error) => console.error("Error playing the video:", error));
    }

    // Pause and reset playback for any videos that are not currently active
    media.value.forEach((mediaElement, index) => {
      if (mediaItems[index].type === "video" && index !== newIndex) {
        mediaElement.pause();
        mediaElement.currentTime = 0;
      }
    });
  };

  const onProgress = (e) => {
    const directSwiperWrapper = document.querySelector(".swiper-wrapper");

    if (directSwiperWrapper) {
      if (!hasSlideChanged.value) {
        directSwiperWrapper.classList.toggle(
          "intro-slide-visible",
          e.detail[1] === 0,
        );

        if (isMobile.value) {
          directSwiperWrapper.classList.toggle(
            "show-unmute-tip",
            e.detail[1] === 0,
          );
        }
      }
    }
  };

  const toggleMute = () => {
    isMuted.value = !isMuted.value;

    // Determine the correct volume based on the current slide's media type when unmuting
    const volumeWhenUnmuted =
      mediaItems[currentMediaIndex.value].type === "image" ? 1.0 : 0.1;

    // Adjust volume based on mute state and current media type
    adjustVolume(isMuted.value ? 0 : volumeWhenUnmuted);

    if (isMobile.value) {
      const directSwiperWrapper = document.querySelector(".swiper-wrapper");
      if (directSwiperWrapper) {
        directSwiperWrapper.classList.toggle("show-unmute-tip", isMuted.value);
      }
    }
  };

  const togglePlayPause = () => {
    const currentItem = mediaItems[currentMediaIndex.value];

    isPlaying.value = !isPlaying.value;

    // Instead of stopping and starting the audio, adjust the gain to "mute" and "unmute."
    if (isPlaying.value) {
      // Restore volume based on current media type without restarting the audio
      const volume = currentItem.type === "image" ? 1.0 : 0.1;
      adjustVolume(isMuted.value ? 0 : volume);
    } else {
      // Effectively "mute" the audio by setting its volume to 0
      adjustVolume(0);
    }

    // Video playback control remains the same
    if (currentItem.type === "video") {
      const currentVideo = media.value[currentMediaIndex.value];
      if (isPlaying.value) {
        currentVideo.play();
      } else {
        currentVideo.pause();
      }
    }
    // Image timer control remains the same
    else if (currentItem.type === "image") {
      if (!isPlaying.value) {
        clearTimeout(autoAdvanceTimer.value);
        autoAdvanceTimer.value = null;
      } else {
        startImageTimer(currentMediaIndex.value, remainingTime.value);
      }
    }
  };

  const handleMediaEnd = (index) => {
    if (index < mediaItems.length - 1) {
      const swiper = document.querySelector(".swiper-container").swiper;
      swiper.slideNext();
      currentMediaIndex.value = swiper.activeIndex;
    }
  };

  const startImageTimer = (index, startTime = null) => {
    const duration = mediaItems[index].duration || 5;
    remainingTime.value = startTime !== null ? startTime : duration;

    countdown.value = remainingTime.value;

    autoAdvanceTimer.value = setInterval(() => {
      if (remainingTime.value > 0) {
        remainingTime.value--;
        countdown.value = remainingTime.value;
      } else {
        clearTimeout(autoAdvanceTimer.value);
        autoAdvanceTimer.value = null;
        remainingTime.value = duration;
        handleMediaEnd(index);
      }
    }, 1000);
  };

  onMounted(() => {
    loadAudio(
      "https://storage.googleapis.com/tribute-music-prod/Spring_In_My_Step_128k.mp3",
    ).then(() => {
      // Mute audio by default on mobile
      if (isMobile.value) isMuted.value = true;
    });
    console.log(audioCtxState.value)
  });

  return {
    mediaItems,
    media,
    isMobile,
    isMuted,
    isPlaying,
    countdown,
    handleMediaEnd,
    togglePlayPause,
    onSlideChange,
    onProgress,
    toggleMute,
    audioCtxState,
    resumeAudioContext,
  };
}
