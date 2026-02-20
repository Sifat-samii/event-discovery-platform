import { NextRequest, NextResponse } from "next/server";
import { getEventById } from "@/lib/db/queries";

function buildIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await getEventById(id);
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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate calendar file" },
      { status: 500 }
    );
  }
}
