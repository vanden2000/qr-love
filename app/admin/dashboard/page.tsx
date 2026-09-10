import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllGiftsForAdmin } from "@/lib/gifts/getGift";
import { GiftListManager } from "@/components/admin/gift-list-manager";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { profile } = await requireAdmin();

  const supabase = createAdminClient();

  // Fetch count statistics
  const { count: totalGifts } = await supabase
    .from("gifts")
    .select("*", { count: "exact", head: true });

  const { count: activeGifts } = await supabase
    .from("gifts")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: draftGifts } = await supabase
    .from("gifts")
    .select("*", { count: "exact", head: true })
    .eq("status", "draft");

  const { count: hiddenGifts } = await supabase
    .from("gifts")
    .select("*", { count: "exact", head: true })
    .eq("status", "hidden");

  // Fetch all gifts with media and story messages for the admin list
  const gifts = await getAllGiftsForAdmin();

  return (
    <div className="space-y-8">
      {/* Welcome & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <span>🛡️ Quản lý Món Quà</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Đăng nhập với tài khoản: <span className="text-rose-400 font-medium">{profile.email}</span>
          </p>
        </div>

        <Link
          href="/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
        >
          <span>✨ Tạo món quà mới</span>
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            Tổng món quà
          </p>
          <p className="text-2xl font-bold text-zinc-100 mt-2">{totalGifts ?? 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-emerald-900/40">
          <p className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">
            🟢 Đang hoạt động (Active)
          </p>
          <p className="text-2xl font-bold text-emerald-300 mt-2">{activeGifts ?? 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-amber-900/40">
          <p className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">
            🟡 Bản nháp (Draft)
          </p>
          <p className="text-2xl font-bold text-amber-300 mt-2">{draftGifts ?? 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-rose-900/40">
          <p className="text-[11px] font-medium text-rose-400 uppercase tracking-wider">
            🔴 Đang ẩn (Hidden)
          </p>
          <p className="text-2xl font-bold text-rose-300 mt-2">{hiddenGifts ?? 0}</p>
        </div>
      </div>

      {/* Interactive Gifts List Manager (Search, Filter, Quick Status & Accordion Edit) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-200">
              Danh sách quà tặng & Chỉnh sửa
            </h2>
            <p className="text-xs text-zinc-500">
              Nhấp vào badge trạng thái để đổi nhanh, hoặc bấm &ldquo;Xem & Sửa&rdquo; để mở bảng chi tiết.
            </p>
          </div>
        </div>

        <GiftListManager initialGifts={gifts} />
      </div>
    </div>
  );
}
