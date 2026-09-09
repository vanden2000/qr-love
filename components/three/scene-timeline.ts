/**
 * Scene Timeline Configuration & Interpolation Utilities for QR Love
 * 5 Cinematic Chapters: AWAKEN, LOVE PORTAL, MEMORIES, CONFESSION, FOREVER
 * Total Scene Duration: 65 seconds
 */

export const SCENE_DURATION = 65;

export type TimelineChapter =
  | "AWAKEN"
  | "LOVE_PORTAL"
  | "MEMORIES"
  | "CONFESSION"
  | "FOREVER";

export const CHAPTER_TIMESTAMPS = {
  AWAKEN: { start: 0, end: 8 },
  LOVE_PORTAL: { start: 8, end: 18 },
  MEMORIES: { start: 18, end: 38 },
  CONFESSION: { start: 38, end: 52 },
  FOREVER: { start: 52, end: 65 },
} as const;

export function getTimelineChapter(time: number): TimelineChapter {
  const t = Math.max(0, Math.min(SCENE_DURATION, time));
  if (t < 8) return "AWAKEN";
  if (t < 18) return "LOVE_PORTAL";
  if (t < 38) return "MEMORIES";
  if (t < 52) return "CONFESSION";
  return "FOREVER";
}

/**
 * Calculates smooth opacity fade-in and fade-out based on timeline window
 */
export function getFadeOpacity(
  time: number,
  start: number,
  end: number,
  fadeInDuration = 1.5,
  fadeOutDuration = 1.5
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
 * Smooth cubic Hermite interpolation
 */
function smoothstep(min: number, max: number, value: number) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

/**
 * Evaluates smooth cinematic camera position and lookAt point across the 5 chapters
 */
export function getCameraPose(time: number) {
  const t = Math.max(0, Math.min(SCENE_DURATION, time));

  let z = 10;
  let curvatureX = 0;
  let curvatureY = 0;

  if (t <= 8) {
    // Chapter 1: AWAKEN (0-8s) - Centered slow push-in
    const p = smoothstep(0, 8, t);
    z = 10.0 - p * 2.8; // 10.0 -> 7.2
    curvatureX = 0;
    curvatureY = 0;
  } else if (t <= 18) {
    // Chapter 2: LOVE PORTAL (8-18s) - Gliding through the portal
    const p = smoothstep(8, 18, t);
    z = 7.2 - p * 4.7; // 7.2 -> 2.5
    curvatureX = Math.sin(p * Math.PI) * 0.25;
    curvatureY = Math.sin(p * Math.PI) * 0.15;
  } else if (t <= 38) {
    // Chapter 3: MEMORIES (18-38s) - Cinematic drifting between memory photo moments
    const p = smoothstep(18, 38, t);
    z = 2.5 - p * 15.0; // 2.5 -> -12.5
    curvatureX = Math.sin(p * Math.PI * 2.2) * 0.55;
    curvatureY = Math.sin(p * Math.PI * 1.5) * 0.28;
  } else if (t <= 52) {
    // Chapter 4: CONFESSION (38-52s) - Decelerating to near-static intimate focus
    const p = smoothstep(38, 52, t);
    z = -12.5 - p * 9.5; // -12.5 -> -22.0
    curvatureX = Math.sin((1 - p) * Math.PI) * 0.2;
    curvatureY = 0;
  } else {
    // Chapter 5: FOREVER (52-65s) - Steady final cinematic poster composition
    const p = smoothstep(52, 65, t);
    z = -22.0 - p * 1.2; // -22.0 -> -23.2
    curvatureX = 0;
    curvatureY = 0;
  }

  // Gentle organic breathing sway
  const swayX = Math.sin(t * 0.35) * 0.04;
  const swayY = Math.cos(t * 0.28) * 0.03;

  const posX = curvatureX + swayX;
  const posY = curvatureY + swayY;
  const posZ = z;

  return {
    position: [posX, posY, posZ] as [number, number, number],
    lookAt: [posX * 0.3, posY * 0.3, posZ - 5] as [number, number, number],
  };
}
