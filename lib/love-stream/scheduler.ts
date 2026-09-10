import type { GiftWithMedia } from "@/types/gift";

export type StreamLayer = "distant" | "mid" | "primary";

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
  duration: number; // in seconds (e.g. 6.5s to 9.5s)
  // 3D positioning & perspective
  xPercent: number; // -35% (left lane) to +35% (right lane) of screen width
  yStartVh: number; // spawn position (e.g. -18vh)
  yEndVh: number; // exit position (e.g. 115vh)
  zDepthPx: number; // CSS translateZ in px (e.g. -200px to +120px)
  scaleStart: number;
  scaleFocus: number;
  scaleEnd: number;
  rotateZDeg: number; // -3deg to +3deg (gentle cinematic tilt)
  rotateYDeg: number; // -6deg to +6deg
  text?: string;
  subtext?: string;
  photoUrl?: string;
  colorTone: "white-pink" | "rose" | "hot-pink" | "gold-rose";
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
  "Anh yêu em",
  "Thương em nhiều lắm",
  "Có em là đủ",
  "Mãi bên nhau nhé",
  "Luôn nhớ đến em",
  "Ở bên anh nhé",
  "Anh luôn thương em",
  "Em thật đặc biệt",
  "Cố lên nhé",
  "Em làm được mà",
  "Đừng bỏ cuộc nha",
  "Luôn tin vào em",
  "Tự hào về em",
  "Mọi chuyện rồi sẽ ổn",
  "Anh luôn ở đây",
  "Mỉm cười lên nha",
  "Bình yên rồi sẽ đến",
];

/**
 * Generates slow, cinematic, emotional Love Stream events across 30 seconds.
 * Strictly uses admin stream phrases (no personal letter text).
 * Slower movement (6.5s-8.0s per phrase, 7.5s-9.5s per photo), 2.5s-3.5s readable focus time.
 */
