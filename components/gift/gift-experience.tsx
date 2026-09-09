"use client";

import React, { useState, useEffect, useRef } from "react";
import type { GiftWithMedia } from "@/types/gift";
import { GiftIntro } from "@/components/gift/gift-intro";
import { GiftContent } from "@/components/gift/gift-content";
import { GiftAudioPlayer } from "@/components/gift/gift-audio-player";
import { LoveScene } from "@/components/three/love-scene";
import { MobileStoryStream } from "@/components/gift/mobile-story-stream";
import { SCENE_DURATION, getTimelineChapter } from "@/components/three/scene-timeline";

interface GiftExperienceProps {
  gift: GiftWithMedia;
}

export function GiftExperience({ gift }: GiftExperienceProps) {
  const [isOpened, setIsOpened] = useState(false);
  const [isExitingIntro, setIsExitingIntro] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [timelineTime, setTimelineTime] = useState(0);
  const [replayCount, setReplayCount] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false);

  const lastFrameTimeRef = useRef<number | null>(null);

  // Detect Mobile Viewport (Width <= 640 or Portrait Aspect Ratio)
  useEffect(() => {
    const handleResize = () => {
      const isMobile =
        window.innerWidth <= 640 ||
        window.innerWidth / Math.max(1, window.innerHeight) < 0.8;
      setIsMobileView(isMobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Extract background audio media if present
  const audioMedia = gift.media?.find((item) => item.type === "audio");

  // 1. Timeline progression ticker (0 to 65s)
  useEffect(() => {
    if (!isOpened || !isPlaying) {
      lastFrameTimeRef.current = null;
      return;
    }

    let animationFrameId: number;

    const tick = (currentTime: number) => {
      if (lastFrameTimeRef.current !== null) {
        const deltaSeconds = (currentTime - lastFrameTimeRef.current) / 1000;
        setTimelineTime((prev) => {
          const next = prev + deltaSeconds;
          return Math.min(SCENE_DURATION, next);
        });
      }
      lastFrameTimeRef.current = currentTime;
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpened, isPlaying]);

  // 2. Open Gift handler
  const handleOpenGift = () => {
    setIsPlaying(true);
    setIsExitingIntro(true);

    setTimeout(() => {
      setIsOpened(true);
      setTimelineTime(0);
    }, 650);
  };

  // 3. Play / Pause toggle
  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  // 4. Mute / Unmute toggle
  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // 5. Replay handler
  const handleReplay = () => {
    setTimelineTime(0);
    setIsPlaying(true);
    setReplayCount((prev) => prev + 1);
  };

  const currentChapter = getTimelineChapter(timelineTime);
  const isConfessionChapter = currentChapter === "CONFESSION";

  return (
    <div className="min-h-screen w-full bg-zinc-950 relative overflow-hidden">
      {/* Background Audio Player (Preserved across all views) */}
      {audioMedia?.url && (
        <GiftAudioPlayer
          audioUrl={audioMedia.url}
          isPlaying={isPlaying}
          isMuted={isMuted}
          replayTrigger={replayCount}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Intro Screen */}
      {!isOpened && (
        <GiftIntro
          gift={gift}
          onOpen={handleOpenGift}
          isExiting={isExitingIntro}
        />
      )}

      {/* 3D Love Scene Experience */}
      {isOpened && (
        <>
          {/* 3D Canvas Layer (Hearts, Stardust, Photos, Cinematic Lighting) */}
          <LoveScene
            gift={gift}
            timelineTime={timelineTime}
            fallbackContent={<GiftContent gift={gift} />}
          />

          {/* Hybrid 2.5D Mobile Story Stream Layer (Crystal-Clear HTML Text) */}
          {isMobileView && (
            <MobileStoryStream
              gift={gift}
              timelineTime={timelineTime}
            />
          )}

          {/* Discreet Mobile-Safe Floating Control Bar */}
          <div
            className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-full bg-zinc-950/75 hover:bg-zinc-950/95 border border-zinc-800/80 backdrop-blur-md shadow-2xl transition-opacity duration-500 ${
              isConfessionChapter
                ? "opacity-35 hover:opacity-100"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            {/* Play / Pause Toggle */}
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? "Tạm dừng" : "Tiếp tục"}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800/80 active:scale-95 transition-all"
              title={isPlaying ? "Tạm dừng" : "Tiếp tục"}
            >
              <span className="text-xs sm:text-sm">{isPlaying ? "⏸" : "▶"}</span>
            </button>

            {/* Replay Button */}
            <button
              type="button"
              onClick={handleReplay}
              aria-label="Phát lại từ đầu"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800/80 active:scale-95 transition-all"
              title="Phát lại từ đầu"
            >
              <span className="text-xs sm:text-sm">↺</span>
            </button>

            <div className="w-[1px] h-4 sm:h-5 bg-zinc-800 mx-0.5" />

            {/* Switch between 3D Space & Full Letter */}
            <button
              type="button"
              onClick={() => setShowLetter((prev) => !prev)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium text-zinc-200 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/40 active:scale-95 transition-all min-h-[40px] sm:min-h-[44px] flex items-center gap-1"
            >
              <span>{showLetter ? "🌌 3D Space" : "Đọc thư"}</span>
            </button>
          </div>

          {/* Letter / Gallery Overlay */}
          {showLetter && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/90 backdrop-blur-md animate-in fade-in duration-300">
              <GiftContent gift={gift} />
              <div className="fixed top-4 left-4 sm:top-5 sm:left-5 z-50">
                <button
                  type="button"
                  onClick={() => setShowLetter(false)}
                  className="px-4 py-2 rounded-full bg-zinc-900/90 border border-zinc-700 text-zinc-200 text-xs font-medium hover:bg-zinc-800 transition-colors min-h-[44px]"
                >
                  ← Trở về không gian 3D
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
