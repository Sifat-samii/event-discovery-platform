import { NextRequest, NextResponse } from "next/server";
import { sanitizeUuid } from "@/lib/security/sanitize";
import { handleRoute } from "@/lib/api/handle-route";

export const GET = handleRoute<{ id: string }>(
  {
    route: "/api/events/[id]",
    action: "get-event-by-id",
    rateLimitKey: "event-detail",
    rateLimitLimit: 180,
  },
  async (request: NextRequest, context) => {
    const { id } = await (context.params as Promise<{ id: string }>);
    const eventId = sanitizeUuid(id);
    if (!eventId) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }
    const role = context.role;
    const includeDeleted = request.nextUrl.searchParams.get("include_deleted") === "true";

    let query = context.supabase
      .from("events")
      .select(
        `
        *,
        organizer:organizers(id,name,verified,website),
        category:event_categories(id,name,slug),
        area:event_areas(id,name,slug)
      `
      )
      .eq("id", eventId);
    if (!(role === "admin" && includeDeleted)) {
      query = query.is("deleted_at", null);
    }

    if (role !== "admin") {
      query = query.eq("status", "published").gte("end_date", new Date().toISOString());
    }

    const { data, error } = await query.maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    return NextResponse.json({ data });
  }
);

