"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const CAT_ACCENT: Record<string, string> = {
  music:                     "from-amber-400 to-orange-500",
  "theatre-performing-arts": "from-violet-500 to-pink-500",
  dance:                     "from-cyan-400 to-blue-500",
  "visual-arts":             "from-emerald-400 to-cyan-500",
  "film-media":              "from-indigo-500 to-violet-600",
  "educational-skill-based": "from-blue-500 to-indigo-600",
  "cultural-festivals":      "from-orange-400 to-rose-500",
  literature:                "from-emerald-400 to-teal-500",
};

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
    category?: { name: string; slug?: string } | null;
    verified?: boolean;
    featured?: boolean;
  };
  className?: string;
}

export default function EventCard({ event, className }: EventCardProps) {
  const eventDate = new Date(event.start_date);
  const day = eventDate.toLocaleDateString("en-US", { day: "numeric" });
  const month = eventDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const dayName = eventDate.toLocaleDateString("en-US", { weekday: "short" });
  const formattedTime = new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const isFree = event.price_type === "free";
  const catSlug = (event.category as { name: string; slug?: string } | null)?.slug ?? "";
  const accentGradient = CAT_ACCENT[catSlug] ?? "from-amber-400 to-orange-500";

  return (
    <Link href={`/events/${event.slug}`} className={cn("group block outline-none", className)}>
      <motion.div
        whileHover={{ y: -5, scale: 1.015 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-surface-1 shadow-[var(--shadow-card)]
                   transition-shadow duration-200 group-hover:shadow-[var(--shadow-2)]"
      >
        {/* ── Top accent line ── */}
        <div className={`h-0.5 w-full bg-gradient-to-r ${accentGradient}`} />

        {/* ── Image ── */}
        <div className="relative aspect-video overflow-hidden bg-surface-2">
          {event.poster_url ? (
            <Image
              src={event.poster_url}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br ${accentGradient} opacity-30`}>
              <Calendar className="h-7 w-7 text-white" />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

          {/* Price badge */}
          <div className="absolute right-2.5 top-2.5">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm",
                isFree
                  ? "bg-emerald-500/90 text-white"
                  : "border border-white/20 bg-black/60 text-white"
              )}
            >
              {isFree ? "FREE" : `৳${event.price_amount || "TBA"}`}
            </span>
          </div>

          {/* Category badge */}
          {event.category && (
            <div className="absolute left-2.5 top-2.5">
              <span className={`inline-flex items-center rounded-full bg-gradient-to-r ${accentGradient} px-2.5 py-1 text-[11px] font-semibold text-white shadow-md`}>
                {event.category.name}
              </span>
            </div>
          )}

          {/* Featured badge */}
          {event.featured && (
            <div className="absolute bottom-2.5 left-2.5">
              <span className="badge-gradient text-[11px]">⭐ Featured</span>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Date block with gradient */}
            <div className={`flex w-10 shrink-0 flex-col items-center rounded-xl bg-gradient-to-b ${accentGradient} p-1.5 text-center text-white`}>
              <span className="text-[10px] font-bold leading-none opacity-90">{month}</span>
              <span className="text-xl font-black leading-tight tabular-nums">{day}</span>
              <span className="text-[10px] leading-none opacity-80">{dayName}</span>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-bold leading-snug transition-colors duration-150 group-hover:text-primary">
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
                  <span className="flex items-center gap-0.5 text-emerald-500">
                    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor" aria-label="Verified">
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                    <span className="text-[10px] font-medium">Verified</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
