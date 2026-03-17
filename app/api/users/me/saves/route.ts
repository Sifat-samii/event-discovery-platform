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

    const { data: saves, error: savesError, count } = await context.supabase
      .from("saved_events")
      .select(
        `
          id,
          event_id,
          created_at
        `,
        { count: "exact" }
      )
      .eq("user_id", context.userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (savesError) return NextResponse.json({ error: savesError.message }, { status: 500 });

    const safeSaves = saves || [];
    if (!safeSaves.length) {
      const total = count || 0;
      return NextResponse.json(
        paginatedResponse({
          data: [],
          total,
          page,
          limit,
        })
      );
    }

    const eventIds = safeSaves.map((item) => item.event_id);
    const { data: events, error: eventsError } = await context.supabase
      .from("events")
      .select(
        `
          *,
          category:event_categories(*),
          organizer:organizers(*),
          area:event_areas(*)
        `
      )
      .in("id", eventIds);
    if (eventsError) return NextResponse.json({ error: eventsError.message }, { status: 500 });

    const eventMap = new Map((events || []).map((event) => [event.id, event]));
    const data = safeSaves.map((item) => ({
      ...item,
      event: eventMap.get(item.event_id) || null,
    }));

    const total = count || 0;
    return NextResponse.json(
      paginatedResponse({
        data,
        total,
        page,
        limit,
      })
    );
  }
);

