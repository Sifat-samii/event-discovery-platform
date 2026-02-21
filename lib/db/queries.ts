import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

// Event queries
export type EventFilters = {
  category?: string | string[];
  subcategory?: string;
  area?: string | string[];
  dateFrom?: string;
  dateTo?: string;
  priceType?: "free" | "paid";
  timeSlot?: "morning" | "afternoon" | "evening" | "night";
  thisWeekend?: boolean;
  verifiedOnly?: boolean;
  search?: string;
  sort?: "soonest" | "trending" | "recent";
  page?: number;
  limit?: number;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

async function resolveIdBySlug(
  table: "event_categories" | "event_subcategories" | "event_areas",
  candidate?: string
) {
  if (!candidate) return undefined;
  if (isUuid(candidate)) return candidate;

  const supabase = await createClient();
  const { data } = await supabase
    .from(table)
    .select("id")
    .eq("slug", candidate)
    .maybeSingle();
  return data?.id;
}

async function resolveIdsBySlugList(
  table: "event_categories" | "event_areas",
  candidates: string[]
) {
  const directIds = candidates.filter((candidate) => isUuid(candidate));
  const slugs = candidates.filter((candidate) => !isUuid(candidate));
  if (!slugs.length) return directIds;
  const supabase = await createClient();
  const { data } = await supabase.from(table).select("id, slug").in("slug", slugs);
  const resolved = (data || []).map((item: any) => item.id as string);
  return [...new Set([...directIds, ...resolved])];
}

export async function getEvents(filters?: EventFilters) {
  if (!hasSupabaseEnv()) {
    return { data: [], error: null, count: 0 } as any;
  }
  const supabase = await createClient();
  const now = new Date().toISOString();
  let query = supabase
    .from("events")
    .select(`
      *,
      category:event_categories(*),
      subcategory:event_subcategories(*),
      organizer:organizers(*),
      area:event_areas(*),
      tags:event_tags_junction(event_tags(*))
    `, { count: "exact" })
    .eq("status", "published")
    .gte("end_date", now);

  // Apply filters
  if (filters?.category) {
    if (Array.isArray(filters.category)) {
      const categoryIds = await resolveIdsBySlugList("event_categories", filters.category);
      if (categoryIds.length) query = query.in("category_id", categoryIds);
    } else {
      const categoryId = await resolveIdBySlug("event_categories", filters.category);
      if (categoryId) query = query.eq("category_id", categoryId);
    }
  }
  if (filters?.subcategory) {
    const subcategoryId = await resolveIdBySlug(
      "event_subcategories",
      filters.subcategory
    );
    if (subcategoryId) query = query.eq("subcategory_id", subcategoryId);
  }
  if (filters?.area) {
    if (Array.isArray(filters.area)) {
      const areaIds = await resolveIdsBySlugList("event_areas", filters.area);
      if (areaIds.length) query = query.in("area_id", areaIds);
    } else {
      const areaId = await resolveIdBySlug("event_areas", filters.area);
      if (areaId) query = query.eq("area_id", areaId);
    }
  }
  if (filters?.dateFrom) {
    query = query.gte("start_date", filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte("end_date", filters.dateTo);
  }
  if (filters?.priceType) {
    query = query.eq("price_type", filters.priceType);
  }
  if (filters?.timeSlot) {
    if (filters.timeSlot === "morning") {
      query = query.gte("start_time", "06:00:00").lt("start_time", "12:00:00");
    } else if (filters.timeSlot === "afternoon") {
      query = query.gte("start_time", "12:00:00").lt("start_time", "17:00:00");
    } else if (filters.timeSlot === "evening") {
      query = query.gte("start_time", "17:00:00").lt("start_time", "21:00:00");
    } else if (filters.timeSlot === "night") {
      query = query.or("start_time.gte.21:00:00,start_time.lt.06:00:00");
    }
  }
  if (filters?.thisWeekend) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = 6 - dayOfWeek;
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + daysUntilSaturday);
    saturday.setHours(0, 0, 0, 0);
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
    sunday.setHours(23, 59, 59, 999);
    query = query.gte("start_date", saturday.toISOString());
    query = query.lte("end_date", sunday.toISOString());
  }
  if (filters?.verifiedOnly) {
    query = query.eq("verified", true);
  }
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,venue_name.ilike.%${filters.search}%`);
  }

  // Apply sorting
  if (filters?.sort === "soonest") {
    query = query.order("start_date", { ascending: true });
  } else if (filters?.sort === "recent") {
    query = query.order("created_at", { ascending: false });
  } else {
    // Trending (default) - would need to join with clicks/saves
    query = query.order("created_at", { ascending: false });
  }

  // Pagination
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  return query;
}

export async function getEventById(id: string) {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      category:event_categories(*),
      subcategory:event_subcategories(*),
      organizer:organizers(*),
      area:event_areas(*),
      tags:event_tags_junction(event_tags(*))
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getEventBySlug(slug: string) {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      category:event_categories(*),
      subcategory:event_subcategories(*),
      organizer:organizers(*),
      area:event_areas(*),
      tags:event_tags_junction(event_tags(*))
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .gte("end_date", new Date().toISOString())
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getTrendingEvents(limit: number = 10) {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      category:event_categories(*),
      organizer:organizers(*),
      area:event_areas(*)
    `)
    .eq("status", "published")
    .gte("start_date", new Date().toISOString())
    .limit(Math.max(limit * 3, 30));

  if (error) throw error;
  const scores = await getTrendingScores((data || []).map((item: any) => item.id));
  const ranked = [...(data || [])].sort(
    (a: any, b: any) => (scores[b.id] || 0) - (scores[a.id] || 0)
  );
  return ranked.slice(0, limit);
}

export async function getCategories() {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_categories")
    .select(`
      *,
      subcategories:event_subcategories(*)
    `)
    .order("order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getAreas() {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_areas")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getFilterOptions() {
  const [categories, areas] = await Promise.all([getCategories(), getAreas()]);
  return { categories, areas };
}

export async function getSimilarEvents(
  eventId: string,
  categoryId?: string | null,
  areaId?: string | null,
  limit: number = 4
) {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  let query = supabase
    .from("events")
    .select(`
      *,
      category:event_categories(*),
      organizer:organizers(*),
      area:event_areas(*)
    `)
    .eq("status", "published")
    .gte("end_date", new Date().toISOString())
    .neq("id", eventId)
    .order("start_date", { ascending: true })
    .limit(limit);

  if (categoryId) query = query.eq("category_id", categoryId);
  if (areaId) query = query.eq("area_id", areaId);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getTrendingScores(eventIds: string[]) {
  if (!eventIds.length || !hasSupabaseEnv()) return {} as Record<string, number>;
  const supabase = await createClient();
  const windowStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: clicks }, { data: saves }] = await Promise.all([
    supabase
      .from("event_clicks")
      .select("event_id")
      .in("event_id", eventIds)
      .gte("clicked_at", windowStart),
    supabase
      .from("saved_events")
      .select("event_id")
      .in("event_id", eventIds),
  ]);

  const scores: Record<string, number> = {};
  for (const id of eventIds) scores[id] = 0;
  for (const click of clicks || []) {
    scores[click.event_id] = (scores[click.event_id] || 0) + 1;
  }
  for (const save of saves || []) {
    scores[save.event_id] = (scores[save.event_id] || 0) + 4;
  }
  return scores;
}
