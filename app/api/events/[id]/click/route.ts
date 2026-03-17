import { NextRequest, NextResponse } from "next/server";
import { sanitizeText, sanitizeUuid } from "@/lib/security/sanitize";
import { handleRoute } from "@/lib/api/handle-route";

export const POST = handleRoute<{ id: string }>(
  {
    route: "/api/events/[id]/click",
    action: "track-click",
    rateLimitKey: "event-click",
    rateLimitLimit: 120,
  },
  async (request: NextRequest, context) => {
    const { id } = await (context.params as Promise<{ id: string }>);
    const eventId = sanitizeUuid(id);
    if (!eventId) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }
    const body = await request.json().catch(() => ({}));
    const source = sanitizeText(body.source || "event_detail", 40);

    const { error } = await context.supabase.from("event_clicks").insert({
      event_id: eventId,
      user_id: context.userId || null,
      source,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }
);
