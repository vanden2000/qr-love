import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAllPhraseCategories } from "@/lib/phrases/getStreamPhrases";
import { CategoryManagerClient } from "@/components/admin/category-manager-client";

export const dynamic = "force-dynamic";

export default async function AdminStreamPhrasesPage() {
  await requireAdmin();
  const categories = await getAllPhraseCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
            <Link href="/admin/dashboard" className="hover:text-zinc-200">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-zinc-200">Bộ câu hiển thị 3D</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <span>💬 Quản lý Bộ câu Love Stream</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Các câu ngắn này sẽ xuất hiện ngẫu nhiên trong không gian 3D khi mở quà theo từng chủ đề. Lời nhắn riêng tư chỉ hiển thị trong phần &ldquo;Đọc thư&rdquo;.
          </p>
        </div>
      </div>

      <CategoryManagerClient initialCategories={categories} />
    </div>
  );
}
