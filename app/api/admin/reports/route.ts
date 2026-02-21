import { NextRequest, NextResponse } from "next/server";
import { handleRoute } from "@/lib/api/handle-route";
import { sanitizeText } from "@/lib/security/sanitize";
import { normalizePagination, paginatedResponse } from "@/lib/api/pagination";

export const GET = handleRoute(
  {
    route: "/api/admin/reports",
    action: "list-admin-reports",
    requireAuth: true,
    requiredRole: "admin",
    rateLimitKey: "admin-reports-list",
    rateLimitLimit: 120,
  },
  async (request: NextRequest, context) => {
    const params = request.nextUrl.searchParams;
    const { page, limit, from, to } = normalizePagination(params);
    const status = sanitizeText(params.get("status"), 20);
    const resolution = sanitizeText(params.get("resolution"), 20);

    let query = context.supabase
      .from("event_reports")
      .select(
        "*, event:events(id,title,slug,status,deleted_at), reporter:users(id,email,full_name)",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);
    if (status && status !== "all") query = query.eq("status", status);
    if (resolution === "resolved") query = query.eq("status", "resolved");
    if (resolution === "unresolved") query = query.neq("status", "resolved");

    const { data, error, count } = await query;
    if (error) {
      return NextResponse.json({ error: error.message, correlationId: context.correlationId }, { status: 500 });
    }
    const total = count || 0;
    return NextResponse.json(
      paginatedResponse({
        data: data || [],
        total,
        page,
        limit,
        extra: { correlationId: context.correlationId },
      })
    );
  }
);

