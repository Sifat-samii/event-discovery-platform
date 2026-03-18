import { NextRequest, NextResponse } from "next/server";
import { sanitizeText } from "@/lib/security/sanitize";
import { ensureUniqueEventSlug } from "@/lib/db/slug";
import { handleRoute } from "@/lib/api/handle-route";

export const POST = handleRoute(
  {
    route: "/api/ai/extract",
    action: "ai-extract-event",
    requireAuth: true,
    requiredRole: "admin",
    rateLimitKey: "ai-extract",
    rateLimitLimit: 10,
  },
  async (request: NextRequest, context) => {
<<<<<<< Current (Your changes)
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
=======
    const body = await request.json();
>>>>>>> Incoming (Background Agent changes)
    const url = sanitizeText(body.url, 400);
    const text = sanitizeText(body.text, 4000);

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
    const { data: event, error } = await context.supabase
      .from("events")
      .insert({
        title: extractedData.title,
        slug: await ensureUniqueEventSlug(extractedData.title),
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
  }
);
