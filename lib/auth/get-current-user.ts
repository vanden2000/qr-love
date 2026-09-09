import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserProfile } from "@/types/gift";
import type { User } from "@supabase/supabase-js";

export interface CurrentUserResult {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
}

/**
 * Retrieves the current authenticated user and their profile/role from Supabase SSR.
 */
export async function getCurrentUser(): Promise<CurrentUserResult> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { user: null, profile: null, isAdmin: false };
    }

    // Fetch profile with admin client to bypass RLS edge cases reliably server-side
    const adminSupabase = createAdminClient();
    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("id, email, role, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return {
        user,
        profile: null,
        isAdmin: false,
      };
    }

    const typedProfile = profile as UserProfile;
    const isAdmin = typedProfile.role === "admin";

    return {
      user,
      profile: typedProfile,
      isAdmin,
    };
  } catch (err) {
    console.error("Error in getCurrentUser:", err);
    return { user: null, profile: null, isAdmin: false };
  }
}
