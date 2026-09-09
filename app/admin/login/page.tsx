"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAdminAction } from "@/app/actions/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const res = await loginAdminAction(formData);
        if (!res.success) {
          setError(res.error || "Đăng nhập thất bại.");
          return;
        }

        router.push(res.data?.redirectUrl || "/admin/dashboard");
        router.refresh();
      } catch (err) {
        console.error("Login client error:", err);
        setError("Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.");
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#070709] px-4 py-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-7">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-rose-400 font-medium">
            <span>🛡️</span>
            <span>Hệ Thống Quản Trị</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            QR LOVE ADMIN
          </h1>
          <p className="text-xs text-zinc-400">
            Đăng nhập bằng tài khoản Quản trị viên để quản lý quà tặng
          </p>
        </div>

        {/* Login Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Quản trị viên"
              id="email"
              name="email"
              type="email"
              placeholder="admin@qrlove.vn"
              required
              disabled={isPending}
              autoComplete="email"
            />

            <Input
              label="Mật khẩu"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isPending}
              autoComplete="current-password"
            />

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs text-center leading-relaxed">
                {error}
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isPending}
              >
                {isPending ? "Đang xác thực..." : "Đăng nhập Admin"}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-zinc-600 text-center select-none">
          QR Love • Secure Admin Portal
        </p>
      </div>
    </div>
  );
}
