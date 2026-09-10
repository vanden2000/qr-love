import type { GiftWithMedia } from "@/types/gift";

export type StreamLayer = "distant" | "mid" | "primary" | "foreground";

export type StreamEventType =
  | "RECEIVER_HERO"
  | "PRIMARY_MESSAGE"
  | "MID_TEXT"
  | "AMBIENT_FRAGMENT"
  | "FOREGROUND_PASS"
  | "PHOTO_HERO"
  | "ENDING";

export interface LoveFieldEvent {
  id: string;
  type: StreamEventType;
  layer: StreamLayer;
  startTime: number; // in seconds (0.0 to 28.0)
  duration: number; // in seconds (e.g. 2.5 to 5.5)
  // 3D positioning & perspective
  xPercent: number; // -45% (far left) to +45% (far right) of screen width
  yStartVh: number; // spawn position (e.g. -25vh)
  yEndVh: number; // exit position (e.g. 125vh)
  zDepthPx: number; // CSS translateZ in px (e.g. -400px to +350px)
  scaleStart: number;
  scaleFocus: number;
  scaleEnd: number;
  rotateZDeg: number; // -25deg to +25deg
  rotateYDeg: number; // -15deg to +15deg
  text?: string;
  subtext?: string;
  photoUrl?: string;
  colorTone: "white-pink" | "rose" | "hot-pink" | "gold-rose";
  fontSizePx: number; // base font size in px
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

/**
 * Generates rich neon space field events for the 30-Second Love Stream.
 * Generates ~70-90 layered events across distant, mid, primary, and foreground layers.
 */
export function generateLoveStreamSchedule({
  gift,
  replayCount,
}: ScheduleOptions): LoveFieldEvent[] {
  const seed = `${gift.slug || gift.id || "gift"}:${replayCount}`;
  const rng = createSeededRNG(seed);

  const events: LoveFieldEvent[] = [];

  // 1. Extract Primary Messages (User defined or split from letter)
  const rawStoryList =
    gift.story_messages && gift.story_messages.length > 0
      ? gift.story_messages.map((m) => m.content.trim()).filter(Boolean)
      : gift.message
          .split(/[.\n;!?]+/)
          .map((s) => s.trim())
          .filter((s) => s.length >= 3);

  const primaryMessages =
    rawStoryList.length > 0
      ? rawStoryList.slice(0, 10)
      : [
          "Cảm ơn em vì đã luôn ở bên anh",
          "Mỗi khoảnh khắc có em đều là điều quý giá nhất",
        ];

  // 2. Extract Photos (all available up to 5)
  const images = (gift.media || [])
    .filter((m) => m.type === "image" && Boolean(m.url))
    .slice(0, 5);

  // 3. Ambient phrases and fragments pool
  let anniversaryText = "Hành trình yêu thương";
  if (gift.start_date && gift.created_at) {
    const startTime = new Date(gift.start_date).getTime();
    const createTime = new Date(gift.created_at).getTime();
    if (!isNaN(startTime) && !isNaN(createTime)) {
      const days = Math.max(
        1,
        Math.floor(Math.abs(createTime - startTime) / (1000 * 60 * 60 * 24))
      );
      anniversaryText = `${days} ngày bên nhau`;
    }
  }

  const ambientPool = [
    gift.receiver_name,
    gift.sender_name || "Yêu em",
    anniversaryText,
    "♡",
    "Forever & Always",
    "Yêu thương đong đầy",
    "My Everything",
    "Ánh sáng của đời anh",
    "Bình yên là có em",
    "Mãi mãi bên nhau",
    "Love you to the moon & back",
    "Trọn vẹn từng khoảnh khắc",
    "Sweetheart ♡",
    "Ngọt ngào như giấc mơ",
    "Chỉ cần có em",
    "Em là điều tuyệt vời nhất",
    ...primaryMessages.flatMap((msg) => {
      // Split into 2-4 word fragments for ambient floating words
      const words = msg.split(" ");
      if (words.length <= 4) return [msg];
      return [
        words.slice(0, 3).join(" "),
        words.slice(-3).join(" "),
      ];
    }),
  ];

  // Helper for random color tones
  const colorTones: ("white-pink" | "rose" | "hot-pink" | "gold-rose")[] = [
    "white-pink",
    "rose",
    "hot-pink",
    "gold-rose",
  ];

  // =========================================================================
  // CHAPTER 1: OPENING (0.0s - 3.2s) — RECEIVER HERO
  // =========================================================================
  events.push({
    id: "opening-receiver-hero",
    type: "RECEIVER_HERO",
    layer: "primary",
    startTime: 0.5,
    duration: 3.5,
    xPercent: 0,
    yStartVh: -25,
    yEndVh: 120,
    zDepthPx: 80,
    scaleStart: 0.85,
    scaleFocus: 1.25,
    scaleEnd: 0.95,
    rotateZDeg: (rng() - 0.5) * 3,
    rotateYDeg: (rng() - 0.5) * 6,
    text: gift.receiver_name,
    subtext: gift.title ? `“${gift.title}”` : "Một món quà dành riêng cho em ♡",
    colorTone: "white-pink",
    fontSizePx: 38,
    opacityFocus: 1.0,
  });

  // Early ambient sparks
  events.push({
    id: "opening-spark-left",
    type: "AMBIENT_FRAGMENT",
    layer: "mid",
    startTime: 0.8,
    duration: 3.2,
    xPercent: -32,
    yStartVh: -20,
    yEndVh: 120,
    zDepthPx: -120,
    scaleStart: 0.8,
    scaleFocus: 1.0,
    scaleEnd: 0.85,
    rotateZDeg: -12,
    rotateYDeg: 8,
    text: "♡",
    colorTone: "hot-pink",
    fontSizePx: 32,
    opacityFocus: 0.85,
  });

  events.push({
    id: "opening-spark-right",
    type: "AMBIENT_FRAGMENT",
    layer: "mid",
    startTime: 1.2,
    duration: 3.4,
    xPercent: 30,
    yStartVh: -20,
    yEndVh: 120,
    zDepthPx: -80,
    scaleStart: 0.8,
    scaleFocus: 1.0,
    scaleEnd: 0.85,
    rotateZDeg: 14,
    rotateYDeg: -8,
    text: gift.sender_name ? `From ${gift.sender_name}` : "Forever ♡",
    colorTone: "rose",
    fontSizePx: 18,
    opacityFocus: 0.8,
  });

  // =========================================================================
  // CHAPTER 2: PRIMARY MESSAGES (3.0s - 26.5s) — FLOATING FREE TYPOGRAPHY
  // =========================================================================
  const msgStart = 3.2;
  const msgEnd = 26.0;
  const totalMsgDuration = msgEnd - msgStart;
  const interval = totalMsgDuration / primaryMessages.length;

  primaryMessages.forEach((msg, idx) => {
    const startTime = msgStart + idx * interval;
    // Dynamic dwell time based on text length
    const duration = msg.length > 80 ? 4.8 : msg.length > 40 ? 4.2 : 3.8;
    // Subtle alternate lanes: center with tiny ±5% drift
    const xPercent = (idx % 2 === 0 ? -1 : 1) * (1.5 + rng() * 4.0);
    const tiltZ = (rng() - 0.5) * 6.0; // -3° to +3°

    events.push({
      id: `primary-msg-${idx}`,
      type: "PRIMARY_MESSAGE",
      layer: "primary",
      startTime: Math.round(startTime * 100) / 100,
      duration: Math.round(duration * 100) / 100,
      xPercent,
      yStartVh: -22,
      yEndVh: 120,
      zDepthPx: 50 + (rng() - 0.5) * 60, // Slight forward depth
      scaleStart: 0.88,
      scaleFocus: 1.12,
      scaleEnd: 0.94,
      rotateZDeg: Math.round(tiltZ * 10) / 10,
      rotateYDeg: (rng() - 0.5) * 8,
      text: msg,
      colorTone: idx % 2 === 0 ? "white-pink" : "rose",
      fontSizePx: msg.length > 90 ? 23 : msg.length > 45 ? 27 : 32,
      opacityFocus: 1.0,
    });
  });

  // =========================================================================
  // CHAPTER 3: PHOTO HEROES (All 1–5 images, 3.5s - 25.0s, FLYING TOWARD CAMERA)
  // =========================================================================
  if (images.length > 0) {
    let photoTimings: number[] = [];
    if (images.length === 1) {
      photoTimings = [11.5];
    } else if (images.length === 2) {
      photoTimings = [8.0, 18.5];
    } else if (images.length === 3) {
      photoTimings = [6.0, 14.0, 21.0];
    } else if (images.length === 4) {
      photoTimings = [5.0, 11.0, 17.0, 23.0];
    } else {
      // 5 photos
      photoTimings = [4.5, 9.5, 14.5, 19.5, 24.0];
    }

    images.forEach((img, idx) => {
      const anchor = photoTimings[idx];
      const jitter = (rng() - 0.5) * 0.8;
      const startTime = Math.max(3.8, Math.min(24.5, anchor + jitter));
      // Alternate left/right/center-slightly
      const xPercent = (idx % 2 === 0 ? -1 : 1) * (10 + rng() * 12);
      const rotY = (idx % 2 === 0 ? 1 : -1) * (8 + rng() * 8);
      const rotZ = (rng() - 0.5) * 8;

      events.push({
        id: `photo-hero-${idx}`,
        type: "PHOTO_HERO",
        layer: "primary",
        startTime: Math.round(startTime * 100) / 100,
        duration: 4.8,
        xPercent,
        yStartVh: -30,
        yEndVh: 125,
        zDepthPx: 120, // Moves close to camera
        scaleStart: 0.55,
        scaleFocus: 1.05,
        scaleEnd: 1.3,
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
  // CHAPTER 4: FOREGROUND PASS-BY EVENTS (Giant typography / giant heart swoops)
  // Every 2.5 - 3.5s, a massive element zooms past camera!
  // =========================================================================
  const foregroundPhrases = [
    gift.receiver_name.toUpperCase(),
    "♡",
    gift.sender_name ? gift.sender_name.toUpperCase() : "LOVE",
    "FOREVER",
    "ALWAYS ♡",
    "MY LOVE",
    "EM YÊU",
    "ANH YÊU EM",
  ];

  const fgTimes = [2.8, 5.8, 9.2, 12.8, 16.2, 19.8, 23.2];

  fgTimes.forEach((fgTime, idx) => {
    const phrase = foregroundPhrases[idx % foregroundPhrases.length];
    const side = idx % 2 === 0 ? -1 : 1;
    const xPercent = side * (24 + rng() * 18); // Sweeping past edges
    const tiltZ = side * (12 + rng() * 14); // Dynamic tilt -12° to -26° or +12° to +26°

    events.push({
      id: `fg-pass-${idx}`,
      type: "FOREGROUND_PASS",
      layer: "foreground",
      startTime: fgTime,
      duration: 2.4, // Fast dynamic pass
      xPercent,
      yStartVh: -25,
      yEndVh: 130,
      zDepthPx: 320, // Very close to camera!
      scaleStart: 1.2,
      scaleFocus: 2.4,
      scaleEnd: 3.4,
      rotateZDeg: Math.round(tiltZ * 10) / 10,
      rotateYDeg: side * 14,
      text: phrase,
      colorTone: idx % 2 === 0 ? "hot-pink" : "rose",
      fontSizePx: 48,
      opacityFocus: 0.68, // Semi-translucent so it doesn't block reader
    });
  });

  // =========================================================================
  // CHAPTER 5: MID-GROUND & DISTANT NEON TEXT STREAM (45+ background events)
  // Ensures constant, dense neon typography field across the entire viewport
  // =========================================================================
  const totalAmbientCount = 52;
  const timeStep = 24.0 / totalAmbientCount; // Spawns an event every ~0.45s!

  for (let i = 0; i < totalAmbientCount; i++) {
    const startTime = 1.5 + i * timeStep + (rng() - 0.5) * 0.4;
    if (startTime > 26.5) continue;

    const phrase = ambientPool[Math.floor(rng() * ambientPool.length)];
    const isDistant = rng() > 0.45; // 55% distant, 45% mid

    // Full screen X coverage: -44% to +44%
    const xPercent = (rng() - 0.5) * 88;
    const tiltZ = (rng() - 0.5) * 32; // -16° to +16°
    const rotY = (rng() - 0.5) * 24;
    const tone = colorTones[Math.floor(rng() * colorTones.length)];

    if (isDistant) {
      events.push({
        id: `ambient-distant-${i}`,
        type: "AMBIENT_FRAGMENT",
        layer: "distant",
        startTime: Math.round(startTime * 100) / 100,
        duration: 3.8 + rng() * 1.4, // 3.8 - 5.2s
        xPercent: Math.round(xPercent * 10) / 10,
        yStartVh: -18,
        yEndVh: 118,
        zDepthPx: -250 - rng() * 300, // Z: -250px to -550px
        scaleStart: 0.55,
        scaleFocus: 0.75,
        scaleEnd: 0.6,
        rotateZDeg: Math.round(tiltZ * 10) / 10,
        rotateYDeg: Math.round(rotY * 10) / 10,
        text: phrase,
        colorTone: tone,
        fontSizePx: phrase === "♡" ? 22 : 14,
        opacityFocus: 0.45 + rng() * 0.25,
      });
    } else {
      events.push({
        id: `ambient-mid-${i}`,
        type: "MID_TEXT",
        layer: "mid",
        startTime: Math.round(startTime * 100) / 100,
        duration: 3.2 + rng() * 1.0, // 3.2 - 4.2s
        xPercent: Math.round(xPercent * 10) / 10,
        yStartVh: -20,
        yEndVh: 120,
        zDepthPx: -80 - rng() * 120, // Z: -80px to -200px
        scaleStart: 0.75,
        scaleFocus: 0.98,
        scaleEnd: 0.82,
        rotateZDeg: Math.round(tiltZ * 10) / 10,
        rotateYDeg: Math.round(rotY * 10) / 10,
        text: phrase,
        colorTone: tone,
        fontSizePx: phrase === "♡" ? 28 : 19,
        opacityFocus: 0.75 + rng() * 0.2,
      });
    }
  }

  // =========================================================================
  // CHAPTER 6: ENDING POSTER (27.0s - 30.0s+) — PERSISTS IN FINAL STATE
  // =========================================================================
  events.push({
    id: "ending-cinematic-poster",
    type: "ENDING",
    layer: "primary",
    startTime: 27.0,
    duration: 999.0, // Stays visible
    xPercent: 0,
    yStartVh: -15,
    yEndVh: 0,
    zDepthPx: 40,
    scaleStart: 0.85,
    scaleFocus: 1.0,
    scaleEnd: 1.0,
    rotateZDeg: 0,
    rotateYDeg: 0,
    text: `${gift.sender_name || "Người thương"} ♡ ${gift.receiver_name}`,
    subtext: "“Hành trình của chúng ta • Mãi mãi đong đầy yêu thương”",
    colorTone: "white-pink",
    fontSizePx: 32,
    opacityFocus: 1.0,
    isEnding: true,
  });

  // Sort events chronologically by startTime
  events.sort((a, b) => a.startTime - b.startTime);

  return events;
}
