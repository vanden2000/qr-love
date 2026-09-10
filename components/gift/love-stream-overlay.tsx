"use client";

import React from "react";
import Image from "next/image";
import type { LoveFieldEvent } from "@/lib/love-stream/scheduler";

interface LoveStreamOverlayProps {
  events: LoveFieldEvent[];
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
      key={`love-stream-field-${replayTrigger}`}
      className="fixed inset-0 z-30 pointer-events-none select-none overflow-hidden"
      style={{
        perspective: "1000px",
        perspectiveOrigin: "50% 45%",
        transformStyle: "preserve-3d",
      }}
    >
      <style jsx>{`
        @keyframes loveFieldFlow {
          0% {
            transform: translate3d(
                calc(-50% + var(--flow-x-drift) * -0.4),
                var(--flow-y-start),
                var(--flow-z-depth)
              )
              scale(var(--flow-scale-start))
              rotateZ(var(--flow-rot-z))
              rotateY(var(--flow-rot-y));
            opacity: 0;
          }
          14% {
            opacity: var(--flow-opacity-focus);
          }
          42% {
            transform: translate3d(
                -50%,
                38vh,
                calc(var(--flow-z-depth) * 1.1)
              )
              scale(var(--flow-scale-focus))
              rotateZ(calc(var(--flow-rot-z) * 0.7))
              rotateY(0deg);
            opacity: var(--flow-opacity-focus);
          }
          58% {
            transform: translate3d(
                -50%,
                50vh,
                calc(var(--flow-z-depth) * 1.1)
              )
              scale(var(--flow-scale-focus))
              rotateZ(calc(var(--flow-rot-z) * 0.7))
              rotateY(0deg);
            opacity: var(--flow-opacity-focus);
          }
          82% {
            opacity: calc(var(--flow-opacity-focus) * 0.85);
          }
          100% {
            transform: translate3d(
                calc(-50% + var(--flow-x-drift) * 0.4),
                var(--flow-y-end),
                calc(var(--flow-z-depth) * 1.25)
              )
              scale(var(--flow-scale-end))
              rotateZ(var(--flow-rot-z))
              rotateY(var(--flow-rot-y));
            opacity: 0;
          }
        }

        @keyframes loveFieldForegroundPass {
          0% {
            transform: translate3d(-50%, var(--flow-y-start), var(--flow-z-depth))
              scale(var(--flow-scale-start))
              rotateZ(var(--flow-rot-z));
            opacity: 0;
          }
          20% {
            opacity: var(--flow-opacity-focus);
          }
          50% {
            transform: translate3d(-50%, 42vh, calc(var(--flow-z-depth) + 80px))
              scale(var(--flow-scale-focus))
              rotateZ(var(--flow-rot-z));
            opacity: var(--flow-opacity-focus);
          }
          100% {
            transform: translate3d(-50%, var(--flow-y-end), calc(var(--flow-z-depth) + 140px))
              scale(var(--flow-scale-end))
              rotateZ(var(--flow-rot-z));
            opacity: 0;
          }
        }

        @keyframes loveFieldEndingSettle {
          0% {
            transform: translate3d(-50%, -20vh, 20px) scale(0.9);
            opacity: 0;
          }
          100% {
            transform: translate3d(-50%, 0vh, 40px) scale(1.0);
            opacity: 1;
          }
        }

        .anim-field-flow {
          animation-name: loveFieldFlow;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          animation-fill-mode: forwards;
          will-change: transform, opacity;
        }

        .anim-fg-pass {
          animation-name: loveFieldForegroundPass;
          animation-timing-function: cubic-bezier(0.12, 0.8, 0.32, 1);
          animation-fill-mode: forwards;
          will-change: transform, opacity;
        }

        .anim-ending-settle {
          animation-name: loveFieldEndingSettle;
          animation-duration: 2.8s;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: forwards;
          will-change: transform, opacity;
        }
      `}</style>

