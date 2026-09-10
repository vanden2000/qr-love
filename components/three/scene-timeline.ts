/**
 * Scene Timeline Configuration & Interpolation Utilities for QR Love
 * 2-Minute (120-Second) Immersive 3D Love Stream Experience
 */

export const SCENE_DURATION = 120.0;

export type TimelineChapter =
  | "OPENING"
  | "LOVE_STREAM_1"
  | "MEMORY_WAVE_1"
  | "MEMORY_WAVE_2"
  | "EMOTIONAL_PEAK"
  | "ENDING";

export function getTimelineChapter(time: number): TimelineChapter {
  const t = Math.max(0, Math.min(SCENE_DURATION, time));
  if (t < 6.0) return "OPENING";
  if (t < 35.0) return "LOVE_STREAM_1";
  if (t < 65.0) return "MEMORY_WAVE_1";
  if (t < 95.0) return "MEMORY_WAVE_2";
  if (t < 115.0) return "EMOTIONAL_PEAK";
  return "ENDING";
}

/**
 * Calculates smooth opacity fade-in and fade-out based on timeline window
 */
export function getFadeOpacity(
  time: number,
  start: number,
  end: number,
  fadeInDuration = 1.2,
  fadeOutDuration = 1.2
): number {
  if (time < start || time > end) return 0;
  if (time < start + fadeInDuration) {
    return Math.max(0, Math.min(1, (time - start) / fadeInDuration));
  }
  if (time > end - fadeOutDuration) {
    return Math.max(0, Math.min(1, (end - time) / fadeOutDuration));
  }
  return 1;
}

/**
 * Evaluates smooth cinematic camera position and lookAt point for the 3D space
 */
export function getCameraPose(time: number) {
  const t = Math.max(0, Math.min(SCENE_DURATION, time));

  // Slow subtle push-in over 30s
  const p = t / SCENE_DURATION;
  const z = 8.5 - p * 2.5; // 8.5 -> 6.0

  // Organic breathing sway
  const swayX = Math.sin(t * 0.4) * 0.05;
  const swayY = Math.cos(t * 0.3) * 0.04;

  const posX = swayX;
  const posY = swayY;
  const posZ = z;

  return {
    position: [posX, posY, posZ] as [number, number, number],
    lookAt: [0, 0, 0] as [number, number, number],
  };
}
