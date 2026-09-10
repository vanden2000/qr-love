"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import type { GiftWithMedia } from "@/types/gift";
import { GiftIntro } from "@/components/gift/gift-intro";
import { GiftContent } from "@/components/gift/gift-content";
import { GiftAudioPlayer } from "@/components/gift/gift-audio-player";
import { LoveScene } from "@/components/three/love-scene";
import { LoveStreamOverlay } from "@/components/gift/love-stream-overlay";
import { generateLoveStreamSchedule } from "@/lib/love-stream/scheduler";
import { SCENE_DURATION } from "@/components/three/scene-timeline";

interface GiftExperienceProps {
  gift: GiftWithMedia;
}

export function GiftExperience({ gift }: GiftExperienceProps) {
  const [isOpened, setIsOpened] = useState(false);
  const [isExitingIntro, setIsExitingIntro] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [replayCount, setReplayCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const finishTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Extract background audio media if present
  const audioMedia = gift.media?.find((item) => item.type === "audio");

  // Precompute deterministic 30s schedule once per (gift + replayCount)
  // ZERO 60fps React re-renders!
  const streamEvents = useMemo(() => {
    return generateLoveStreamSchedule({
      gift,
      replayCount,
    });
  }, [gift, replayCount]);

  // Handle 30-Second visual duration finish trigger
  useEffect(() => {
    if (!isOpened || !isPlaying) {
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      return;
    }

    // Set finished flag at 30 seconds to reveal final action controls
    finishTimerRef.current = setTimeout(() => {
      setIsFinished(true);
    }, SCENE_DURATION * 1000);

    return () => {
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, [isOpened, isPlaying, replayCount]);

  // 1. Open Gift handler
  const handleOpenGift = () => {
    setIsPlaying(true);
    setIsExitingIntro(true);

    setTimeout(() => {
      setIsOpened(true);
      setIsFinished(false);
    }, 600);
  };

  // 2. Play / Pause toggle
  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  // 3. Mute / Unmute toggle
  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // 4. Replay handler (Increments replayCount, resets visual schedule with new variation, restarts audio)
  const handleReplay = () => {
    setIsFinished(false);
    setIsPlaying(true);
    setReplayCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen w-full bg-[#050103] relative overflow-hidden">
      {/* Background Audio Player (Independent of visual duration, restarts on replay) */}
      {audioMedia?.url && (
        <GiftAudioPlayer
          audioUrl={audioMedia.url}
          isPlaying={isPlaying}
          isMuted={isMuted}
          replayTrigger={replayCount}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* 1. Intro Screen */}
      {!isOpened && (
        <GiftIntro
          gift={gift}
          onOpen={handleOpenGift}
          isExiting={isExitingIntro}
        />
      )}

      {/* 2. 30-Second Love Stream Experience */}
      {isOpened && (
        <>
          {/* WebGL Canvas Background: 4-Tier 3D Heart Waterfall, Stardust & Lighting */}
          <LoveScene
            gift={gift}
            isPaused={!isPlaying}
            fallbackContent={<GiftContent gift={gift} />}
          />

          {/* High-DPI HTML/CSS Love Stream Overlay: Primary Messages, Photo Cards & Final Card */}
          <LoveStreamOverlay
            events={streamEvents}
            started={isOpened}
            replayTrigger={replayCount}
            isPaused={!isPlaying}
            onOpenLetter={() => setShowLetter(true)}
            onReplay={handleReplay}
          />

          {/* Floating Control Bar (Ultra-discreet 0.25 during stream, prominent after 30s finish) */}
          <div
            className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-1.5 rounded-full bg-zinc-950/75 hover:bg-zinc-950/95 border border-rose-500/20 hover:border-rose-500/50 backdrop-blur-md shadow-2xl transition-all duration-700 ${
              isFinished
                ? "opacity-100 scale-100 ring-2 ring-rose-500/40 bg-zinc-950/90"
                : "opacity-25 hover:opacity-95 active:opacity-95 scale-90 hover:scale-95"
            }`}
          >
            {/* Play / Pause Toggle */}
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? "Tạm dừng" : "Tiếp tục"}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800/80 active:scale-95 transition-all cursor-pointer"
              title={isPlaying ? "Tạm dừng" : "Tiếp tục"}
            >
              <span className="text-xs sm:text-sm">{isPlaying ? "⏸" : "▶"}</span>
            </button>

            {/* Replay Button */}
            <button
              type="button"
              onClick={handleReplay}
              aria-label="Xem lại từ đầu"
              className="px-3 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 text-zinc-200 hover:text-white bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/50 active:scale-95 transition-all text-xs font-medium cursor-pointer"
              title="Xem lại từ đầu"
            >
              <span>↺</span>
              <span>Xem lại</span>
            </button>

            <div className="w-[1px] h-4 bg-zinc-800 mx-0.5" />

            {/* Switch to Full Letter Modal */}
            <button
              type="button"
              onClick={() => setShowLetter((prev) => !prev)}
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-medium text-zinc-200 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>📖</span>
              <span>{showLetter ? "Không gian 3D" : "Đọc thư"}</span>
            </button>
          </div>

          {/* Letter / Gallery Overlay Modal */}
          {showLetter && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/95 backdrop-blur-md animate-in fade-in duration-300">
              <GiftContent gift={gift} />
              <div className="fixed top-4 left-4 sm:top-5 sm:left-5 z-50">
                <button
                  type="button"
                  onClick={() => setShowLetter(false)}
                  className="px-4 py-2 rounded-full bg-zinc-900/90 border border-zinc-700 text-zinc-200 text-xs font-medium hover:bg-zinc-800 transition-colors min-h-[44px] cursor-pointer"
                >
                  ← Trở về dòng ký ức
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
