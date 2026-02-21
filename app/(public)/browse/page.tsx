"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import EventCard from "@/components/events/event-card";
import AppShell from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Skeleton from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import BottomSheet from "@/components/ui/bottom-sheet";
import { useToast } from "@/components/ui/toast";
import SearchInput from "@/components/ui/search-input";
import Chip from "@/components/ui/chip";

type SelectOption = { id: string; name: string; slug: string };
type DatePreset = "today" | "weekend" | "custom" | "";
const PAGE_LIMIT = 12;

function BrowsePageContent() {
  const { pushToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const parseList = (value: string | null) =>
    value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];

  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [subcategories, setSubcategories] = useState<SelectOption[]>([]);
  const [areas, setAreas] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(() => ({
    search: searchParams.get("search") || "",
    categories: parseList(searchParams.get("categories") || searchParams.get("category")),
    subcategory: searchParams.get("subcategory") || "",
    areas: parseList(searchParams.get("areas") || searchParams.get("area")),
    dateFrom: searchParams.get("date_from") || "",
    dateTo: searchParams.get("date_to") || "",
    datePreset: (searchParams.get("date_preset") as DatePreset) || "",
    timeSlot: searchParams.get("time_slot") || "",
    priceType: searchParams.get("price_type") || "",
    sort: searchParams.get("sort") || "soonest",
    thisWeekend: searchParams.get("this_weekend") === "true",
    verifiedOnly: searchParams.get("verified_only") === "true",
  }));
  const [draftFilters, setDraftFilters] = useState(filters);
  const stateKey = useMemo(
    () => `browse_state_${JSON.stringify({ filters, page: pagination.page })}`,
    [filters, pagination.page]
  );
  const activeFilterCount = useMemo(
    () =>
      Number(Boolean(filters.search)) +
      filters.categories.length +
      Number(Boolean(filters.subcategory)) +
      filters.areas.length +
      Number(Boolean(filters.datePreset || filters.dateFrom || filters.dateTo)) +
      Number(Boolean(filters.timeSlot)) +
      Number(Boolean(filters.priceType)) +
      Number(Boolean(filters.verifiedOnly)),
    [filters]
  );

  const syncUrl = useCallback(
    (nextFilters: typeof filters, page: number) => {
      const params = new URLSearchParams();
      if (nextFilters.search) params.set("search", nextFilters.search);
      if (nextFilters.categories.length) params.set("categories", nextFilters.categories.join(","));
      if (nextFilters.subcategory) params.set("subcategory", nextFilters.subcategory);
      if (nextFilters.areas.length) params.set("areas", nextFilters.areas.join(","));
      if (nextFilters.dateFrom) params.set("date_from", nextFilters.dateFrom);
      if (nextFilters.dateTo) params.set("date_to", nextFilters.dateTo);
      if (nextFilters.datePreset) params.set("date_preset", nextFilters.datePreset);
      if (nextFilters.timeSlot) params.set("time_slot", nextFilters.timeSlot);
      if (nextFilters.priceType) params.set("price_type", nextFilters.priceType);
      if (nextFilters.sort) params.set("sort", nextFilters.sort);
      if (nextFilters.thisWeekend) params.set("this_weekend", "true");
      if (nextFilters.verifiedOnly) params.set("verified_only", "true");
      params.set("page", String(page));
      params.set("limit", String(PAGE_LIMIT));
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router]
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

      if (filters.categories.length === 1) {
        const selected = categoryList.find((c) => c.slug === filters.categories[0]);
        setSubcategories(selected?.subcategories || []);
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      console.error("Failed to load filter options", error);
    }
  }, [filters.categories]);

  const fetchEvents = useCallback(
    async (page: number, append = false) => {
      if (!append) setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append("search", filters.search);
        if (filters.categories.length) params.append("categories", filters.categories.join(","));
        if (filters.subcategory) params.append("subcategory", filters.subcategory);
        if (filters.areas.length) params.append("areas", filters.areas.join(","));
        if (filters.dateFrom) params.append("date_from", filters.dateFrom);
        if (filters.dateTo) params.append("date_to", filters.dateTo);
        if (filters.datePreset) params.append("date_preset", filters.datePreset);
        if (filters.timeSlot) params.append("time_slot", filters.timeSlot);
        if (filters.priceType) params.append("price_type", filters.priceType);
        if (filters.sort) params.append("sort", filters.sort);
        if (filters.thisWeekend) params.append("this_weekend", "true");
        if (filters.verifiedOnly) params.append("verified_only", "true");
        params.append("page", String(page));
        params.append("limit", String(PAGE_LIMIT));

        const response = await fetch(`/api/events?${params}`);
        if (!response.ok) throw new Error("Failed to load events");
        const data = await response.json();
        const incoming = data.events || [];
        let mergedEvents: any[] = incoming;
        setEvents((prev) => {
          if (!append) {
            mergedEvents = incoming;
            return incoming;
          }
          const seen = new Set(prev.map((item: any) => item.id));
          mergedEvents = [...prev, ...incoming.filter((item: any) => !seen.has(item.id))];
          return mergedEvents;
        });
        const nextPagination = data.pagination || {
          page,
          limit: PAGE_LIMIT,
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
        window.sessionStorage.setItem(
          stateKey,
          JSON.stringify({
            events: mergedEvents,
            pagination: data.pagination || { page, limit: PAGE_LIMIT, total: 0, totalPages: 1 },
          })
        );
      } catch (error: any) {
        console.error("Error fetching events:", error);
        setError(error.message || "Failed to load events");
      } finally {
        if (!append) setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters, stateKey]
  );

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    const savedScroll = window.sessionStorage.getItem("browse_scroll");
    if (savedScroll) window.scrollTo({ top: Number(savedScroll), behavior: "auto" });
    const onScroll = () => {
      window.sessionStorage.setItem("browse_scroll", String(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const cached = window.sessionStorage.getItem(stateKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.events?.length) setEvents(parsed.events);
        if (parsed?.pagination) setPagination(parsed.pagination);
        setLoading(false);
      } catch {
        // ignore cache parse failure
      }
    }
    fetchEvents(pagination.page);
    syncUrl(filters, pagination.page);
  }, [fetchEvents, pagination.page, syncUrl, filters, stateKey]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        if (loading || loadingMore) return;
        if (pagination.page >= pagination.totalPages) return;
        setLoadingMore(true);
        const nextPage = pagination.page + 1;
        setPagination((prev) => ({ ...prev, page: nextPage }));
        fetchEvents(nextPage, true);
      },
      { rootMargin: "120px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchEvents, loading, loadingMore, pagination.page, pagination.totalPages]);

  const toggleMultiValue = (list: string[], value: string) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  const applyDatePreset = (preset: DatePreset) => {
    if (!preset) {
      setFilters((prev) => ({ ...prev, datePreset: "", dateFrom: "", dateTo: "", thisWeekend: false }));
      return;
    }
    if (preset === "today") {
      const today = new Date().toISOString().slice(0, 10);
      setFilters((prev) => ({
        ...prev,
        datePreset: "today",
        dateFrom: today,
        dateTo: today,
        thisWeekend: false,
      }));
      return;
    }
    if (preset === "weekend") {
      setFilters((prev) => ({
        ...prev,
        datePreset: "weekend",
        dateFrom: "",
        dateTo: "",
        thisWeekend: true,
      }));
      return;
    }
    setFilters((prev) => ({ ...prev, datePreset: "custom", thisWeekend: false }));
  };

  const onCategoryToggle = (categorySlug: string) => {
    const categoriesNext = toggleMultiValue(filters.categories, categorySlug);
    let nextSubcategories: SelectOption[] = [];
    if (categoriesNext.length === 1) {
      const selected = categories.find((c) => c.slug === categoriesNext[0]) as
        | (SelectOption & { subcategories?: SelectOption[] })
        | undefined;
      nextSubcategories = selected?.subcategories || [];
    }
    setSubcategories(nextSubcategories);
    const next = {
      ...filters,
      categories: categoriesNext,
      subcategory: categoriesNext.length === 1 ? filters.subcategory : "",
    };
    setFilters(next);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = useMemo(
    () => () => {
      const reset = {
        search: "",
        categories: [] as string[],
        subcategory: "",
        areas: [] as string[],
        dateFrom: "",
        dateTo: "",
        datePreset: "" as DatePreset,
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

  const applyMobileFilters = () => {
    setFilters(draftFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setMobileFilterOpen(false);
  };

  const resetMobileFilters = () => {
    clearFilters();
    setDraftFilters({
      ...filters,
      search: "",
      categories: [],
      subcategory: "",
      areas: [],
      dateFrom: "",
      dateTo: "",
      datePreset: "",
      timeSlot: "",
      priceType: "",
      sort: "soonest",
      thisWeekend: false,
      verifiedOnly: false,
    });
  };

  return (
    <AppShell>
      <div className="min-h-screen py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden lg:sticky lg:top-24 lg:h-fit lg:w-72 lg:block space-y-4">
            <div>
              <h3 className="font-semibold mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <SearchInput
                    value={filters.search}
                    onChange={(value) => {
                      setFilters({ ...filters, search: value });
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Chip
                        key={category.id}
                        label={category.name}
                        active={filters.categories.includes(category.slug)}
                        onClick={() => onCategoryToggle(category.slug)}
                      />
                    ))}
                  </div>
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
                    disabled={filters.categories.length !== 1}
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
                  <div className="flex flex-wrap gap-2">
                    {areas.map((area) => (
                      <Chip
                        key={area.id}
                        label={area.name}
                        active={filters.areas.includes(area.slug)}
                        onClick={() => {
                          setFilters((prev) => ({
                            ...prev,
                            areas: toggleMultiValue(prev.areas, area.slug),
                          }));
                          setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date preset</label>
                  <div className="flex flex-wrap gap-2">
                    <Chip
                      label="Today"
                      active={filters.datePreset === "today"}
                      onClick={() => {
                        applyDatePreset("today");
                        setPagination((prev) => ({ ...prev, page: 1 }));
                      }}
                    />
                    <Chip
                      label="Weekend"
                      active={filters.datePreset === "weekend" || filters.thisWeekend}
                      onClick={() => {
                        applyDatePreset("weekend");
                        setPagination((prev) => ({ ...prev, page: 1 }));
                      }}
                    />
                    <Chip
                      label="Custom"
                      active={filters.datePreset === "custom"}
                      onClick={() => {
                        applyDatePreset("custom");
                        setPagination((prev) => ({ ...prev, page: 1 }));
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date From</label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => {
                      setFilters({ ...filters, dateFrom: e.target.value });
                      if (e.target.value) setFilters((prev) => ({ ...prev, datePreset: "custom" }));
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    disabled={filters.datePreset === "today" || filters.datePreset === "weekend"}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date To</label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => {
                      setFilters({ ...filters, dateTo: e.target.value });
                      if (e.target.value) setFilters((prev) => ({ ...prev, datePreset: "custom" }));
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    disabled={filters.datePreset === "today" || filters.datePreset === "weekend"}
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
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold">Browse Events</h1>
              <div className="flex items-center gap-2">
                <Button
                  className="lg:hidden"
                  variant="outline"
                  onClick={() => {
                    setDraftFilters(filters);
                    setMobileFilterOpen(true);
                  }}
                >
                  Filters {activeFilterCount ? `(${activeFilterCount})` : ""}
                </Button>
                <div className="text-sm text-muted-foreground">
                  {pagination.total} total
                </div>
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
            {error ? (
              <div className="mt-6 rounded-lg border border-danger/40 bg-surface-1 p-4">
                <p className="text-sm text-danger">{error}</p>
                <Button
                  className="mt-3"
                  variant="outline"
                  onClick={() => {
                    fetchEvents(pagination.page);
                    pushToast({ title: "Retrying fetch..." });
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : null}
            <div ref={sentinelRef} className="h-1" />
            {pagination.page < pagination.totalPages ? (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  disabled={loadingMore}
                  onClick={() => {
                    setLoadingMore(true);
                    const nextPage = pagination.page + 1;
                    setPagination((prev) => ({ ...prev, page: nextPage }));
                    fetchEvents(nextPage, true);
                  }}
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
        <BottomSheet
          open={mobileFilterOpen}
          onOpenChange={setMobileFilterOpen}
          title={`Filters${activeFilterCount ? ` (${activeFilterCount})` : ""}`}
          footer={
            <div className="flex gap-2">
              <Button variant="outline" className="w-full" onClick={resetMobileFilters}>
                Reset
              </Button>
              <Button className="w-full" onClick={applyMobileFilters}>
                Apply
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <SearchInput
              value={draftFilters.search}
              onChange={(value) => setDraftFilters((prev) => ({ ...prev, search: value }))}
            />
            <div>
              <p className="mb-2 text-sm font-medium">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Chip
                    key={category.id}
                    label={category.name}
                    active={draftFilters.categories.includes(category.slug)}
                    onClick={() =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        categories: toggleMultiValue(prev.categories, category.slug),
                        subcategory: "",
                      }))
                    }
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Areas</p>
              <div className="flex flex-wrap gap-2">
                {areas.map((area) => (
                  <Chip
                    key={area.id}
                    label={area.name}
                    active={draftFilters.areas.includes(area.slug)}
                    onClick={() =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        areas: toggleMultiValue(prev.areas, area.slug),
                      }))
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </BottomSheet>
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
