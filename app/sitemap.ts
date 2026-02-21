import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eventsdhaka.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/home`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  if (!hasSupabaseEnv()) {
    return staticRoutes;
  }

  const supabase = await createClient();
  const [{ data: categories }, { data: events }, { data: organizers }] = await Promise.all([
    supabase.from("event_categories").select("slug"),
    supabase
      .from("events")
      .select("slug, updated_at")
      .eq("status", "published")
      .gte("end_date", new Date().toISOString())
      .limit(5000),
    supabase
      .from("organizers")
      .select("id, updated_at")
      .eq("verified", true)
      .limit(2000),
  ]);

  const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((category: any) => ({
    url: `${baseUrl}/browse?categories=${encodeURIComponent(category.slug)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const eventRoutes: MetadataRoute.Sitemap = (events || []).map((event: any) => ({
    url: `${baseUrl}/events/${event.slug}`,
    lastModified: event.updated_at ? new Date(event.updated_at) : new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const organizerRoutes: MetadataRoute.Sitemap = (organizers || []).map((organizer: any) => ({
    url: `${baseUrl}/organizers/${organizer.id}`,
    lastModified: organizer.updated_at ? new Date(organizer.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...eventRoutes,
    ...organizerRoutes,
  ];
}
