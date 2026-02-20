import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendReminderEmail } from "@/lib/email/resend";
import { logApiError } from "@/lib/utils/logger";

function getDhakaNow() {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const expected = `Bearer ${process.env.CRON_SECRET || ""}`;
    if (!process.env.CRON_SECRET || authHeader !== expected) {
      return NextResponse.json({ error: "Unauthorized cron call" }, { status: 401 });
    }

    const supabase = await createClient();
    const now = getDhakaNow();
    const plus24 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const plus3 = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    const { data: reminders, error } = await supabase
      .from("reminders")
      .select(`
        id,
        user_id,
        event_id,
        reminder_24h,
        reminder_3h,
        sent_24h,
        sent_3h,
        user:users(email),
        event:events(title,start_date,status)
      `);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let sentCount = 0;
    for (const reminder of reminders || []) {
      const event = Array.isArray(reminder.event) ? reminder.event[0] : reminder.event;
      const user = Array.isArray(reminder.user) ? reminder.user[0] : reminder.user;
      if (!event || event.status !== "published") continue;

      const eventStart = new Date(event.start_date);
      const userEmail = user?.email;
      if (!userEmail || !eventStart) continue;

      const delta = eventStart.getTime() - now.getTime();
      const within24h = delta <= 24 * 60 * 60 * 1000 && delta > 23 * 60 * 60 * 1000;
      const within3h = delta <= 3 * 60 * 60 * 1000 && delta > 2 * 60 * 60 * 1000;

      if (reminder.reminder_24h && !reminder.sent_24h && within24h) {
        await sendReminderEmail(userEmail, event.title, eventStart, "24h");
        await supabase.from("reminders").update({ sent_24h: true }).eq("id", reminder.id);
        sentCount += 1;
      }

      if (reminder.reminder_3h && !reminder.sent_3h && within3h) {
        await sendReminderEmail(userEmail, event.title, eventStart, "3h");
        await supabase.from("reminders").update({ sent_3h: true }).eq("id", reminder.id);
        sentCount += 1;
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      timestamp: now.toISOString(),
      window24h: plus24.toISOString(),
      window3h: plus3.toISOString(),
    });
  } catch (error: any) {
    logApiError("/api/reminders/dispatch", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
