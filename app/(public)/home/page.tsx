import { getTrendingEvents, getCategories } from "@/lib/db/queries";
import EventCard from "@/components/events/event-card";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  // Fetch data (in production, these would be real queries)
  const trendingEvents = await getTrendingEvents(8);
  const categories = await getCategories();

  // Get this weekend events (simplified - would need proper date logic)
  const thisWeekendEvents = trendingEvents.slice(0, 6);
  const freeEvents = trendingEvents.filter((e: any) => e.price_type === "free").slice(0, 6);
  const newlyAdded = trendingEvents.slice(0, 6);

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Cultural Events in Dhaka
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Find concerts, workshops, exhibitions, and more happening across the city
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/browse">
                <Button size="lg">Browse Events</Button>
              </Link>
              <Link href="/organizer">
                <Button variant="outline" size="lg">Submit Event</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Trending This Week */}
        <section className="py-12 container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Trending This Week</h2>
            <Link href="/browse?sort=trending">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingEvents.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        {/* This Weekend */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">This Weekend</h2>
              <Link href="/browse?this_weekend=true">
                <Button variant="ghost">View All</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {thisWeekendEvents.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>

        {/* Free Events */}
        <section className="py-12 container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Free Events</h2>
            <Link href="/browse?price_type=free">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeEvents.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 12).map((category: any) => (
                <Link
                  key={category.id}
                  href={`/browse?category=${category.slug}`}
                  className="p-4 rounded-lg border bg-card hover:border-primary hover:shadow-md transition-all text-center"
                >
                  <div className="font-semibold text-sm">{category.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Newly Added */}
        <section className="py-12 container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Newly Added</h2>
            <Link href="/browse?sort=recent">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newlyAdded.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
