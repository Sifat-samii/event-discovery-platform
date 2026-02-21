import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { normalizeReportStatus, canTransitionReportStatus } from "@/lib/reports/status";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const limiter = rateLimit({
      key: `report-resolve:${getClientIp(request)}`,
      limit: 60,
      windowMs: 60_000,
    });
    if (!limiter.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { id } = await params;
    const supabase = await createClient();
    const roleCheck = await requireRole(supabase, "admin");
    if (!roleCheck.authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: roleCheck.status });
    }

    const body = await request.json().catch(() => ({}));
    const status = normalizeReportStatus(body.status);
    const { data: existing } = await supabase
      .from("event_reports")
      .select("status")
      .eq("id", id)
      .maybeSingle();
    const currentStatus = (existing?.status || "open") as "open" | "reviewed" | "resolved";
    if (!canTransitionReportStatus(currentStatus, status)) {
      return NextResponse.json(
        { error: `Invalid report transition: ${currentStatus} -> ${status}` },
        { status: 400 }
      );
    }
    const { error } = await supabase
      .from("event_reports")
      .update({
        status,
        reviewed_by: roleCheck.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
