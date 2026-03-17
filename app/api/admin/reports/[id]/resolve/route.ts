import { NextRequest, NextResponse } from "next/server";
import { handleRoute } from "@/lib/api/handle-route";
import { canTransitionReportStatus, normalizeReportStatus } from "@/lib/reports/status";
import { sanitizeUuid } from "@/lib/security/sanitize";

export const POST = handleRoute<{ id: string }>(
  {
    route: "/api/admin/reports/[id]/resolve",
    action: "resolve-report",
    requireAuth: true,
    requiredRole: "admin",
    rateLimitKey: "admin-report-resolve",
    rateLimitLimit: 60,
  },
  async (request: NextRequest, context) => {
    const { id } = await (context.params as Promise<{ id: string }>);
    const reportId = sanitizeUuid(id);
    if (!reportId) {
      return NextResponse.json({ error: "Invalid report id", correlationId: context.correlationId }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const status = normalizeReportStatus(body.status);

    const { data: existing } = await context.supabase
      .from("event_reports")
      .select("status")
      .eq("id", reportId)
      .maybeSingle();

    const currentStatus = (existing?.status || "open") as "open" | "reviewed" | "resolved";
    if (!canTransitionReportStatus(currentStatus, status)) {
      return NextResponse.json(
        {
          error: `Invalid report transition: ${currentStatus} -> ${status}`,
          correlationId: context.correlationId,
        },
        { status: 400 }
      );
    }

    const { error } = await context.supabase
      .from("event_reports")
      .update({
        status,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reportId);
    if (error) {
      return NextResponse.json({ error: error.message, correlationId: context.correlationId }, { status: 500 });
    }

    return NextResponse.json({ success: true, status, correlationId: context.correlationId });
  }
);

