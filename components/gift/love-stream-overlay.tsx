"use client";

import React from "react";
import Image from "next/image";
import type { StreamEvent } from "@/lib/love-stream/scheduler";

interface LoveStreamOverlayProps {
  events: StreamEvent[];
  started: boolean;
  replayTrigger: number;
  isPaused?: boolean;
}

export function LoveStreamOverlay({
  events,
  started,
  replayTrigger,
  isPaused = false,
}: LoveStreamOverlayProps) {
  if (!started) return null;

  return (
    <div
      key={`love-stream-${replayTrigger}`}
      className="fixed inset-0 z-30 pointer-events-none select-none overflow-hidden"
      style={{
        animationPlayState: isPaused ? "paused" : "running",
      }}
    >
      <style jsx>{`
        @keyframes streamFlowStandard {
          0% {
            transform: translateY(-22vh) scale(0.93) rotate(var(--stream-tilt));
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          40% {
            transform: translateY(35vh) scale(1.02) rotate(var(--stream-tilt));
            opacity: 1;
          }
          58% {
            transform: translateY(48vh) scale(1.0) rotate(var(--stream-tilt));
            opacity: 1;
          }
          82% {
            opacity: 0.85;
          }
          100% {
            transform: translateY(118vh) scale(0.94) rotate(var(--stream-tilt));
            opacity: 0;
          }
        }

        @keyframes streamFlowEnding {
          0% {
            transform: translateY(-20vh) scale(0.9);
            opacity: 0;
          }
          100% {
            transform: translateY(0vh) scale(1.0);
            opacity: 1;
          }
        }

        .stream-element-anim {
          animation-name: streamFlowStandard;
          animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
          animation-fill-mode: forwards;
          will-change: transform, opacity;
        }

        .stream-ending-anim {
          animation-name: streamFlowEnding;
          animation-duration: 2.8s;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: forwards;
          will-change: transform, opacity;
        }
      `}</style>

      {events.map((event) => {
        // Position X alignment based on lane
        let laneClasses = "left-1/2 -translate-x-1/2"; // default center
        if (event.lane === "left") {
          laneClasses = "left-4 sm:left-10";
        } else if (event.lane === "right") {
          laneClasses = "right-4 sm:right-10";
        }

        const animStyle: React.CSSProperties = {
          ["--stream-tilt" as string]: `${event.tiltDeg || 0}deg`,
          animationDelay: `${event.startTime}s`,
          animationDuration: `${event.duration}s`,
          animationPlayState: isPaused ? "paused" : "running",
        };

        // ===================================================================
        // 1. ENDING POSTER (Persists in center past 30.0s)
        // ===================================================================
        if (event.isEnding) {
          return (
            <div
              key={event.id}
              className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center stream-ending-anim"
              style={{
                animationDelay: `${event.startTime}s`,
                animationPlayState: isPaused ? "paused" : "running",
              }}
            >
              <div className="relative max-w-[420px] w-full p-6 rounded-3xl bg-zinc-950/60 border border-rose-500/20 backdrop-blur-md shadow-2xl flex flex-col items-center">
                {/* Luminous Pulsing Glow Heart Symbol */}
                <div className="text-3xl text-rose-400 mb-2 animate-pulse drop-shadow-[0_0_12px_rgba(251,113,133,0.8)]">
                  ♥
                </div>

                <p className="text-[11px] sm:text-xs tracking-[0.25em] text-rose-300/80 uppercase font-light mb-1.5">
                  {event.label}
                </p>

                <h1
                  className="text-2xl sm:text-3xl font-serif text-white font-medium tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
                  style={{
                    fontFamily: "var(--font-playfair), serif",
                    textShadow: "0 0 20px rgba(251,113,133,0.45)",
                  }}
                >
                  {event.primaryText}
                </h1>

                {event.subtitle && (
                  <p className="mt-3 text-xs sm:text-sm text-rose-200/90 leading-relaxed font-serif italic max-w-xs drop-shadow-sm">
                    {event.subtitle}
                  </p>
                )}
              </div>
            </div>
          );
        }

        // ===================================================================
        // 2. ROMANTIC MEMORY PHOTO CARD
        // ===================================================================
        if (event.type === "PHOTO" && event.photoUrl) {
          return (
            <div
              key={event.id}
              className={`absolute top-0 ${laneClasses} stream-element-anim opacity-0`}
              style={animStyle}
            >
              <div className="relative w-[150px] sm:w-[190px] aspect-[4/5] p-1.5 rounded-2xl bg-zinc-950/80 border border-rose-300/40 backdrop-blur-md shadow-[0_8px_30px_rgba(225,29,72,0.3)]">
                {/* Subtle Inner Glass Glare */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 via-transparent to-black/40 pointer-events-none" />

                {/* The Image */}
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-zinc-900">
                  <Image
                    src={event.photoUrl}
                    alt="Memory photo"
                    fill
                    sizes="(max-width: 640px) 190px, 240px"
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* Subtle bottom emblem */}
                <div className="absolute bottom-1 right-2 text-[8px] text-rose-300/80 font-serif italic drop-shadow">
                  love memory ♡
                </div>
              </div>
            </div>
          );
        }

        // ===================================================================
        // 3. AMBIENT TEXT PILL
        // ===================================================================
        if (event.type === "AMBIENT_TEXT") {
          return (
            <div
              key={event.id}
              className={`absolute top-0 ${laneClasses} stream-element-anim opacity-0`}
              style={animStyle}
            >
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-950/75 border border-rose-500/30 backdrop-blur-md shadow-lg">
                {event.label && (
                  <span className="text-[10px] uppercase tracking-wider text-rose-400 font-semibold">
                    {event.label} •
                  </span>
                )}
                <span
                  className="text-xs sm:text-sm font-serif italic text-rose-100 drop-shadow-sm whitespace-nowrap"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {event.primaryText}
                </span>
              </div>
            </div>
          );
        }

        // ===================================================================
        // 4. RECEIVER HERO / PRIMARY MESSAGE (Centered, crisp, elegant)
        // ===================================================================
        return (
          <div
            key={event.id}
            className={`absolute top-0 ${laneClasses} w-[min(88vw,440px)] text-center stream-element-anim opacity-0`}
            style={animStyle}
          >
            <div className="p-3 sm:p-4 rounded-3xl bg-zinc-950/40 border border-rose-500/10 backdrop-blur-[2px] inline-block max-w-full">
              {event.label && (
                <p className="text-[11px] sm:text-[13px] tracking-[0.2em] font-medium text-rose-300/90 uppercase mb-1.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                  {event.label}
                </p>
              )}

              <h1
                className={`font-serif leading-[1.25] text-[#FFF5F7] px-2 break-words drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] ${
                  event.type === "RECEIVER_HERO"
                    ? "text-[clamp(28px,7.5vw,42px)] font-medium"
                    : "text-[clamp(22px,5.8vw,32px)] font-normal"
                }`}
                style={{
                  fontFamily: "var(--font-playfair), serif",
                  textShadow:
                    "0 0 16px rgba(251,113,133,0.38), 0 0 32px rgba(225,29,72,0.22)",
                }}
              >
                {event.primaryText}
              </h1>

              {event.subtitle && (
                <p className="mt-2 text-sm sm:text-base text-rose-200/90 leading-snug font-serif italic max-w-xs mx-auto drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                  {event.subtitle}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
