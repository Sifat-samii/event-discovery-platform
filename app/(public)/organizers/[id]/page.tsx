import { notFound } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import EventCard from "@/components/events/event-card";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabase = await createClient();
  const { data: organizer } = await supabase
    .from("organizers")
    .select("id,name,description")
    .eq("id", params.id)
    .maybeSingle();

  if (!organizer) {
    return { title: "Organizer not found | Events Dhaka" };
  }
  return {
    title: `${organizer.name} | Organizer | Events Dhaka`,
    description: organizer.description?.slice(0, 160) || `Explore events from ${organizer.name}.`,
    alternates: { canonical: `/organizers/${organizer.id}` },
    openGraph: {
      title: organizer.name,
      description: organizer.description?.slice(0, 160),
      url: `/organizers/${organizer.id}`,
    },
  };
}

export default async function OrganizerProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: organizer, error } = await supabase
    .from("organizers")
    .select("id,name,description,verified,website,social_links,created_at")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !organizer) {
    notFound();
  }

  const { data: events } = await supabase
    .from("events")
    .select(`
      *,
      category:event_categories(*),
      organizer:organizers(*),
      area:event_areas(*)
    `)
    .eq("organizer_id", organizer.id)
    .eq("status", "published")
    .gte("end_date", new Date().toISOString())
    .order("start_date", { ascending: true })
    .limit(50);

  return (
    <AppShell>
      <div className="min-h-screen py-8">
        <div className="glass-surface rounded-xl p-6">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{organizer.name}</h1>
            {organizer.verified ? <Badge>Verified</Badge> : null}
          </div>
          {organizer.description ? (
            <p className="mt-3 text-sm text-muted-foreground">{organizer.description}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {organizer.website ? (
              <a className="text-primary hover:underline" href={organizer.website} target="_blank" rel="noreferrer">
                Website
              </a>
            ) : null}
            <span>
              Organizer since {new Date(organizer.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="mb-4 text-2xl font-semibold">Published events</h2>
          {events?.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface-1 p-6 text-sm text-muted-foreground">
              No published events yet.
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
