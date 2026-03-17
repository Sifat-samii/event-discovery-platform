import { NextRequest, NextResponse } from "next/server";
import { sanitizeText, sanitizeUuid } from "@/lib/security/sanitize";
import { handleRoute } from "@/lib/api/handle-route";

export const POST = handleRoute<{ id: string }>(
  {
    route: "/api/events/[id]/report",
    action: "create-report",
    rateLimitKey: "event-report",
    rateLimitLimit: 20,
  },
  async (request: NextRequest, context) => {
    const { id } = await (context.params as Promise<{ id: string }>);
    const eventId = sanitizeUuid(id);
    if (!eventId) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }

    const body = await request.json();
    const reason = sanitizeText(body.reason, 120);
    const description = sanitizeText(body.description, 800) || null;

    if (!reason) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 });
    }

    const { error } = await context.supabase.from("event_reports").insert({
      event_id: eventId,
      user_id: context.userId || null,
      reason,
      description,
      status: "open",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }
);
