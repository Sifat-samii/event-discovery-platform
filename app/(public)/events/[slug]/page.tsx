import { notFound } from "next/navigation";
import { getEventBySlug, getSimilarEvents } from "@/lib/db/queries";
import AppShell from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import EventCard from "@/components/events/event-card";
import EventActions from "@/components/events/event-actions";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);
  if (!event) {
    return {
      title: "Event not found | Events Dhaka",
    };
  }

  return {
    title: `${event.title} | Events Dhaka`,
    description: event.description?.slice(0, 160) || "Discover cultural events in Dhaka.",
    openGraph: {
      title: event.title,
      description: event.description?.slice(0, 160),
      images: event.poster_url ? [event.poster_url] : [],
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  const similarEvents = await getSimilarEvents(
    event.id,
    event.category_id,
    event.area_id,
    4
  );

  const eventDate = new Date(event.start_date);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString(
    "en-US",
    { hour: "numeric", minute: "2-digit", hour12: true }
  );

  return (
    <AppShell>
      <div className="min-h-screen py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Poster */}
            <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-2">
              {event.poster_url ? (
                <Image
                  src={event.poster_url}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image Available
                </div>
              )}
            </div>

            {/* Title and Badges */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <div className="flex gap-2">
                  {event.verified && <Badge>Verified</Badge>}
                  {event.featured && <Badge variant="secondary">Featured</Badge>}
                </div>
              </div>
              {event.category && (
                <Badge variant="outline" className="mb-4">
                  {event.category.name}
                </Badge>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
            </div>

            {/* Event Details */}
            <div className="glass-surface rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Date & Time</div>
                  <div className="text-muted-foreground">
                    {formattedDate} at {formattedTime}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Venue</div>
                  <div className="text-muted-foreground">{event.venue_name}</div>
                  <div className="text-sm text-muted-foreground">{event.venue_address}</div>
                  {event.area && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Area: {event.area.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Price</div>
                  <div className="text-muted-foreground">
                    {event.price_type === "free" ? "Free" : `৳${event.price_amount || "TBA"}`}
                  </div>
                </div>
              </div>

              {event.ticket_link && (
                <div>
                  <a
                    href={event.ticket_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Get Tickets
                  </a>
                </div>
              )}
            </div>

            {/* Organizer */}
            {event.organizer && (
              <div className="glass-surface rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Organizer</h2>
                <Link
                  href={`/organizers/${event.organizer.id}`}
                  className="text-primary hover:underline"
                >
                  {event.organizer.name}
                </Link>
                {event.organizer.verified && (
                  <Badge variant="secondary" className="ml-2">Verified</Badge>
                )}
              </div>
            )}

            {/* Last Updated */}
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date(event.updated_at).toLocaleDateString()}
            </div>
          </div>

          {/* Sidebar */}
            <div className="space-y-4">
            <EventActions eventId={event.id} eventSlug={event.slug} />

            {/* Google Maps */}
            {event.venue_coordinates && (
              <div className="glass-surface rounded-xl p-6">
                <h3 className="font-semibold mb-4">Location</h3>
                <div className="aspect-video bg-muted rounded">
                  {/* Google Maps embed would go here */}
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    Map View
                  </div>
                </div>
              </div>
            )}

            {similarEvents.length > 0 && (
              <div className="glass-surface rounded-xl p-6">
                <h3 className="font-semibold mb-4">Similar Events</h3>
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
