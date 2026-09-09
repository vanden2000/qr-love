"use client";

import React, { useMemo } from "react";
import type { GiftWithMedia } from "@/types/gift";
import { getFadeOpacity } from "@/components/three/scene-timeline";

interface MobileStoryStreamProps {
  gift: GiftWithMedia;
  timelineTime: number;
}

interface StoryBeat {
  id: string;
  label?: string;
  primaryText: string;
  subtitle?: string;
  startWindow: number;
  endWindow: number;
  isEnding?: boolean;
}

export function MobileStoryStream({
  gift,
  timelineTime,
}: MobileStoryStreamProps) {
  // Extract user-defined or clean derived story messages
  const storyBeats = useMemo<StoryBeat[]>(() => {
    const rawList =
      gift.story_messages && gift.story_messages.length > 0
        ? gift.story_messages.map((m) => m.content.trim()).filter(Boolean)
        : gift.message
            .split(/[.\n;!?]+/)
            .map((s) => s.trim())
            .filter((s) => s.length >= 3);

    const messages =
      rawList.length > 0
        ? rawList.slice(0, 10)
        : [
            "Cảm ơn vì đã luôn ở bên anh",
            "Mỗi khoảnh khắc có em đều là điều quý giá nhất",
          ];

    const beats: StoryBeat[] = [];

    // --- CHAPTER 1: OPENING (1.0s - 8.0s) ---
    beats.push({
      id: "opening-hero",
      label: "MỘT MÓN QUÀ DÀNH CHO BẠN",
      primaryText: gift.receiver_name,
      subtitle: `“Gửi ${gift.receiver_name} yêu thương”`,
      startWindow: 1.0,
      endWindow: 8.0,
    });

    // --- CHAPTER 2 & 3: USER STORY MESSAGES (8.0s - 48.0s) ---
    const totalMessageTime = 40.0;
    const beatDuration = totalMessageTime / messages.length;

    messages.forEach((msg, idx) => {
      const start = 8.0 + idx * beatDuration;
      const end = Math.min(48.5, start + beatDuration + 0.4);
      beats.push({
        id: `msg-beat-${idx}`,
        label: messages.length > 1 ? `LỜI NHẮN ${idx + 1}/${messages.length}` : undefined,
        primaryText: msg,
        startWindow: start,
        endWindow: end,
      });
    });

    // --- CHAPTER 4: SENDER SIGN-OFF (48.0s - 53.5s) ---
    beats.push({
      id: "sender-signoff",
      label: "GỬI TỪ TRÁI TIM",
      primaryText: `Thương gửi từ ${gift.sender_name || "người thương"}`,
      subtitle: "Forever & Always ♡",
      startWindow: 48.0,
      endWindow: 53.5,
    });

    // --- CHAPTER 5: ENDING POSTER (53.5s onwards) ---
    beats.push({
      id: "ending-poster",
      primaryText: `${gift.sender_name || "Người thương"} ♡ ${gift.receiver_name}`,
      subtitle: "“Hành trình của chúng ta • Mãi mãi đong đầy yêu thương”",
      startWindow: 53.5,
      endWindow: 999.0,
      isEnding: true,
    });

    return beats;
  }, [gift]);

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Centered Safe Area Container: 10vw to 90vw horizontal, 22vh to 72vh vertical focus */}
      <div className="relative w-full max-w-[420px] px-4 flex flex-col items-center justify-center text-center my-auto min-h-[220px]">
        {storyBeats.map((beat) => {
          const opacity = getFadeOpacity(
            timelineTime,
            beat.startWindow,
            beat.endWindow,
            1.2,
            0.0
          );

          if (opacity <= 0.001) return null;

          const duration = Math.min(20.0, beat.endWindow - beat.startWindow);
          const progress = Math.max(
            0,
            Math.min(1, (timelineTime - beat.startWindow) / duration)
          );

          let translateY = 0;
          let scale = 1;

          if (progress < 0.22) {
            // ENTERING from top: translateY -24px -> 0px
            const enterP = progress / 0.22;
            translateY = (1 - enterP) * -24;
            scale = 0.97 + enterP * 0.03;
          } else if (progress > 0.78 && !beat.isEnding) {
            // EXITING to bottom (for intermediate beats only): translateY 0px -> 26px
            const exitP = (progress - 0.78) / 0.22;
            translateY = exitP * 26;
            scale = 1.0 + exitP * 0.02;
          }

          return (
            <div
              key={beat.id}
              className="absolute inset-x-0 mx-auto w-[min(82vw,400px)] flex flex-col items-center justify-center text-center transition-transform will-change-transform"
              style={{
                opacity,
                transform: `translateY(${translateY}px) scale(${scale})`,
              }}
            >
              {/* Top Small Label */}
              {beat.label && (
                <p className="text-[12px] sm:text-[14px] tracking-[0.18em] font-medium text-rose-300/90 uppercase mb-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                  {beat.label}
                </p>
              )}

              {/* Ending Heart Icon */}
              {beat.isEnding && (
                <div className="text-2xl text-rose-400 mb-2 animate-pulse">
                  ♥
                </div>
              )}

              {/* Receiver Name / Primary Message Typography */}
              <h1
                className={`font-serif leading-[1.2] text-[#FFF4F6] px-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] break-words ${
                  beat.isEnding
                    ? "text-[clamp(24px,6.5vw,34px)] font-medium tracking-wide"
                    : "text-[clamp(28px,7.5vw,40px)] font-medium"
                }`}
                style={{
                  fontFamily: "var(--font-playfair), serif",
                  textShadow:
                    "0 0 14px rgba(251,113,133,0.32), 0 0 28px rgba(225,29,72,0.18)",
                }}
              >
                {beat.primaryText}
              </h1>

              {/* Subtitle / Romantic Quote */}
              {beat.subtitle && (
                <p className="mt-2.5 text-[15px] sm:text-[17px] text-rose-200/90 leading-[1.45] font-serif italic max-w-[340px] drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                  {beat.subtitle}
                </p>
              )}

              {beat.isEnding && (
                <p className="mt-3 text-[11px] tracking-[0.22em] text-rose-300/70 uppercase font-light">
                  FOREVER & ALWAYS
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