      {events.map((event) => {
        // Base CSS custom properties driving the 3D physics per item
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
        // 1. ENDING POSTER (Settles at 27s and holds forever)
        // ===================================================================
        if (event.isEnding) {
          return (
            <div
              key={event.id}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center p-4 text-center anim-ending-settle w-full max-w-[440px]"
              style={{
                animationDelay: `${event.startTime}s`,
                animationPlayState: isPaused ? "paused" : "running",
              }}
            >
              {/* Luminous Pulsing Heart Icon */}
              <div className="text-4xl text-rose-400 mb-2 animate-pulse drop-shadow-[0_0_16px_rgba(244,63,94,0.9)]">
                ♥
              </div>

              <p className="text-[11px] sm:text-xs tracking-[0.3em] text-rose-300/80 uppercase font-light mb-2 drop-shadow">
                FOREVER & ALWAYS
              </p>

              <h1
                className="text-3xl sm:text-4xl font-serif text-white font-medium tracking-wide drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] px-2"
                style={{
                  fontFamily: "var(--font-playfair), serif",
                  textShadow:
                    "0 0 16px rgba(251,113,133,0.5), 0 0 35px rgba(225,29,72,0.35)",
                }}
              >
                {event.text}
              </h1>

              {event.subtext && (
                <p className="mt-3 text-sm sm:text-base text-rose-200/90 leading-relaxed font-serif italic max-w-sm drop-shadow-md">
                  {event.subtext}
                </p>
              )}
            </div>
          );
        }

        // ===================================================================
        // 2. PHOTO HERO (Flying from distance toward camera, large memory card)
        // ===================================================================
        if (event.type === "PHOTO_HERO" && event.photoUrl) {
          return (
            <div
              key={event.id}
              className="absolute top-0 anim-field-flow opacity-0"
              style={animCustomProps}
            >
              {/* Romantic Glowing Memory Card (Large 62vw-76vw, no bulky UI frame) */}
              <div className="relative w-[min(72vw,310px)] aspect-[4/5] rounded-3xl overflow-hidden p-1 bg-gradient-to-br from-rose-300/60 via-rose-500/30 to-rose-950/80 shadow-[0_0_35px_rgba(244,63,94,0.5),0_15px_40px_rgba(0,0,0,0.8)] border border-rose-300/50 backdrop-blur-sm">
                {/* Image itself */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-zinc-950">
                  <Image
                    src={event.photoUrl}
                    alt="Love memory"
                    fill
                    sizes="(max-width: 640px) 72vw, 310px"
                    className="object-cover"
                    unoptimized
                  />
                  {/* Subtle glass sheen overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/10 pointer-events-none" />
                </div>
              </div>
            </div>
          );
        }

        // ===================================================================
        // 3. FOREGROUND PASS-BY (Massive luminous text zooming past camera)
        // ===================================================================
        if (event.type === "FOREGROUND_PASS") {
          return (
            <div
              key={event.id}
              className="absolute top-0 anim-fg-pass opacity-0 whitespace-nowrap pointer-events-none"
              style={animCustomProps}
            >
              <span
                className="font-serif font-black tracking-widest text-transparent bg-clip-text select-none"
                style={{
                  fontFamily: "var(--font-playfair), serif",
                  fontSize: `${event.fontSizePx}px`,
                  backgroundImage:
                    "linear-gradient(180deg, #FFFFFF 0%, #FDA4AF 60%, #E11D48 100%)",
                  filter:
                    "drop-shadow(0 0 20px rgba(244,63,94,0.8)) drop-shadow(0 0 50px rgba(225,29,72,0.5))",
                }}
              >
                {event.text}
              </span>
            </div>
          );
        }

        // ===================================================================
        // 4. PRIMARY MESSAGES & AMBIENT/MID NEON TYPOGRAPHY (Floating Free)
        // ===================================================================
        // Text Color & Glow Themes
        let colorClass = "text-[#FFF1F4]";
        let textShadowStyle =
          "0 0 12px rgba(251,113,133,0.5), 0 0 25px rgba(244,63,94,0.35)";

        if (event.colorTone === "hot-pink") {
          colorClass = "text-[#FFE4E6]";
          textShadowStyle =
            "0 0 10px #FB7185, 0 0 22px #F43F5E, 0 0 45px rgba(225,29,72,0.6)";
        } else if (event.colorTone === "rose") {
          colorClass = "text-[#FDA4AF]";
          textShadowStyle =
            "0 0 8px #F43F5E, 0 0 18px #BE123C, 0 0 35px rgba(190,18,60,0.5)";
        } else if (event.colorTone === "gold-rose") {
          colorClass = "text-[#FFF5F7]";
          textShadowStyle =
            "0 0 12px #FECDD3, 0 0 24px #FB7185, 0 0 45px rgba(244,63,94,0.4)";
        }

        const isPrimary = event.type === "PRIMARY_MESSAGE" || event.type === "RECEIVER_HERO";

        return (
          <div
            key={event.id}
            className={`absolute top-0 anim-field-flow opacity-0 text-center ${
              isPrimary ? "w-[min(88vw,440px)]" : "max-w-[280px]"
            }`}
            style={animCustomProps}
          >
            {/* Free-floating typography (NO boxes, NO cards, NO background rectangles) */}
            <h2
              className={`font-serif leading-[1.3] select-none break-words px-2 ${colorClass} ${
                isPrimary
                  ? "font-medium drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]"
                  : "font-normal italic drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]"
              }`}
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: `${event.fontSizePx}px`,
                textShadow: textShadowStyle,
              }}
            >
              {event.text}
            </h2>

            {event.subtext && (
              <p
                className="mt-2 text-xs sm:text-sm text-rose-200/90 leading-snug font-serif italic max-w-xs mx-auto"
                style={{
                  textShadow: "0 0 10px rgba(244,63,94,0.4)",
                }}
              >
                {event.subtext}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
