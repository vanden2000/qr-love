"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import type { ActionResponse } from "@/types/gift";

/**
 * Server action to authenticate an admin using email & password.
 * Checks profiles.role === 'admin' before allowing access.
 */
export async function loginAdminAction(
  formData: FormData
): Promise<ActionResponse<{ redirectUrl: string }>> {
  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!email || !password) {
    return {
      success: false,
      error: "Vui lòng nhập đầy đủ email và mật khẩu.",
    };
  }

  try {
    const supabase = await createServerClient();
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.user) {
      return {
        success: false,
        error: "Email hoặc mật khẩu không chính xác.",
      };
    }

    // Check RBAC role in profiles table
    const adminSupabase = createAdminClient();
    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError || !profile || profile.role !== "admin") {
      // User is not an admin: sign out immediately
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Tài khoản của bạn không có quyền Quản trị viên (Admin).",
      };
    }

    return {
      success: true,
      data: { redirectUrl: "/admin/dashboard" },
    };
  } catch (err) {
    console.error("Login error:", err);
    return {
      success: false,
      error: "Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại sau.",
    };
  }
}

/**
 * Server action to sign out the current admin and redirect to /admin/login.
 */
export async function logoutAdminAction(): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
