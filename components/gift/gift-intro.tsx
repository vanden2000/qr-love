"use client";

import React from "react";
import type { GiftWithMedia } from "@/types/gift";
import { IntroCrystalHeart } from "@/components/three/intro-crystal-heart";

interface GiftIntroProps {
  gift: GiftWithMedia;
  onOpen: () => void;
  isExiting: boolean;
}

export function GiftIntro({ gift, onOpen, isExiting }: GiftIntroProps) {
  return (
    <div
      className={`fixed inset-0 z-40 bg-[#090104] text-zinc-100 flex flex-col justify-between items-center px-4 py-6 sm:py-8 select-none overflow-hidden transition-all duration-700 ease-out ${isExiting
          ? "opacity-0 scale-95 pointer-events-none"
          : "opacity-100 scale-100"
        }`}
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #300612 0%, #150209 50%, #080004 100%)",
      }}
    >
      {/* 1. Background Atmosphere: Ambient spotlights & Glowing Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] bg-rose-600/20 rounded-full blur-[90px] pointer-events-none animate-pulse duration-1000" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[400px] h-[220px] bg-rose-950/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Decorative Ribbon & Calligraphy (Top-Right) */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 text-right pointer-events-none z-10">
        <span
          className="block text-rose-300/40 text-xs sm:text-sm tracking-wider italic font-serif -rotate-6 transform"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          More Love Everyday
        </span>
        <span className="block text-rose-400/40 text-[10px] sm:text-xs text-right mt-0.5">
          ♡
        </span>
      </div>

      {/* Decorative Silk Ribbon (Top-Left Corner SVG) */}
      <div className="absolute -top-3 -left-3 w-28 h-28 sm:w-36 sm:h-36 pointer-events-none z-10 opacity-75">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none">
          <path
            d="M-10,20 C30,10 40,50 15,85 C5,70 10,40 -10,35 Z"
            fill="url(#ribbonGrad1)"
            opacity="0.85"
          />
          <path
            d="M-5,10 C45,15 55,60 25,95 C15,80 20,45 -5,25 Z"
            fill="url(#ribbonGrad2)"
            opacity="0.6"
          />
          <defs>
            <linearGradient id="ribbonGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#4c0519" />
            </linearGradient>
            <linearGradient id="ribbonGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Decorative Silk Ribbon & Rose Accent (Bottom-Right Corner SVG) */}
      <div className="absolute -bottom-4 -right-4 w-32 h-32 sm:w-44 sm:h-44 pointer-events-none z-10 opacity-70">
        <svg viewBox="0 0 120 120" className="w-full h-full fill-none">
          <path
            d="M130,50 C80,60 60,95 90,130 C105,110 95,80 130,65 Z"
            fill="url(#ribbonGrad3)"
          />
          <defs>
            <linearGradient id="ribbonGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e11d48" />
              <stop offset="70%" stopColor="#881337" />
              <stop offset="100%" stopColor="#2b030f" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Decorative Floating Rose Petals */}
      <div className="absolute top-[28%] left-[8%] w-4 h-5 bg-gradient-to-br from-rose-500 to-rose-900 rounded-full blur-[0.5px] rotate-45 opacity-60 pointer-events-none animate-bounce duration-[3500ms]" />
      <div className="absolute top-[36%] right-[10%] w-3 h-4 bg-gradient-to-br from-rose-400 to-rose-800 rounded-full blur-[0.5px] -rotate-12 opacity-50 pointer-events-none animate-pulse duration-[4000ms]" />
      <div className="absolute bottom-[22%] left-[12%] w-5 h-6 bg-gradient-to-br from-rose-600 to-rose-950 rounded-full blur-[0.5px] rotate-12 opacity-70 pointer-events-none" />
      <div className="absolute bottom-[16%] right-[14%] w-4 h-5 bg-gradient-to-br from-rose-500 to-rose-900 rounded-full blur-[0.5px] -rotate-45 opacity-65 pointer-events-none" />

      {/* 2. Top Header */}
      <header className="w-full max-w-xs text-center z-20 pt-2">
        <h2
          className="text-xs sm:text-sm tracking-[0.38em] text-rose-100/90 font-light uppercase"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          QR LOVE
        </h2>
        <div className="flex items-center justify-center gap-2.5 w-32 mx-auto mt-1.5 opacity-60">
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
          <span className="text-rose-400 text-[8px]">♥</span>
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
        </div>
      </header>

      {/* 3. Center Section: 3D Realtime Crystal Glowing Heart & Romantic Details */}
      <main className="w-full max-w-sm flex flex-col items-center text-center space-y-3 sm:space-y-4 z-20 my-auto">
        {/* Real-time 3D Interactive Luminous Crystal Heart Orb */}
        <div className="relative w-52 h-52 sm:w-64 sm:h-64 flex items-center justify-center">
          {/* Subtle outer glowing aura */}
          <div className="absolute inset-2 rounded-full border border-rose-400/25 shadow-[0_0_40px_rgba(244,63,94,0.35)] pointer-events-none" />

          {/* 3D Realtime Interactive Heart Canvas */}
          <div className="relative w-full h-full rounded-full overflow-visible">
            <IntroCrystalHeart />
          </div>

          {/* Dynamic Sparkle Highlights */}
          <div className="absolute -top-1 right-8 w-2 h-2 bg-white rounded-full blur-[0.5px] shadow-[0_0_8px_#ffffff] animate-ping duration-1000 pointer-events-none" />
          <div className="absolute bottom-4 left-8 w-1.5 h-1.5 bg-rose-200 rounded-full blur-[0.5px] shadow-[0_0_6px_#fda4af] pointer-events-none" />
        </div>

        {/* Romantic Text Block */}
        <div className="space-y-1.5 sm:space-y-2 pt-1">
          <p
            className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-rose-200/75 font-light"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            MỘT MÓN QUÀ DÀNH CHO BẠN
          </p>

          <div className="flex items-center justify-center gap-2 w-24 mx-auto opacity-50 py-0.5">
            <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
            <span className="text-rose-300 text-[8px]">♥</span>
            <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
          </div>

          {/* Recipient Name (Prominent, Glowing, Luxury Serif) */}
          <h1
            className="text-3xl sm:text-4xl text-white font-normal tracking-wide drop-shadow-[0_0_20px_rgba(251,113,133,0.45)] px-2"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {gift.receiver_name}
          </h1>

          {/* Gift Title / Subtitle */}
          <p
            className="text-sm sm:text-base text-rose-200/90 italic font-serif max-w-xs mx-auto px-4 drop-shadow-sm"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            &ldquo;{gift.title}&rdquo;
          </p>
        </div>

        {/* 4. Luxury 3D Ruby Pill CTA Button */}
        <div className="w-full pt-3 px-4 flex justify-center">
          <button
            type="button"
            onClick={onOpen}
            className="relative w-full max-w-[270px] sm:max-w-[290px] h-[52px] sm:h-[56px] rounded-full flex items-center justify-center gap-2 group transition-all duration-300 active:scale-95 focus:outline-none"
            style={{
              background:
                "linear-gradient(180deg, #f43f5e 0%, #be123c 55%, #630823 100%)",
              boxShadow:
                "0 0 30px rgba(225, 29, 72, 0.55), 0 0 10px rgba(251, 113, 133, 0.4), inset 0 1.5px 2px rgba(255, 255, 255, 0.6), inset 0 -2px 6px rgba(0, 0, 0, 0.5)",
              border: "1.5px solid rgba(254, 205, 211, 0.45)",
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
              <span className="text-xs text-rose-100 font-bold transition-transform duration-300 group-hover:translate-x-1">
                ❯
              </span>
            </span>
          </button>
        </div>
      </main>

      {/* 5. Footer: Touch Pointer Indicator */}
      <footer className="w-full max-w-xs flex flex-col items-center text-center space-y-1 z-20 pb-2">
        {/* Animated Touch Hand Icon */}
        <div className="w-6 h-6 text-rose-300/80 animate-bounce duration-[2000ms] flex items-center justify-center">
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

        <p className="text-[11px] text-rose-200/50 tracking-wider font-light">
          Chạm để khám phá thông điệp yêu thương
        </p>

        <div className="flex items-center justify-center gap-2 w-20 mx-auto opacity-40 pt-1">
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
          <span className="text-rose-400 text-[7px]">♥</span>
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
        </div>
      </footer>
    </div>
  );
}
