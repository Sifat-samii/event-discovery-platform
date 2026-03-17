import { NextRequest, NextResponse } from "next/server";
import { sanitizeUuid } from "@/lib/security/sanitize";
import { handleRoute } from "@/lib/api/handle-route";

export const DELETE = handleRoute<{ id: string }>(
  {
    route: "/api/reminders/[id]",
    action: "delete-reminder",
    requireAuth: true,
    rateLimitKey: "reminders-delete",
    rateLimitLimit: 60,
  },
  async (_request: NextRequest, context) => {
    const { id } = await (context.params as Promise<{ id: string }>);
    const reminderId = sanitizeUuid(id);
    if (!reminderId) {
      return NextResponse.json({ error: "Invalid reminder id" }, { status: 400 });
    }

    const { error } = await context.supabase
      .from("reminders")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", reminderId)
      .eq("user_id", context.userId)
      .is("deleted_at", null);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted: true });
  }
);

