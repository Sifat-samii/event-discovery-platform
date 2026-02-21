import { createClient } from "@/lib/supabase/server";
import { sendWeeklyDigest as sendWeeklyDigestEmail } from "@/lib/email/resend";

function getWeekendRange() {
  const now = new Date();
  const day = now.getDay();
  const diffToSat = (6 - day + 7) % 7;
  const saturday = new Date(now);
  saturday.setDate(now.getDate() + diffToSat);
  saturday.setHours(0, 0, 0, 0);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  sunday.setHours(23, 59, 59, 999);
  return { saturday, sunday };
}

export async function generateWeeklyDigestDraft() {
  const supabase = await createClient();
  const { saturday, sunday } = getWeekendRange();

  const { data: events, error } = await supabase
    .from("events")
    .select("id,title,start_date,venue_name,price_type,verified")
    .eq("status", "published")
    .gte("start_date", saturday.toISOString())
    .lte("end_date", sunday.toISOString())
    .order("verified", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  return {
    title: "This Weekend in Dhaka",
    events: events || [],
    generatedAt: new Date().toISOString(),
    window: { from: saturday.toISOString(), to: sunday.toISOString() },
  };
}

export async function sendWeeklyDigest(recipients: string[], events: any[]) {
  const normalizedEvents = (events || []).map((event: any) => ({
    title: event.title,
    date: event.start_date ? new Date(event.start_date).toLocaleString("en-US", { timeZone: "Asia/Dhaka" }) : "",
    venue: event.venue_name || "",
  }));

  const results = await Promise.all(
    recipients.map((email) => sendWeeklyDigestEmail(email, normalizedEvents))
  );
  const failed = results.filter((result) => !result.ok);
  return {
    sent: results.length - failed.length,
    failed: failed.length,
    failures: failed,
  };
}
