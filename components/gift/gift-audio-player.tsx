"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { formatAudioTime } from "@/lib/utils";

interface GiftAudioPlayerProps {
  audioUrl?: string | null;
  isPlaying: boolean;
  startSeconds?: number;
  isMuted?: boolean;
  replayTrigger?: number;
  onToggleMute?: () => void;
  onTogglePlay?: () => void;
}

export function GiftAudioPlayer({
  audioUrl,
  isPlaying,
  startSeconds = 0,
  isMuted = false,
  replayTrigger = 0,
  onToggleMute,
  onTogglePlay,
}: GiftAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const hasReachedStartRef = useRef(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(startSeconds);
  const [isDragging, setIsDragging] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);

  // Reset reached flag if audioUrl or replayTrigger changes
  useEffect(() => {
    hasReachedStartRef.current = false;
  }, [audioUrl, replayTrigger]);

  // 1. Force Seek to startSeconds and verify whether browser accepted it
  const forceSeekToStart = useCallback(() => {
    if (!audioRef.current || startSeconds <= 0) return;
    try {
      const dur = audioRef.current.duration;
      const targetTime = isFinite(dur) && dur > 0 ? Math.min(startSeconds, Math.max(0, dur - 0.5)) : startSeconds;
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
      if (Math.abs(audioRef.current.currentTime - targetTime) < 1.5) {
        hasReachedStartRef.current = true;
      }
    } catch (err) {
      console.warn("Could not seek audio currentTime:", err);
    }
  }, [startSeconds]);

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    const dur = audioRef.current.duration;
    if (isFinite(dur) && dur > 0) {
      setDuration(dur);
    }
    if (startSeconds > 0 && !hasReachedStartRef.current) {
      forceSeekToStart();
    }
  };

  const handleCanPlay = () => {
    if (!audioRef.current) return;
    if (startSeconds > 0 && !hasReachedStartRef.current) {
      forceSeekToStart();
    }
  };

  const handlePlaying = () => {
    if (!audioRef.current) return;
    if (startSeconds > 0 && !hasReachedStartRef.current) {
      if (audioRef.current.currentTime < startSeconds - 1.0) {
        forceSeekToStart();
      } else {
        hasReachedStartRef.current = true;
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current || isDragging) return;
    const curr = audioRef.current.currentTime;
    // If audio is actively playing from start (near 0s) while startSeconds was configured
    if (startSeconds > 0 && !hasReachedStartRef.current && isPlaying) {
      if (curr < startSeconds - 1.0) {
        forceSeekToStart();
        return;
      } else {
        hasReachedStartRef.current = true;
      }
    }
    setCurrentTime(curr);
  };

  // 2. Handle Play / Pause & Volume / Mute
  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;

    audioRef.current.volume = 0.65;
    audioRef.current.muted = isMuted;

    if (isPlaying && !isMuted) {
      // Seek to start position before calling play
      if (startSeconds > 0 && !hasReachedStartRef.current) {
        forceSeekToStart();
      }

      try {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (startSeconds > 0 && audioRef.current && audioRef.current.currentTime < startSeconds - 1.0) {
                forceSeekToStart();
              }
            })
            .catch((err) => {
              console.warn("Audio play prevented or interrupted:", err);
            });
        }
      } catch (playErr) {
        console.warn("Direct audio play error:", playErr);
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isMuted, audioUrl, startSeconds, forceSeekToStart]);

  // 3. Handle Replay -> Restarts strictly from configured startSeconds!
  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;
    if (replayTrigger > 0) {
      const resetTime =
        audioRef.current.duration && startSeconds > 0
          ? Math.min(startSeconds, Math.max(0, audioRef.current.duration - 1))
          : startSeconds;

      try {
        audioRef.current.currentTime = resetTime;
      } catch {}
      setCurrentTime(resetTime);

      if (isPlaying && !isMuted) {
        try {
          audioRef.current.play().catch(() => {});
        } catch {}
      }
    }
  }, [replayTrigger, isPlaying, isMuted, audioUrl, startSeconds]);

  // Pointer drag calculation for public mini scrubber
  const calculateSecondsFromPointer = useCallback(
    (clientX: number): number => {
      if (!trackRef.current || duration <= 0) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawSec = progress * duration;
      return Math.max(0, Math.min(duration, Number(rawSec.toFixed(2))));
    },
    [duration]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration <= 0) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);

    const newSec = calculateSecondsFromPointer(e.clientX);
    setCurrentTime(newSec);
    audioRef.current.currentTime = newSec;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !audioRef.current || duration <= 0) return;
    const newSec = calculateSecondsFromPointer(e.clientX);
    setCurrentTime(newSec);
    audioRef.current.currentTime = newSec;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  if (!audioUrl) return null;

  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Background Audio Element with preload auto for Safari & Slow Networks */}
      <audio
        ref={audioRef}
        src={audioUrl}
        loop
        preload="auto"
        playsInline
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onPlaying={handlePlaying}
        onTimeUpdate={handleTimeUpdate}
        className="hidden"
      />

      {/* Floating Music Control in Top-Right Corner */}
      <div className="fixed top-4 sm:top-5 right-4 sm:right-5 z-50 flex flex-col items-end gap-2 select-none">
        {/* Main Music Button */}
        <button
          type="button"
          onClick={() => setShowMiniPlayer((prev) => !prev)}
          aria-label={isMuted ? "Bật âm thanh" : "Điều chỉnh nhạc nền"}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-zinc-900/80 border border-zinc-700/60 hover:border-rose-500/50 backdrop-blur-md text-zinc-300 text-xs font-medium shadow-xl hover:text-white active:scale-95 transition-all duration-200 min-h-[44px] cursor-pointer"
        >
          {!isMuted && isPlaying ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span className="text-rose-200 font-medium">Nhạc nền</span>
              <span className="text-sm">🎵</span>
            </>
          ) : (
            <>
              <span className="inline-block h-2 w-2 rounded-full bg-zinc-600" />
              <span className="text-zinc-400">Tắt tiếng</span>
              <span className="text-sm opacity-60">🔇</span>
            </>
          )}
        </button>

        {/* Expandable Public Mini Player with Touch Seek Bar */}
        {showMiniPlayer && (
          <div className="w-64 sm:w-72 p-3.5 rounded-2xl bg-zinc-950/90 border border-rose-500/30 backdrop-blur-xl shadow-2xl space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header: Track Status & Controls */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <span className="text-rose-400">♫</span>
                <span className="font-mono text-[11px] text-zinc-400">
                  {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {onTogglePlay && (
                  <button
                    type="button"
                    onClick={onTogglePlay}
                    className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs cursor-pointer"
                    title={isPlaying ? "Tạm dừng" : "Tiếp tục"}
                  >
                    {isPlaying ? "⏸" : "▶"}
                  </button>
                )}

                {onToggleMute && (
                  <button
                    type="button"
                    onClick={onToggleMute}
                    className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs cursor-pointer"
                    title={isMuted ? "Bật âm thanh" : "Tắt tiếng"}
                  >
                    {isMuted ? "🔇" : "🔊"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowMiniPlayer(false)}
                  className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
                  title="Đóng"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Touch Seek Bar */}
            <div
              ref={trackRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="relative w-full h-8 flex items-center cursor-pointer touch-none"
            >
              <div className="w-full h-1.5 rounded-full bg-zinc-800 relative overflow-visible">
                <div
                  className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-rose-600 to-rose-400"
                  style={{ width: `${playheadPercent}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-rose-500 shadow-md transition-transform active:scale-125"
                  style={{ left: `${playheadPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
