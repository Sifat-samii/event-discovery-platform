import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { sanitizeText } from "@/lib/security/sanitize";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const limiter = rateLimit({
      key: `report:${getClientIp(request)}`,
      limit: 20,
      windowMs: 60_000,
    });
    if (!limiter.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const reason = sanitizeText(body.reason, 120);
    const description = sanitizeText(body.description, 800) || null;

    if (!reason) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 });
    }

    const { error } = await supabase.from("event_reports").insert({
      event_id: id,
      user_id: user?.id || null,
      reason,
      description,
      status: "open",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
