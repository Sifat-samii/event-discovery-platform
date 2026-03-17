import { sanitizeUrlQuery } from "../security/sanitize";

export function normalizeEventQuery(searchParams: URLSearchParams) {
  const parsedPage = parseInt(searchParams.get("page") || "1", 10);
  const parsedLimit = parseInt(searchParams.get("limit") || "20", 10);
  const categories = (searchParams.get("categories") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const areas = (searchParams.get("areas") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const datePreset = (searchParams.get("date_preset") || "").toLowerCase();
  const todayStr = new Date().toISOString().slice(0, 10);

  return {
    category: categories.length > 0 ? categories : searchParams.get("category") || undefined,
    subcategory: searchParams.get("subcategory") || undefined,
    area: areas.length > 0 ? areas : searchParams.get("area") || undefined,
    dateFrom: datePreset === "today" ? todayStr : searchParams.get("date_from") || undefined,
    dateTo: datePreset === "today" ? todayStr : searchParams.get("date_to") || undefined,
    priceType: searchParams.get("price_type") as "free" | "paid" | undefined,
    timeSlot: searchParams.get("time_slot") as "morning" | "afternoon" | "evening" | "night" | undefined,
    thisWeekend: searchParams.get("this_weekend") === "true" || datePreset === "weekend",
    verifiedOnly: searchParams.get("verified_only") === "true",
    search: sanitizeUrlQuery(searchParams.get("search"), 80) || undefined,
    sort: searchParams.get("sort") as "soonest" | "trending" | "recent" | undefined,
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    limit: Number.isFinite(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100 ? parsedLimit : 20,
  };
}

