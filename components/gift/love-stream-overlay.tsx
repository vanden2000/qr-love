"use client";

import React from "react";
import Image from "next/image";
import type { LoveFieldEvent } from "@/lib/love-stream/scheduler";

interface LoveStreamOverlayProps {
  events: LoveFieldEvent[];
  started: boolean;
  replayTrigger: number;
  isPaused?: boolean;
  onOpenLetter?: () => void;
  onReplay?: () => void;
}

export function LoveStreamOverlay({
  events,
  started,
  replayTrigger,
  isPaused = false,
  onOpenLetter,
  onReplay,
}: LoveStreamOverlayProps) {
  if (!started) return null;

  return (
    <div
      key={`love-stream-field-${replayTrigger}`}
      className="fixed inset-0 z-30 pointer-events-none select-none overflow-hidden"
      style={{
        perspective: "1000px",
        perspectiveOrigin: "50% 45%",
        transformStyle: "preserve-3d",
      }}
    >
      <style jsx>{`
        /* Slow, cinematic, readable flow with 2.8s-3.5s center dwell */
        @keyframes loveStreamSlowFlow {
          0% {
            transform: translate3d(
                calc(-50% + var(--flow-x-drift) * -0.3),
                var(--flow-y-start),
                var(--flow-z-depth)
              )
              scale(var(--flow-scale-start))
              rotateZ(var(--flow-rot-z))
              rotateY(var(--flow-rot-y));
            opacity: 0;
          }
          16% {
            opacity: var(--flow-opacity-focus);
          }
          36% {
            transform: translate3d(
                -50%,
                36vh,
                calc(var(--flow-z-depth) * 1.05)
              )
              scale(var(--flow-scale-focus))
              rotateZ(calc(var(--flow-rot-z) * 0.5))
              rotateY(0deg);
            opacity: var(--flow-opacity-focus);
          }
          64% {
            transform: translate3d(
                -50%,
                52vh,
                calc(var(--flow-z-depth) * 1.05)
              )
              scale(var(--flow-scale-focus))
              rotateZ(calc(var(--flow-rot-z) * 0.5))
              rotateY(0deg);
            opacity: var(--flow-opacity-focus);
          }
          84% {
            opacity: calc(var(--flow-opacity-focus) * 0.85);
          }
          100% {
            transform: translate3d(
                calc(-50% + var(--flow-x-drift) * 0.3),
                var(--flow-y-end),
                calc(var(--flow-z-depth) * 1.15)
              )
              scale(var(--flow-scale-end))
              rotateZ(var(--flow-rot-z))
              rotateY(var(--flow-rot-y));
            opacity: 0;
          }
        }

        /* Final Journey Card: Fades and scales in at exactly 30.0s */
        @keyframes loveFinalCardSettle {
          0% {
            transform: translate3d(-50%, -45%, 30px) scale(0.9);
            opacity: 0;
          }
          100% {
            transform: translate3d(-50%, -50%, 50px) scale(1.0);
            opacity: 1;
          }
        }

        .anim-stream-flow {
          animation-name: loveStreamSlowFlow;
          animation-timing-function: cubic-bezier(0.25, 1, 0.35, 1);
          animation-fill-mode: forwards;
          will-change: transform, opacity;
        }

        .anim-final-settle {
          animation-name: loveFinalCardSettle;
          animation-duration: 1.2s;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: forwards;
          will-change: transform, opacity;
        }
      `}</style>

      {events.map((event) => {
        // Base CSS custom properties driving the slow 3D physics per item
        const animCustomProps: React.CSSProperties = {
          ["--flow-y-start" as string]: `${event.yStartVh}vh`,
          ["--flow-y-end" as string]: `${event.yEndVh}vh`,
          ["--flow-z-depth" as string]: `${event.zDepthPx}px`,
          ["--flow-scale-start" as string]: `${event.scaleStart}`,
          ["--flow-scale-focus" as string]: `${event.scaleFocus}`,
          ["--flow-scale-end" as string]: `${event.scaleEnd}`,
          ["--flow-rot-z" as string]: `${event.rotateZDeg}deg`,
          ["--flow-rot-y" as string]: `${event.rotateYDeg}deg`,
          ["--flow-opacity-focus" as string]: `${event.opacityFocus}`,
          ["--flow-x-drift" as string]: `${event.xPercent}%`,
          left: `calc(50% + ${event.xPercent}%)`,
          animationDelay: `${event.startTime}s`,
          animationDuration: `${event.duration}s`,
          animationPlayState: isPaused ? "paused" : "running",
        };

        // ===================================================================
        // 1. FINAL JOURNEY CARD (Appears at exactly 30.0s — NEVER in 0-30s)
        // ===================================================================
        if (event.type === "FINAL_CARD" || event.isEnding) {
          return (
            <div
              key={event.id}
              className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center p-6 text-center anim-final-settle w-full max-w-[390px] pointer-events-auto opacity-0"
              style={{
                animationDelay: `${event.startTime}s`,
                animationPlayState: isPaused ? "paused" : "running",
              }}
            >
              {/* Luminous Pulsing Ruby Heart */}
              <div className="text-4xl sm:text-5xl text-rose-500 mb-3 animate-pulse drop-shadow-[0_0_20px_rgba(244,63,94,0.9)]">
                ♥
              </div>

              <p className="text-[11px] sm:text-xs tracking-[0.3em] text-rose-300/80 uppercase font-light mb-2 drop-shadow">
                FOREVER & ALWAYS
              </p>

              <h1
                className="text-2xl sm:text-3xl font-serif text-white font-medium tracking-wide drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] px-2"
                style={{
                  fontFamily: "var(--font-playfair), serif",
                  textShadow:
                    "0 0 16px rgba(251,113,133,0.6), 0 0 35px rgba(225,29,72,0.4)",
                }}
              >
                {event.text}
              </h1>

              {event.subtext && (
                <p className="mt-3 text-xs sm:text-sm text-rose-200/90 leading-relaxed font-serif italic max-w-xs drop-shadow-md">
                  {event.subtext}
                </p>
              )}

              {/* Direct interactive CTAs on Final Card */}
              <div className="mt-6 flex items-center justify-center gap-3">
                {onOpenLetter && (
                  <button
                    type="button"
                    onClick={onOpenLetter}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs sm:text-sm font-medium shadow-[0_0_20px_rgba(225,29,72,0.5)] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📖</span>
                    <span>Đọc thư</span>
                  </button>
                )}

                {onReplay && (
                  <button
                    type="button"
                    onClick={onReplay}
                    className="px-4 py-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 text-xs sm:text-sm font-medium border border-zinc-700/60 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>↺</span>
                    <span>Xem lại</span>
                  </button>
                )}
              </div>
            </div>
          );
        }

        // ===================================================================
        // 2. PHOTO HERO (Slow 7.5s-8.4s memory moment, large 64-74vw, crisp)
        // ===================================================================
        if (event.type === "PHOTO_HERO" && event.photoUrl) {
          return (
            <div
              key={event.id}
              className="absolute top-0 anim-stream-flow opacity-0 pointer-events-none"
              style={animCustomProps}
            >
              <div className="relative w-[min(72vw,330px)] aspect-[4/5] rounded-3xl overflow-hidden p-1 bg-gradient-to-br from-rose-300/40 via-rose-500/20 to-rose-950/70 shadow-[0_0_35px_rgba(244,63,94,0.45),0_15px_45px_rgba(0,0,0,0.85)] border border-rose-300/40 backdrop-blur-sm">
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-zinc-950">
                  <Image
                    src={event.photoUrl}
                    alt="Love memory"
                    fill
                    sizes="(max-width: 640px) 72vw, 330px"
                    className="object-cover"
                    unoptimized
                  />
                  {/* Subtle soft sheen overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />
                </div>
              </div>
            </div>
          );
        }

        // ===================================================================
        // 3. PRIMARY PHRASES & AMBIENT FLOATING TEXT (NO card, NO box, clean glow)
        // ===================================================================
        const isPrimary = event.type === "PRIMARY_PHRASE";

        let textShadow =
          "0 0 10px rgba(251,113,133,0.7), 0 0 24px rgba(225,29,72,0.45), 0 2px 14px rgba(0,0,0,0.95)";
        let textColor = "text-[#FFF3F6]";

        if (event.colorTone === "rose") {
          textColor = "text-[#FFE4E6]";
          textShadow =
            "0 0 10px #FB7185, 0 0 22px #F43F5E, 0 2px 12px rgba(0,0,0,0.9)";
        } else if (event.colorTone === "gold-rose") {
          textColor = "text-[#FFF8F9]";
          textShadow =
            "0 0 12px #FECDD3, 0 0 24px #FB7185, 0 2px 12px rgba(0,0,0,0.9)";
        } else if (event.colorTone === "hot-pink") {
          textColor = "text-[#FFE4E9]";
          textShadow =
            "0 0 10px #F43F5E, 0 0 22px #BE123C, 0 2px 12px rgba(0,0,0,0.9)";
        }

        return (
          <div
            key={event.id}
            className={`absolute top-0 anim-stream-flow opacity-0 text-center pointer-events-none ${
              isPrimary
                ? "w-[min(90vw,420px)]"
                : "max-w-[240px]"
            }`}
            style={animCustomProps}
          >
            {/* 100% Free-floating glowing typography (NO background box, NO card border) */}
            <h2
              className={`font-serif leading-[1.3] select-none px-2 ${textColor} ${
                isPrimary
                  ? "font-medium whitespace-nowrap"
                  : "font-normal italic"
              }`}
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: `${event.fontSizePx}px`,
                textShadow,
              }}
            >
              {event.text}
            </h2>
          </div>
        );
      })}
    </div>
  );
}

