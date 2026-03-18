import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppRole } from "@/lib/auth/roles";
import { sanitizeUuid } from "@/lib/security/sanitize";
import { normalizeOrganizerEventPayload, validateOrganizerEventPayload } from "@/lib/organizer/validation";
import { isValidStatus, validateStatusTransition } from "@/lib/admin/status";
import { handleRoute } from "@/lib/api/handle-route";

async function getOwnedEventContext(
  supabase: SupabaseClient,
  userId: string,
  role: AppRole | null,
  eventId: string
) {
  if (role !== "organizer" && role !== "admin") return { error: "Forbidden", status: 403 as const };

  const { data: organizer } = await supabase
    .from("organizers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!organizer?.id) return { error: "Organizer profile not found", status: 400 as const };

  const { data: event } = await supabase
    .from("events")
    .select("id,status,organizer_id,deleted_at")
    .eq("id", eventId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!event) return { error: "Event not found", status: 404 as const };
  if (event.organizer_id !== organizer.id && role !== "admin") {
    return { error: "Forbidden", status: 403 as const };
  }

  return { organizerId: organizer.id, event } as const;
}

export const PATCH = handleRoute<{ id: string }>(
  {
    route: "/api/organizer/events/[id]",
    action: "update-organizer-event",
    requireAuth: true,
    rateLimitKey: "organizer-event-update",
    rateLimitLimit: 60,
  },
  async (request: NextRequest, ctx) => {
    const { id } = await (ctx.params as Promise<{ id: string }>);
    const eventId = sanitizeUuid(id);
    if (!eventId) return NextResponse.json({ error: "Invalid event id" }, { status: 400 });

    const owned = await getOwnedEventContext(ctx.supabase, ctx.userId!, ctx.role, eventId);
    if ("error" in owned) return NextResponse.json({ error: owned.error }, { status: owned.status });

    if (!["draft", "pending"].includes(owned.event.status)) {
      return NextResponse.json({ error: "Only Draft/Pending events can be edited." }, { status: 400 });
    }

    const rawBody = await request.json().catch(() => ({}));
    const payload = normalizeOrganizerEventPayload(rawBody);
    const validation = validateOrganizerEventPayload(payload);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join(" ") }, { status: 400 });
    }

    const requestedStatus = String(rawBody.status || "");
    if (requestedStatus) {
      if (requestedStatus === "published") {
        return NextResponse.json({ error: "Organizer cannot set Published status." }, { status: 403 });
      }
      if (!isValidStatus(requestedStatus)) {
        return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
      }
      const transition = validateStatusTransition(
        owned.event.status,
        requestedStatus,
        "organizer"
      );
      if (!transition.valid) {
        return NextResponse.json({ error: transition.message }, { status: 400 });
      }
    }

    const updatePayload: Record<string, unknown> = {
      title: payload.title,
      description: payload.description || "",
      venue_name: payload.venueName,
      venue_address: payload.venueAddress || payload.venueName,
      start_date: `${payload.startDate}T00:00:00.000Z`,
      end_date: `${(payload.endDate || payload.startDate)}T23:59:59.000Z`,
      start_time: payload.startTime || "18:00:00",
      end_time: payload.endTime || null,
      price_type: payload.priceType,
      ticket_link: payload.ticketLink || null,
    };
    if (requestedStatus) {
      updatePayload.status = requestedStatus;
    }

    const { error } = await ctx.supabase
      .from("events")
      .update(updatePayload)
      .eq("id", eventId)
      .is("deleted_at", null);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
);

export const DELETE = handleRoute<{ id: string }>(
  {
    route: "/api/organizer/events/[id]",
    action: "delete-organizer-event",
    requireAuth: true,
    rateLimitKey: "organizer-event-delete",
    rateLimitLimit: 60,
  },
  async (_request: NextRequest, ctx) => {
    const { id } = await (ctx.params as Promise<{ id: string }>);
    const eventId = sanitizeUuid(id);
    if (!eventId) return NextResponse.json({ error: "Invalid event id" }, { status: 400 });

    const owned = await getOwnedEventContext(ctx.supabase, ctx.userId!, ctx.role, eventId);
    if ("error" in owned) return NextResponse.json({ error: owned.error }, { status: owned.status });
    if (!["draft", "pending"].includes(owned.event.status)) {
      return NextResponse.json({ error: "Only Draft/Pending events can be deleted." }, { status: 400 });
    }

    const { error } = await ctx.supabase
      .from("events")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", eventId)
      .is("deleted_at", null);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, deleted: true });
  }
);

