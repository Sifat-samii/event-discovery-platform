import { NextRequest, NextResponse } from "next/server";
import { sanitizeUuid, sanitizeUuidList } from "@/lib/security/sanitize";
import { aggregateReminderStatus, canCreateReminderForEvent } from "@/lib/reminders/lifecycle";
import { handleRoute } from "@/lib/api/handle-route";
import { normalizePagination, paginatedResponse } from "@/lib/api/pagination";

export const GET = handleRoute(
  {
    route: "/api/reminders",
    action: "list-reminders",
    requireAuth: true,
    rateLimitKey: "reminders-list",
    rateLimitLimit: 120,
  },
  async (request: NextRequest, context) => {
    if (!context.userId) {
      return NextResponse.json(
        paginatedResponse({
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          extra: { reminders: [] },
        })
      );
    }

    const { page, limit, from, to } = normalizePagination(request.nextUrl.searchParams);
    const eventIds = sanitizeUuidList(request.nextUrl.searchParams.get("event_ids") || "");

    let query = context.supabase
      .from("reminders")
      .select("*", { count: "exact" })
      .eq("user_id", context.userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (eventIds.length) query = query.in("event_id", eventIds);
    const { data, error, count } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      paginatedResponse({
        data: data || [],
        total: count || 0,
        page,
        limit,
        extra: { reminders: data || [] },
      })
    );
  }
);

export const POST = handleRoute(
  {
    route: "/api/reminders",
    action: "upsert-reminder",
    requireAuth: true,
    rateLimitKey: "reminders-create",
    rateLimitLimit: 60,
  },
  async (request: NextRequest, context) => {
    const body = await request.json();
    const { reminder_24h, reminder_3h } = body;
    const timezone =
      typeof body.timezone === "string" && body.timezone.trim().length
        ? body.timezone.trim().slice(0, 80)
        : "Asia/Dhaka";
    const eventId = sanitizeUuid(body.event_id);
    if (!eventId) {
      return NextResponse.json({ error: "event_id is required" }, { status: 400 });
    }

    const { data: event } = await context.supabase
      .from("events")
      .select("id,status,end_date,deleted_at")
      .eq("id", eventId)
      .maybeSingle();
    if (!canCreateReminderForEvent(event || {})) {
      return NextResponse.json({ error: "Cannot create reminder for expired/unpublished event" }, { status: 400 });
    }

    const reminder24 = reminder_24h ?? true;
    const reminder3 = reminder_3h ?? false;

    const { data: existing } = await context.supabase
      .from("reminders")
      .select("id,sent_24h,sent_3h,status_24h,status_3h")
      .eq("user_id", context.userId)
      .eq("event_id", eventId)
      .maybeSingle();

    const payload = {
      user_id: context.userId,
      event_id: eventId,
      reminder_type: "combined",
      reminder_24h: reminder24,
      reminder_3h: reminder3,
      deleted_at: null as string | null,
      status_24h: existing?.sent_24h ? "sent" : "pending",
      status_3h: existing?.sent_3h ? "sent" : "pending",
      status: aggregateReminderStatus({
        status24: (existing?.sent_24h ? "sent" : existing?.status_24h || "pending") as
          | "pending"
          | "sent"
          | "failed",
        status3: (existing?.sent_3h ? "sent" : existing?.status_3h || "pending") as
          | "pending"
          | "sent"
          | "failed",
        reminder24: Boolean(reminder24),
        reminder3: Boolean(reminder3),
      }),
      timezone,
    };

    const { error } = await context.supabase
      .from("reminders")
      .upsert(payload, { onConflict: "user_id,event_id" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }
);
