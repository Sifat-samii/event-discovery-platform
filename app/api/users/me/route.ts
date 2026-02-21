import { NextRequest, NextResponse } from "next/server";
import { handleRoute } from "@/lib/api/handle-route";

export const GET = handleRoute(
  {
    route: "/api/users/me",
    action: "get-current-user",
    requireAuth: true,
    rateLimitKey: "users-me",
    rateLimitLimit: 120,
  },
  async (_request: NextRequest, context) => {
    const { data: authData, error: authError } = await context.supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authUser = authData.user;
    const { data: profile } = await context.supabase
      .from("users")
      .select("id,email,full_name,avatar_url,interests")
      .eq("id", authUser.id)
      .maybeSingle();

    if (!profile) {
      await context.supabase.from("users").insert({
        id: authUser.id,
        email: authUser.email || "",
        full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
        avatar_url: authUser.user_metadata?.avatar_url || null,
      });
    }

    return NextResponse.json({
      user: {
        id: authUser.id,
        email: authUser.email || null,
        fullName: profile?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
        avatarUrl: profile?.avatar_url || authUser.user_metadata?.avatar_url || null,
        interests: profile?.interests || [],
        role: context.role,
      },
    });
  }
);

