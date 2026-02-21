import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
import { logApiError } from "@/lib/utils/logger";
import { generateWeeklyDigestDraft, sendWeeklyDigest } from "@/lib/email/digest";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const limiter = rateLimit({
      key: `digest-generate:${getClientIp(request)}`,
      limit: 20,
      windowMs: 60_000,
    });
    if (!limiter.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const supabase = await createClient();
    const roleCheck = await requireRole(supabase, "admin");
    if (!roleCheck.authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: roleCheck.status });
    }

    const body = await request.json().catch(() => ({}));
    const draft = await generateWeeklyDigestDraft();

    if (body.sendNow) {
      const { data: recipientsData } = await supabase
        .from("users")
        .select("email")
        .limit(500);
      const recipients = (recipientsData || [])
        .map((item: any) => item.email)
        .filter(Boolean);
      const sendResult = await sendWeeklyDigest(recipients, draft.events);
      return NextResponse.json({ success: true, draft, sendResult });
    }

    return NextResponse.json({ success: true, draft, sendResult: null });
  } catch (error: any) {
    logApiError("/api/digest/generate", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
