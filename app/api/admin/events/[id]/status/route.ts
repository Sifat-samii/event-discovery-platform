import { NextRequest, NextResponse } from "next/server";
import { isValidStatus, validateStatusTransition } from "@/lib/admin/status";
import { sanitizeUuid } from "@/lib/security/sanitize";
import { handleRoute } from "@/lib/api/handle-route";

export const PATCH = handleRoute<{ id: string }>(
  {
    route: "/api/admin/events/[id]/status",
    action: "admin-update-event-status",
    requireAuth: true,
    requiredRole: "admin",
    rateLimitKey: "admin-status",
    rateLimitLimit: 60,
  },
  async (request: NextRequest, context) => {
    const { id } = await (context.params as Promise<{ id: string }>);
    const eventId = sanitizeUuid(id);
    if (!eventId) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }

    const body = await request.json();
    const status = String(body.status || "");
    if (!isValidStatus(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { data: existing, error: existingError } = await context.supabase
      .from("events")
      .select("status")
      .eq("id", eventId)
      .is("deleted_at", null)
      .maybeSingle();
    if (existingError || !existing?.status || !isValidStatus(existing.status)) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    const transition = validateStatusTransition(existing.status, status, "admin");
    if (!transition.valid) {
      return NextResponse.json(
        { error: transition.message },
        { status: 400 }
      );
    }

    const { error } = await context.supabase
      .from("events")
      .update({ status })
      .eq("id", eventId)
      .is("deleted_at", null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, status, correlationId: context.correlationId });
  }
);
