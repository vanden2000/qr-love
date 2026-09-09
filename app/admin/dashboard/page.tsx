import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

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

  // Fetch recent gifts
  const { data: recentGifts } = await supabase
    .from("gifts")
    .select("id, slug, sender_name, receiver_name, title, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      {/* Welcome & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Tổng quan Quản trị
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Chào mừng trở lại, <span className="text-zinc-200">{profile.email}</span>
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            Tổng món quà
          </p>
          <p className="text-2xl font-bold text-zinc-100 mt-2">{totalGifts ?? 0}</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <p className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">
            Đang hoạt động (Active)
          </p>
          <p className="text-2xl font-bold text-emerald-300 mt-2">{activeGifts ?? 0}</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <p className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">
            Bản nháp (Draft)
          </p>
          <p className="text-2xl font-bold text-amber-300 mt-2">{draftGifts ?? 0}</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <p className="text-[11px] font-medium text-rose-400 uppercase tracking-wider">
            Đang ẩn (Hidden)
          </p>
          <p className="text-2xl font-bold text-rose-300 mt-2">{hiddenGifts ?? 0}</p>
        </div>
      </div>

      {/* Recent Gifts Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-200">
            Món quà tạo gần đây
          </h2>
        </div>

        {recentGifts && recentGifts.length > 0 ? (
          <div className="rounded-xl border border-zinc-800/80 overflow-hidden bg-zinc-900/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="p-3.5 font-medium">Người nhận</th>
                    <th className="p-3.5 font-medium">Người gửi</th>
                    <th className="p-3.5 font-medium">Tiêu đề</th>
                    <th className="p-3.5 font-medium">Trạng thái</th>
                    <th className="p-3.5 font-medium">Ngày tạo</th>
                    <th className="p-3.5 font-medium text-right">Xem quà</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {recentGifts.map((gift) => (
                    <tr key={gift.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="p-3.5 font-medium text-zinc-100">
                        {gift.receiver_name}
                      </td>
                      <td className="p-3.5 text-zinc-300">
                        {gift.sender_name || "—"}
                      </td>
                      <td className="p-3.5 text-zinc-300 max-w-[200px] truncate">
                        {gift.title}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                            gift.status === "active"
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50"
                              : gift.status === "draft"
                              ? "bg-amber-950/60 text-amber-400 border border-amber-800/50"
                              : "bg-rose-950/60 text-rose-400 border border-rose-800/50"
                          }`}
                        >
                          {gift.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-400">
                        {new Date(gift.created_at).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/gift/${gift.slug}`}
                          target="_blank"
                          className="text-rose-400 hover:text-rose-300 underline underline-offset-2"
                        >
                          Mở link ↗
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-xl border border-dashed border-zinc-800 text-center space-y-2">
            <p className="text-xs text-zinc-400">Chưa có món quà nào trong hệ thống.</p>
          </div>
        )}
      </div>
    </div>
  );
}
