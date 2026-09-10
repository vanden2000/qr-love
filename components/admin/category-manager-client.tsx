"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import type { StreamPhraseCategory } from "@/types/phrase";
import {
  createPhraseCategoryAction,
  updatePhraseCategoryAction,
  togglePhraseCategoryAction,
  deletePhraseCategoryAction,
} from "@/app/actions/admin-phrases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CategoryManagerClientProps {
  initialCategories: StreamPhraseCategory[];
}

export function CategoryManagerClient({
  initialCategories,
}: CategoryManagerClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StreamPhraseCategory | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setShowAddModal(true);
  };

  const handleOpenEdit = (cat: StreamPhraseCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      if (editingCategory) {
        const res = await updatePhraseCategoryAction(
          editingCategory.id,
          name.trim(),
          description.trim()
        );
        if (!res.success) {
          setFeedback({ type: "error", text: res.error || "Lỗi cập nhật." });
        } else {
          setCategories((prev) =>
            prev.map((c) =>
              c.id === editingCategory.id
                ? { ...c, name: name.trim(), description: description.trim() }
                : c
            )
          );
          setFeedback({ type: "success", text: "Đã cập nhật bộ câu thành công!" });
          setShowAddModal(false);
        }
      } else {
        const res = await createPhraseCategoryAction(name.trim(), description.trim());
        if (!res.success) {
          setFeedback({ type: "error", text: res.error || "Lỗi tạo mới." });
        } else {
          setCategories((prev) => [
            ...prev,
            {
              id: res.data?.id || Math.random().toString(),
              name: name.trim(),
              slug: name.toLowerCase().replace(/\s+/g, "-"),
              description: description.trim(),
              is_active: true,
              sort_order: prev.length + 1,
              phrases_count: 0,
            },
          ]);
          setFeedback({ type: "success", text: "Đã tạo bộ câu mới thành công!" });
          setShowAddModal(false);
        }
      }
      setTimeout(() => setFeedback(null), 3000);
    });
  };

  const handleToggleActive = (catId: string, currentActive: boolean) => {
    startTransition(async () => {
      const next = !currentActive;
      const res = await togglePhraseCategoryAction(catId, next);
      if (res.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === catId ? { ...c, is_active: next } : c))
        );
      }
    });
  };

  const handleDelete = (catId: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bộ câu "${name}" và toàn bộ câu bên trong?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deletePhraseCategoryAction(catId);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== catId));
        setFeedback({ type: "success", text: `Đã xóa bộ câu "${name}".` });
        setTimeout(() => setFeedback(null), 3000);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">
          Tổng cộng: <strong className="text-zinc-200">{categories.length}</strong> chủ đề
        </span>

        <Button type="button" variant="primary" onClick={handleOpenAdd}>
          + Thêm bộ câu mới
        </Button>
      </div>

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

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col justify-between gap-3 group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-rose-300 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800/60">
                    /{cat.slug}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleActive(cat.id, cat.is_active)}
                  disabled={isPending}
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                    cat.is_active
                      ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
                      : "bg-zinc-900 text-zinc-500 border-zinc-800"
                  }`}
                >
                  {cat.is_active ? "🟢 Bật" : "⚪ Tắt"}
                </button>
              </div>

              {cat.description && (
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {cat.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
              <span className="text-xs text-rose-400 font-medium">
                {cat.phrases_count || 0} câu nhắn
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  className="px-2.5 py-1 rounded text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Sửa
                </button>

                <Link
                  href={`/admin/stream-phrases/${cat.id}`}
                  className="px-3 py-1 rounded text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                >
                  Quản lý câu ➔
                </Link>

                <button
                  type="button"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="px-2 py-1 rounded text-xs text-zinc-500 hover:text-rose-400 transition-colors"
                  title="Xóa bộ câu"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-zinc-100">
              {editingCategory ? "Chỉnh sửa Bộ câu" : "Tạo Bộ câu hiển thị mới"}
            </h2>

            <form onSubmit={handleSave} className="space-y-3">
              <Input
                label="Tên bộ câu (ví dụ: Yêu thương, Cổ vũ, Chữa lành)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                placeholder="Nhập tên bộ câu..."
              />

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Mô tả chủ đề
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả ý nghĩa của bộ câu..."
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Hủy
                </button>
                <Button type="submit" variant="primary" disabled={isPending}>
                  {isPending ? "Đang lưu..." : editingCategory ? "Lưu thay đổi" : "Tạo mới"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
