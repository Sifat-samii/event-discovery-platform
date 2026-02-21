import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logApiError } from "@/lib/utils/logger";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const limiter = rateLimit({
      key: `save-event:${getClientIp(request)}`,
      limit: 80,
      windowMs: 60_000,
    });
    if (!limiter.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase.from("saved_events").insert({
      user_id: user.id,
      event_id: id,
    });

    if (error) {
      if (error.code === "23505") {
        // Already saved
        return NextResponse.json({ success: true, saved: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { error: reminderError } = await supabase.from("reminders").upsert({
      user_id: user.id,
      event_id: id,
      reminder_24h: true,
      reminder_3h: false,
    });
    if (reminderError) {
      console.error("Failed to initialize reminder after save", reminderError.message);
    }

    return NextResponse.json({ success: true, saved: true });
  } catch (error: any) {
    logApiError("/api/events/[id]/save POST", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: true, saved: false });
    }

    const { data, error } = await supabase
      .from("saved_events")
      .select("id")
      .eq("user_id", user.id)
      .eq("event_id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, saved: Boolean(data?.id) });
  } catch (error: any) {
    logApiError("/api/events/[id]/save GET", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const limiter = rateLimit({
      key: `unsave-event:${getClientIp(request)}`,
      limit: 80,
      windowMs: 60_000,
    });
    if (!limiter.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("saved_events")
      .delete()
      .eq("user_id", user.id)
      .eq("event_id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase
      .from("reminders")
      .delete()
      .eq("user_id", user.id)
      .eq("event_id", id);

    return NextResponse.json({ success: true, saved: false });
  } catch (error: any) {
    logApiError("/api/events/[id]/save DELETE", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
