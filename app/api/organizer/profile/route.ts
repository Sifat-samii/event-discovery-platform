import { NextRequest, NextResponse } from "next/server";
import { handleRoute } from "@/lib/api/handle-route";

export const GET = handleRoute(
  {
    route: "/api/organizer/profile",
    action: "get-organizer-profile",
    requireAuth: true,
    rateLimitKey: "organizer-profile",
    rateLimitLimit: 120,
  },
  async (_request: NextRequest, context) => {
    if (context.role !== "organizer" && context.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await context.supabase
      .from("organizers")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ organizer: data || null });
  }
);

