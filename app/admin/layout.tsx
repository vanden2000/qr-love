import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { logoutAdminAction } from "@/app/actions/admin-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Portal | QR Love",
  description: "Bảng điều khiển quản trị viên QR Love",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, isAdmin } = await getCurrentUser();

  // If user is not logged in or not admin, we let child routes handle redirect
  // or render bare container for login page
  if (!user || !profile || !isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 font-bold tracking-tight text-zinc-100 hover:text-rose-400 transition-colors"
            >
              <span className="text-base text-rose-500">🛡️</span>
              <span className="text-sm sm:text-base">QR LOVE ADMIN</span>
            </Link>

            <nav className="hidden sm:flex items-center gap-4 text-xs font-medium text-zinc-400">
              <Link
                href="/admin/dashboard"
                className="hover:text-zinc-100 transition-colors"
              >
                Dashboard
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-medium text-zinc-200">
                {profile.email}
              </span>
              <span className="text-[10px] text-rose-400 uppercase tracking-wider font-semibold">
                Admin
              </span>
            </div>

            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-rose-300 border border-zinc-800 transition-colors cursor-pointer"
              >
                Đăng xuất
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Admin Content Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
