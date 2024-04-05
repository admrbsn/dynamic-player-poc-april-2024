import { mediaItems } from '../mediaItems.js';
import { ref, onMounted } from 'vue';
import { register } from 'swiper/element/bundle';

register();

export default function useSwiper() {
  // TODO: convert to WebAudio
  const audioElement = new Audio('https://storage.googleapis.com/tribute-music-prod/Spring_In_My_Step_128k.mp3');
  const media = ref([]);
  const currentMediaIndex = ref(0);
  const isPlaying = ref(false);
  const autoAdvanceTimer = ref(null);
  const countdown = ref(0);
  const remainingTime = ref(0);
  const isMobile = ref(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  const isMuted = ref(isMobile.value);
  const hasSlideChanged = ref(false);

  const onSlideChange = (event) => {
    const swiper = event.target.swiper;
    const newIndex = swiper.activeIndex;
    const newMedia = mediaItems[newIndex];
    currentMediaIndex.value = newIndex;
    hasSlideChanged.value = true;

    adjustAudioVolumeForSlide(newMedia.type);
    isPlaying.value = true;

    if (newIndex >= 1) {
        if (isPlaying.value) {
            setTimeout(() => {
                audioElement.play().catch((e) => console.error("Error playing audio:", e));
            }, 100);
        }
    } else {
        audioElement.pause();
        audioElement.currentTime = 0;
    }
  
    if (autoAdvanceTimer.value) {
        clearInterval(autoAdvanceTimer.value);
        autoAdvanceTimer.value = null;
    }

    if (newMedia.type === 'image') {
        const newMediaDuration = newMedia.duration || 5;
        countdown.value = newMediaDuration;
        remainingTime.value = newMediaDuration;
        startImageTimer(newIndex);
    } else if (newMedia.type === 'video') {
        countdown.value = 0;
        remainingTime.value = 0;
        const newVideo = media.value[newIndex];
        newVideo.play().catch((error) => console.error('Error playing the video:', error));
    }
  
    media.value.forEach((mediaElement, index) => {
        if (mediaItems[index].type === 'video' && index !== newIndex) {
            mediaElement.pause();
            mediaElement.currentTime = 0;
        }
    });
  };

  const onProgress = (e) => {
    const directSwiperWrapper = document.querySelector('.swiper-wrapper');

    if (directSwiperWrapper) {
      if (!hasSlideChanged.value) {
        directSwiperWrapper.classList.toggle(
          'intro-slide-visible',
          e.detail[1] === 0
        );

        if (isMobile.value) {
          directSwiperWrapper.classList.toggle(
            'show-unmute-tip',
            e.detail[1] === 0
          );
        }
      }
    }
  };

  const toggleMute = () => {
    isMuted.value = !isMuted.value;
    audioElement.muted = isMuted.value;

    if (isMobile.value) {
      const directSwiperWrapper = document.querySelector('.swiper-wrapper');
      if (directSwiperWrapper) {
        directSwiperWrapper.classList.toggle('show-unmute-tip', isMuted.value);
      }
    }
  };

  const togglePlayPause = () => {
    const currentItem = mediaItems[currentMediaIndex.value];

    isPlaying.value = !isPlaying.value;

    if (isPlaying.value && currentMediaIndex.value >= 1) {
      if (audioElement.muted) {
        audioElement.muted = false;
      }
      audioElement.play().catch((e) => console.error("Error playing audio:", e));
    } else {
      audioElement.pause();
    }

    if (currentItem.type === 'video') {
      const currentVideo = media.value[currentMediaIndex.value];
      if (isPlaying.value) {
          currentVideo.play();
      } else {
          currentVideo.pause();
      }
    } else if (currentItem.type === 'image') {
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
      const swiper = document.querySelector('.swiper-container').swiper;
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

  const adjustAudioVolumeForSlide = (slideType) => {
    if (slideType === 'image') {
      audioElement.volume = 1.0;
    } else if (slideType === 'video') {
      audioElement.volume = 0.1;
    }
  };

  onMounted(() => {
    audioElement.muted = isMobile.value;
    audioElement.preload = 'auto';
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
  };
}
