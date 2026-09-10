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
  startTime: number; // in seconds (0.0 to 30.0)
  duration: number; // in seconds (e.g. 5.5s to 8.5s)
  // 3D positioning & perspective
  xPercent: number; // -42% (left) to +42% (right)
  yStartVh: number; // spawn position (e.g. -22vh)
  yEndVh: number; // exit position (e.g. 118vh)
  zDepthPx: number; // CSS translateZ in px (-350px to +300px)
  scaleStart: number;
  scaleFocus: number;
  scaleEnd: number;
  rotateZDeg: number; // -12deg to +12deg tilt
  rotateYDeg: number; // -15deg to +15deg
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
];

/**
 * Generates dense, luminous 3D waterfall stream events matching reference design:
 * - Neon ice-blue / cyan, glowing white, and radiant rose typography cascading down.
 * - Memory photos drifting through space.
 * - Incorporates custom "Lời muốn nói" (story_messages), names, anniversary, and category phrases.
 * - Multi-layered depth from giant foreground swoops to distant ambient glows.
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
  if (customPhrases.length < 8) {
    DEFAULT_FALLBACK_PHRASES.forEach((p) => {
      if (!customPhrases.includes(p)) customPhrases.push(p);
    });
  }

  // 4. Extract Memory Photos
  const images = (gift.media || [])
    .filter((m) => m.type === "image" && Boolean(m.url))
    .slice(0, 5);

  // 5. Color Tone Palettes (Weighted towards Neon Ice-Blue / Cyan as in reference)
  const tones: ("neon-cyan" | "neon-white" | "neon-rose" | "gold-rose")[] = [
    "neon-cyan",
    "neon-cyan",
    "neon-white",
    "neon-cyan",
    "neon-rose",
    "gold-rose",
  ];

  // =========================================================================
  // CHAPTER 1: DENSE WATERFALL TEXT STREAM (0.4s - 26.5s) — SLOW & CLEAR ON MOBILE
  // Traversal duration: 8.5s - 11.0s (Smooth, readable, no rush)
  // =========================================================================
  const totalTextEvents = 44;
  const timeSpan = 25.5;

  // Track phrase rotation to ensure all user custom phrases are shown first
  let userPhraseIndex = 0;

  for (let i = 0; i < totalTextEvents; i++) {
    const rawStart = 0.4 + (i / totalTextEvents) * timeSpan;
    const jitter = (rng() - 0.5) * 0.6;
    const startTime = Math.max(0.3, Math.min(26.5, rawStart + jitter));

    // Choose phrase: alternate ensuring user's story phrases appear frequently
    let phrase: string;
    if (userStoryPhrases.length > 0 && (i % 2 === 0 || i < userStoryPhrases.length * 2)) {
      phrase = userStoryPhrases[userPhraseIndex % userStoryPhrases.length];
      userPhraseIndex++;
    } else {
      phrase = customPhrases[Math.floor(rng() * customPhrases.length)] || "Em yêu anh";
    }

    // Assign layer tier deterministically
    const tierRand = rng();
    let layer: StreamLayer = "mid";
    let zDepthPx = 0;
    let fontSizePx = 18;
    let opacityFocus = 0.85;
    let scaleStart = 0.85;
    let scaleFocus = 1.0;
    let scaleEnd = 1.08;
    let duration = 9.0 + rng() * 2.0; // 9.0s - 11.0s slow graceful fall

    // Lateral position constrained to mobile-friendly center zone (-25% to +25%)
    const xPercent = (rng() - 0.5) * 52;
    const tiltZ = (rng() - 0.5) * 10; // -5° to +5° gentle tilt
    const rotY = (rng() - 0.5) * 8;

    if (tierRand < 0.2) {
      // GIANT FOREGROUND SWOOP (Readable, luminous pass)
      layer = "foreground";
      zDepthPx = 160 + rng() * 90; // +160px to +250px
      fontSizePx = phrase.length > 25 ? 26 : phrase.length > 15 ? 30 : 34;
      opacityFocus = 0.95;
      scaleStart = 0.9;
      scaleFocus = 1.25;
      scaleEnd = 1.35;
      duration = 8.2 + rng() * 1.5; // 8.2s - 9.7s
    } else if (tierRand < 0.6) {
      // PRIMARY HERO / READABLE
      layer = "primary";
      zDepthPx = 30 + rng() * 60; // +30px to +90px
      fontSizePx = phrase.length > 30 ? 19 : phrase.length > 18 ? 22 : 26;
      opacityFocus = 1.0;
      scaleStart = 0.85;
      scaleFocus = 1.02;
      scaleEnd = 1.1;
      duration = 9.0 + rng() * 1.8;
    } else if (tierRand < 0.85) {
      // MIDGROUND
      layer = "mid";
      zDepthPx = -60 - rng() * 70; // -60px to -130px
      fontSizePx = phrase.length > 25 ? 15 : 18;
      opacityFocus = 0.75;
      scaleStart = 0.8;
      scaleFocus = 0.88;
      scaleEnd = 0.92;
      duration = 9.8 + rng() * 2.0;
    } else {
      // DISTANT AMBIENT GLOW
      layer = "distant";
      zDepthPx = -180 - rng() * 120; // -180px to -300px
      fontSizePx = 13 + Math.floor(rng() * 3);
      opacityFocus = 0.45;
      scaleStart = 0.68;
      scaleFocus = 0.72;
      scaleEnd = 0.75;
      duration = 10.5 + rng() * 2.5;
    }

    events.push({
      id: `stream-phrase-${i}`,
      type: layer === "primary" || layer === "foreground" ? "PRIMARY_PHRASE" : "AMBIENT_SHORT",
      layer,
      startTime: Math.round(startTime * 100) / 100,
      duration: Math.round(duration * 100) / 100,
      xPercent: Math.round(xPercent * 10) / 10,
      yStartVh: -20,
      yEndVh: 118,
      zDepthPx: Math.round(zDepthPx),
      scaleStart,
      scaleFocus,
      scaleEnd,
      rotateZDeg: Math.round(tiltZ * 10) / 10,
      rotateYDeg: Math.round(rotY * 10) / 10,
      text: phrase,
      colorTone: tones[Math.floor(rng() * tones.length)],
      fontSizePx,
      opacityFocus,
    });
  }

  // =========================================================================
  // CHAPTER 2: GLOWING HEART ICONS & AMBIENT ACCENTS ("♡", "♥", "Forever")
  // =========================================================================
  const symbols = ["♡", "♥", "♡", "Forever", "Always", "♡", "Bình yên"];
  for (let s = 0; s < 14; s++) {
    const startTime = 0.5 + (s / 14) * 26.0 + (rng() - 0.5) * 0.8;
    if (startTime > 27.5) continue;

    const sym = symbols[s % symbols.length];
    const isClose = s % 4 === 0;

    events.push({
      id: `symbol-accent-${s}`,
      type: "AMBIENT_SHORT",
      layer: isClose ? "primary" : "distant",
      startTime: Math.round(startTime * 100) / 100,
      duration: Math.round((9.5 + rng() * 2.5) * 100) / 100,
      xPercent: Math.round(((rng() - 0.5) * 54) * 10) / 10,
      yStartVh: -18,
      yEndVh: 118,
      zDepthPx: isClose ? 70 : -220 - rng() * 100,
      scaleStart: 0.7,
      scaleFocus: isClose ? 1.05 : 0.75,
      scaleEnd: 0.8,
      rotateZDeg: Math.round(((rng() - 0.5) * 16) * 10) / 10,
      rotateYDeg: (rng() - 0.5) * 12,
      text: sym,
      colorTone: sym === "♥" ? "neon-rose" : "neon-cyan",
      fontSizePx: sym === "♡" || sym === "♥" ? (isClose ? 26 : 18) : 14,
      opacityFocus: isClose ? 0.9 : 0.45,
    });
  }

  // =========================================================================
  // CHAPTER 3: FLOATING MEMORY PHOTOS (2.5s - 24.5s)
  // Cascading smoothly down alongside glowing typography
  // =========================================================================
  if (images.length > 0) {
    const photoSpans =
      images.length === 1
        ? [8.0]
        : images.length === 2
        ? [5.0, 15.0]
        : images.length === 3
        ? [4.0, 11.5, 19.0]
        : images.length === 4
        ? [3.5, 9.5, 15.5, 21.5]
        : [2.5, 7.5, 12.5, 17.5, 22.5];

    images.forEach((img, idx) => {
      const anchor = photoSpans[idx];
      const jitter = (rng() - 0.5) * 0.5;
      const startTime = Math.max(2.0, Math.min(23.5, anchor + jitter));
      const duration = 9.5 + rng() * 1.5; // 9.5s - 11.0s slow traversal

      // Gentle lateral position (-6% to +6%) to keep photo fully on screen
      const side = idx % 2 === 0 ? -1 : 1;
      const xPercent = side * (4 + rng() * 5);
      const rotZ = side * (1.5 + rng() * 2.0);
      const rotY = -side * (3 + rng() * 3);

      events.push({
        id: `photo-hero-${idx}`,
        type: "PHOTO_HERO",
        layer: "primary",
        startTime: Math.round(startTime * 100) / 100,
        duration: Math.round(duration * 100) / 100,
        xPercent: Math.round(xPercent * 10) / 10,
        yStartVh: -26,
        yEndVh: 120,
        zDepthPx: 90, // positioned forward for crisp prominence
        scaleStart: 0.85,
        scaleFocus: 1.0,
        scaleEnd: 1.06,
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
  // CHAPTER 4: FINAL JOURNEY CARD (Triggered at 30.0s)
  // =========================================================================
  events.push({
    id: "final-journey-card",
    type: "FINAL_CARD",
    layer: "primary",
    startTime: 30.0, // EXACTLY at 30.0s!
    duration: 999.0, // Persists in static final state
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
    fontSizePx: 28,
    opacityFocus: 1.0,
    isEnding: true,
  });

  // Sort events chronologically by startTime
  events.sort((a, b) => a.startTime - b.startTime);

  return events;
}


