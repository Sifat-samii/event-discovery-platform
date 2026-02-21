import { NextRequest, NextResponse } from "next/server";
import { getEvents, getTrendingScores } from "@/lib/db/queries";
import { normalizeEventQuery } from "@/lib/filters/query-normalizer";
import { paginatedResponse } from "@/lib/api/pagination";
import { handleRoute } from "@/lib/api/handle-route";

export const GET = handleRoute(
  {
    route: "/api/events",
    action: "list-public-events",
    rateLimitKey: "events-list",
    rateLimitLimit: 180,
  },
  async (request: NextRequest) => {
    const filters = normalizeEventQuery(request.nextUrl.searchParams);

    const { data, error, count } = await getEvents(filters);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let events = data || [];
    if (filters.sort === "trending") {
      const scores = await getTrendingScores(events.map((event: any) => event.id));
      events = [...events].sort(
        (a: any, b: any) => (scores[b.id] || 0) - (scores[a.id] || 0)
      );
    }

    const total = count || 0;
    return NextResponse.json(
      paginatedResponse({
        data: events,
        total,
        page: filters.page,
        limit: filters.limit,
        extra: {
          // Keep backward compatibility for existing clients.
          events,
          pagination: {
            page: filters.page,
            limit: filters.limit,
            total,
            totalPages: Math.ceil(total / filters.limit),
          },
        },
      })
    );
  }
);
