import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "@/lib/db/queries";
import { logApiError } from "@/lib/utils/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parsedPage = parseInt(searchParams.get("page") || "1", 10);
    const parsedLimit = parseInt(searchParams.get("limit") || "20", 10);
    
    const filters = {
      category: searchParams.get("category") || undefined,
      subcategory: searchParams.get("subcategory") || undefined,
      area: searchParams.get("area") || undefined,
      dateFrom: searchParams.get("date_from") || undefined,
      dateTo: searchParams.get("date_to") || undefined,
      priceType: searchParams.get("price_type") as "free" | "paid" | undefined,
      timeSlot: searchParams.get("time_slot") as "morning" | "afternoon" | "evening" | "night" | undefined,
      thisWeekend: searchParams.get("this_weekend") === "true",
      verifiedOnly: searchParams.get("verified_only") === "true",
      search: searchParams.get("search") || undefined,
      sort: searchParams.get("sort") as "soonest" | "trending" | "recent" | undefined,
      page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
      limit:
        Number.isFinite(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100
          ? parsedLimit
          : 20,
    };

    const { data, error, count } = await getEvents(filters);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      events: data || [],
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
