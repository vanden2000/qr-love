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

  // 2. Build Rich Pool of "Lời muốn nói" & Key Phrases
  const customPhrases: string[] = [];

  // A. Story Messages ("Lời muốn nói" managed per gift)
  if (gift.story_messages && gift.story_messages.length > 0) {
    gift.story_messages.forEach((sm) => {
      const content = typeof sm === "string" ? sm : sm.content;
      if (content && content.trim()) {
        customPhrases.push(content.trim());
      }
    });
  }

  // B. Names & Key Identifiers
  if (gift.receiver_name) customPhrases.push(gift.receiver_name.trim());
  if (gift.sender_name) customPhrases.push(gift.sender_name.trim());
  if (anniversaryLabel) customPhrases.push(anniversaryLabel);
  customPhrases.push("Happy Anniversary");

  // C. Admin / Category Stream Phrases
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

  // 3. Extract Memory Photos
  const images = (gift.media || [])
    .filter((m) => m.type === "image" && Boolean(m.url))
    .slice(0, 5);

  // 4. Color Tone Palettes (Weighted heavily towards Neon Ice-Blue / Cyan as in reference)
  const tones: ("neon-cyan" | "neon-white" | "neon-rose" | "gold-rose")[] = [
    "neon-cyan",
    "neon-cyan",
    "neon-white",
    "neon-cyan",
    "neon-rose",
    "gold-rose",
  ];

  // =========================================================================
  // CHAPTER 1: DENSE WATERFALL TEXT STREAM (0.3s - 27.5s) — 50 to 65 EVENTS
  // Distributes phrases across Foreground, Primary, Midground, and Distant layers
  // =========================================================================
  const totalTextEvents = 52;
  const timeSpan = 26.5;

  for (let i = 0; i < totalTextEvents; i++) {
    const rawStart = 0.3 + (i / totalTextEvents) * timeSpan;
    const jitter = (rng() - 0.5) * 0.7;
    const startTime = Math.max(0.2, Math.min(27.0, rawStart + jitter));
    const phrase = customPhrases[Math.floor(rng() * customPhrases.length)] || "Em yêu anh";

    // Assign layer tier deterministically
    const tierRand = rng();
    let layer: StreamLayer = "mid";
    let zDepthPx = 0;
    let fontSizePx = 22;
    let opacityFocus = 0.85;
    let scaleStart = 0.85;
    let scaleFocus = 1.0;
    let scaleEnd = 1.1;
    let duration = 6.2 + rng() * 1.8; // 6.2s - 8.0s waterfall fall

    // Lateral position across screen width (-38% to +38%)
    const xPercent = (rng() - 0.5) * 76;
    const tiltZ = (rng() - 0.5) * 14; // -7° to +7° tilt
    const rotY = (rng() - 0.5) * 12;

    if (tierRand < 0.18) {
      // GIANT FOREGROUND SWOOP (Passes very close to camera with high bloom)
      layer = "foreground";
      zDepthPx = 200 + rng() * 120; // +200px to +320px
      fontSizePx = phrase.length > 25 ? 32 : phrase.length > 15 ? 38 : 46;
      opacityFocus = 0.95;
      scaleStart = 0.9;
      scaleFocus = 1.35;
      scaleEnd = 1.55;
      duration = 5.2 + rng() * 1.2; // slightly faster foreground pass
    } else if (tierRand < 0.55) {
      // PRIMARY HERO / READABLE
      layer = "primary";
      zDepthPx = 40 + rng() * 80; // +40px to +120px
      fontSizePx = phrase.length > 30 ? 22 : phrase.length > 18 ? 26 : 32;
      opacityFocus = 1.0;
      scaleStart = 0.85;
      scaleFocus = 1.05;
      scaleEnd = 1.18;
      duration = 6.5 + rng() * 1.5;
    } else if (tierRand < 0.82) {
      // MIDGROUND
      layer = "mid";
      zDepthPx = -80 - rng() * 90; // -80px to -170px
      fontSizePx = phrase.length > 25 ? 17 : 21;
      opacityFocus = 0.75;
      scaleStart = 0.8;
      scaleFocus = 0.9;
      scaleEnd = 0.95;
      duration = 7.0 + rng() * 1.8;
    } else {
      // DISTANT AMBIENT GLOW
      layer = "distant";
      zDepthPx = -220 - rng() * 160; // -220px to -380px
      fontSizePx = 14 + Math.floor(rng() * 4);
      opacityFocus = 0.45;
      scaleStart = 0.65;
      scaleFocus = 0.72;
      scaleEnd = 0.75;
      duration = 8.0 + rng() * 2.2;
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
  for (let s = 0; s < 16; s++) {
    const startTime = 0.5 + (s / 16) * 26.0 + (rng() - 0.5) * 0.8;
    if (startTime > 27.5) continue;

    const sym = symbols[s % symbols.length];
    const isClose = s % 4 === 0;

    events.push({
      id: `symbol-accent-${s}`,
      type: "AMBIENT_SHORT",
      layer: isClose ? "primary" : "distant",
      startTime: Math.round(startTime * 100) / 100,
      duration: Math.round((7.0 + rng() * 2.5) * 100) / 100,
      xPercent: Math.round(((rng() - 0.5) * 80) * 10) / 10,
      yStartVh: -18,
      yEndVh: 118,
      zDepthPx: isClose ? 80 : -260 - rng() * 120,
      scaleStart: 0.7,
      scaleFocus: isClose ? 1.1 : 0.75,
      scaleEnd: 0.8,
      rotateZDeg: Math.round(((rng() - 0.5) * 20) * 10) / 10,
      rotateYDeg: (rng() - 0.5) * 15,
      text: sym,
      colorTone: sym === "♥" ? "neon-rose" : "neon-cyan",
      fontSizePx: sym === "♡" || sym === "♥" ? (isClose ? 32 : 20) : 15,
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
        ? [7.5]
        : images.length === 2
        ? [4.5, 14.0]
        : images.length === 3
        ? [3.5, 10.5, 18.0]
        : images.length === 4
        ? [3.0, 8.5, 14.5, 20.5]
        : [2.5, 7.5, 12.5, 17.5, 22.0];

    images.forEach((img, idx) => {
      const anchor = photoSpans[idx];
      const jitter = (rng() - 0.5) * 0.6;
      const startTime = Math.max(2.0, Math.min(23.5, anchor + jitter));
      const duration = 7.8 + rng() * 0.8; // 7.8s - 8.6s

      // Stagger photos alternating left and right with subtle tilt
      const side = idx % 2 === 0 ? -1 : 1;
      const xPercent = side * (8 + rng() * 10);
      const rotZ = side * (2.5 + rng() * 3.5);
      const rotY = -side * (4 + rng() * 4);

      events.push({
        id: `photo-hero-${idx}`,
        type: "PHOTO_HERO",
        layer: "primary",
        startTime: Math.round(startTime * 100) / 100,
        duration: Math.round(duration * 100) / 100,
        xPercent: Math.round(xPercent * 10) / 10,
        yStartVh: -26,
        yEndVh: 120,
        zDepthPx: 110, // positioned forward for crisp prominence
        scaleStart: 0.85,
        scaleFocus: 1.02,
        scaleEnd: 1.08,
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


