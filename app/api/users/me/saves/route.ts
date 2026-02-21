import { NextRequest, NextResponse } from "next/server";
import { normalizePagination, paginatedResponse } from "@/lib/api/pagination";
import { handleRoute } from "@/lib/api/handle-route";

export const GET = handleRoute(
  {
    route: "/api/users/me/saves",
    action: "list-user-saves",
    requireAuth: true,
    rateLimitKey: "user-saves",
    rateLimitLimit: 120,
  },
  async (request: NextRequest, context) => {
    const { page, limit, from, to } = normalizePagination(request.nextUrl.searchParams);

    const { data, error, count } = await context.supabase
      .from("saved_events")
      .select(
        `
          id,
          event_id,
          created_at,
          event:events(
            *,
            category:event_categories(*),
            organizer:organizers(*),
            area:event_areas(*)
          )
        `,
        { count: "exact" }
      )
      .eq("user_id", context.userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const total = count || 0;
    return NextResponse.json(
      paginatedResponse({
        data: data || [],
        total,
        page,
        limit,
      })
    );
  }
);

