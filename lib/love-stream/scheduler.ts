import type { GiftWithMedia } from "@/types/gift";

export type StreamEventType =
  | "RECEIVER_HERO"
  | "PRIMARY_MESSAGE"
  | "AMBIENT_TEXT"
  | "PHOTO"
  | "HEART_BURST"
  | "ENDING";

export type StreamLane = "left" | "center" | "right";

export interface StreamEvent {
  id: string;
  type: StreamEventType;
  startTime: number; // in seconds (e.g. 0.6)
  duration: number; // in seconds (e.g. 4.5)
  lane: StreamLane;
  xOffsetPercent?: number; // small horizontal drift e.g. -8% to +8%
  tiltDeg: number; // gentle tilt between -6deg and +6deg
  scale: number; // 0.9 to 1.15
  primaryText?: string;
  subtitle?: string;
  label?: string;
  photoUrl?: string;
  isEnding?: boolean;
}

/**
 * Deterministic Mulberry32 PRNG from a string seed
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

/**
 * Calculates adaptive reading duration based on character length
 */
function getMessageDuration(text: string): number {
  const len = text.trim().length;
  if (len <= 35) return 3.6;
  if (len <= 80) return 4.3;
  if (len <= 130) return 4.9;
  return 5.4;
}

export interface ScheduleOptions {
  gift: GiftWithMedia;
  replayCount: number;
}

/**
 * Precomputes the full 30-second Love Stream event schedule once.
 * Deterministic for a given (gift.slug + replayCount).
 */
