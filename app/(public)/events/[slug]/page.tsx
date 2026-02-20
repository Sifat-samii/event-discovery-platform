import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/db/queries";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, DollarSign, ExternalLink, Share2, Flag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

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
    <>
      <Header />
      <main className="min-h-screen container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Poster */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
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
            <div className="border rounded-lg p-6 space-y-4">
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
              <div className="border rounded-lg p-6">
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
            <div className="border rounded-lg p-6 space-y-4 sticky top-4">
              <Button className="w-full">Save Event</Button>
              <Button variant="outline" className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" className="w-full">
                Add to Calendar
              </Button>
              <Button variant="outline" className="w-full text-destructive">
                <Flag className="h-4 w-4 mr-2" />
                Report Incorrect Info
              </Button>
            </div>

            {/* Google Maps */}
            {event.venue_coordinates && (
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Location</h3>
                <div className="aspect-video bg-muted rounded">
                  {/* Google Maps embed would go here */}
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    Map View
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
