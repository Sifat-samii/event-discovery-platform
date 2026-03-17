import { NextRequest, NextResponse } from "next/server";
import { generateWeeklyDigestDraft, sendWeeklyDigest } from "@/lib/email/digest";
import { handleRoute } from "@/lib/api/handle-route";

export const POST = handleRoute(
  {
    route: "/api/digest/generate",
    action: "generate-digest",
    requireAuth: true,
    requiredRole: "admin",
    rateLimitKey: "digest-generate",
    rateLimitLimit: 20,
  },
  async (request: NextRequest, context) => {
    const body = await request.json().catch(() => ({}));
    const draft = await generateWeeklyDigestDraft();

    if (body.sendNow) {
      const { data: recipientsData } = await context.supabase
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
  }
);
