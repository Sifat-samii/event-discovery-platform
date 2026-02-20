import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWeeklyDigestDraft } from "@/lib/email/digest";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // TODO: Check admin role
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get events for this weekend
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = 6 - dayOfWeek;
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + daysUntilSaturday);
    saturday.setHours(0, 0, 0, 0);
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
    sunday.setHours(23, 59, 59, 999);

    const { data: events, error } = await supabase
      .from("events")
      .select(`
        *,
        category:event_categories(*),
        organizer:organizers(*),
        area:event_areas(*)
      `)
      .eq("status", "published")
      .gte("start_date", saturday.toISOString())
      .lte("end_date", sunday.toISOString())
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const draft = {
      title: "This Weekend in Dhaka",
      events: events || [],
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, draft });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
