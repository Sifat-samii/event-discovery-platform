import { NextRequest, NextResponse } from "next/server";
import { handleRoute } from "@/lib/api/handle-route";
import { sanitizeText } from "@/lib/security/sanitize";

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

export const POST = handleRoute(
  {
    route: "/api/organizer/profile",
    action: "create-organizer-profile",
    requireAuth: true,
    rateLimitKey: "organizer-profile-create",
    rateLimitLimit: 10,
  },
  async (request: NextRequest, context) => {
    if (context.role !== "organizer" && context.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const name = sanitizeText(body?.name, 200);
    const description = sanitizeText(body?.description, 2000);
    const website = sanitizeText(body?.website, 400);

    if (!name) {
      return NextResponse.json({ error: "Organizer name is required" }, { status: 400 });
    }

    const { data: existing } = await context.supabase
      .from("organizers")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Organizer profile already exists" }, { status: 409 });
    }

    const { data, error } = await context.supabase
      .from("organizers")
      .insert({
        user_id: context.userId,
        name,
        description: description || null,
        website: website || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ organizer: data }, { status: 201 });
  }
);

