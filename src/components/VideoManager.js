let currentVideo = null;

export default {
  async stopCurrent() {
    if (currentVideo) {
      try {
        await currentVideo.setStatusAsync({ shouldPlay: false });
      } catch (e) {
        console.warn('Failed to stop current video', e);
      }
      currentVideo = null;
    }
  },
  setCurrent(videoInstance) {
    currentVideo = videoInstance;
  }
};
