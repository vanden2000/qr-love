"use client";

import React from "react";
import type { GiftWithMedia } from "@/types/gift";
import { GiftGallery } from "@/components/gift/gift-gallery";
import { formatDate } from "@/lib/utils";

interface GiftContentProps {
  gift: GiftWithMedia;
}

export function GiftContent({ gift }: GiftContentProps) {
  const imageMedia =
    gift.media?.filter((item) => item.type === "image") || [];

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col justify-between items-center px-4 py-8 relative overflow-hidden animate-in fade-in zoom-in-95 duration-700">
      {/* Ambient background light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-950/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-md flex justify-between items-center text-xs tracking-widest text-zinc-500 uppercase z-10 pt-2 pb-6">
        <span className="font-light text-rose-400/80">QR Love</span>
        {gift.start_date && (
          <span className="text-zinc-400 font-light">
            {formatDate(gift.start_date)}
          </span>
        )}
      </header>

      {/* Main Content Card */}
      <main className="w-full max-w-md my-auto py-6 z-10 space-y-6">
        <div className="w-full bg-zinc-900/40 p-6 sm:p-7 rounded-3xl border border-zinc-800/80 backdrop-blur-md shadow-2xl shadow-black/60 space-y-6">
          {/* Recipient & Title */}
          <div className="border-b border-zinc-800/80 pb-5 space-y-1.5">
            <span className="text-xs text-rose-400 font-medium tracking-wider uppercase">
              {gift.title}
            </span>
            <h1 className="text-2xl font-light text-zinc-100 tracking-tight">
              Gửi {gift.receiver_name},
            </h1>
          </div>

          {/* Letter Message & Story Paragraphs */}
          <div className="text-sm sm:text-base leading-relaxed text-zinc-200 whitespace-pre-wrap font-light tracking-wide py-1 space-y-4">
            {gift.message && <p>{gift.message}</p>}
            {gift.story_messages && gift.story_messages.length > 0 && (
              <div className="space-y-3 pt-2">
                {gift.story_messages.map((sm, idx) => (
                  <p key={sm.id || idx} className="text-zinc-200/95">
                    {sm.content}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Image Gallery (if any) */}
          {imageMedia.length > 0 && (
            <div className="pt-2 border-t border-zinc-800/60">
              <GiftGallery images={imageMedia} />
            </div>
          )}

          {/* Sender Sign-off */}
          <div className="pt-5 border-t border-zinc-800/80 flex justify-between items-center text-xs text-zinc-400">
            <span className="italic font-light">Thương gửi,</span>
            <span className="font-medium text-zinc-200 text-sm">
              {gift.sender_name}
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center text-[11px] text-zinc-600 tracking-wider z-10 py-4">
        QR Love — Trao gửi khoảnh khắc yêu thương
      </footer>
    </div>
  );
}
