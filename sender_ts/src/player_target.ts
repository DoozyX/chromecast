import { Drm } from "./drm";

export interface PlayerTarget {
  play(): void;
  pause(): void;
  stop(): void;
  seekTo(time: number): void;
  load(url: string, drm?: Drm): void;
  isMediaLoaded(url: string): boolean;
  getMediaDuration(): number;
  getCurrentMediaTime(): number;
  setVolume(volumeSliderPosition: number): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  updateDisplay(): void;
  updateCurrentTimeDisplay(): void;
  updateDurationDisplay(): void;
  setTimeString(time: number): void;
}
