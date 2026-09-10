"use client";

import React, { useState, useTransition } from "react";
import type { StreamPhraseCategory, StreamPhrase } from "@/types/phrase";
import {
  createStreamPhraseAction,
  updateStreamPhraseAction,
  toggleStreamPhraseAction,
  deleteStreamPhraseAction,
} from "@/app/actions/admin-phrases";
import { Button } from "@/components/ui/button";

interface PhraseListClientProps {
  category: StreamPhraseCategory;
  initialPhrases: StreamPhrase[];
}

export function PhraseListClient({
  category,
  initialPhrases,
}: PhraseListClientProps) {
  const [phrases, setPhrases] = useState(initialPhrases);
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAddPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    startTransition(async () => {
      const res = await createStreamPhraseAction(
        category.id,
        newContent.trim(),
        phrases.length + 1
      );
      if (!res.success) {
        setFeedback({ type: "error", text: res.error || "Không thể thêm câu." });
      } else {
        setPhrases((prev) => [
          ...prev,
          {
            id: res.data?.id || Math.random().toString(),
            category_id: category.id,
            content: newContent.trim(),
            sort_order: prev.length + 1,
            is_active: true,
          },
        ]);
        setNewContent("");
        setFeedback({ type: "success", text: "Đã thêm câu ngắn thành công!" });
      }
      setTimeout(() => setFeedback(null), 2500);
    });
  };

  const handleStartEdit = (phrase: StreamPhrase) => {
    setEditingId(phrase.id);
    setEditContent(phrase.content);
  };

  const handleSaveEdit = (phraseId: string) => {
    if (!editContent.trim()) return;

    startTransition(async () => {
      const res = await updateStreamPhraseAction(
        phraseId,
        category.id,
        editContent.trim()
      );
      if (!res.success) {
        setFeedback({ type: "error", text: res.error || "Không thể sửa câu." });
      } else {
        setPhrases((prev) =>
          prev.map((p) =>
            p.id === phraseId ? { ...p, content: editContent.trim() } : p
          )
        );
        setEditingId(null);
        setFeedback({ type: "success", text: "Đã cập nhật câu ngắn!" });
      }
      setTimeout(() => setFeedback(null), 2500);
    });
  };

  const handleToggle = (phraseId: string, currentActive: boolean) => {
    startTransition(async () => {
      const next = !currentActive;
      const res = await toggleStreamPhraseAction(phraseId, category.id, next);
      if (res.success) {
        setPhrases((prev) =>
          prev.map((p) => (p.id === phraseId ? { ...p, is_active: next } : p))
        );
      }
    });
  };

  const handleDelete = (phraseId: string) => {
    startTransition(async () => {
      const res = await deleteStreamPhraseAction(phraseId, category.id);
      if (res.success) {
        setPhrases((prev) => prev.filter((p) => p.id !== phraseId));
        setFeedback({ type: "success", text: "Đã xóa câu." });
        setTimeout(() => setFeedback(null), 2500);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Add New Phrase Box */}
      <form
        onSubmit={handleAddPhrase}
        className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col sm:flex-row items-center gap-3"
      >
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            maxLength={80}
            placeholder="Nhập câu ngắn mới (khuyến nghị <= 60 ký tự, ví dụ: 'Cố lên nhé', 'Anh yêu em')..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
            required
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">
            {newContent.length}/80
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isPending || !newContent.trim()}
          className="shrink-0 w-full sm:w-auto"
        >
          + Thêm câu này
        </Button>
      </form>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs text-center border font-medium ${
            feedback.type === "success"
              ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
              : "bg-rose-950/60 text-rose-300 border-rose-800/60"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Phrases List */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden divide-y divide-zinc-800/60 shadow-xl">
        <div className="p-3.5 bg-zinc-900/80 text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
          <span>Danh sách câu hiển thị 3D ({phrases.length})</span>
          <span className="text-[11px] normal-case text-zinc-500 font-normal">
            6–8 câu sẽ được chọn ngẫu nhiên mỗi lượt 30s
          </span>
        </div>

        {phrases.length > 0 ? (
          phrases.map((phrase, idx) => (
            <div
              key={phrase.id}
              className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-900/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xs font-serif text-rose-400 w-5 text-center shrink-0">
                  {idx + 1}
                </span>

                {editingId === phrase.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editContent}
                      maxLength={80}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-rose-500 rounded-lg px-2.5 py-1 text-xs text-zinc-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(phrase.id)}
                      disabled={isPending}
                      className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <p
                    className={`text-xs font-medium truncate ${
                      phrase.is_active ? "text-zinc-100" : "text-zinc-500 line-through"
                    }`}
                  >
                    &ldquo;{phrase.content}&rdquo;
                  </p>
                )}
              </div>

              {editingId !== phrase.id && (
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(phrase.id, phrase.is_active)}
                    disabled={isPending}
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border cursor-pointer ${
                      phrase.is_active
                        ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/90"
                        : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:bg-zinc-800"
                    }`}
                  >
                    {phrase.is_active ? "🟢 Bật" : "⚪ Tắt"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartEdit(phrase)}
                    className="px-2 py-1 rounded text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700"
                  >
                    Sửa
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(phrase.id)}
                    className="px-2 py-1 rounded text-xs text-zinc-500 hover:text-rose-400"
                    title="Xóa câu"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-zinc-500">
            Chưa có câu ngắn nào trong bộ này. Hãy thêm câu đầu tiên ở trên.
          </div>
        )}
      </div>
    </div>
  );
}
