import { NextRequest, NextResponse } from "next/server";
import { sendReminderEmail } from "@/lib/email/resend";
import { handleRoute } from "@/lib/api/handle-route";
import { aggregateReminderStatus } from "@/lib/reminders/lifecycle";

function getDhakaNow() {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
}

export const POST = handleRoute(
  {
    route: "/api/reminders/dispatch",
    action: "dispatch-reminders",
    rateLimitKey: "reminder-dispatch",
    rateLimitLimit: 10,
  },
  async (request: NextRequest, context) => {
    const authHeader = request.headers.get("authorization");
    const expected = `Bearer ${process.env.CRON_SECRET || ""}`;
    if (!process.env.CRON_SECRET || authHeader !== expected) {
      return NextResponse.json({ error: "Unauthorized cron call" }, { status: 401 });
    }

    const supabase = context.supabase;
    const now = getDhakaNow();
    const plus24 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const plus3 = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    const batchSize = 200;
    let page = 0;
    let sentCount = 0;

    while (true) {
      const from = page * batchSize;
      const to = from + batchSize - 1;

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
        status_24h,
        status_3h,
        status,
        timezone,
        deleted_at,
        user:users(email),
        event:events(title,start_date,status)
      `)
        .range(from, to);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      if (!reminders?.length) {
        break;
      }

      for (const reminder of reminders) {
        const event = Array.isArray(reminder.event) ? reminder.event[0] : reminder.event;
        const user = Array.isArray(reminder.user) ? reminder.user[0] : reminder.user;
        if (reminder.deleted_at) continue;
        if (!event || event.status !== "published") continue;

        const eventStart = new Date(event.start_date);
        const userEmail = user?.email;
        if (!userEmail || !eventStart) continue;

        const delta = eventStart.getTime() - now.getTime();
        const within24h = delta <= 24 * 60 * 60 * 1000 && delta > 23 * 60 * 60 * 1000;
        const within3h = delta <= 3 * 60 * 60 * 1000 && delta > 2 * 60 * 60 * 1000;

        if (reminder.reminder_24h && !reminder.sent_24h && reminder.status_24h === "pending" && within24h) {
          const result = await sendReminderEmail(userEmail, event.title, eventStart, "24h");
          if (result.ok) {
            await supabase
              .from("reminders")
              .update({ sent_24h: true, status_24h: "sent" })
              .eq("id", reminder.id);
            reminder.status_24h = "sent";
            sentCount += 1;
          } else {
            await supabase
              .from("reminders")
              .update({ status_24h: "failed" })
              .eq("id", reminder.id);
            reminder.status_24h = "failed";
          }
        }

        if (reminder.reminder_3h && !reminder.sent_3h && reminder.status_3h === "pending" && within3h) {
          const result = await sendReminderEmail(userEmail, event.title, eventStart, "3h");
          if (result.ok) {
            await supabase
              .from("reminders")
              .update({ sent_3h: true, status_3h: "sent" })
              .eq("id", reminder.id);
            reminder.status_3h = "sent";
            sentCount += 1;
          } else {
            await supabase
              .from("reminders")
              .update({ status_3h: "failed" })
              .eq("id", reminder.id);
            reminder.status_3h = "failed";
          }
        }

        const status = aggregateReminderStatus({
          reminder24: Boolean(reminder.reminder_24h),
          reminder3: Boolean(reminder.reminder_3h),
          status24: (String(reminder.status_24h || "pending") as "pending" | "sent" | "failed"),
          status3: (String(reminder.status_3h || "pending") as "pending" | "sent" | "failed"),
        });
        await supabase.from("reminders").update({ status }).eq("id", reminder.id);
      }

      if (reminders.length < batchSize) {
        break;
      }
      page += 1;
    }

    return NextResponse.json({
      success: true,
      sentCount,
      timestamp: now.toISOString(),
      window24h: plus24.toISOString(),
      window3h: plus3.toISOString(),
    });
  }
);
