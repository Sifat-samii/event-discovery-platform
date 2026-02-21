import { NextRequest, NextResponse } from "next/server";
import { handleRoute } from "@/lib/api/handle-route";
import { sanitizeUuid } from "@/lib/security/sanitize";

function buildIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export const GET = handleRoute<{ id: string }>(
  {
    route: "/api/events/[id]/calendar.ics",
    action: "calendar-export",
    rateLimitKey: "calendar-export",
    rateLimitLimit: 120,
  },
  async (_request: NextRequest, context) => {
    const { id } = await (context.params as Promise<{ id: string }>);
    const eventId = sanitizeUuid(id);
    if (!eventId) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }
    const { data: event } = await context.supabase
      .from("events")
      .select("id,slug,title,description,venue_name,venue_address,start_date,end_date,status,deleted_at")
      .eq("id", eventId)
      .eq("status", "published")
      .gte("end_date", new Date().toISOString())
      .is("deleted_at", null)
      .maybeSingle();
    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date || event.start_date);
    const title = (event.title || "Event").replace(/,/g, "\\,");
    const description = (event.description || "").replace(/\n/g, "\\n");
    const location = `${event.venue_name}, ${event.venue_address}`.replace(/,/g, "\\,");

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Events Dhaka//EN",
      "BEGIN:VEVENT",
      `UID:${event.id}@eventsdhaka.com`,
      `DTSTAMP:${buildIcsDate(new Date())}`,
      `DTSTART:${buildIcsDate(startDate)}`,
      `DTEND:${buildIcsDate(endDate)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    return new NextResponse(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${event.slug || "event"}.ics"`,
      },
    });
  }
);