export function generateLoveStreamSchedule({
  gift,
  replayCount,
}: ScheduleOptions): StreamEvent[] {
  const seed = `${gift.slug || gift.id || "gift"}:${replayCount}`;
  const rng = createSeededRNG(seed);

  const events: StreamEvent[] = [];

  // 1. Extract Primary Messages (from gift_messages or full message text)
  const rawList =
    gift.story_messages && gift.story_messages.length > 0
      ? gift.story_messages.map((m) => m.content.trim()).filter(Boolean)
      : gift.message
          .split(/[.\n;!?]+/)
          .map((s) => s.trim())
          .filter((s) => s.length >= 3);

  const primaryMessages =
    rawList.length > 0
      ? rawList.slice(0, 10)
      : [
          "Cảm ơn em vì đã luôn ở bên anh",
          "Mỗi khoảnh khắc có em đều là điều quý giá nhất",
        ];

  // 2. Extract Images (up to 5)
  const imageMedia = (gift.media || [])
    .filter((m) => m.type === "image" && Boolean(m.url))
    .slice(0, 5);

  // 3. Calculate Anniversary Days phrase
  let anniversaryPhrase: string | null = null;
  if (gift.start_date && gift.created_at) {
    const startTime = new Date(gift.start_date).getTime();
    const createTime = new Date(gift.created_at).getTime();
    if (!isNaN(startTime) && !isNaN(createTime)) {
      const days = Math.max(
        1,
        Math.floor(Math.abs(createTime - startTime) / (1000 * 60 * 60 * 24))
      );
      anniversaryPhrase = `${days} ngày yêu thương ♡`;
    }
  }

  // =========================================================================
  // 0.0s – 3.2s: OPENING — RECEIVER NAME HERO
  // =========================================================================
  events.push({
    id: "receiver-hero-0",
    type: "RECEIVER_HERO",
    startTime: 0.6,
    duration: 3.2,
    lane: "center",
    tiltDeg: (rng() - 0.5) * 2.0, // slight subtle tilt
    scale: 1.0,
    label: "MỘT MÓN QUÀ DÀNH CHO BẠN",
    primaryText: gift.receiver_name,
    subtitle: gift.title ? `“${gift.title}”` : undefined,
  });

  // =========================================================================
  // 3.0s – 26.5s: PRIMARY MESSAGES (Center corridor, strictly non-overlapping focus)
  // =========================================================================
  const messageTimeStart = 3.2;
  const messageTimeEnd = 26.0;
  const totalMessageBudget = messageTimeEnd - messageTimeStart;
  const countMsg = primaryMessages.length;

  // Stagger messages across the 3.2s - 26.0s window
  const intervalPerMsg = totalMessageBudget / countMsg;

  primaryMessages.forEach((msg, idx) => {
    const baseDuration = getMessageDuration(msg);
    // Ensure duration fits gracefully inside timeline
    const duration = Math.min(baseDuration, intervalPerMsg + 1.2);
    const startTime = messageTimeStart + idx * intervalPerMsg;
    const tilt = (rng() - 0.5) * 4.0; // -2 to +2 deg
    const xOffset = (rng() - 0.5) * 4; // slight ±2% drift for organic feel

    events.push({
      id: `primary-msg-${idx}`,
      type: "PRIMARY_MESSAGE",
      startTime: Math.round(startTime * 100) / 100,
      duration: Math.round(duration * 100) / 100,
      lane: "center",
      tiltDeg: Math.round(tilt * 10) / 10,
      xOffsetPercent: Math.round(xOffset * 10) / 10,
      scale: 1.0,
      label: countMsg > 1 ? `Lời nhắn ${idx + 1}/${countMsg}` : undefined,
      primaryText: msg,
    });
  });

  // =========================================================================
  // 4.0s – 26.0s: GUARANTEED PHOTO STREAM (All 1–5 images scheduled)
  // =========================================================================
  const numPhotos = imageMedia.length;

  if (numPhotos > 0) {
    let photoAnchorTimes: number[] = [];

    if (numPhotos === 1) {
      photoAnchorTimes = [12.0];
    } else if (numPhotos === 2) {
      photoAnchorTimes = [8.5, 19.0];
    } else if (numPhotos === 3) {
      photoAnchorTimes = [6.5, 14.5, 21.5];
    } else if (numPhotos === 4) {
      photoAnchorTimes = [5.5, 11.5, 17.5, 23.0];
    } else {
      // 5 photos
      photoAnchorTimes = [4.8, 9.6, 14.4, 19.2, 23.8];
    }

    imageMedia.forEach((img, idx) => {
      const anchor = photoAnchorTimes[idx] || 12.0;
      // Add safe deterministic jitter ±0.4s
      const jitter = (rng() - 0.5) * 0.8;
      const startTime = Math.max(3.8, Math.min(24.5, anchor + jitter));
      const duration = 4.8;

      // Alternate lanes: left, right, left, right...
      const lane: StreamLane = idx % 2 === 0 ? "left" : "right";
      const tilt = (idx % 2 === 0 ? -1 : 1) * (2.5 + rng() * 3.0); // -2.5° to -5.5° or +2.5° to +5.5°
      const xOffset = (rng() - 0.5) * 6; // ±3%

      events.push({
        id: `photo-event-${idx}`,
        type: "PHOTO",
        startTime: Math.round(startTime * 100) / 100,
        duration: Math.round(duration * 100) / 100,
        lane,
        tiltDeg: Math.round(tilt * 10) / 10,
        xOffsetPercent: Math.round(xOffset * 10) / 10,
        scale: 0.96 + rng() * 0.08,
        photoUrl: img.url,
      });
    });
  }

  // =========================================================================
  // AMBIENT TEXT PILLS (Sender name, anniversary days, quote touches, sparkles)
  // =========================================================================
  const ambientItems: { text: string; label?: string }[] = [];

  if (gift.sender_name) {
    ambientItems.push({ text: `Từ: ${gift.sender_name}`, label: "GỬI TỪ TRÁI TIM" });
  }
  if (anniversaryPhrase) {
    ambientItems.push({ text: anniversaryPhrase });
  }
  ambientItems.push({ text: "Forever & Always ♡" });
  ambientItems.push({ text: "Mỗi ngày thêm yêu em ♡" });

  const ambientTimings = [4.2, 10.2, 16.8, 22.5];

  ambientItems.forEach((item, idx) => {
    const timeAnchor = ambientTimings[idx % ambientTimings.length];
    const jitter = (rng() - 0.5) * 1.2;
    const startTime = Math.max(3.5, Math.min(25.0, timeAnchor + jitter));
    const lane: StreamLane = idx % 2 === 0 ? "right" : "left";
    const tilt = (rng() - 0.5) * 5.0;

    events.push({
      id: `ambient-event-${idx}`,
      type: "AMBIENT_TEXT",
      startTime: Math.round(startTime * 100) / 100,
      duration: 3.8,
      lane,
      tiltDeg: Math.round(tilt * 10) / 10,
      xOffsetPercent: (rng() - 0.5) * 8,
      scale: 0.92,
      label: item.label,
      primaryText: item.text,
    });
  });

  // =========================================================================
  // 26.5s – 30.0s+: ENDING HERO POSTER (Persists past 30.0s)
  // =========================================================================
  events.push({
    id: "ending-poster-event",
    type: "ENDING",
    startTime: 26.5,
    duration: 999.0, // Indefinite persistence after 30s
    lane: "center",
    tiltDeg: 0,
    scale: 1.0,
    label: "FOREVER & ALWAYS",
    primaryText: `${gift.sender_name || "Người thương"} ♡ ${gift.receiver_name}`,
    subtitle: "“Hành trình của chúng ta • Mãi mãi đong đầy yêu thương”",
    isEnding: true,
  });

  // Sort events chronologically by startTime
  events.sort((a, b) => a.startTime - b.startTime);

  return events;
}
