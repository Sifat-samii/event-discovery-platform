"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import EventCard from "@/components/events/event-card";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function BrowsePageContent() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    area: searchParams.get("area") || "",
    priceType: searchParams.get("price_type") || "",
    sort: searchParams.get("sort") || "soonest",
    thisWeekend: searchParams.get("this_weekend") === "true",
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category", filters.category);
      if (filters.area) params.append("area", filters.area);
      if (filters.priceType) params.append("price_type", filters.priceType);
      if (filters.sort) params.append("sort", filters.sort);
      if (filters.thisWeekend) params.append("this_weekend", "true");

      const response = await fetch(`/api/events?${params}`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <>
      <Header />
      <main className="min-h-screen container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 space-y-4">
            <div>
              <h3 className="font-semibold mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <Input
                    placeholder="Search events..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Price</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    value={filters.priceType}
                    onChange={(e) => setFilters({ ...filters, priceType: e.target.value })}
                  >
                    <option value="">All</option>
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    value={filters.sort}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                  >
                    <option value="soonest">Soonest</option>
                    <option value="trending">Trending</option>
                    <option value="recent">Recently Added</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.thisWeekend}
                      onChange={(e) => setFilters({ ...filters, thisWeekend: e.target.checked })}
                    />
                    <span className="text-sm">This Weekend</span>
                  </label>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setFilters({ search: "", category: "", area: "", priceType: "", sort: "soonest", thisWeekend: false })}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </aside>

          {/* Events Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Browse Events</h1>
              <div className="text-sm text-muted-foreground">
                {events.length} events found
              </div>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No events found. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen container mx-auto px-4 py-8">Loading browse page...</div>}>
      <BrowsePageContent />
    </Suspense>
  );
}
