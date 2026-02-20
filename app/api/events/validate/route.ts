import { NextRequest, NextResponse } from "next/server";
import { validateEvent, checkDuplicateEvent } from "@/lib/validation/event-validation";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    
    // Validate event data
    const validation = validateEvent(event);
    
    // Check for duplicates
    const supabase = await createClient();
    const { data: existingEvents } = await supabase
      .from("events")
      .select("id, title, start_date, venue_name")
      .eq("status", "published");

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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
