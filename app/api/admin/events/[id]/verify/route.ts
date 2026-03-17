import { NextRequest, NextResponse } from "next/server";
import { sanitizeUuid } from "@/lib/security/sanitize";
import { handleRoute } from "@/lib/api/handle-route";

export const PATCH = handleRoute<{ id: string }>(
  {
    route: "/api/admin/events/[id]/verify",
    action: "admin-verify-event",
    requireAuth: true,
    requiredRole: "admin",
    rateLimitKey: "admin-verify",
    rateLimitLimit: 60,
  },
  async (request: NextRequest, context) => {
    const { id } = await (context.params as Promise<{ id: string }>);
    const eventId = sanitizeUuid(id);
    if (!eventId) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }

    const body = await request.json();
    const verified = Boolean(body.verified);
    const { error } = await context.supabase
      .from("events")
      .update({ verified })
      .eq("id", eventId)
      .is("deleted_at", null);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, verified, correlationId: context.correlationId });
  }
);
