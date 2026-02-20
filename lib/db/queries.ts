import { createClient } from "@/lib/supabase/server";

// Event queries
export async function getEvents(filters?: {
  category?: string;
  subcategory?: string;
  area?: string;
  dateFrom?: string;
  dateTo?: string;
  priceType?: "free" | "paid";
  timeSlot?: "morning" | "afternoon" | "evening" | "night";
  thisWeekend?: boolean;
  search?: string;
  sort?: "soonest" | "trending" | "recent";
  page?: number;
  limit?: number;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("events")
    .select(`
      *,
      category:event_categories(*),
      subcategory:event_subcategories(*),
      organizer:organizers(*),
      area:event_areas(*),
      tags:event_tags_junction(event_tags(*))
    `)
    .eq("status", "published");

  // Apply filters
  if (filters?.category) {
    query = query.eq("category_id", filters.category);
  }
  if (filters?.subcategory) {
    query = query.eq("subcategory_id", filters.subcategory);
  }
  if (filters?.area) {
    query = query.eq("area_id", filters.area);
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
    .single();

  if (error) throw error;
  return data;
}

export async function getTrendingEvents(limit: number = 10) {
  const supabase = await createClient();
  // This is a simplified version - in production, you'd join with clicks/saves
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
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getCategories() {
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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_areas")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}
