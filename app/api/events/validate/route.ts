import { NextRequest, NextResponse } from "next/server";
import { validateEvent, checkDuplicateEvent } from "@/lib/validation/event-validation";
import { handleRoute } from "@/lib/api/handle-route";

export const POST = handleRoute(
  {
    route: "/api/events/validate",
    action: "validate-event-payload",
    rateLimitKey: "events-validate",
    rateLimitLimit: 120,
  },
  async (request: NextRequest, context) => {
    const event = await request.json();
    
    // Validate event data
    const validation = validateEvent(event);
    
    // Check for duplicates in a bounded date window.
    const pivot = event?.start_date ? new Date(event.start_date) : new Date();
    const lower = new Date(pivot.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const upper = new Date(pivot.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: existingEvents } = await context.supabase
      .from("events")
      .select("id, title, start_date, venue_name")
      .eq("status", "published")
      .is("deleted_at", null)
      .gte("end_date", new Date().toISOString())
      .gte("start_date", lower)
      .lte("start_date", upper)
      .order("start_date", { ascending: true })
      .limit(200);

    const duplicateCheck = checkDuplicateEvent(
      event.title,
      event.start_date,
      event.venue_name,
      existingEvents || []
    );

    if (duplicateCheck.isDuplicate) {
      validation.warnings.push(
        `Possible duplicate: Similar event found (${Math.round(duplicateCheck.similarity * 100)}% similarity)`
      );
    }

    return NextResponse.json({
      valid: validation.valid && !duplicateCheck.isDuplicate,
      errors: validation.errors,
      warnings: validation.warnings,
      duplicate: duplicateCheck.isDuplicate ? duplicateCheck.matchedEvent : null,
    });
  }
);
