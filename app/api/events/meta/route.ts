import { NextResponse } from "next/server";
import { handleRoute } from "@/lib/api/handle-route";

export const GET = handleRoute(
  {
    route: "/api/events/meta",
    action: "get-events-meta",
    rateLimitKey: "events-meta",
    rateLimitLimit: 120,
  },
  async (_request, context) => {
    const [{ data: categories }, { data: areas }] = await Promise.all([
      context.supabase
        .from("event_categories")
        .select("id,name,slug")
        .order("order", { ascending: true }),
      context.supabase.from("event_areas").select("id,name,slug").order("name", { ascending: true }),
    ]);
    return NextResponse.json({ categories: categories || [], areas: areas || [] });
  }
);
