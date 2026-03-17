import type { SupabaseClient } from "@supabase/supabase-js";

export type AppRole = "user" | "organizer" | "admin";

export async function getUserRole(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data?.role || "user") as AppRole;
}

export async function requireRole(supabase: SupabaseClient, requiredRole: AppRole) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, status: 401 as const, userId: null };
  }

  const role = await getUserRole(supabase, user.id);
  if (role !== requiredRole) {
    return { authorized: false, status: 403 as const, userId: user.id };
  }

  return { authorized: true, status: 200 as const, userId: user.id, role };
}
