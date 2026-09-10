import type { GiftWithMedia } from "@/types/gift";

export type StreamLayer = "distant" | "mid" | "primary" | "foreground";

export type StreamEventType =
  | "PRIMARY_PHRASE"
  | "PHOTO_HERO"
  | "AMBIENT_SHORT"
  | "FINAL_CARD";

export interface LoveFieldEvent {
  id: string;
  type: StreamEventType;
  layer: StreamLayer;
  startTime: number; // in seconds (0.0 to 120.0)
  duration: number; // in seconds (e.g. 9.0s to 12.0s)
  // 3D positioning & perspective
  xPercent: number; // -34% (far left) to +34% (far right)
  yStartVh: number; // spawn position (e.g. -12vh, or staggered for initial wave)
  yEndVh: number; // exit position (e.g. 108vh)
  zDepthPx: number; // CSS translateZ in px (-240px to +180px)
  scaleStart: number;
  scaleFocus: number;
  scaleEnd: number;
  rotateZDeg: number; // gentle tilt
  rotateYDeg: number;
  text?: string;
  subtext?: string;
  photoUrl?: string;
  colorTone: "neon-cyan" | "neon-white" | "neon-rose" | "gold-rose";
  fontSizePx: number;
  opacityFocus: number;
  isEnding?: boolean;
}

/**
 * Deterministic Mulberry32 PRNG
 */
export function createSeededRNG(seedStr: string): () => number {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }

  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export interface ScheduleOptions {
  gift: GiftWithMedia;
  replayCount: number;
}

const DEFAULT_FALLBACK_PHRASES = [
  "Em yêu anh",
  "Anh yêu em",
  "vững vàng",
  "thành công",
  "Happy Anniversary",
  "Chúc anh luôn vui vẻ",
  "Chúc em luôn vui vẻ",
  "Luôn bên nhau nhé",
  "1000 Days",
  "Có em là đủ",
  "Tự hào về em",
  "Anh luôn ở đây",
  "Bình yên bên nhau",
  "Mãi mãi yêu em",
  "Thương em nhiều lắm",
  "Yêu thương đong đầy",
  "Nắm chặt tay nhau",
  "Hạnh phúc mỗi ngày",
];

/**
 * Generates dense, luminous 3D waterfall stream events:
 * - Multi-lane horizontal distribution (7 lanes) covering full mobile width with zero empty voids.
 * - Initial wave pre-populating screen at t=0 for immediate full-screen vibrancy.
 * - Linear downward flow with smooth fade-out to prevent bottom clustering.
 * - Prominent inclusion of custom "Lời muốn nói" (story_messages), names, and anniversary.
 */
