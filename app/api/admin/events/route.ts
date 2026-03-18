import { NextRequest, NextResponse } from "next/server";
import { handleRoute } from "@/lib/api/handle-route";
import { sanitizeText, sanitizeUuid } from "@/lib/security/sanitize";
import { normalizePagination, paginatedResponse } from "@/lib/api/pagination";
import { ensureUniqueEventSlug } from "@/lib/db/slug";

export const GET = handleRoute(
  {
    route: "/api/admin/events",
    action: "list-admin-events",
    requireAuth: true,
    requiredRole: "admin",
    rateLimitKey: "admin-events-list",
    rateLimitLimit: 120,
  },
  async (request: NextRequest, context) => {
    const params = request.nextUrl.searchParams;
    const { page, limit, from, to } = normalizePagination(params);

    const status = sanitizeText(params.get("status"), 20);
    const organizer = sanitizeText(params.get("organizer"), 120);
    const date = sanitizeText(params.get("date"), 20);
    const dateFrom = sanitizeText(params.get("date_from"), 20);
    const dateTo = sanitizeText(params.get("date_to"), 20);
    const verified = sanitizeText(params.get("verified"), 10);
    const includeDeleted = params.get("include_deleted") === "true";

    let query = context.supabase
      .from("events")
      .select("*, organizer:organizers(id,name,verified)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (!includeDeleted) query = query.is("deleted_at", null);

    if (status && status !== "all") query = query.eq("status", status);
    const organizerId = organizer && organizer !== "all" ? sanitizeUuid(organizer) : null;
    if (organizerId) query = query.eq("organizer_id", organizerId);
    if (date) {
      query = query.gte("start_date", `${date}T00:00:00.000Z`).lte("start_date", `${date}T23:59:59.999Z`);
    }
    if (dateFrom) query = query.gte("start_date", `${dateFrom}T00:00:00.000Z`);
    if (dateTo) query = query.lte("start_date", `${dateTo}T23:59:59.999Z`);
    if (verified === "true") query = query.eq("verified", true);
    if (verified === "false") query = query.eq("verified", false);

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

export const POST = handleRoute(
  {
    route: "/api/admin/events",
    action: "admin-create-event",
    requireAuth: true,
    requiredRole: "admin",
    rateLimitKey: "admin-events-create",
    rateLimitLimit: 30,
  },
  async (request: NextRequest, context) => {
    const body = await request.json().catch(() => ({}));
    const title = sanitizeText(body?.title, 300);
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const slug = await ensureUniqueEventSlug(title);
    const { data, error } = await context.supabase
      .from("events")
      .insert({
        title,
        slug,
        description: sanitizeText(body?.description, 5000) || null,
        start_date: body?.start_date || null,
        venue_name: sanitizeText(body?.venue_name, 300) || null,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message, correlationId: context.correlationId }, { status: 500 });
    }

    return NextResponse.json({ event: data, correlationId: context.correlationId }, { status: 201 });
  }
);

