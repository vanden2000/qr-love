import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getCategoryWithPhrases } from "@/lib/phrases/getStreamPhrases";
import { PhraseListClient } from "@/components/admin/phrase-list-client";

export const dynamic = "force-dynamic";

interface PhraseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PhraseDetailPage({ params }: PhraseDetailPageProps) {
  await requireAdmin();
  const { id } = await params;

  const { category, phrases } = await getCategoryWithPhrases(id);
  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
          <Link href="/admin/dashboard" className="hover:text-zinc-200">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/admin/stream-phrases" className="hover:text-zinc-200">
            Bộ câu hiển thị 3D
          </Link>
          <span>/</span>
          <span className="text-zinc-200 font-medium">{category.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              <span>💬 Chủ đề: &ldquo;{category.name}&rdquo;</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {category.description || "Danh sách các câu ngắn xuất hiện ngẫu nhiên trong không gian 3D."}
            </p>
          </div>

          <Link
            href="/admin/stream-phrases"
            className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-medium"
          >
            ← Quay lại danh sách bộ câu
          </Link>
        </div>
      </div>

      <PhraseListClient category={category} initialPhrases={phrases} />
    </div>
  );
}
