"use client";

import React, { useEffect, useRef } from "react";

interface GiftAudioPlayerProps {
  audioUrl?: string | null;
  isPlaying: boolean;
  isMuted?: boolean;
  replayTrigger?: number;
  onToggleMute?: () => void;
}

export function GiftAudioPlayer({
  audioUrl,
  isPlaying,
  isMuted = false,
  replayTrigger = 0,
  onToggleMute,
}: GiftAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // 1. Handle Play / Pause & Volume / Mute
  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;

    audioRef.current.volume = 0.6;
    audioRef.current.muted = isMuted;

    if (isPlaying && !isMuted) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio play prevented or interrupted:", err);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isMuted, audioUrl]);

  // 2. Handle Replay Seek to 0
  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;
    if (replayTrigger > 0) {
      audioRef.current.currentTime = 0;
      if (isPlaying && !isMuted) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [replayTrigger, isPlaying, isMuted, audioUrl]);

  if (!audioUrl) return null;

  return (
    <>
      {/* Background audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        loop
        preload="metadata"
        className="hidden"
      />

      {/* Floating mute / unmute button in upper corner */}
      {onToggleMute && (
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          className="fixed top-5 right-5 z-50 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-zinc-900/80 border border-zinc-700/60 backdrop-blur-md text-zinc-300 text-xs font-medium shadow-lg hover:border-rose-500/40 active:scale-95 transition-all duration-200 min-h-[44px]"
        >
          {!isMuted && isPlaying ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span className="text-rose-300">Nhạc nền</span>
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
      )}
    </>
  );
}
