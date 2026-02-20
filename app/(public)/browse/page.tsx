"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import EventCard from "@/components/events/event-card";
import AppShell from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Skeleton from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import Pagination from "@/components/ui/pagination";

type SelectOption = { id: string; name: string; slug: string };

function BrowsePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialLimit = parseInt(searchParams.get("limit") || "12", 10);

  const [events, setEvents] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 1,
  });
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [subcategories, setSubcategories] = useState<SelectOption[]>([]);
  const [areas, setAreas] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    subcategory: searchParams.get("subcategory") || "",
    area: searchParams.get("area") || "",
    dateFrom: searchParams.get("date_from") || "",
    dateTo: searchParams.get("date_to") || "",
    timeSlot: searchParams.get("time_slot") || "",
    priceType: searchParams.get("price_type") || "",
    sort: searchParams.get("sort") || "soonest",
    thisWeekend: searchParams.get("this_weekend") === "true",
    verifiedOnly: searchParams.get("verified_only") === "true",
  });

  const syncUrl = useCallback(
    (nextFilters: typeof filters, page: number) => {
      const params = new URLSearchParams();
      if (nextFilters.search) params.set("search", nextFilters.search);
      if (nextFilters.category) params.set("category", nextFilters.category);
      if (nextFilters.subcategory) params.set("subcategory", nextFilters.subcategory);
      if (nextFilters.area) params.set("area", nextFilters.area);
      if (nextFilters.dateFrom) params.set("date_from", nextFilters.dateFrom);
      if (nextFilters.dateTo) params.set("date_to", nextFilters.dateTo);
      if (nextFilters.timeSlot) params.set("time_slot", nextFilters.timeSlot);
      if (nextFilters.priceType) params.set("price_type", nextFilters.priceType);
      if (nextFilters.sort) params.set("sort", nextFilters.sort);
      if (nextFilters.thisWeekend) params.set("this_weekend", "true");
      if (nextFilters.verifiedOnly) params.set("verified_only", "true");
      params.set("page", String(page));
      params.set("limit", String(pagination.limit));
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, pagination.limit, router]
  );

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await fetch("/api/events/meta");
      const data = await response.json();
      const categoryList = (data.categories || []) as (SelectOption & {
        subcategories?: SelectOption[];
      })[];
      setCategories(categoryList);
      setAreas((data.areas || []) as SelectOption[]);

      if (filters.category) {
        const selected = categoryList.find((c) => c.slug === filters.category);
        setSubcategories(selected?.subcategories || []);
      }
    } catch (error) {
      console.error("Failed to load filter options", error);
    }
  }, [filters.category]);

  const fetchEvents = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append("search", filters.search);
        if (filters.category) params.append("category", filters.category);
        if (filters.subcategory) params.append("subcategory", filters.subcategory);
        if (filters.area) params.append("area", filters.area);
        if (filters.dateFrom) params.append("date_from", filters.dateFrom);
        if (filters.dateTo) params.append("date_to", filters.dateTo);
        if (filters.timeSlot) params.append("time_slot", filters.timeSlot);
        if (filters.priceType) params.append("price_type", filters.priceType);
        if (filters.sort) params.append("sort", filters.sort);
        if (filters.thisWeekend) params.append("this_weekend", "true");
        if (filters.verifiedOnly) params.append("verified_only", "true");
        params.append("page", String(page));
        params.append("limit", String(pagination.limit));

        const response = await fetch(`/api/events?${params}`);
        const data = await response.json();
        setEvents(data.events || []);
        const nextPagination = data.pagination || {
          page,
          limit: pagination.limit,
          total: 0,
          totalPages: 1,
        };
        setPagination((prev) =>
          prev.page === nextPagination.page &&
          prev.limit === nextPagination.limit &&
          prev.total === nextPagination.total &&
          prev.totalPages === nextPagination.totalPages
            ? prev
            : nextPagination
        );
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.limit]
  );

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    fetchEvents(pagination.page);
    syncUrl(filters, pagination.page);
  }, [fetchEvents, pagination.page, syncUrl, filters]);

  const onCategoryChange = (categorySlug: string) => {
    const selected = categories.find((c) => c.slug === categorySlug) as
      | (SelectOption & { subcategories?: SelectOption[] })
      | undefined;
    setSubcategories(selected?.subcategories || []);
    const next = {
      ...filters,
      category: categorySlug,
      subcategory: "",
    };
    setFilters(next);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = useMemo(
    () => () => {
      const reset = {
        search: "",
        category: "",
        subcategory: "",
        area: "",
        dateFrom: "",
        dateTo: "",
        timeSlot: "",
        priceType: "",
        sort: "soonest",
        thisWeekend: false,
        verifiedOnly: false,
      };
      setFilters(reset);
      setSubcategories([]);
      setPagination((prev) => ({ ...prev, page: 1 }));
      syncUrl(reset, 1);
    },
    [syncUrl]
  );

  return (
    <AppShell>
      <div className="min-h-screen py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:h-fit lg:w-72 space-y-4">
            <div>
              <h3 className="font-semibold mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <Input
                    placeholder="Search events..."
                    value={filters.search}
                    onChange={(e) => {
                      setFilters({ ...filters, search: e.target.value });
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    value={filters.category}
                    onChange={(e) => onCategoryChange(e.target.value)}
                  >
                    <option value="">All</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Subcategory</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    value={filters.subcategory}
                    onChange={(e) => {
                      setFilters({ ...filters, subcategory: e.target.value });
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    disabled={!filters.category}
                  >
                    <option value="">All</option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.slug}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Area</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    value={filters.area}
                    onChange={(e) => {
                      setFilters({ ...filters, area: e.target.value });
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                  >
                    <option value="">All</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.slug}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date From</label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => {
                      setFilters({ ...filters, dateFrom: e.target.value });
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date To</label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => {
                      setFilters({ ...filters, dateTo: e.target.value });
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Time Slot</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    value={filters.timeSlot}
                    onChange={(e) => {
                      setFilters({ ...filters, timeSlot: e.target.value });
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                  >
                    <option value="">All</option>
                    <option value="morning">Morning (6:00-12:00)</option>
                    <option value="afternoon">Afternoon (12:00-17:00)</option>
                    <option value="evening">Evening (17:00-21:00)</option>
                    <option value="night">Night (21:00-6:00)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Price</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    value={filters.priceType}
                    onChange={(e) => {
                      setFilters({ ...filters, priceType: e.target.value });
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
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
                    onChange={(e) => {
                      setFilters({ ...filters, sort: e.target.value });
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
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
                      onChange={(e) => {
                        setFilters({ ...filters, thisWeekend: e.target.checked });
                        setPagination((prev) => ({ ...prev, page: 1 }));
                      }}
                    />
                    <span className="text-sm">This Weekend</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.verifiedOnly}
                      onChange={(e) => {
                        setFilters({ ...filters, verifiedOnly: e.target.checked });
                        setPagination((prev) => ({ ...prev, page: 1 }));
                      }}
                    />
                    <span className="text-sm">Verified only</span>
                  </label>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearFilters}
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
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No events found"
                description="Try broadening your date range or removing one filter."
                actionLabel="Reset filters"
                onAction={clearFilters}
              />
            )}

            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPrev={() =>
                setPagination((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))
              }
              onNext={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(prev.page + 1, prev.totalPages),
                }))
              }
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading browse...</div>}>
      <BrowsePageContent />
    </Suspense>
  );
}
