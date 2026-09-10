"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { formatAudioTime } from "@/lib/utils";

interface AudioStartEditorProps {
  audioSrc: string;
  audioName: string;
  value: number; // audio_start_seconds (e.g. 78.5)
  onChange: (seconds: number) => void;
  onRemoveAudio?: () => void;
  disabled?: boolean;
}

export function AudioStartEditor({
  audioSrc,
  audioName,
  value,
  onChange,
  onRemoveAudio,
  disabled = false,
}: AudioStartEditorProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Sync initial currentTime or value changes when not playing
  useEffect(() => {
    if (audioRef.current && !isPlaying && !isDragging) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  }, [value, isPlaying, isDragging]);

  // Handle audio metadata load
  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    const dur = audioRef.current.duration;
    if (isFinite(dur) && dur > 0) {
      setDuration(dur);
      setIsLoaded(true);
      if (value > 0) {
        const clamped = Math.min(value, Math.max(0, dur - 1));
        audioRef.current.currentTime = clamped;
        setCurrentTime(clamped);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (!audioRef.current || !isLoaded) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Playback prevented:", err);
      });
    }
  };

  // Play from start marker
  const handlePlayFromStart = () => {
    if (!audioRef.current || !isLoaded) return;
    const clamped = Math.min(value, Math.max(0, duration - 1));
    audioRef.current.currentTime = clamped;
    setCurrentTime(clamped);
    audioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch((err) => {
      console.warn("Playback prevented:", err);
    });
  };

  // Reset start marker to 00:00
  const handleResetStart = () => {
    onChange(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  // Pointer drag calculation
  const calculateSecondsFromPointer = useCallback(
    (clientX: number): number => {
      if (!trackRef.current || duration <= 0) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawSec = progress * duration;
      const maxAllowed = Math.max(0, duration - 1);
      return Math.max(0, Math.min(maxAllowed, Number(rawSec.toFixed(2))));
    },
    [duration]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isLoaded || disabled) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);

    const newSec = calculateSecondsFromPointer(e.clientX);
    onChange(newSec);
    setCurrentTime(newSec);
    if (audioRef.current) {
      audioRef.current.currentTime = newSec;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !isLoaded || disabled) return;
    const newSec = calculateSecondsFromPointer(e.clientX);
    onChange(newSec);
    setCurrentTime(newSec);
    if (audioRef.current) {
      audioRef.current.currentTime = newSec;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Percentages for visual timeline
  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const startMarkerPercent = duration > 0 ? (value / duration) * 100 : 0;

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3.5 shadow-inner">
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
      />

      {/* Header Info */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="text-rose-400 text-lg">🎵</span>
          <div className="truncate">
            <p className="text-xs font-semibold text-zinc-100 truncate">{audioName}</p>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              {isLoaded ? (
                <span>
                  {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
                </span>
              ) : (
                <span className="text-rose-400/80 animate-pulse">Đang tải nhạc...</span>
              )}
            </p>
          </div>
        </div>

        {onRemoveAudio && (
          <button
            type="button"
            onClick={onRemoveAudio}
            disabled={disabled}
            className="text-xs text-zinc-400 hover:text-rose-400 px-2 py-1 rounded-md hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            Gỡ bỏ
          </button>
        )}
      </div>

      {/* Seek / Scrub Timeline with Large Touch Area */}
      <div className="space-y-1.5 select-none">
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative w-full h-9 flex items-center cursor-pointer touch-none ${
            !isLoaded || disabled ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {/* Background Track */}
          <div className="w-full h-2 rounded-full bg-zinc-800 relative overflow-visible">
            {/* Played Progress Fill */}
            <div
              className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 transition-all duration-75"
              style={{ width: `${playheadPercent}%` }}
            />

            {/* Admin Selected Start Position Marker */}
            {duration > 0 && value > 0 && (
              <div
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
                style={{ left: `${startMarkerPercent}%` }}
                title={`Vị trí bắt đầu: ${formatAudioTime(value)}`}
              >
                <div className="w-1.5 h-4 bg-rose-400 rounded-sm shadow-[0_0_8px_rgba(244,63,94,0.9)] ring-1 ring-white" />
              </div>
            )}

            {/* Draggable Playhead Thumb */}
            <div
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] z-20 transition-transform active:scale-125"
              style={{ left: `${playheadPercent}%` }}
            />
          </div>
        </div>

        {/* Start Offset Readout & Helper */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Bắt đầu nhạc từ:</span>
            <span className="font-mono font-semibold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/50">
              {formatAudioTime(value)}
            </span>
          </div>

          {value > 0 && (
            <button
              type="button"
              onClick={handleResetStart}
              disabled={disabled || !isLoaded}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
            >
              Phát từ 00:00
            </button>
          )}
        </div>

        <p className="text-[11px] text-zinc-500 leading-relaxed pt-1">
          Kéo thanh nhạc đến đúng đoạn bạn muốn phát khi người nhận mở món quà.
        </p>
      </div>

      {/* Control Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={togglePlay}
          disabled={!isLoaded || disabled}
          className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-medium text-zinc-200 hover:text-white flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <span>{isPlaying ? "⏸" : "▶"}</span>
          <span>{isPlaying ? "Tạm dừng" : "Nghe thử"}</span>
        </button>

        <button
          type="button"
          onClick={handlePlayFromStart}
          disabled={!isLoaded || disabled}
          className="flex-1 py-2 px-3 rounded-xl bg-rose-950/50 hover:bg-rose-900/70 border border-rose-700/60 text-xs font-medium text-rose-200 hover:text-white flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <span>🎯</span>
          <span>Nghe thử từ {formatAudioTime(value)}</span>
        </button>
      </div>
    </div>
  );
}
