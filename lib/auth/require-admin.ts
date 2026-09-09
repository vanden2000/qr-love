import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import type { UserProfile } from "@/types/gift";
import type { User } from "@supabase/supabase-js";

export interface AdminSession {
  user: User;
  profile: UserProfile;
}

/**
 * Server guard to require an active admin session.
 * If user is unauthenticated or not an admin, redirects to /admin/login (in Pages/Layouts)
 * or throws an Error (in Server Actions).
 */
export async function requireAdmin(redirectToLogin = true): Promise<AdminSession> {
  const { user, profile, isAdmin } = await getCurrentUser();

  if (!user || !profile || !isAdmin) {
    if (redirectToLogin) {
      redirect("/admin/login");
    }
    throw new Error("Truy cập bị từ chối: Yêu cầu quyền quản trị viên.");
  }

  return {
    user,
    profile,
  };
}
