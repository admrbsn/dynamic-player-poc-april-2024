import { mediaItems } from "../mediaItems.js";
import { ref, reactive, onMounted, nextTick } from "vue";
import { register } from "swiper/element/bundle";
import { useAudio } from "./useAudio";

register();

export default function useSwiper() {
  const {
    loadAudio,
    playAudio,
    stopAudio,
    adjustVolume,
    resumeAudioContext,
    isAudioPlaying,
  } = useAudio();
  const media = ref([]);
  const currentMediaIndex = ref(0);
  const isPlaying = ref(false);
  const autoAdvanceTimer = ref(null);
  const remainingTime = ref(0);
  const videoDurations = reactive({});
  const videoCurrentTimes = reactive({});
  const isMobile = ref(
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ),
  );
  const isMuted = ref(isMobile.value);
  const hasSlideChanged = ref(false);

  mediaItems.forEach((item, index) => {
    videoDurations[index] = item.duration || 5; // Default duration or derived from item
    videoCurrentTimes[index] = 0; // Start with zero currentTime
});

  const onSlideChange = (event) => {
    const swiper = event.target.swiper;
    const newIndex = swiper.activeIndex;
    const newMedia = mediaItems[newIndex];
    currentMediaIndex.value = newIndex;
    hasSlideChanged.value = true;
    isPlaying.value = true;

    // This condition ensures audio plays only when the swiper index is beyond the first slide
    if (newIndex >= 1) {
      playAudio(isMuted.value, currentMediaIndex.value, mediaItems);
    } else {
      // Optionally, stop the audio if you want to reset it when navigating back to the first slide
      stopAudio();
    }

    // Directly adjust volume if audio is playing. Use 'volume' from mediaItems if available.
    if (isAudioPlaying.value) {
      const adjustedVolume = newMedia.volume || (newMedia.type === 'image' ? 1.0 : 0.1);
      adjustVolume(adjustedVolume);
    }

    // Clear any existing auto-advance timer
    if (autoAdvanceTimer.value) {
      clearInterval(autoAdvanceTimer.value);
      autoAdvanceTimer.value = null;
    }

    // Start a new timer for image slides
    if (newMedia.type === "image") {
      startImageTimer(newIndex);
    }
    // For video slides, ensure video playback
    else if (newMedia.type === "video") {
      remainingTime.value = 0;
      // Directly play the video associated with the new slide
      const newVideo = media.value[newIndex];
      newVideo
        .play()
        .catch((error) => console.error("Error playing the video:", error));
    }

    // Pause and reset playback for any videos that are not currently active
    media.value.forEach((mediaElement, index) => {
      if (index !== newIndex && mediaItems[index].type === "video") {
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

    // Use the 'volume' property from mediaItems if available.
    const currentMedia = mediaItems[currentMediaIndex.value];
    const volumeWhenUnmuted = currentMedia.volume || (currentMedia.type === 'image' ? 1.0 : 0.1);

    // Adjust volume based on mute state and current media type
    adjustVolume(isMuted.value ? 0 : volumeWhenUnmuted);

    if (isMobile.value) {
      nextTick(() => {
        const directSwiperWrapper = document.querySelector(".swiper-wrapper");
        if (directSwiperWrapper) {
          if (isMuted.value) {
            directSwiperWrapper.classList.add("show-unmute-tip");
          } else {
            directSwiperWrapper.classList.remove("show-unmute-tip");
          }
        }
      });
    }
  };

  const togglePlayPause = () => {
    const currentItem = mediaItems[currentMediaIndex.value];
  
    isPlaying.value = !isPlaying.value;  // Toggle playing state
  
    // Adjust volume based on the current state
    const adjustedVolume = currentItem.volume || (currentItem.type === 'image' ? 1.0 : 0.1);
    adjustVolume(isPlaying.value && !isMuted.value ? adjustedVolume : 0);
  
    if (currentItem.type === "video") {
        const currentVideo = media.value[currentMediaIndex.value];
        if (isPlaying.value) {
            currentVideo.play();
        } else {
            currentVideo.pause();
        }
    } else if (currentItem.type === "image") {
        if (!isPlaying.value) {
            // Pause the timer but do not reset it
            clearTimeout(autoAdvanceTimer.value);
            autoAdvanceTimer.value = null;
        } else {
            // Resume timer from the current time instead of restarting it
            startImageTimer(currentMediaIndex.value, videoCurrentTimes[currentMediaIndex.value]);
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

  const startImageTimer = (index, startTime = 0) => {
    const duration = mediaItems[index].duration || 5; // Default to 5 seconds if not provided
    videoDurations[index] = duration;
    
    // Use startTime if provided, otherwise start from 0
    videoCurrentTimes[index] = startTime;
    
    const interval = 100; // Update every 100 milliseconds
    autoAdvanceTimer.value = setInterval(() => {
        if (videoCurrentTimes[index] < duration) {
            videoCurrentTimes[index] += 0.1; // Increment by 0.1 seconds every 100 milliseconds
            if (videoCurrentTimes[index] >= duration) {
                clearInterval(autoAdvanceTimer.value);
                autoAdvanceTimer.value = null;
                handleMediaEnd(index); // Move to the next slide
            }
        }
    }, interval);
};

  onMounted(() => {
    loadAudio(
      "https://storage.googleapis.com/tribute-music-prod/Spring_In_My_Step_128k.mp3",
    ).then(() => {
      if (isMobile.value) isMuted.value = true;
    });
  });

  return {
    mediaItems,
    media,
    isMobile,
    isMuted,
    isPlaying,
    currentMediaIndex,
    videoDurations,
    videoCurrentTimes,
    handleMediaEnd,
    togglePlayPause,
    onSlideChange,
    onProgress,
    toggleMute,
    resumeAudioContext,
  };
}