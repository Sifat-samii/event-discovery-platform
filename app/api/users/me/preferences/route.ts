import { NextRequest, NextResponse } from "next/server";
import { handleRoute } from "@/lib/api/handle-route";
import { sanitizeText } from "@/lib/security/sanitize";

function sanitizeStringList(input: unknown, maxItems: number) {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => sanitizeText(String(item), 64))
    .filter(Boolean)
    .slice(0, maxItems);
}

export const PATCH = handleRoute(
  {
    route: "/api/users/me/preferences",
    action: "update-user-preferences",
    requireAuth: true,
    rateLimitKey: "user-preferences",
    rateLimitLimit: 60,
  },
  async (request: NextRequest, context) => {
    const payload = await request.json().catch(() => ({}));
    const interests = sanitizeStringList(payload?.interests, 20);
    const preferredAreas = sanitizeStringList(payload?.preferredAreas, 20);
    const emailReminders = Boolean(payload?.emailReminders);

    const { error: userUpdateError } = await context.supabase
      .from("users")
      .update({ interests })
      .eq("id", context.userId);

    if (userUpdateError) {
      return NextResponse.json({ error: userUpdateError.message }, { status: 500 });
    }

    const { error: authUpdateError } = await context.supabase.auth.updateUser({
      data: {
        preferred_areas: preferredAreas,
        email_reminders: emailReminders,
      },
    });

    if (authUpdateError) {
      return NextResponse.json({ error: authUpdateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }
);

