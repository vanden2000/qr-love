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
      try {
        audioRef.current.currentTime = value;
      } catch (e) {}
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
        const clamped = Math.min(value, Math.max(0, dur - 0.5));
        try {
          audioRef.current.currentTime = clamped;
        } catch (e) {}
        setCurrentTime(clamped);
      }
    } else if (audioRef.current.readyState >= 1) {
      setIsLoaded(true);
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
      try {
        audioRef.current.currentTime = value;
      } catch (e) {}
      setCurrentTime(value);
    }
  };

  // Play / Pause toggle: Always starts from the selected start position (value) if paused
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (value > 0 && Math.abs(audioRef.current.currentTime - value) > 0.5) {
        const clamped = duration > 0 ? Math.min(value, Math.max(0, duration - 0.5)) : value;
        try {
          audioRef.current.currentTime = clamped;
          setCurrentTime(clamped);
        } catch (e) {}
      }
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Playback prevented:", err);
      });
    }
  };

  // Play from start marker
  const handlePlayFromStart = () => {
    if (!audioRef.current) return;
    const clamped = duration > 0 ? Math.min(value, Math.max(0, duration - 0.5)) : value;
    try {
      audioRef.current.currentTime = clamped;
    } catch (e) {}
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

  // Helper to adjust start time by delta seconds
  const adjustSeconds = (delta: number) => {
    if (disabled) return;
    const maxAllowed = duration > 0 ? Math.max(0, duration - 1) : 3600;
    const newSec = Math.max(0, Math.min(maxAllowed, Number((value + delta).toFixed(1))));
    onChange(newSec);
    setCurrentTime(newSec);
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = newSec;
      } catch (e) {}
    }
  };

  // Direct MM:SS manual input handling
  const currentMinutes = Math.floor(value / 60);
  const currentRemainingSeconds = Math.floor(value % 60);

  const handleMinutesChange = (mStr: string) => {
    if (disabled) return;
    const m = Math.max(0, parseInt(mStr, 10) || 0);
    const maxAllowed = duration > 0 ? Math.max(0, duration - 1) : 3600;
    const newSec = Math.min(maxAllowed, m * 60 + currentRemainingSeconds);
    onChange(newSec);
    setCurrentTime(newSec);
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = newSec;
      } catch (e) {}
    }
  };

  const handleSecondsChange = (sStr: string) => {
    if (disabled) return;
    const s = Math.max(0, Math.min(59, parseInt(sStr, 10) || 0));
    const maxAllowed = duration > 0 ? Math.max(0, duration - 1) : 3600;
    const newSec = Math.min(maxAllowed, currentMinutes * 60 + s);
    onChange(newSec);
    setCurrentTime(newSec);
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = newSec;
      } catch (e) {}
    }
  };

  // Percentages for visual timeline
  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const startMarkerPercent = duration > 0 ? (value / duration) * 100 : 0;

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3.5 shadow-inner">
      {/* Hidden Native Audio Element with lightweight metadata preload for fast loading */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onLoadedData={handleLoadedMetadata}
        onCanPlay={handleLoadedMetadata}
        onDurationChange={handleLoadedMetadata}
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
      <div className="space-y-2 select-none">
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

        {/* Start Offset Readout & Direct Fine-Tuning Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-1 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-300 font-medium">Bắt đầu từ:</span>

            {/* Direct Minute : Second Input */}
            <div className="inline-flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-700">
              <input
                type="number"
                min={0}
                max={59}
                value={currentMinutes}
                onChange={(e) => handleMinutesChange(e.target.value)}
                disabled={!isLoaded || disabled}
                className="w-7 text-center text-xs font-mono font-semibold text-rose-300 bg-transparent focus:outline-none focus:text-white"
                title="Số phút"
              />
              <span className="text-zinc-500 font-mono text-xs">:</span>
              <input
                type="number"
                min={0}
                max={59}
                value={currentRemainingSeconds < 10 ? `0${currentRemainingSeconds}` : currentRemainingSeconds}
                onChange={(e) => handleSecondsChange(e.target.value)}
                disabled={!isLoaded || disabled}
                className="w-7 text-center text-xs font-mono font-semibold text-rose-300 bg-transparent focus:outline-none focus:text-white"
                title="Số giây"
              />
            </div>

            <span className="text-[11px] text-zinc-400 font-mono">
              ({value.toFixed(1)}s)
            </span>
          </div>

          {/* Precision Fine-Tuning Step Buttons [-5s], [-1s], [+1s], [+5s] */}
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <button
              type="button"
              onClick={() => adjustSeconds(-5)}
              disabled={!isLoaded || disabled || value <= 0}
              className="px-2 py-1 text-[11px] font-mono font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
              title="Lùi 5 giây"
            >
              -5s
            </button>
            <button
              type="button"
              onClick={() => adjustSeconds(-1)}
              disabled={!isLoaded || disabled || value <= 0}
              className="px-2 py-1 text-[11px] font-mono font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
              title="Lùi 1 giây"
            >
              -1s
            </button>
            <button
              type="button"
              onClick={() => adjustSeconds(1)}
              disabled={!isLoaded || disabled}
              className="px-2 py-1 text-[11px] font-mono font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
              title="Tiến 1 giây"
            >
              +1s
            </button>
            <button
              type="button"
              onClick={() => adjustSeconds(5)}
              disabled={!isLoaded || disabled}
              className="px-2 py-1 text-[11px] font-mono font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
              title="Tiến 5 giây"
            >
              +5s
            </button>

            {value > 0 && (
              <button
                type="button"
                onClick={handleResetStart}
                disabled={disabled || !isLoaded}
                className="ml-1 text-[11px] text-zinc-400 hover:text-rose-300 underline cursor-pointer"
                title="Đặt lại về 00:00"
              >
                Về 0s
              </button>
            )}
          </div>
        </div>

        <p className="text-[11px] text-zinc-500 leading-relaxed pt-0.5">
          Nhập số phút:giây hoặc bấm nút tinh chỉnh để nhạc bắt đầu ngay khúc điệp khúc bạn thích.
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
