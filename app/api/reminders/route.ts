import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logApiError } from "@/lib/utils/logger";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { event_id, reminder_24h, reminder_3h } = body;

    const { error } = await supabase.from("reminders").upsert({
      user_id: user.id,
      event_id,
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
