"use client";

import React, { useMemo } from "react";
import type { GiftWithMedia } from "@/types/gift";
import type { RelationshipType } from "@/lib/presets/occasions";
import { IntroCrystalHeart } from "@/components/three/intro-crystal-heart";

interface GiftIntroProps {
  gift: GiftWithMedia;
  onOpen: () => void;
  isExiting: boolean;
}

export function GiftIntro({ gift, onOpen, isExiting }: GiftIntroProps) {
  const rel = (gift.relationship_type as RelationshipType) || "COUPLE";

  const theme = useMemo(() => {
    switch (rel) {
      case "FRIENDSHIP":
        return {
          bgGradient: "radial-gradient(ellipse at 50% 0%, #2e1a04 0%, #160d02 50%, #060301 100%)",
          glowTop: "bg-amber-500/20",
          glowBottom: "bg-cyan-950/30",
          headerTitle: "QR MEMORIES",
          calligraphy: "Best Friends Forever",
          symbol: "⭐",
          symbolSub: "✨",
          textColor: "text-amber-200/90",
          accentColor: "text-amber-300",
          dividerColor: "via-amber-400",
          orbBorder: "border-amber-400/30 shadow-[0_0_40px_rgba(245,158,11,0.35)]",
          btnGradient: "linear-gradient(180deg, #f59e0b 0%, #d97706 55%, #78350f 100%)",
          btnShadow: "0 0 30px rgba(245, 158, 11, 0.55), 0 0 10px rgba(251, 191, 36, 0.4), inset 0 1.5px 2px rgba(255, 255, 255, 0.6), inset 0 -2px 6px rgba(0, 0, 0, 0.5)",
          btnBorder: "1.5px solid rgba(253, 230, 138, 0.5)",
          footerText: "Chạm để khám phá thông điệp tình bạn",
        };
      case "FAMILY":
        return {
          bgGradient: "radial-gradient(ellipse at 50% 0%, #2a1104 0%, #150902 50%, #060201 100%)",
          glowTop: "bg-orange-500/20",
          glowBottom: "bg-amber-950/30",
          headerTitle: "QR FAMILY",
          calligraphy: "Warmth & Gratitude Always",
          symbol: "🌸",
          symbolSub: "🏡",
          textColor: "text-orange-200/90",
          accentColor: "text-orange-300",
          dividerColor: "via-orange-400",
          orbBorder: "border-orange-400/30 shadow-[0_0_40px_rgba(249,115,22,0.35)]",
          btnGradient: "linear-gradient(180deg, #ea580c 0%, #c2410c 55%, #7c2d12 100%)",
          btnShadow: "0 0 30px rgba(234, 88, 12, 0.55), 0 0 10px rgba(251, 146, 60, 0.4), inset 0 1.5px 2px rgba(255, 255, 255, 0.6), inset 0 -2px 6px rgba(0, 0, 0, 0.5)",
          btnBorder: "1.5px solid rgba(254, 215, 170, 0.5)",
          footerText: "Chạm để khám phá thông điệp gia đình",
        };
      case "COLLEAGUE":
        return {
          bgGradient: "radial-gradient(ellipse at 50% 0%, #041d30 0%, #020e18 50%, #010408 100%)",
          glowTop: "bg-sky-500/20",
          glowBottom: "bg-indigo-950/30",
          headerTitle: "QR CONNECTION",
          calligraphy: "Success & Harmony Together",
          symbol: "💎",
          symbolSub: "✦",
          textColor: "text-sky-200/90",
          accentColor: "text-sky-300",
          dividerColor: "via-sky-400",
          orbBorder: "border-sky-400/30 shadow-[0_0_40px_rgba(14,165,233,0.35)]",
          btnGradient: "linear-gradient(180deg, #0284c7 0%, #0369a1 55%, #075985 100%)",
          btnShadow: "0 0 30px rgba(2, 132, 199, 0.55), 0 0 10px rgba(56, 189, 248, 0.4), inset 0 1.5px 2px rgba(255, 255, 255, 0.6), inset 0 -2px 6px rgba(0, 0, 0, 0.5)",
          btnBorder: "1.5px solid rgba(186, 230, 253, 0.5)",
          footerText: "Chạm để khám phá thông điệp tri ân",
        };
      default: // COUPLE & CRUSH
        return {
          bgGradient: "radial-gradient(ellipse at 50% 0%, #300612 0%, #150209 50%, #080004 100%)",
          glowTop: "bg-rose-600/20",
          glowBottom: "bg-rose-950/30",
          headerTitle: "QR LOVE",
          calligraphy: "More Love Everyday",
          symbol: "♥",
          symbolSub: "♡",
          textColor: "text-rose-200/90",
          accentColor: "text-rose-300",
          dividerColor: "via-rose-400",
          orbBorder: "border-rose-400/25 shadow-[0_0_40px_rgba(244,63,94,0.35)]",
          btnGradient: "linear-gradient(180deg, #f43f5e 0%, #be123c 55%, #630823 100%)",
          btnShadow: "0 0 30px rgba(225, 29, 72, 0.55), 0 0 10px rgba(251, 113, 133, 0.4), inset 0 1.5px 2px rgba(255, 255, 255, 0.6), inset 0 -2px 6px rgba(0, 0, 0, 0.5)",
          btnBorder: "1.5px solid rgba(254, 205, 211, 0.45)",
          footerText: "Chạm để khám phá thông điệp yêu thương",
        };
    }
  }, [rel]);

  return (
    <div
      className={`fixed inset-0 z-40 bg-[#090104] text-zinc-100 flex flex-col justify-between items-center px-4 py-6 sm:py-8 select-none overflow-hidden transition-all duration-700 ease-out ${
        isExiting
          ? "opacity-0 scale-95 pointer-events-none"
          : "opacity-100 scale-100"
      }`}
      style={{
        background: theme.bgGradient,
      }}
    >
      {/* 1. Background Atmosphere: Ambient spotlights & Glowing Aura */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] ${theme.glowTop} rounded-full blur-[90px] pointer-events-none animate-pulse duration-1000`} />
      <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 w-[400px] h-[220px] ${theme.glowBottom} rounded-full blur-[100px] pointer-events-none`} />

      {/* Decorative Ribbon & Calligraphy (Top-Right) */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 text-right pointer-events-none z-10">
        <span
          className={`block ${theme.textColor} text-xs sm:text-sm tracking-wider italic font-serif -rotate-6 transform opacity-70`}
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {theme.calligraphy}
        </span>
        <span className={`block ${theme.accentColor} text-[10px] sm:text-xs text-right mt-0.5 opacity-60`}>
          {theme.symbolSub}
        </span>
      </div>

      {/* 2. Top Header */}
      <header className="w-full max-w-xs text-center z-20 pt-2">
        <h2
          className="text-xs sm:text-sm tracking-[0.38em] text-zinc-100/90 font-light uppercase"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {theme.headerTitle}
        </h2>
        <div className="flex items-center justify-center gap-2.5 w-32 mx-auto mt-1.5 opacity-60">
          <span className={`h-[1px] flex-1 bg-gradient-to-r from-transparent ${theme.dividerColor} to-transparent`} />
          <span className={`${theme.accentColor} text-[8px]`}>{theme.symbol}</span>
          <span className={`h-[1px] flex-1 bg-gradient-to-r from-transparent ${theme.dividerColor} to-transparent`} />
        </div>
      </header>

      {/* 3. Center Section: 3D Realtime Crystal Object & Details */}
      <main className="w-full max-w-sm flex flex-col items-center text-center space-y-3 sm:space-y-4 z-20 my-auto">
        {/* Real-time 3D Interactive Luminous Crystal Object Orb */}
        <div className="relative w-52 h-52 sm:w-64 sm:h-64 flex items-center justify-center">
          {/* Subtle outer glowing aura */}
          <div className={`absolute inset-2 rounded-full border ${theme.orbBorder} pointer-events-none`} />

          {/* 3D Realtime Interactive Canvas matching relationship (Star/Lotus/Diamond/Heart) */}
          <div className="relative w-full h-full rounded-full overflow-visible">
            <IntroCrystalHeart relationship={rel} />
          </div>

          {/* Dynamic Sparkle Highlights */}
          <div className="absolute -top-1 right-8 w-2 h-2 bg-white rounded-full blur-[0.5px] shadow-[0_0_8px_#ffffff] animate-ping duration-1000 pointer-events-none" />
          <div className="absolute bottom-4 left-8 w-1.5 h-1.5 bg-amber-100 rounded-full blur-[0.5px] shadow-[0_0_6px_#fde68a] pointer-events-none" />
        </div>

        {/* Text Block */}
        <div className="space-y-1.5 sm:space-y-2 pt-1">
          <p
            className={`text-[11px] sm:text-xs uppercase tracking-[0.25em] ${theme.textColor} font-light`}
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            MỘT MÓN QUÀ DÀNH CHO BẠN
          </p>

          <div className="flex items-center justify-center gap-2 w-24 mx-auto opacity-50 py-0.5">
            <span className={`h-[1px] flex-1 bg-gradient-to-r from-transparent ${theme.dividerColor} to-transparent`} />
            <span className={`${theme.accentColor} text-[8px]`}>{theme.symbol}</span>
            <span className={`h-[1px] flex-1 bg-gradient-to-r from-transparent ${theme.dividerColor} to-transparent`} />
          </div>

          {/* Recipient Name */}
          <h1
            className="text-3xl sm:text-4xl text-white font-normal tracking-wide drop-shadow-[0_0_20px_rgba(255,255,255,0.45)] px-2"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {gift.receiver_name}
          </h1>

          {/* Gift Title / Subtitle */}
          <p
            className={`text-sm sm:text-base ${theme.textColor} italic font-serif max-w-xs mx-auto px-4 drop-shadow-sm`}
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            &ldquo;{gift.title}&rdquo;
          </p>
        </div>

        {/* 4. Luxury 3D Pill CTA Button */}
        <div className="w-full pt-3 px-4 flex justify-center">
          <button
            type="button"
            onClick={onOpen}
            className="relative w-full max-w-[270px] sm:max-w-[290px] h-[52px] sm:h-[56px] rounded-full flex items-center justify-center gap-2 group transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer"
            style={{
              background: theme.btnGradient,
              boxShadow: theme.btnShadow,
              border: theme.btnBorder,
            }}
          >
            {/* Top Gloss Reflection */}
            <div className="absolute top-1 left-4 right-4 h-[16px] rounded-full bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />

            {/* Button Label */}
            <span
              className="text-white font-medium text-sm sm:text-base tracking-[0.12em] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] flex items-center gap-2 uppercase"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              <span>MỞ QUÀ</span>
              <span className="text-xs text-white/90 font-bold transition-transform duration-300 group-hover:translate-x-1">
                ❯
              </span>
            </span>
          </button>
        </div>
      </main>

      {/* 5. Footer: Touch Pointer Indicator */}
      <footer className="w-full max-w-xs flex flex-col items-center text-center space-y-1 z-20 pb-2">
        {/* Animated Touch Hand Icon */}
        <div className={`w-6 h-6 ${theme.accentColor} animate-bounce duration-[2000ms] flex items-center justify-center opacity-80`}>
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 fill-none stroke-current stroke-[1.75]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5"
            />
          </svg>
        </div>

        <p className="text-[11px] text-zinc-300/60 tracking-wider font-light">
          {theme.footerText}
        </p>

        <div className="flex items-center justify-center gap-2 w-20 mx-auto opacity-40 pt-1">
          <span className={`h-[1px] flex-1 bg-gradient-to-r from-transparent ${theme.dividerColor} to-transparent`} />
          <span className={`${theme.accentColor} text-[7px]`}>{theme.symbol}</span>
          <span className={`h-[1px] flex-1 bg-gradient-to-r from-transparent ${theme.dividerColor} to-transparent`} />
        </div>
      </footer>
    </div>
  );
}
