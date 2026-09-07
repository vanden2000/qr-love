"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import type { GiftItem } from "@/types/gift";
import { formatDate } from "@/lib/utils";

interface GiftViewerProps {
  gift: GiftItem;
}

export function GiftViewer({ gift }: GiftViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col justify-between items-center px-4 py-8 select-none relative overflow-hidden">
      {/* Subtle ambient light - minimal, not excessive */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-rose-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-md flex justify-between items-center text-xs tracking-widest text-zinc-500 uppercase z-10">
        <span>QR Love</span>
        {gift.anniversaryDate && (
          <span>{formatDate(gift.anniversaryDate)}</span>
        )}
      </header>

      {/* Main Experience Container */}
      <main className="w-full max-w-md my-auto py-12 flex flex-col items-center text-center z-10 space-y-8">
        {!isOpen ? (
          <div className="space-y-6 w-full flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-rose-400 text-2xl shadow-inner">
              💌
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-zinc-400">
                Món quà dành riêng cho
              </p>
              <h1 className="text-2xl sm:text-3xl font-light text-zinc-100 tracking-tight">
                {gift.recipientName}
              </h1>
            </div>

            <div className="py-2">
              <p className="text-sm text-zinc-400 font-normal italic max-w-xs mx-auto">
                &ldquo;{gift.title}&rdquo;
              </p>
            </div>

            <div className="pt-4 w-full max-w-xs">
              <Button
                variant="primary"
                fullWidth
                onClick={() => setIsOpen(true)}
              >
                Mở quà
              </Button>
            </div>
          </div>
        ) : (
          /* Opened Gift State (Demo preview skeleton) */
          <div className="space-y-6 w-full text-left bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">
            <div className="border-b border-zinc-800/80 pb-4">
              <span className="text-xs text-rose-400 font-medium tracking-wider uppercase">
                {gift.title}
              </span>
              <h2 className="text-xl font-light text-zinc-100 mt-1">
                Gửi {gift.recipientName},
              </h2>
            </div>

            <div className="py-2 text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap font-light">
              {gift.message}
            </div>

            <div className="pt-4 border-t border-zinc-800/80 flex justify-between items-center text-xs text-zinc-500">
              <span>Thương gửi,</span>
              <span className="font-medium text-zinc-300">
                {gift.senderName}
              </span>
            </div>

            <div className="pt-2 text-center">
              <Button
                variant="ghost"
                className="text-xs text-zinc-500 hover:text-zinc-300"
                onClick={() => setIsOpen(false)}
              >
                Đóng lại
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center text-xs text-zinc-600 z-10">
        Trao gửi khoảnh khắc bằng QR Love
      </footer>
    </div>
  );
}
