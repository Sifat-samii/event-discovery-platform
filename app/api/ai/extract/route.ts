import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
import { logApiError } from "@/lib/utils/logger";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const roleCheck = await requireRole(supabase, "admin");
    if (!roleCheck.authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: roleCheck.status });
    }

    const body = await request.json();
    const { url, text } = body;

    // Placeholder AI extraction
    // In production, this would use OpenAI API to extract structured data
    const extractedData = {
      title: "Extracted Event Title",
      date: new Date().toISOString(),
      venue: "Extracted Venue",
      price: "free",
      category: "Music",
      tags: ["extracted", "tags"],
      description: text || "Extracted description from URL or text",
    };

    // Create draft event
    const { data: event, error } = await supabase
      .from("events")
      .insert({
        title: extractedData.title,
        slug: extractedData.title.toLowerCase().replace(/\s+/g, "-"),
        description: extractedData.description,
        status: "draft",
        source_url: url,
        // ... other fields
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      event,
      extractedData,
    });
  } catch (error: any) {
    logApiError("/api/ai/extract", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
