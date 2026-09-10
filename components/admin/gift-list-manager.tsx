"use client";

import React, { useState, useMemo } from "react";
import type { GiftWithMedia, GiftStatus } from "@/types/gift";
import { GiftRowItem } from "@/components/admin/gift-row-item";
import Link from "next/link";

interface GiftListManagerProps {
  initialGifts: GiftWithMedia[];
}

export function GiftListManager({ initialGifts }: GiftListManagerProps) {
  const [gifts, setGifts] = useState<GiftWithMedia[]>(initialGifts);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | GiftStatus>("all");

  const counts = useMemo(() => {
    return {
      all: gifts.length,
      active: gifts.filter((g) => g.status === "active").length,
      draft: gifts.filter((g) => g.status === "draft").length,
      hidden: gifts.filter((g) => g.status === "hidden").length,
    };
  }, [gifts]);

  const filteredGifts = useMemo(() => {
    return gifts.filter((gift) => {
      // 1. Status Filter
      if (statusFilter !== "all" && gift.status !== statusFilter) {
        return false;
      }
      // 2. Search Query Filter
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      const matchReceiver = gift.receiver_name?.toLowerCase().includes(q);
      const matchSender = gift.sender_name?.toLowerCase().includes(q);
      const matchTitle = gift.title?.toLowerCase().includes(q);
      const matchSlug = gift.slug?.toLowerCase().includes(q);
      return matchReceiver || matchSender || matchTitle || matchSlug;
    });
  }, [gifts, statusFilter, searchTerm]);

  const handleDeleted = (giftId: string) => {
    setGifts((prev) => prev.filter((g) => g.id !== giftId));
  };

  return (
    <div className="space-y-4">
      {/* Header, Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/80">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            Tất cả ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              statusFilter === "active"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-zinc-900 hover:bg-zinc-800 text-emerald-400/80 hover:text-emerald-300 border border-zinc-800"
            }`}
          >
            🟢 Active ({counts.active})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("draft")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              statusFilter === "draft"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                : "bg-zinc-900 hover:bg-zinc-800 text-amber-400/80 hover:text-amber-300 border border-zinc-800"
            }`}
          >
            🟡 Draft ({counts.draft})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("hidden")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              statusFilter === "hidden"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                : "bg-zinc-900 hover:bg-zinc-800 text-rose-400/80 hover:text-rose-300 border border-zinc-800"
            }`}
          >
            🔴 Hidden ({counts.hidden})
          </button>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="🔍 Tìm người nhận, người gửi, slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Gifts List Container */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden shadow-xl">
        {filteredGifts.length > 0 ? (
          <div className="divide-y divide-zinc-800/60">
            {filteredGifts.map((gift) => (
              <GiftRowItem
                key={gift.id}
                gift={gift}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <span className="text-3xl">💌</span>
            <p className="text-xs text-zinc-400 font-medium">
              {searchTerm || statusFilter !== "all"
                ? "Không tìm thấy món quà nào khớp với bộ lọc."
                : "Chưa có món quà nào trong hệ thống."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <div className="pt-2">
                <Link
                  href="/create"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all"
                >
                  ✨ Tạo món quà đầu tiên
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
