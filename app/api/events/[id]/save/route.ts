import { NextRequest, NextResponse } from "next/server";
import { logApiWarn } from "@/lib/utils/logger";
import { sanitizeUuid } from "@/lib/security/sanitize";
import { handleRoute } from "@/lib/api/handle-route";

export const POST = handleRoute<{ id: string }>(
  {
    route: "/api/events/[id]/save",
    action: "save-event",
    requireAuth: true,
    rateLimitKey: "save-event",
    rateLimitLimit: 80,
  },
  async (_request: NextRequest, context) => {
    const { id } = await (context.params as Promise<{ id: string }>);
    const eventId = sanitizeUuid(id);
    if (!eventId) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }
    const supabase = context.supabase;
    const userId = context.userId;

    const { data: event } = await supabase
      .from("events")
      .select("id,status,end_date,deleted_at")
      .eq("id", eventId)
      .maybeSingle();
    if (!event || event.deleted_at || event.status !== "published" || event.end_date < new Date().toISOString()) {
      return NextResponse.json({ error: "Cannot save expired or unpublished event" }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabase
      .from("saved_events")
      .select("id,deleted_at")
      .eq("user_id", userId)
      .eq("event_id", eventId)
      .maybeSingle();
    if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
    if (existing?.id) {
      if (existing.deleted_at) {
        const { error: reviveError } = await supabase
          .from("saved_events")
          .update({ deleted_at: null })
          .eq("id", existing.id);
        if (reviveError) return NextResponse.json({ error: reviveError.message }, { status: 500 });
      }
    } else {
      const { error } = await supabase.from("saved_events").insert({
        user_id: userId,
        event_id: eventId,
      });
      if (error) {
        if (error.code === "23505") {
          return NextResponse.json({ success: true, saved: true });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const { error: reminderError } = await supabase.from("reminders").upsert({
      user_id: userId,
      event_id: eventId,
      reminder_type: "combined",
      reminder_24h: true,
      reminder_3h: false,
      deleted_at: null,
      status_24h: "pending",
      status_3h: "pending",
      status: "pending",
      timezone: "Asia/Dhaka",
    });
    if (reminderError) {
      logApiWarn(
        {
          route: "/api/events/[id]/save POST",
          userId,
          action: "save-event-init-reminder",
        },
        reminderError.message
      );
    }

    return NextResponse.json({ success: true, saved: true });
  }
);

export const GET = handleRoute<{ id: string }>(
  {
    route: "/api/events/[id]/save",
    action: "get-save-state",
    rateLimitKey: "save-state",
    rateLimitLimit: 180,
  },
  async (_request: NextRequest, context) => {
    const { id } = await (context.params as Promise<{ id: string }>);
    const eventId = sanitizeUuid(id);
    if (!eventId) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }
    const supabase = context.supabase;
    const userId = context.userId;

    if (!userId) {
      return NextResponse.json({ success: true, saved: false });
    }

    const { data, error } = await supabase
      .from("saved_events")
      .select("id")
      .eq("user_id", userId)
      .eq("event_id", eventId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { count } = await supabase
      .from("saved_events")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .is("deleted_at", null);

    return NextResponse.json({
      success: true,
      saved: Boolean(data?.id),
      saveCount: count || 0,
    });
  }
);

export const DELETE = handleRoute<{ id: string }>(
  {
    route: "/api/events/[id]/save",
    action: "unsave-event",
    requireAuth: true,
    rateLimitKey: "unsave-event",
    rateLimitLimit: 80,
  },
  async (_request: NextRequest, context) => {
    const { id } = await (context.params as Promise<{ id: string }>);
    const eventId = sanitizeUuid(id);
    if (!eventId) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }
    const supabase = context.supabase;
    const userId = context.userId;

    const { error } = await supabase
      .from("saved_events")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("event_id", eventId)
      .is("deleted_at", null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase
      .from("reminders")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("event_id", eventId)
      .is("deleted_at", null);

    return NextResponse.json({ success: true, saved: false });
  }
);
