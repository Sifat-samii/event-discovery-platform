import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

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
  className?: string;
}

export default function EventCard({ event, className }: EventCardProps) {
  const eventDate = new Date(event.start_date);
  const day = eventDate.toLocaleDateString("en-US", { day: "numeric" });
  const month = eventDate.toLocaleDateString("en-US", { month: "short" });
  const dayName = eventDate.toLocaleDateString("en-US", { weekday: "short" });
  const formattedTime = new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString(
    "en-US",
    { hour: "numeric", minute: "2-digit", hour12: true }
  );
  const isFree = event.price_type === "free";

  return (
    <Link href={`/events/${event.slug}`} className={cn("group block outline-none", className)}>
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-surface-1 transition-all duration-200 hover:-translate-y-1 hover:border-border hover:shadow-[0_16px_40px_rgba(0,0,0,0.45),0_0_20px_rgba(255,138,0,0.07)]">

        {/* ── Image ── */}
        <div className="relative aspect-video overflow-hidden bg-surface-2">
          {event.poster_url ? (
            <Image
              src={event.poster_url}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-surface-2 to-surface-3">
              <Calendar className="h-6 w-6 text-primary/40" />
              <span className="text-xs text-muted-foreground">No image</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          {/* Price badge — top right */}
          <div className="absolute right-2.5 top-2.5">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm",
                isFree
                  ? "border border-success/30 bg-success/20 text-success"
                  : "border border-white/15 bg-black/55 text-white"
              )}
            >
              {isFree ? "Free" : `৳${event.price_amount || "TBA"}`}
            </span>
          </div>

          {/* Category — top left */}
          {event.category && (
            <div className="absolute left-2.5 top-2.5">
              <span className="inline-flex items-center rounded-full border border-white/12 bg-black/55 px-2 py-0.5 text-[11px] text-white/85 backdrop-blur-sm">
                {event.category.name}
              </span>
            </div>
          )}

          {/* Featured ribbon — bottom left */}
          {event.featured && (
            <div className="absolute bottom-2.5 left-2.5">
              <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                ⭐ Featured
              </span>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="p-3.5">
          <div className="flex items-start gap-3">
            {/* Date block */}
            <div className="flex w-9 shrink-0 flex-col items-center pt-0.5 text-center">
              <span className="text-[10px] font-semibold uppercase leading-none text-primary">
                {month}
              </span>
              <span className="text-[22px] font-bold leading-tight tabular-nums">
                {day}
              </span>
              <span className="text-[10px] leading-none text-muted-foreground">
                {dayName}
              </span>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors duration-150 group-hover:text-primary">
                {event.title}
              </h3>

              <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {event.venue_name}
                  {event.area ? ` · ${event.area.name}` : ""}
                </span>
              </div>

              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span>{formattedTime}</span>
                </div>
                {event.verified && (
                  <span className="flex items-center gap-0.5 text-success">
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 12 12"
                      fill="currentColor"
                      aria-label="Verified"
                    >
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                    <span className="text-[10px]">Verified</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
