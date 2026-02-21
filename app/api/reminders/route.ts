import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logApiError } from "@/lib/utils/logger";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { sanitizeUuid, sanitizeUuidList } from "@/lib/security/sanitize";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ reminders: [] });
    }

    const eventIds = sanitizeUuidList(request.nextUrl.searchParams.get("event_ids") || "");

    let query = supabase.from("reminders").select("*").eq("user_id", user.id);
    if (eventIds.length) query = query.in("event_id", eventIds);
    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ reminders: data || [] });
  } catch (error: any) {
    logApiError("/api/reminders GET", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const limiter = rateLimit({
      key: `reminders:${getClientIp(request)}`,
      limit: 60,
      windowMs: 60_000,
    });
    if (!limiter.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reminder_24h, reminder_3h } = body;
    const eventId = sanitizeUuid(body.event_id);
    if (!eventId) {
      return NextResponse.json({ error: "event_id is required" }, { status: 400 });
    }

    const { error } = await supabase.from("reminders").upsert({
      user_id: user.id,
      event_id: eventId,
      reminder_24h: reminder_24h ?? true,
      reminder_3h: reminder_3h ?? false,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logApiError("/api/reminders", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
