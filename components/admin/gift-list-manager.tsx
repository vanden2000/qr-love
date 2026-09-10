"use client";

import React, { useState, useMemo, useTransition } from "react";
import type { GiftWithMedia, GiftStatus } from "@/types/gift";
import { GiftRowItem } from "@/components/admin/gift-row-item";
import { deleteGiftAction, bulkDeleteGiftsAction } from "@/app/actions/admin-gifts";
import Link from "next/link";

interface GiftListManagerProps {
  initialGifts: GiftWithMedia[];
}

export function GiftListManager({ initialGifts }: GiftListManagerProps) {
  const [gifts, setGifts] = useState<GiftWithMedia[]>(initialGifts);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | GiftStatus>("all");

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Deletion modals state
  const [targetGiftToDelete, setTargetGiftToDelete] = useState<GiftWithMedia | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const [isDeleting, startDeleteTransition] = useTransition();
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

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

  // Selection handlers
  const handleToggleSelect = (giftId: string) => {
    setSelectedIds((prev) =>
      prev.includes(giftId) ? prev.filter((id) => id !== giftId) : [...prev, giftId]
    );
  };

  const isAllFilteredSelected =
    filteredGifts.length > 0 &&
    filteredGifts.every((g) => selectedIds.includes(g.id));

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      // Deselect all filtered
      const filteredIds = new Set(filteredGifts.map((g) => g.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      // Select all filtered
      const combined = new Set([...selectedIds, ...filteredGifts.map((g) => g.id)]);
      setSelectedIds(Array.from(combined));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Single Delete
  const handleRequestSingleDelete = (gift: GiftWithMedia) => {
    setTargetGiftToDelete(gift);
  };

  const handleConfirmSingleDelete = () => {
    if (!targetGiftToDelete) return;
    const targetId = targetGiftToDelete.id;
    const targetName = targetGiftToDelete.receiver_name;

    startDeleteTransition(async () => {
      const res = await deleteGiftAction(targetId);
      if (!res.success) {
        showToast("error", res.error || "Không thể xóa món quà.");
      } else {
        setGifts((prev) => prev.filter((g) => g.id !== targetId));
        setSelectedIds((prev) => prev.filter((id) => id !== targetId));
        showToast("success", `Đã xóa thành công món quà dành cho "${targetName}".`);
      }
      setTargetGiftToDelete(null);
    });
  };

  // Bulk Delete
  const handleConfirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const countToDelete = selectedIds.length;

    startDeleteTransition(async () => {
      const res = await bulkDeleteGiftsAction(selectedIds);
      if (!res.success) {
        showToast("error", res.error || "Không thể xóa hàng loạt món quà.");
      } else {
        const deletedSet = new Set(selectedIds);
        setGifts((prev) => prev.filter((g) => !deletedSet.has(g.id)));
        setSelectedIds([]);
        showToast("success", `Đã xóa thành công ${countToDelete} món quà được chọn.`);
      }
      setShowBulkDeleteModal(false);
    });
  };

  const selectedGiftsObjects = useMemo(() => {
    const map = new Map(gifts.map((g) => [g.id, g]));
    return selectedIds.map((id) => map.get(id)).filter(Boolean) as GiftWithMedia[];
  }, [gifts, selectedIds]);

  return (
    <div className="space-y-4 relative pb-16">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top-2 duration-200 text-xs font-medium max-w-md ${
            toast.type === "success"
              ? "bg-emerald-950/90 text-emerald-200 border-emerald-800"
              : "bg-rose-950/90 text-rose-200 border-rose-800"
          }`}
        >
          <span>{toast.type === "success" ? "✅" : "⚠️"}</span>
          <span>{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-auto text-zinc-400 hover:text-zinc-100"
          >
            ✕
          </button>
        </div>
      )}

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

      {/* Action Bar / Selection Controls */}
      {filteredGifts.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/30 rounded-xl border border-zinc-800/60 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-zinc-200 select-none">
            <input
              type="checkbox"
              checked={isAllFilteredSelected}
              onChange={handleToggleSelectAll}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-rose-600 focus:ring-rose-500/30 focus:ring-offset-0 cursor-pointer accent-rose-600"
            />
            <span className="font-medium">
              {isAllFilteredSelected
                ? "Bỏ chọn tất cả"
                : `Chọn tất cả (${filteredGifts.length} món quà)`}
            </span>
          </label>

          <span className="text-[11px] text-zinc-500">
            Hiển thị {filteredGifts.length} / {gifts.length} món quà
          </span>
        </div>
      )}

      {/* Gifts List Container */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden shadow-xl">
        {filteredGifts.length > 0 ? (
          <div className="divide-y divide-zinc-800/60">
            {filteredGifts.map((gift) => (
              <GiftRowItem
                key={gift.id}
                gift={gift}
                isSelected={selectedIds.includes(gift.id)}
                onToggleSelect={handleToggleSelect}
                onRequestDelete={handleRequestSingleDelete}
                onDeleted={(deletedId) => {
                  setGifts((prev) => prev.filter((g) => g.id !== deletedId));
                  setSelectedIds((prev) => prev.filter((id) => id !== deletedId));
                  showToast("success", `Đã xóa món quà thành công.`);
                }}
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

      {/* Floating Bulk Action Bar (when 1+ items selected) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/95 border border-rose-800/80 shadow-2xl shadow-rose-950/60 backdrop-blur-xl px-5 py-3 rounded-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-zinc-200 font-medium">
              Đã chọn <strong className="text-rose-400">{selectedIds.length}</strong> món quà
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-800" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearSelection}
              disabled={isDeleting}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors cursor-pointer"
            >
              Bỏ chọn
            </button>
            <button
              type="button"
              onClick={() => setShowBulkDeleteModal(true)}
              disabled={isDeleting}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>🗑️</span>
              <span>Xóa hàng loạt ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal 1: Single Delete Confirmation Dialog */}
      {targetGiftToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-rose-900/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-xl shrink-0">
                ⚠️
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-base font-bold text-zinc-100">
                  Xác nhận xóa món quà?
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Bạn đang chuẩn bị xóa món quà dành cho:
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Người nhận:</span>
                <span className="font-semibold text-rose-300">{targetGiftToDelete.receiver_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Người gửi:</span>
                <span className="text-zinc-300">{targetGiftToDelete.sender_name || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Tiêu đề:</span>
                <span className="text-zinc-300 truncate max-w-[200px]">{targetGiftToDelete.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Đường dẫn:</span>
                <span className="font-mono text-zinc-400">/{targetGiftToDelete.slug}</span>
              </div>
            </div>

            <p className="text-[11px] text-rose-300/80 bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/30">
              🚨 <strong>Cảnh báo:</strong> Toàn bộ hình ảnh, file âm thanh và lời nhắn sẽ bị xóa vĩnh viễn trên máy chủ Storage và Database. Hành động này không thể khôi phục.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTargetGiftToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <span>🗑️</span>
                    <span>Đồng ý xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Bulk Delete Confirmation Dialog */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-rose-900/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-xl shrink-0">
                🚨
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-base font-bold text-zinc-100">
                  Xác nhận xóa hàng loạt {selectedIds.length} món quà?
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Các món quà được chọn dưới đây sẽ bị xóa hoàn toàn khỏi hệ thống:
                </p>
              </div>
            </div>

            {/* List preview of selected gifts */}
            <div className="max-h-48 overflow-y-auto p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs divide-y divide-zinc-900">
              {selectedGiftsObjects.map((g) => (
                <div key={g.id} className="pt-1.5 first:pt-0 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="font-semibold text-zinc-200">{g.receiver_name}</span>
                    <span className="text-zinc-500 text-[11px]"> (từ {g.sender_name || "—"})</span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 shrink-0">/{g.slug}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-rose-300/80 bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/30">
              ⚠️ <strong>Lưu ý quan trọng:</strong> Quá trình này sẽ giải phóng toàn bộ ảnh, nhạc và tin nhắn của {selectedIds.length} món quà trên Supabase Storage. Không thể hoàn tác sau khi xác nhận.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang xóa {selectedIds.length} món quà...</span>
                  </>
                ) : (
                  <>
                    <span>🗑️</span>
                    <span>Xác nhận xóa {selectedIds.length} món quà</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
