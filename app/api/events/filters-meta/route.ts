import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { handleRoute } from "@/lib/api/handle-route";

export const revalidate = 300;
export const dynamic = "force-dynamic";

const TIME_SLOTS = [
  { id: "morning", label: "Morning (6:00-12:00)" },
  { id: "afternoon", label: "Afternoon (12:00-17:00)" },
  { id: "evening", label: "Evening (17:00-21:00)" },
  { id: "night", label: "Night (21:00-6:00)" },
];

type Category = { id: string; name: string; slug: string };
type Subcategory = { id: string; name: string; slug: string; category_id: string };
type Area = { id: string; name: string; slug: string };

export const GET = handleRoute(
  {
    route: "/api/events/filters-meta",
    action: "get-filters-meta",
    rateLimitKey: "events-filters-meta",
    rateLimitLimit: 120,
  },
  async (_request, context) => {
    if (!hasSupabaseEnv()) {
      return NextResponse.json(
        {
          categories: [],
          subcategoriesByCategory: {},
          areas: [],
          timeSlots: TIME_SLOTS,
          dateRange: { min: null, max: null },
        },
        { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
      );
    }

    const nowIso = new Date().toISOString();

    const [{ data: eventRows }, { data: categories }, { data: subcategories }, { data: areas }] =
      await Promise.all([
        context.supabase
          .from("events")
          .select("category_id,subcategory_id,area_id,start_date,end_date")
          .eq("status", "published")
          .is("deleted_at", null)
          .gte("end_date", nowIso)
          .limit(2000),
        context.supabase.from("event_categories").select("id,name,slug").order("order", { ascending: true }),
        context.supabase.from("event_subcategories").select("id,name,slug,category_id").order("name"),
        context.supabase.from("event_areas").select("id,name,slug").order("name"),
      ]);

    const rows = eventRows || [];
    const categoryIds = new Set(rows.map((item) => item.category_id).filter(Boolean));
    const subcategoryIds = new Set(rows.map((item) => item.subcategory_id).filter(Boolean));
    const areaIds = new Set(rows.map((item) => item.area_id).filter(Boolean));

    const activeCategories = ((categories || []) as Category[]).filter((item) => categoryIds.has(item.id));
    const activeAreas = ((areas || []) as Area[]).filter((item) => areaIds.has(item.id));
    const activeSubcategories = ((subcategories || []) as Subcategory[]).filter((item) =>
      subcategoryIds.has(item.id)
    );

    const subcategoriesByCategory = activeSubcategories.reduce<Record<string, Subcategory[]>>((acc, item) => {
      if (!acc[item.category_id]) acc[item.category_id] = [];
      acc[item.category_id].push(item);
      return acc;
    }, {});

    const minStart = rows.reduce<string | null>((acc, item) => {
      if (!item.start_date) return acc;
      if (!acc) return item.start_date;
      return item.start_date < acc ? item.start_date : acc;
    }, null);
    const maxEnd = rows.reduce<string | null>((acc, item) => {
      if (!item.end_date) return acc;
      if (!acc) return item.end_date;
      return item.end_date > acc ? item.end_date : acc;
    }, null);

    return NextResponse.json(
      {
        categories: activeCategories,
        subcategoriesByCategory,
        areas: activeAreas,
        timeSlots: TIME_SLOTS,
        dateRange: {
          min: minStart ? minStart.slice(0, 10) : null,
          max: maxEnd ? maxEnd.slice(0, 10) : null,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  }
);

