import { mediaItems } from '../mediaItems.js';
import { ref } from 'vue';
import { register } from 'swiper/element/bundle';

register();

export default function useSwiper() {
  const media = ref([]);
  const currentMediaIndex = ref(0);
  const isPlaying = ref(false);
  const autoAdvanceTimer = ref(null);
  const countdown = ref(0);
  const remainingTime = ref(0);

  const onSlideChange = (event) => {
    const swiper = event.target.swiper;
    const newIndex = swiper.activeIndex;
    currentMediaIndex.value = newIndex;

    if (autoAdvanceTimer.value) {
      clearInterval(autoAdvanceTimer.value);
      autoAdvanceTimer.value = null;
    }

    isPlaying.value = true;

    media.value.forEach((mediaElement, index) => {
      if (mediaItems[index].type === 'video') {
        mediaElement.pause();
        mediaElement.currentTime = 0;
      }
    });

    const newMedia = mediaItems[newIndex];
    if (newMedia.type === 'video') {
      const newVideo = media.value[newIndex];
      newVideo
        .play()
        .catch((error) => console.error('Error playing the video:', error));
    } else if (newMedia.type === 'image') {
      remainingTime.value = newMedia.duration || 5;
      startImageTimer(newIndex);
    }
  };

  const onProgress = (e) => {
    const directSwiperWrapper = document.querySelector('.swiper-wrapper');

    if (directSwiperWrapper) {
      directSwiperWrapper.classList.toggle(
        'intro-slide-visible',
        e.detail[1] === 0
      );
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
    isPlaying,
    countdown,
    handleMediaEnd,
    togglePlayPause,
    onSlideChange,
    onProgress,
  };
}
