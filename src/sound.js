import beepUrl from "./beep.mp3";

const bell = new Audio(beepUrl);
bell.preload = "auto";

export const unlockAudio = () => {
  const wasMuted = bell.muted;
  bell.muted = true;
  bell
    .play()
    .then(() => {
      bell.pause();
      bell.currentTime = 0;
      bell.muted = wasMuted;
    })
    .catch(() => {
      bell.muted = wasMuted;
    });
};

export const playBell = (isMuted) => {
  if (isMuted) return;
  bell.currentTime = 0;
  bell.play().catch(() => undefined);
};