export function generateLoveStreamSchedule({
  gift,
  replayCount,
}: ScheduleOptions): LoveFieldEvent[] {
  const seed = `${gift.slug || gift.id || "gift"}:replay-${replayCount}`;
  const rng = createSeededRNG(seed);

  const events: LoveFieldEvent[] = [];

  // 1. Calculate Anniversary Days & Labels
  let anniversaryLabel = "Happy Anniversary";
  let anniversarySubtitle: string | undefined = undefined;
  if (gift.start_date) {
    const startTime = new Date(gift.start_date).getTime();
    const createTime = gift.created_at ? new Date(gift.created_at).getTime() : Date.now();
    if (!isNaN(startTime) && !isNaN(createTime)) {
      const days = Math.max(
        1,
        Math.floor(Math.abs(createTime - startTime) / (1000 * 60 * 60 * 24))
      );
      anniversaryLabel = `${days} Days`;
      anniversarySubtitle = `${days} ngày đong đầy yêu thương`;
    }
  }

  // 2. Extract User's Custom "Lời muốn nói" (High Priority)
  const userStoryPhrases: string[] = [];
  if (gift.story_messages && gift.story_messages.length > 0) {
    gift.story_messages.forEach((sm) => {
      const content = typeof sm === "string" ? sm : sm.content;
      if (content && content.trim()) {
        userStoryPhrases.push(content.trim());
      }
    });
  }

  // 3. Build Full Pool of Phrases
  const customPhrases: string[] = [...userStoryPhrases];

  // Names & Key Identifiers
  if (gift.receiver_name) customPhrases.push(gift.receiver_name.trim());
  if (gift.sender_name) customPhrases.push(gift.sender_name.trim());
  if (anniversaryLabel) customPhrases.push(anniversaryLabel);
  customPhrases.push("Happy Anniversary");

  // Admin / Category Stream Phrases
  if (gift.stream_phrases && gift.stream_phrases.length > 0) {
    gift.stream_phrases.forEach((p) => {
      const txt = typeof p === "string" ? p.trim() : (p as { content: string }).content?.trim();
      if (txt && !customPhrases.includes(txt)) {
        customPhrases.push(txt);
      }
    });
  }

  // Fallbacks if pool is sparse
  DEFAULT_FALLBACK_PHRASES.forEach((p) => {
    if (!customPhrases.includes(p)) customPhrases.push(p);
  });

  // 4. Extract Memory Photos
  const images = (gift.media || [])
    .filter((m) => m.type === "image" && Boolean(m.url))
    .slice(0, 5);

  // 5. Color Tone Palettes (Neon Cyan, Radiant White, Rose, Gold)
  const tones: ("neon-cyan" | "neon-white" | "neon-rose" | "gold-rose")[] = [
    "neon-cyan",
    "neon-cyan",
    "neon-white",
    "neon-cyan",
    "neon-rose",
    "gold-rose",
  ];

  // 7 Distinct Horizontal Lanes across mobile screen width (-30% to +30%)
  const horizontalLanes = [-30, -20, -10, 0, 10, 20, 30];

  // =========================================================================
  // CHAPTER 0: INITIAL WAVE AT T=0 (Screen is instantly populated and alive)
  // =========================================================================
  const initialCount = 28;
  for (let i = 0; i < initialCount; i++) {
    const lane = horizontalLanes[i % horizontalLanes.length];
    const xPercent = lane + (rng() - 0.5) * 3.5;
    const yStart = 5 + ((i % 6) * 14) + (rng() - 0.5) * 6; // 5vh to 80vh
    const remainingDistanceRatio = (108 - yStart) / 120; // fraction left to travel
    const baseDuration = 10.0 + rng() * 2.0;
    const duration = Math.max(3.0, baseDuration * remainingDistanceRatio);

    const phrase =
      userStoryPhrases.length > 0 && i % 2 === 0
        ? userStoryPhrases[i % userStoryPhrases.length]
        : customPhrases[i % customPhrases.length];

    const isCenter = Math.abs(lane) <= 10;
    const layer: StreamLayer = isCenter ? (rng() < 0.35 ? "foreground" : "primary") : (rng() < 0.6 ? "mid" : "distant");
    const zDepthPx = layer === "foreground" ? 140 : layer === "primary" ? 40 : layer === "mid" ? -60 : -180;
    const fontSizePx =
      layer === "foreground"
        ? (phrase.length > 20 ? 22 : 28)
        : layer === "primary"
        ? (phrase.length > 20 ? 17 : 22)
        : (phrase.length > 20 ? 13 : 15);

    events.push({
      id: `initial-wave-${i}`,
      type: layer === "primary" || layer === "foreground" ? "PRIMARY_PHRASE" : "AMBIENT_SHORT",
      layer,
      startTime: 0,
      duration: Math.round(duration * 100) / 100,
      xPercent: Math.round(xPercent * 10) / 10,
      yStartVh: Math.round(yStart),
      yEndVh: 108,
      zDepthPx: Math.round(zDepthPx),
      scaleStart: 0.9,
      scaleFocus: 1.0,
      scaleEnd: 1.05,
      rotateZDeg: Math.round((rng() - 0.5) * 6 * 10) / 10,
      rotateYDeg: Math.round((rng() - 0.5) * 6 * 10) / 10,
      text: phrase,
      colorTone: tones[Math.floor(rng() * tones.length)],
      fontSizePx,
      opacityFocus: layer === "distant" ? 0.5 : 0.95,
    });
  }

  // =========================================================================
  // CHAPTER 1: CONTINUOUS 2-MINUTE WATERFALL TEXT CASCADE (0.3s - 116.0s)
  // ~240 Events cycling across 7 horizontal lanes for non-stop, dense coverage
  // =========================================================================
  const totalCascadeEvents = 240;
  const timeSpan = 115.5;
  let userPhraseIdx = 0;

  for (let i = 0; i < totalCascadeEvents; i++) {
    const rawStart = 0.3 + (i / totalCascadeEvents) * timeSpan;
    const jitter = (rng() - 0.5) * 0.5;
    const startTime = Math.max(0.2, Math.min(116.0, rawStart + jitter));

    // Determine phrase
    let phrase: string;
    if (userStoryPhrases.length > 0 && (i % 2 === 0 || i < userStoryPhrases.length * 3)) {
      phrase = userStoryPhrases[userPhraseIdx % userStoryPhrases.length];
      userPhraseIdx++;
    } else {
      phrase = customPhrases[Math.floor(rng() * customPhrases.length)] || "Em yêu anh";
    }

    // Lane positioning
    const baseLane = horizontalLanes[i % horizontalLanes.length];
    const xPercent = baseLane + (rng() - 0.5) * 3.5;
    const isCenter = Math.abs(baseLane) <= 10;

    const tierRand = rng();
    let layer: StreamLayer = "mid";
    let zDepthPx = 0;
    let fontSizePx = 16;
    let opacityFocus = 0.85;
    let scaleStart = 0.85;
    let scaleFocus = 1.0;
    let scaleEnd = 1.05;
    let duration = 9.5 + rng() * 2.5; // 9.5s - 12.0s linear steady fall

    if (isCenter && tierRand < 0.28) {
      // GIANT FOREGROUND SWOOP
      layer = "foreground";
      zDepthPx = 140 + rng() * 60;
      fontSizePx = phrase.length > 25 ? 22 : phrase.length > 15 ? 26 : 30;
      opacityFocus = 0.95;
      scaleStart = 0.9;
      scaleFocus = 1.15;
      scaleEnd = 1.2;
      duration = 9.2 + rng() * 1.8;
    } else if (tierRand < 0.55) {
      // PRIMARY HERO
      layer = "primary";
      zDepthPx = 20 + rng() * 50;
      fontSizePx = phrase.length > 30 ? 17 : phrase.length > 18 ? 20 : 23;
      opacityFocus = 1.0;
      scaleStart = 0.88;
      scaleFocus = 1.0;
      scaleEnd = 1.06;
      duration = 9.8 + rng() * 2.0;
    } else if (tierRand < 0.82) {
      // MIDGROUND
      layer = "mid";
      zDepthPx = -40 - rng() * 60;
      fontSizePx = phrase.length > 25 ? 13 : 16;
      opacityFocus = 0.75;
      scaleStart = 0.82;
      scaleFocus = 0.9;
      scaleEnd = 0.94;
      duration = 10.5 + rng() * 2.0;
    } else {
      // DISTANT AMBIENT
      layer = "distant";
      zDepthPx = -140 - rng() * 90;
      fontSizePx = 12 + Math.floor(rng() * 3);
      opacityFocus = 0.45;
      scaleStart = 0.7;
      scaleFocus = 0.75;
      scaleEnd = 0.78;
      duration = 11.0 + rng() * 2.2;
    }

    events.push({
      id: `stream-phrase-${i}`,
      type: layer === "primary" || layer === "foreground" ? "PRIMARY_PHRASE" : "AMBIENT_SHORT",
      layer,
      startTime: Math.round(startTime * 100) / 100,
      duration: Math.round(duration * 100) / 100,
      xPercent: Math.round(xPercent * 10) / 10,
      yStartVh: -12,
      yEndVh: 108,
      zDepthPx: Math.round(zDepthPx),
      scaleStart,
      scaleFocus,
      scaleEnd,
      rotateZDeg: Math.round((rng() - 0.5) * 6 * 10) / 10,
      rotateYDeg: Math.round((rng() - 0.5) * 6 * 10) / 10,
      text: phrase,
      colorTone: tones[Math.floor(rng() * tones.length)],
      fontSizePx,
      opacityFocus,
    });
  }

  // =========================================================================
  // CHAPTER 2: GLOWING HEART ICONS & AMBIENT ACCENTS ("♡", "♥", "Forever")
  // =========================================================================
  const symbols = ["♡", "♥", "♡", "Forever", "Always", "♡", "Bình yên", "♥"];
  for (let s = 0; s < 50; s++) {
    const startTime = 0.4 + (s / 50) * 115.0 + (rng() - 0.5) * 0.6;
    if (startTime > 116.5) continue;

    const sym = symbols[s % symbols.length];
    const isClose = s % 4 === 0;

    events.push({
      id: `symbol-accent-${s}`,
      type: "AMBIENT_SHORT",
      layer: isClose ? "primary" : "distant",
      startTime: Math.round(startTime * 100) / 100,
      duration: Math.round((9.5 + rng() * 2.5) * 100) / 100,
      xPercent: Math.round(((rng() - 0.5) * 64) * 10) / 10,
      yStartVh: -12,
      yEndVh: 108,
      zDepthPx: isClose ? 50 : -160 - rng() * 80,
      scaleStart: 0.7,
      scaleFocus: isClose ? 1.05 : 0.75,
      scaleEnd: 0.8,
      rotateZDeg: Math.round(((rng() - 0.5) * 10) * 10) / 10,
      rotateYDeg: (rng() - 0.5) * 8,
      text: sym,
      colorTone: sym === "♥" ? "neon-rose" : "neon-cyan",
      fontSizePx: sym === "♡" || sym === "♥" ? (isClose ? 22 : 15) : 12,
      opacityFocus: isClose ? 0.88 : 0.4,
    });
  }

  // =========================================================================
  // CHAPTER 3: FLOATING MEMORY PHOTOS (Spaced across 120s, Compact for Mobile)
  // =========================================================================
  if (images.length > 0) {
    const photoSpans =
      images.length === 1
        ? [35.0]
        : images.length === 2
        ? [25.0, 75.0]
        : images.length === 3
        ? [18.0, 55.0, 92.0]
        : images.length === 4
        ? [15.0, 42.0, 70.0, 98.0]
        : [12.0, 34.0, 56.0, 78.0, 100.0];

    images.forEach((img, idx) => {
      const anchor = photoSpans[idx];
      const jitter = (rng() - 0.5) * 1.5;
      const startTime = Math.max(4.0, Math.min(110.0, anchor + jitter));
      const duration = 11.0 + rng() * 1.5;

      const side = idx % 2 === 0 ? -1 : 1;
      const xPercent = side * (2.5 + rng() * 3.5);
      const rotZ = side * (1.2 + rng() * 1.5);
      const rotY = -side * (2.5 + rng() * 2.5);

      events.push({
        id: `photo-hero-${idx}`,
        type: "PHOTO_HERO",
        layer: "primary",
        startTime: Math.round(startTime * 100) / 100,
        duration: Math.round(duration * 100) / 100,
        xPercent: Math.round(xPercent * 10) / 10,
        yStartVh: -18,
        yEndVh: 110,
        zDepthPx: 80,
        scaleStart: 0.85,
        scaleFocus: 1.0,
        scaleEnd: 1.05,
        rotateZDeg: Math.round(rotZ * 10) / 10,
        rotateYDeg: Math.round(rotY * 10) / 10,
        photoUrl: img.url,
        colorTone: "neon-cyan",
        fontSizePx: 0,
        opacityFocus: 1.0,
      });
    });
  }

  // =========================================================================
  // CHAPTER 4: FINAL JOURNEY CARD (Triggered at 120.0s / 2 Minutes)
  // =========================================================================
  events.push({
    id: "final-journey-card",
    type: "FINAL_CARD",
    layer: "primary",
    startTime: 120.0,
    duration: 999.0,
    xPercent: 0,
    yStartVh: 0,
    yEndVh: 0,
    zDepthPx: 50,
    scaleStart: 0.85,
    scaleFocus: 1.0,
    scaleEnd: 1.0,
    rotateZDeg: 0,
    rotateYDeg: 0,
    text: `${gift.sender_name || "Người thương"} ♡ ${gift.receiver_name}`,
    subtext: anniversarySubtitle || (gift.title ? `“${gift.title}”` : "Hành trình yêu thương mãi mãi"),
    colorTone: "neon-cyan",
    fontSizePx: 26,
    opacityFocus: 1.0,
    isEnding: true,
  });

  // Sort events chronologically by startTime
  events.sort((a, b) => a.startTime - b.startTime);

  return events;
}
