import { mediaItems } from '../mediaItems.js';
import { ref, provide } from 'vue';
import { register } from 'swiper/element/bundle';

register();

export default function useSwiper() {
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
    currentMediaIndex.value = newIndex;
    hasSlideChanged.value = true;
  
    if (autoAdvanceTimer.value) {
      clearInterval(autoAdvanceTimer.value);
      autoAdvanceTimer.value = null;
    }
  
    const newMedia = mediaItems[newIndex];
    if (newMedia.type === 'image') {
      const newMediaDuration = newMedia.duration || 5;
      countdown.value = newMediaDuration;
      remainingTime.value = newMediaDuration;
      startImageTimer(newIndex);
    } else if (newMedia.type === 'video') {
      countdown.value = 0;
      remainingTime.value = 0;
    }
  
    isPlaying.value = true;
  
    media.value.forEach((mediaElement, index) => {
      if (mediaItems[index].type === 'video') {
        mediaElement.pause();
        mediaElement.currentTime = 0;
      }
    });
  
    if (newMedia.type === 'video') {
      const newVideo = media.value[newIndex];
      newVideo
        .play()
        .catch((error) => console.error('Error playing the video:', error));
    }
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

    if (isMobile.value) {
      const directSwiperWrapper = document.querySelector('.swiper-wrapper');
      if (directSwiperWrapper) {
        directSwiperWrapper.classList.toggle('show-unmute-tip', isMuted.value);
      }
    }
  };

  const togglePlayPause = () => {
    const currentItem = mediaItems[currentMediaIndex.value];

    if (currentItem.type === 'video') {
      const currentVideo = media.value[currentMediaIndex.value];
      isPlaying.value = !isPlaying.value;
      if (isPlaying.value) {
        currentVideo.play();
      } else {
        currentVideo.pause();
      }
    } else if (currentItem.type === 'image') {
      if (isPlaying.value) {
        clearTimeout(autoAdvanceTimer.value);
        autoAdvanceTimer.value = null;
      } else {
        startImageTimer(currentMediaIndex.value, remainingTime.value);
      }
      isPlaying.value = !isPlaying.value;
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
