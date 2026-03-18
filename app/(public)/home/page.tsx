import { Suspense } from "react";
import { getTrendingEvents, getCategories } from "@/lib/db/queries";
import AppShell from "@/components/layout/app-shell";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import QuickChips from "@/components/events/quick-chips";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata/defaults";
import HeroSection from "./hero-section";
import EventCarousel from "./event-carousel";
import StatsSection from "./stats-section";
import FeaturesGrid from "./features-grid";
import CategoryGrid from "./category-grid";
import CtaSection from "./cta-section";

type HomeEvent = Awaited<ReturnType<typeof getTrendingEvents>>[number];
type HomeCategory = { id: string; name: string; slug: string };

export const metadata: Metadata = createMetadata({
  title: "Kothay Jabo? — Discover Events in Dhaka",
  description:
    "Find concerts, workshops, exhibitions, and more happening across Dhaka, Bangladesh.",
  alternates: {
    canonical: "/home",
  },
  openGraph: {
    title: "Kothay Jabo? — Discover Events in Dhaka",
    description:
      "Find concerts, workshops, exhibitions, and more happening across Dhaka, Bangladesh.",
    url: "/home",
  },
});

export default async function HomePage() {
  const trendingEvents = await getTrendingEvents(8);
  const categories = await getCategories();

  const thisWeekendEvents = trendingEvents.slice(0, 6);
  const freeEvents = trendingEvents.filter((e: HomeEvent) => e?.price_type === "free").slice(0, 6);
  const newlyAdded = trendingEvents.slice(0, 6);

  return (
    <AppShell>
      <div className="space-y-20 pb-10">
        <HeroSection />

        <Suspense fallback={null}>
          <QuickChips />
        </Suspense>

        <StatsSection />

        <EventCarousel
          title="Trending This Week"
          subtitle="Most popular events right now"
          events={trendingEvents}
          href="/browse?sort=trending"
        />

        <EventCarousel
          title="This Weekend"
          subtitle="Plans for Saturday and Sunday"
          events={thisWeekendEvents}
          href="/browse?this_weekend=true"
          variant="surface"
        />

        <FeaturesGrid />

        <EventCarousel
          title="Free Events"
          subtitle="No ticket needed"
          events={freeEvents}
          href="/browse?price_type=free"
        />

        <CategoryGrid categories={categories} />

        <EventCarousel
          title="Newly Added"
          subtitle="Fresh on the platform"
          events={newlyAdded}
          href="/browse?sort=recent"
        />

        <CtaSection />
      </div>
    </AppShell>
  );
}
