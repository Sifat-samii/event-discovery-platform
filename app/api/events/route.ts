import { NextRequest, NextResponse } from "next/server";
import { getEvents, getTrendingScores } from "@/lib/db/queries";
import { logApiError } from "@/lib/utils/logger";
import { normalizeEventQuery } from "@/lib/filters/query-normalizer";

export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json({
      events,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / filters.limit),
      },
    });
  } catch (error: any) {
    logApiError("/api/events", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
