import { getTrendingEvents, getCategories } from "@/lib/db/queries";
import EventCard from "@/components/events/event-card";
import CategoryCard from "@/components/events/category-card";
import AppShell from "@/components/layout/app-shell";
import HeroSection from "@/components/layout/hero-section";
import { AnimatedGrid, AnimatedItem, FadeUp } from "@/components/events/animated-section";
import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createMetadata } from "@/lib/metadata/defaults";
import { ArrowRight, TrendingUp, Clock, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import DhakaSkyline from "@/components/ui/dhaka-skyline";

type HomeEvent = Awaited<ReturnType<typeof getTrendingEvents>>[number];
type HomeCategory = { id: string; name: string; slug: string };

export const metadata: Metadata = createMetadata({
  title: "Kothay Jabo? — Discover Events in Dhaka",
  description:
    "Find concerts, workshops, exhibitions, theatre and more happening across Dhaka, Bangladesh.",
  alternates: { canonical: "/home" },
  openGraph: {
    title: "Kothay Jabo? — Discover Events in Dhaka",
    description:
      "Find concerts, workshops, exhibitions, theatre and more happening across Dhaka, Bangladesh.",
    url: "/home",
  },
});

function SectionHeader({
  icon,
  title,
  viewAllHref,
  viewAllLabel = "View all",
  accent,
}: {
  icon?: ReactNode;
  title: string;
  viewAllHref: string;
  viewAllLabel?: string;
  accent?: string;
}) {
  return (
    <FadeUp className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md ${accent ?? "bg-gradient-to-br from-brand-gold to-brand-coral"}`}>
            {icon}
          </div>
        )}
        <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
      </div>
      <Link
        href={viewAllHref}
        className="group flex items-center gap-1.5 rounded-full border border-border/60 px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:border-brand-gold/50 hover:text-brand-gold"
      >
        {viewAllLabel}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </FadeUp>
  );
}

export default async function HomePage() {
  const trendingEvents = await getTrendingEvents(8);
  const categories = await getCategories();

  const freeEvents = trendingEvents.filter((e: HomeEvent) => e?.price_type === "free").slice(0, 6);
  const newlyAdded = trendingEvents.slice(0, 6);

  return (
    <AppShell>
      {/* ──────────────── HERO ──────────────── */}
      <HeroSection />

      <div className="space-y-20 py-16">

        {/* ──────────────── TRENDING ──────────────── */}
        <section className="page-wrap">
          <SectionHeader
            icon={<TrendingUp className="h-4 w-4" />}
            title="Trending This Week"
            viewAllHref="/browse?sort=trending"
            accent="bg-gradient-to-br from-brand-gold to-brand-coral"
          />
          {trendingEvents.length > 0 ? (
            <AnimatedGrid className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {trendingEvents.map((event: HomeEvent) => (
                <AnimatedItem key={event.id}>
                  <EventCard event={event} />
                </AnimatedItem>
              ))}
            </AnimatedGrid>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No trending events right now — check back soon.
            </p>
          )}
        </section>

        {/* ──────────────── CATEGORIES ──────────────── */}
        {categories.length > 0 && (
          <section className="page-wrap">
            <SectionHeader
              title="Browse by Category"
              viewAllHref="/browse"
              icon={<Sparkles className="h-4 w-4" />}
              accent="bg-gradient-to-br from-brand-teal to-brand-blue"
            />
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {categories.slice(0, 12).map((category: HomeCategory, i: number) => (
                <CategoryCard key={category.id} category={category} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ──────────────── THIS WEEKEND ──────────────── */}
        <section className="relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-teal/6 via-transparent to-brand-purple/6" />
          <div className="absolute inset-0 pattern-dots opacity-30" />
          {/* Skyline accent */}
          <DhakaSkyline className="pointer-events-none absolute bottom-0 left-0 right-0 text-brand-teal/12 dark:text-brand-teal/08" />

          <div className="relative z-10 page-wrap py-12">
            <SectionHeader
              icon={<Clock className="h-4 w-4" />}
              title="This Weekend"
              viewAllHref="/browse?this_weekend=true"
              accent="bg-gradient-to-br from-brand-teal to-brand-blue"
            />
            <AnimatedGrid className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {trendingEvents.slice(0, 3).map((event: HomeEvent) => (
                <AnimatedItem key={event.id}>
                  <EventCard event={event} />
                </AnimatedItem>
              ))}
            </AnimatedGrid>
          </div>
        </section>

        {/* ──────────────── FREE EVENTS ──────────────── */}
        {freeEvents.length > 0 && (
          <section className="page-wrap">
            <SectionHeader
              title="Free to Attend"
              viewAllHref="/browse?price_type=free"
              viewAllLabel="See all free"
              icon={<span className="text-sm">🎫</span>}
              accent="bg-gradient-to-br from-brand-emerald to-brand-teal"
            />
            <AnimatedGrid className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {freeEvents.map((event: HomeEvent) => (
                <AnimatedItem key={event.id}>
                  <EventCard event={event} />
                </AnimatedItem>
              ))}
            </AnimatedGrid>
          </section>
        )}

        {/* ──────────────── NEWLY ADDED ──────────────── */}
        <section className="page-wrap">
          <SectionHeader
            title="Newly Added"
            viewAllHref="/browse?sort=recent"
            icon={<Zap className="h-4 w-4" />}
            accent="bg-gradient-to-br from-brand-purple to-brand-pink"
          />
          <AnimatedGrid className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {newlyAdded.map((event: HomeEvent) => (
              <AnimatedItem key={event.id}>
                <EventCard event={event} />
              </AnimatedItem>
            ))}
          </AnimatedGrid>
        </section>

        {/* ──────────────── CTA BANNER ──────────────── */}
        <section className="page-wrap">
          <FadeUp>
            <div className="relative overflow-hidden rounded-3xl">
              {/* Multi-color gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-gold via-brand-coral to-brand-purple opacity-90" />
              {/* Orb glows */}
              <div className="pointer-events-none absolute -left-16 -top-16 h-60 w-60 rounded-full bg-white/15 blur-[60px]" />
              <div className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-[50px]" />
              {/* Dot pattern */}
              <div className="absolute inset-0 opacity-20 pattern-dots" />
              {/* Skyline silhouette */}
              <DhakaSkyline className="pointer-events-none absolute bottom-0 left-0 right-0 text-white/10" />

              {/* Content */}
              <div className="relative z-10 px-8 py-14 text-center text-white">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Are you an organizer?
                </div>
                <h3 className="mb-3 text-3xl font-black md:text-4xl">
                  List Your Event on Kothay Jabo?
                </h3>
                <p className="mx-auto mb-8 max-w-md text-base text-white/80">
                  Reach thousands of event lovers in Dhaka. Submit your event in minutes — it&apos;s free.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/organizer">
                    <Button
                      className="rounded-full bg-white font-bold text-orange-600 shadow-xl hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                      size="lg"
                    >
                      Submit Your Event
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/browse">
                    <Button
                      variant="outline"
                      className="rounded-full border-white/50 text-white hover:bg-white/15 hover:border-white"
                      size="lg"
                    >
                      Browse Events
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </FadeUp>
        </section>

      </div>
    </AppShell>
  );
}
