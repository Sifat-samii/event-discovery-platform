import { notFound } from "next/navigation";
import { getEventBySlug, getSimilarEvents } from "@/lib/db/queries";
import AppShell from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Ticket, ExternalLink, CheckCircle, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import EventCard from "@/components/events/event-card";
import EventActions from "@/components/events/event-actions";
import type { Metadata } from "next";
import TagList from "@/components/ui/tag-list";
import EventViewTracker from "@/components/events/event-view-tracker";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event not found | Kothay Jabo?" };
  return {
    title: `${event.title} | Kothay Jabo?`,
    description: event.description?.slice(0, 160) || "Discover cultural events in Dhaka.",
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      title: event.title,
      description: event.description?.slice(0, 160),
      url: `/events/${event.slug}`,
      images: event.poster_url ? [event.poster_url] : [],
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const similarEvents = await getSimilarEvents(event.id, event.category_id, event.area_id, 3);

  const eventDate = new Date(event.start_date);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const formattedTime = new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
  const day    = eventDate.toLocaleDateString("en-US", { day: "numeric" });
  const month  = eventDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const dayName= eventDate.toLocaleDateString("en-US", { weekday: "short" });
  const isFree = event.price_type === "free";
  const aboutText = event.description || "No event description available yet.";
  const tagNames = ((event.tags || []) as any[]).map((t) => t?.event_tags?.name).filter(Boolean);

  const CAT_GRADIENT: Record<string, string> = {
    music:                     "from-amber-400 to-orange-500",
    "theatre-performing-arts": "from-violet-500 to-pink-500",
    dance:                     "from-cyan-400 to-blue-500",
    "visual-arts":             "from-emerald-400 to-cyan-500",
    "film-media":              "from-indigo-500 to-violet-600",
    "educational-skill-based": "from-blue-500 to-indigo-600",
    "cultural-festivals":      "from-orange-400 to-rose-500",
    literature:                "from-emerald-400 to-teal-500",
  };
  const catSlug = (event.category as { name: string; slug?: string } | null)?.slug ?? "";
  const accentGradient = CAT_GRADIENT[catSlug] ?? "from-amber-400 to-orange-500";

  return (
    <AppShell>
      <EventViewTracker eventId={event.id} />

      {/* ── Hero image (full-bleed) ── */}
      <div className="relative w-full overflow-hidden bg-surface-2" style={{ height: "clamp(240px, 38vh, 480px)" }}>
        {event.poster_url ? (
          <Image
            src={event.poster_url}
            alt={event.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${accentGradient} opacity-40`} />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        {/* Floating info bar */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end gap-3">
              {event.category && (
                <span className={`inline-flex items-center rounded-full bg-gradient-to-r ${accentGradient} px-3 py-1 text-xs font-semibold text-white shadow-md`}>
                  {event.category.name}
                </span>
              )}
              {event.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  <CheckCircle className="h-3 w-3" /> Verified
                </span>
              )}
              {event.featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  <Star className="h-3 w-3" /> Featured
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* ── Main column ── */}
          <div className="space-y-6 lg:col-span-2">

            {/* Title block */}
            <div>
              <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl md:text-4xl">
                {event.title}
              </h1>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Last updated {new Date(event.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>

            {/* Quick info strip */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-surface-1 px-4 py-2.5">
                {/* Date block mini */}
                <div className={`flex w-9 shrink-0 flex-col items-center rounded-lg bg-gradient-to-b ${accentGradient} px-1 py-1 text-center text-white`}>
                  <span className="text-[8px] font-bold leading-none">{month}</span>
                  <span className="text-lg font-black leading-tight">{day}</span>
                  <span className="text-[8px] leading-none opacity-80">{dayName}</span>
                </div>
                <div className="text-sm">
                  <div className="font-semibold">{formattedDate}</div>
                  <div className="text-muted-foreground">{formattedTime}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-surface-1 px-4 py-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="text-sm">
                  <div className="font-semibold">{event.venue_name}</div>
                  {event.area && <div className="text-muted-foreground">{event.area.name}</div>}
                </div>
              </div>

              <div className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 ${isFree ? "border-emerald-500/30 bg-emerald-500/8" : "border-border/50 bg-surface-1"}`}>
                <Ticket className={`h-4 w-4 shrink-0 ${isFree ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`} />
                <div className="text-sm">
                  <div className={`font-semibold ${isFree ? "text-emerald-700 dark:text-emerald-400" : ""}`}>
                    {isFree ? "Free Entry" : `৳${event.price_amount || "TBA"}`}
                  </div>
                  {event.ticket_link && (
                    <a href={event.ticket_link} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-1 text-xs text-primary hover:underline">
                      Get Tickets <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            <div className="glass-surface rounded-2xl p-6">
              <h2 className="mb-3 text-lg font-bold">About This Event</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{aboutText}</p>
              <TagList tags={tagNames} className="mt-4" />
            </div>

            {/* Venue details */}
            {event.venue_address && (
              <div className="glass-surface rounded-2xl p-6">
                <h2 className="mb-4 text-lg font-bold">Venue</h2>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold">{event.venue_name}</div>
                    <div className="text-sm text-muted-foreground">{event.venue_address}</div>
                    {event.area && <div className="mt-0.5 text-xs text-muted-foreground">{event.area.name} area</div>}
                    {event.venue_coordinates && (
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue_name} ${event.venue_address}`)}`}
                         target="_blank" rel="noreferrer"
                         className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/12 transition-colors">
                        <MapPin className="h-3 w-3" /> Open in Google Maps
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Organizer */}
            {event.organizer && (
              <div className="glass-surface rounded-2xl p-6">
                <h2 className="mb-3 text-lg font-bold">Organizer</h2>
                <Link href={`/organizers/${event.organizer.id}`}
                      className="group flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accentGradient} text-sm font-bold text-white`}>
                    {(event.organizer as { name: string; verified?: boolean }).name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-semibold group-hover:text-primary transition-colors">
                      {(event.organizer as { name: string; verified?: boolean }).name}
                      {(event.organizer as { name: string; verified?: boolean }).verified && (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">View organizer profile</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5 lg:sticky lg:top-20 lg:h-fit">
            <EventActions eventId={event.id} eventSlug={event.slug} />

            {/* Similar events */}
            {similarEvents.length > 0 && (
              <div className="rounded-2xl border border-border/50 bg-surface-1 p-5 shadow-[var(--shadow-1)]">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  You might also like
                </h3>
                <div className="space-y-3">
                  {similarEvents.map((similar) => (
                    <EventCard key={similar.id} event={similar} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
