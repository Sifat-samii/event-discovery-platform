"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import TiltCard from "@/components/ui/tilt-card";
import { motion } from "framer-motion";

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
  index?: number;
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  if (!event) return null;
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
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link href={`/events/${event.slug}`} className="block group">
        <TiltCard className="glass-card overflow-hidden shine-border" tiltDeg={6}>
          <div className="relative aspect-[16/10] bg-surface-2/50 overflow-hidden">
            {event.poster_url ? (
              <Image
                src={event.poster_url}
                alt={event.title}
                fill
                className="object-cover transition-transform duration-700 ease-spring group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center mesh-gradient">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-3/60 backdrop-blur-sm">
                  <Calendar className="h-6 w-6 text-muted-foreground/50" />
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute top-3 left-3 flex gap-1.5">
              {event.featured && (
                <Badge className="text-[10px] bg-primary/90 text-white border-0 backdrop-blur-md shadow-sm">
                  Featured
                </Badge>
              )}
              {event.verified && (
                <Badge variant="secondary" className="text-[10px] bg-surface-1/80 backdrop-blur-md border-0 shadow-sm">
                  Verified
                </Badge>
              )}
            </div>

            {event.price_type === "free" ? (
              <div className="absolute top-3 right-3">
                <span className="rounded-lg bg-success/90 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                  Free
                </span>
              </div>
            ) : event.price_amount ? (
              <div className="absolute top-3 right-3">
                <span className="rounded-lg bg-surface-1/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-foreground shadow-sm">
                  ৳{event.price_amount}
                </span>
              </div>
            ) : null}

            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <div className="flex items-center gap-2 text-white/90 text-[12px] font-medium">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formattedDate} &middot; {formattedTime}</span>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-2.5">
            <h3 className="text-[15px] font-semibold tracking-tight line-clamp-2 group-hover:text-primary transition-colors duration-base">
              {event.title}
            </h3>

            <div className="flex items-center gap-3">
              {event.category && (
                <span className="inline-flex items-center rounded-md bg-primary/8 px-2 py-0.5 text-[10px] font-semibold text-primary/90 uppercase tracking-wider">
                  {event.category.name}
                </span>
              )}
              <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground min-w-0">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {event.venue_name}
                  {event.area && ` · ${event.area.name}`}
                </span>
              </div>
            </div>
          </div>
        </TiltCard>
      </Link>
    </motion.div>
  );
}