export function generateLoveStreamSchedule({
  gift,
  replayCount,
}: ScheduleOptions): LoveFieldEvent[] {
  const seed = `${gift.slug || gift.id || "gift"}:replay-${replayCount}`;
  const rng = createSeededRNG(seed);

  const events: LoveFieldEvent[] = [];

  // 1. Source Admin Stream Phrases (strictly NO gift.message or gift.story_messages)
  const availablePhrases =
    gift.stream_phrases && gift.stream_phrases.length > 0
      ? gift.stream_phrases.map((p) => (typeof p === "string" ? p.trim() : (p as { content: string }).content?.trim())).filter(Boolean)
      : DEFAULT_FALLBACK_PHRASES;

  // Shuffle phrases deterministically using Fisher-Yates
  const shuffledPhrases = [...availablePhrases];
  for (let i = shuffledPhrases.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffledPhrases[i], shuffledPhrases[j]] = [shuffledPhrases[j], shuffledPhrases[i]];
  }

  // Select 6 to 8 short phrases per 30-second run (never overload)
  const targetPhraseCount = Math.min(
    shuffledPhrases.length,
    Math.max(6, Math.min(8, Math.floor(6 + rng() * 3)))
  );
  const selectedPhrases = shuffledPhrases.slice(0, targetPhraseCount);

  // 2. Extract Photos (up to 5 photos)
  const images = (gift.media || [])
    .filter((m) => m.type === "image" && Boolean(m.url))
    .slice(0, 5);

  // 3. Color tones palette
  const colorTones: ("white-pink" | "rose" | "hot-pink" | "gold-rose")[] = [
    "white-pink",
    "rose",
    "gold-rose",
    "hot-pink",
  ];

  // =========================================================================
  // CHAPTER 1: PRIMARY PHRASES (0.8s - 24.5s) — SLOW FLOATING 1-LINE TYPOGRAPHY
  // Traversal duration: 7.0s - 8.0s (Center focus read time: 2.8s - 3.5s)
  // =========================================================================
  const phraseStart = 0.8;
  const phraseEnd = 23.5;
  const phraseInterval = (phraseEnd - phraseStart) / selectedPhrases.length;

  // 3-lane positioning with center preference: Left (-18% to -8%), Center (-3% to +3%), Right (+8% to +18%)
  const lanes = [0, -12, 12, -4, 4, -10, 10, 0];

  selectedPhrases.forEach((phrase, idx) => {
    const baseStart = phraseStart + idx * phraseInterval;
    const jitter = (rng() - 0.5) * 0.4;
    const startTime = Math.max(0.5, Math.min(24.0, baseStart + jitter));
    const duration = 7.2 + (rng() - 0.5) * 0.8; // 6.8s - 7.6s slow traversal

    // Subtle drift in designated lane
    const laneOffset = lanes[idx % lanes.length];
    const xPercent = laneOffset + (rng() - 0.5) * 4.0;
    const tiltZ = (rng() - 0.5) * 5.0; // -2.5° to +2.5° subtle tilt
    const rotY = (rng() - 0.5) * 6.0;

    events.push({
      id: `primary-phrase-${idx}`,
      type: "PRIMARY_PHRASE",
      layer: "primary",
      startTime: Math.round(startTime * 100) / 100,
      duration: Math.round(duration * 100) / 100,
      xPercent: Math.round(xPercent * 10) / 10,
      yStartVh: -18,
      yEndVh: 115,
      zDepthPx: 40 + (rng() - 0.5) * 40, // Mild forward depth
      scaleStart: 0.82,
      scaleFocus: 1.0,
      scaleEnd: 1.06,
      rotateZDeg: Math.round(tiltZ * 10) / 10,
      rotateYDeg: Math.round(rotY * 10) / 10,
      text: phrase,
      colorTone: colorTones[idx % colorTones.length],
      fontSizePx: phrase.length > 50 ? 24 : phrase.length > 30 ? 28 : 32,
      opacityFocus: 1.0,
    });
  });

  // =========================================================================
  // CHAPTER 2: MEMORY PHOTOS (3.0s - 24.0s) — SLOW, LARGE, CRISP (7.5s - 9.0s)
  // =========================================================================
  if (images.length > 0) {
    let photoTimings: number[] = [];
    if (images.length === 1) {
      photoTimings = [8.5];
    } else if (images.length === 2) {
      photoTimings = [5.5, 14.5];
    } else if (images.length === 3) {
      photoTimings = [4.0, 11.0, 18.0];
    } else if (images.length === 4) {
      photoTimings = [3.5, 9.5, 15.5, 21.0];
    } else {
      // 5 photos nicely spaced
      photoTimings = [3.0, 8.0, 13.0, 18.0, 22.5];
    }

    images.forEach((img, idx) => {
      const anchor = photoTimings[idx];
      const jitter = (rng() - 0.5) * 0.5;
      const startTime = Math.max(2.5, Math.min(23.5, anchor + jitter));
      const duration = 8.0 + (rng() - 0.5) * 0.8; // 7.6s - 8.4s slow traversal

      // Gentle lateral position (-10% to +10%)
      const xPercent = (idx % 2 === 0 ? -1 : 1) * (5 + rng() * 6);
      const rotZ = (rng() - 0.5) * 4.0; // -2° to +2° gentle tilt
      const rotY = (idx % 2 === 0 ? 1 : -1) * (3 + rng() * 4);

      events.push({
        id: `photo-hero-${idx}`,
        type: "PHOTO_HERO",
        layer: "primary",
        startTime: Math.round(startTime * 100) / 100,
        duration: Math.round(duration * 100) / 100,
        xPercent: Math.round(xPercent * 10) / 10,
        yStartVh: -24,
        yEndVh: 118,
        zDepthPx: 90, // Positioned forward
        scaleStart: 0.86,
        scaleFocus: 1.0,
        scaleEnd: 1.05,
        rotateZDeg: Math.round(rotZ * 10) / 10,
        rotateYDeg: Math.round(rotY * 10) / 10,
        photoUrl: img.url,
        colorTone: "gold-rose",
        fontSizePx: 0,
        opacityFocus: 1.0,
      });
    });
  }

  // =========================================================================
  // CHAPTER 3: AMBIENT FLOATING ACCENTS (Distant / Mid, 8-12 gentle items)
  // =========================================================================
  const ambientWords = ["♡", "Yêu thương", "Bình yên", "Luôn bên em", "Mãi mãi", "Tự hào", "♡"];
  const ambientCount = 10;
  const ambientInterval = 24.0 / ambientCount;

  for (let i = 0; i < ambientCount; i++) {
    const startTime = 1.2 + i * ambientInterval + (rng() - 0.5) * 0.6;
    if (startTime > 25.5) continue;

    const word = ambientWords[i % ambientWords.length];
    const isDistant = i % 2 === 0;
    const xPercent = (rng() - 0.5) * 70; // -35% to +35%
    const tiltZ = (rng() - 0.5) * 12; // -6° to +6°
    const duration = 8.5 + rng() * 2.0; // 8.5s - 10.5s

    events.push({
      id: `ambient-acc-${i}`,
      type: "AMBIENT_SHORT",
      layer: isDistant ? "distant" : "mid",
      startTime: Math.round(startTime * 100) / 100,
      duration: Math.round(duration * 100) / 100,
      xPercent: Math.round(xPercent * 10) / 10,
      yStartVh: -18,
      yEndVh: 118,
      zDepthPx: isDistant ? -220 - rng() * 150 : -80 - rng() * 80,
      scaleStart: 0.7,
      scaleFocus: isDistant ? 0.75 : 0.9,
      scaleEnd: 0.72,
      rotateZDeg: Math.round(tiltZ * 10) / 10,
      rotateYDeg: (rng() - 0.5) * 10,
      text: word,
      colorTone: colorTones[Math.floor(rng() * colorTones.length)],
      fontSizePx: word === "♡" ? 24 : 15,
      opacityFocus: isDistant ? 0.45 : 0.65,
    });
  }

  // =========================================================================
  // CHAPTER 4: FINAL JOURNEY CARD (Triggered at 30.0s — ZERO card in 0-30s)
  // =========================================================================
  let anniversarySubtitle: string | undefined = undefined;
  if (gift.start_date) {
    const startTime = new Date(gift.start_date).getTime();
    const createTime = gift.created_at ? new Date(gift.created_at).getTime() : Date.now();
    if (!isNaN(startTime) && !isNaN(createTime)) {
      const days = Math.max(
        1,
        Math.floor(Math.abs(createTime - startTime) / (1000 * 60 * 60 * 24))
      );
      anniversarySubtitle = `${days} ngày đong đầy yêu thương`;
    }
  }

  events.push({
    id: "final-journey-card",
    type: "FINAL_CARD",
    layer: "primary",
    startTime: 30.0, // EXACTLY at 30.0s!
    duration: 999.0, // Persists in static final state
    xPercent: 0,
    yStartVh: 0,
    yEndVh: 0,
    zDepthPx: 40,
    scaleStart: 0.85,
    scaleFocus: 1.0,
    scaleEnd: 1.0,
    rotateZDeg: 0,
    rotateYDeg: 0,
    text: `${gift.sender_name || "Người thương"} ♡ ${gift.receiver_name}`,
    subtext: anniversarySubtitle || (gift.title ? `“${gift.title}”` : "Hành trình yêu thương mãi mãi"),
    colorTone: "white-pink",
    fontSizePx: 28,
    opacityFocus: 1.0,
    isEnding: true,
  });

  // Sort events chronologically by startTime
  events.sort((a, b) => a.startTime - b.startTime);

  return events;
}

