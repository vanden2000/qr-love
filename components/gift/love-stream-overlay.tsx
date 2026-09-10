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
        perspective: "1100px",
        perspectiveOrigin: "50% 40%",
        transformStyle: "preserve-3d",
      }}
    >
      <style jsx>{`
        /* Continuous, Steady Linear 3D Waterfall Flow from Top to Bottom */
        @keyframes loveStreamWaterfall {
          0% {
            transform: translate3d(
                calc(-50% + var(--flow-x-drift) * -0.15),
                var(--flow-y-start),
                var(--flow-z-depth)
              )
              scale(var(--flow-scale-start))
              rotateZ(var(--flow-rot-z))
              rotateY(var(--flow-rot-y));
            opacity: 0;
            visibility: visible;
          }
          8% {
            opacity: var(--flow-opacity-focus);
          }
          70% {
            opacity: var(--flow-opacity-focus);
          }
          88% {
            opacity: 0;
          }
          100% {
            transform: translate3d(
                calc(-50% + var(--flow-x-drift) * 0.15),
                var(--flow-y-end),
                calc(var(--flow-z-depth) * 1.08)
              )
              scale(var(--flow-scale-end))
              rotateZ(var(--flow-rot-z))
              rotateY(var(--flow-rot-y));
            opacity: 0;
            visibility: hidden;
          }
        }

        /* Final Journey Card: Fades and settles in at 120.0s */
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

        .anim-stream-waterfall {
          animation-name: loveStreamWaterfall;
          animation-timing-function: linear;
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
        // 1. FINAL JOURNEY CARD (Appears at 30.0s)
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
              <div className="text-4xl sm:text-5xl text-rose-500 mb-3 animate-pulse drop-shadow-[0_0_24px_rgba(244,63,94,0.95)]">
                ♥
              </div>

              <p className="text-[11px] sm:text-xs tracking-[0.3em] text-cyan-300/80 uppercase font-light mb-2 drop-shadow">
                FOREVER & ALWAYS
              </p>

              <h1
                className="text-2xl sm:text-3xl font-sans text-white font-semibold tracking-wide drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] px-2"
                style={{
                  textShadow:
                    "0 0 16px #38BDF8, 0 0 35px #0284C7, 0 0 50px rgba(2,132,199,0.5)",
                }}
              >
                {event.text}
              </h1>

              {event.subtext && (
                <p className="mt-3 text-xs sm:text-sm text-cyan-100/90 leading-relaxed font-sans max-w-xs drop-shadow-md">
                  {event.subtext}
                </p>
              )}

              {/* Direct interactive CTAs */}
              <div className="mt-6 flex items-center justify-center gap-3">
                {onOpenLetter && (
                  <button
                    type="button"
                    onClick={onOpenLetter}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs sm:text-sm font-medium shadow-[0_0_20px_rgba(225,29,72,0.6)] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
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
        // 2. MEMORY PHOTO CARDS (Compact, Elegant, Perfectly Sized for Mobile)
        // ===================================================================
        if (event.type === "PHOTO_HERO" && event.photoUrl) {
          return (
            <div
              key={event.id}
              className="absolute top-0 anim-stream-waterfall opacity-0 pointer-events-none"
              style={animCustomProps}
            >
              <div className="relative w-[min(48vw,200px)] aspect-[4/5] rounded-2xl overflow-hidden p-1 bg-gradient-to-br from-cyan-400/40 via-rose-500/30 to-blue-950/80 shadow-[0_0_25px_rgba(56,189,248,0.4),0_10px_35px_rgba(0,0,0,0.85)] border border-cyan-300/40 backdrop-blur-sm">
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-zinc-950">
                  <Image
                    src={event.photoUrl}
                    alt="Love memory"
                    fill
                    sizes="(max-width: 640px) 48vw, 200px"
                    className="object-cover"
                    unoptimized
                  />
                  {/* Sheen overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />
                </div>
              </div>
            </div>
          );
        }

        // ===================================================================
        // 3. RADIANT NEON WATERFALL TYPOGRAPHY (Strict Mobile Viewport Safety)
        // ===================================================================
        const isForeground = event.layer === "foreground";
        const isPrimary = event.layer === "primary";

        let textShadow =
          "0 0 10px #38BDF8, 0 0 25px #0284C7, 0 0 45px rgba(2,132,199,0.6), 0 2px 10px rgba(0,0,0,0.95)";
        let textColor = "text-[#E0F7FA]";

        if (event.colorTone === "neon-cyan") {
          textColor = "text-[#E0F7FA]";
          textShadow =
            "0 0 12px #38BDF8, 0 0 28px #0284C7, 0 0 50px rgba(2,132,199,0.7), 0 2px 12px rgba(0,0,0,0.95)";
        } else if (event.colorTone === "neon-white") {
          textColor = "text-[#FFFFFF]";
          textShadow =
            "0 0 14px #FFFFFF, 0 0 28px #38BDF8, 0 0 50px rgba(56,189,248,0.6), 0 2px 12px rgba(0,0,0,0.95)";
        } else if (event.colorTone === "neon-rose") {
          textColor = "text-[#FFF0F5]";
          textShadow =
            "0 0 12px #FB7185, 0 0 28px #E11D48, 0 0 50px rgba(225,29,72,0.6), 0 2px 12px rgba(0,0,0,0.95)";
        } else if (event.colorTone === "gold-rose") {
          textColor = "text-[#FFF8E7]";
          textShadow =
            "0 0 12px #FDE68A, 0 0 25px #F59E0B, 0 0 45px rgba(245,158,11,0.5), 0 2px 12px rgba(0,0,0,0.95)";
        }

        const isShort = (event.text || "").length <= 12;

        const isOuterLane = Math.abs(event.xPercent) >= 20;

        return (
          <div
            key={event.id}
            className={`absolute top-0 anim-stream-waterfall opacity-0 text-center pointer-events-none flex items-center justify-center ${
              isOuterLane
                ? "max-w-[38vw] sm:max-w-[170px]"
                : isForeground
                ? "max-w-[74vw] sm:max-w-[340px]"
                : isPrimary
                ? "max-w-[65vw] sm:max-w-[290px]"
                : "max-w-[48vw] sm:max-w-[200px]"
            }`}
            style={animCustomProps}
          >
            <h2
              className={`leading-[1.25] select-none px-2 ${textColor} ${
                isForeground
                  ? "font-bold tracking-normal"
                  : isPrimary
                  ? "font-semibold tracking-wide"
                  : "font-normal tracking-wide"
              } ${isShort ? "whitespace-nowrap" : "break-words whitespace-normal"}`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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


