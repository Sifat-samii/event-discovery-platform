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
    const userId = context.userId!;

    const { data: profile } = await context.supabase
      .from("users")
      .select("id,email,full_name,avatar_url,interests")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) {
      const { data: authData } = await context.supabase.auth.getUser();
      const meta = authData?.user?.user_metadata;
      await context.supabase.from("users").insert({
        id: userId,
        email: authData?.user?.email || "",
        full_name: meta?.full_name || meta?.name || null,
        avatar_url: meta?.avatar_url || null,
      });
      return NextResponse.json({
        user: {
          id: userId,
          email: authData?.user?.email || null,
          fullName: meta?.full_name || meta?.name || null,
          avatarUrl: meta?.avatar_url || null,
          interests: [],
          role: context.role,
        },
      });
    }

    const metadata = authUser.user_metadata || {};
    return NextResponse.json({
      user: {
<<<<<<< Current (Your changes)
        id: userId,
        email: profile.email || null,
        fullName: profile.full_name || null,
        avatarUrl: profile.avatar_url || null,
        interests: profile.interests || [],
=======
        id: authUser.id,
        email: authUser.email || null,
        fullName: profile?.full_name || metadata.full_name || metadata.name || null,
        avatarUrl: profile?.avatar_url || metadata.avatar_url || null,
        interests: profile?.interests || [],
        preferredAreas: Array.isArray(metadata.preferred_areas) ? metadata.preferred_areas : [],
        emailReminders: metadata.email_reminders ?? true,
>>>>>>> Incoming (Background Agent changes)
        role: context.role,
      },
    });
  }
);

