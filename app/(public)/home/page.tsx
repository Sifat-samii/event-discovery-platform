import { getTrendingEvents, getCategories } from "@/lib/db/queries";
import EventCard from "@/components/events/event-card";
import AppShell from "@/components/layout/app-shell";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import QuickChips from "@/components/events/quick-chips";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createMetadata } from "@/lib/metadata/defaults";
import { ArrowRight, TrendingUp, Sparkles, Clock, Tag } from "lucide-react";

type HomeEvent = Awaited<ReturnType<typeof getTrendingEvents>>[number];
type HomeCategory = { id: string; name: string; slug: string };

const CATEGORY_EMOJI: Record<string, string> = {
  music: "🎵",
  "theatre-performing-arts": "🎭",
  dance: "💃",
  "visual-arts": "🎨",
  "film-media": "🎬",
  literature: "📚",
  "educational-skill-based": "🧠",
  "cultural-festivals": "🎪",
  "hobby-lifestyle": "✨",
  competitions: "🏆",
};

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
}: {
  icon?: ReactNode;
  title: string;
  viewAllHref: string;
  viewAllLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon && <span className="text-primary">{icon}</span>}
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <Link
        href={viewAllHref}
        className="group flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        {viewAllLabel}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const trendingEvents = await getTrendingEvents(8);
  const categories = await getCategories();

  const freeEvents = trendingEvents
    .filter((e: HomeEvent) => e?.price_type === "free")
    .slice(0, 6);
  const newlyAdded = trendingEvents.slice(0, 6);

  return (
    <AppShell>
      <div className="space-y-16 py-6 pb-10">

        {/* ── Hero ─────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-2xl px-6 py-16 md:py-24">
          {/* Layered ambient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-surface-1 via-background to-surface-1" />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-16 -top-16 h-80 w-80 rounded-full bg-primary/18 blur-[90px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 top-8 h-64 w-64 rounded-full bg-amber-400/10 blur-[72px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-orange-500/8 blur-[60px]"
          />

          {/* Content */}
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/22 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Dhaka&apos;s Premier Events Guide
            </div>

            <h1 className="mb-4 text-4xl font-bold leading-[1.12] tracking-tight md:text-6xl">
              <span className="gradient-text">Kothay Jabo?</span>
            </h1>
            <p className="mb-2 text-xl font-semibold text-foreground md:text-2xl">
              Where to go in Dhaka — we&apos;ll tell you.
            </p>

            <p className="mx-auto mb-8 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">
              Concerts, workshops, exhibitions, theatre —{" "}
              <br className="hidden sm:block" />
              all the best events in the city, in one place.
            </p>

            <div className="mb-8 flex flex-wrap justify-center gap-3">
              <Link href="/browse">
                <Button size="lg" className="h-12 gap-2 px-6">
                  Browse Events
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/organizer">
                <Button variant="outline" size="lg" className="h-12 px-6">
                  Submit Event
                </Button>
              </Link>
            </div>

            <QuickChips />
          </div>
        </section>

        {/* ── Trending ─────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<TrendingUp className="h-5 w-5" />}
            title="Trending This Week"
            viewAllHref="/browse?sort=trending"
          />
          {trendingEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trendingEvents.map((event: HomeEvent) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No trending events right now. Check back soon.
            </p>
          )}
        </section>

        {/* ── Categories ───────────────────────────────── */}
        {categories.length > 0 && (
          <section>
            <SectionHeader
              title="Browse by Category"
              viewAllHref="/browse"
              icon={<Tag className="h-5 w-5" />}
            />
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {categories.slice(0, 12).map((category: HomeCategory) => (
                <Link
                  key={category.id}
                  href={`/browse?category=${category.slug}`}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-surface-1 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/28 hover:bg-surface-2 hover:shadow-[0_4px_16px_rgba(255,138,0,0.06)]"
                >
                  <span className="text-2xl leading-none">
                    {CATEGORY_EMOJI[category.slug] ?? "🎪"}
                  </span>
                  <span className="text-xs font-medium leading-tight text-muted-foreground transition-colors group-hover:text-foreground">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── This Weekend ─────────────────────────────── */}
        <section className="relative overflow-hidden rounded-2xl border border-border/40 bg-surface-1/60 px-6 py-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-[60px]"
          />
          <div className="relative z-10">
            <SectionHeader
              icon={<Clock className="h-5 w-5" />}
              title="This Weekend"
              viewAllHref="/browse?this_weekend=true"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trendingEvents.slice(0, 3).map((event: HomeEvent) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Free Events ──────────────────────────────── */}
        {freeEvents.length > 0 && (
          <section>
            <SectionHeader
              title="Free to Attend"
              viewAllHref="/browse?price_type=free"
              viewAllLabel="See all free"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {freeEvents.map((event: HomeEvent) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* ── Newly Added ──────────────────────────────── */}
        <section>
          <SectionHeader title="Newly Added" viewAllHref="/browse?sort=recent" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newlyAdded.map((event: HomeEvent) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────── */}
        <section className="relative overflow-hidden rounded-2xl border border-primary/18 bg-gradient-to-br from-primary/14 via-orange-500/8 to-amber-500/10 px-8 py-12 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-primary/20 blur-[70px]"
          />
          <div className="relative z-10">
            <p className="section-label mb-3">Are you an organizer?</p>
            <h3 className="mb-2 text-2xl font-bold">List Your Event on Kothay Jabo?</h3>
            <p className="mx-auto mb-7 max-w-sm text-sm text-muted-foreground">
              Reach thousands of event lovers in Dhaka. Submit your event in minutes — it&apos;s free.
            </p>
            <Link href="/organizer">
              <Button variant="glow" size="lg" className="gap-2">
                Submit Your Event
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
