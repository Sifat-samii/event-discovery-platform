import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign } from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    slug: string;
    title: string;
    poster_url?: string | null;
    start_date: string;
    start_time: string;
    venue_name: string;
    area?: { name: string } | null;
    price_type: string;
    price_amount?: number | null;
    category?: { name: string } | null;
    verified?: boolean;
    featured?: boolean;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.start_date);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const formattedTime = new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString(
    "en-US",
    { hour: "numeric", minute: "2-digit", hour12: true }
  );

  return (
    <Link href={`/events/${event.slug}`} className="block group">
      <div className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-video bg-muted">
          {event.poster_url ? (
            <Image
              src={event.poster_url}
              alt={event.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          {event.featured && (
            <Badge className="absolute top-2 right-2 bg-primary">Featured</Badge>
          )}
          {event.verified && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              Verified
            </Badge>
          )}
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
          </div>
          {event.category && (
            <Badge variant="outline" className="text-xs">
              {event.category.name}
            </Badge>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate} at {formattedTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">
              {event.venue_name}
              {event.area && `, ${event.area.name}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4" />
            <span>
              {event.price_type === "free" ? "Free" : `৳${event.price_amount || "TBA"}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
