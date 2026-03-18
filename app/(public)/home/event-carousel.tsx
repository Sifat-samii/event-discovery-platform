"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import EventCard from "@/components/events/event-card";
import Carousel from "@/components/ui/carousel";
import ScrollReveal from "@/components/ui/scroll-reveal";
import { cn } from "@/lib/utils";

interface EventCarouselProps {
  title: string;
  subtitle: string;
  events: any[];
  href: string;
  variant?: "default" | "surface";
}

export default function EventCarousel({
  title,
  subtitle,
  events,
  href,
  variant = "default",
}: EventCarouselProps) {
  if (events.length === 0) return null;

  return (
    <ScrollReveal>
      <section
        className={cn(
          variant === "surface" && "rounded-3xl bg-surface-1/40 border border-border/15 p-6 md:p-8"
        )}
      >
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Link href={href}>
            <Button variant="ghost" size="sm" className="group">
              View All
              <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>

        <Carousel showDots>
          {events.map((event: any, i: number) => (
            <div key={event.id} className="w-[280px] sm:w-[300px] lg:w-[320px]">
              <EventCard event={event} index={i} />
            </div>
          ))}
        </Carousel>
      </section>
    </ScrollReveal>
  );
}
