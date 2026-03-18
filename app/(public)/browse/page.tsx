"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import EventCard from "@/components/events/event-card";
import AppShell from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import Skeleton from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import BottomSheet from "@/components/ui/bottom-sheet";
import { useToast } from "@/components/ui/toast";
import SearchInput from "@/components/ui/search-input";
import Chip from "@/components/ui/chip";
import { logClientError } from "@/lib/utils/client-logger";
import { SlidersHorizontal, X, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type SelectOption = { id: string; name: string; slug: string };
type TimeSlotOption = { id: string; label: string };
type DatePreset = "today" | "weekend" | "custom" | "";
const PAGE_LIMIT = 12;

/* ── Styled Select ── */
function StyledSelect({
  value,
  onChange,
  disabled,
  children,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-full appearance-none rounded-xl border border-border/60 bg-surface-2/60 px-3.5 py-2.5 pr-9 text-sm font-medium text-foreground transition-all focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/12",
          disabled && "cursor-not-allowed opacity-50"
        )}
        aria-label={label}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

/* ── Filter Section ── */
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function BrowsePageContent() {
  const { pushToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [searchLocal, setSearchLocal] = useState(searchParams.get("search") || "");

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
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState<Record<string, SelectOption[]>>({});
  const [areas, setAreas] = useState<SelectOption[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlotOption[]>([]);
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
      filters.categories.length +
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
      const response = await fetch("/api/events/filters-meta");
      const data = await response.json();
      const categoryList = (data.categories || []) as SelectOption[];
      setCategories(categoryList);
      setAreas((data.areas || []) as SelectOption[]);
      setSubcategoriesByCategory((data.subcategoriesByCategory || {}) as Record<string, SelectOption[]>);
      setTimeSlots((data.timeSlots || []) as TimeSlotOption[]);
      if (filters.categories.length === 1) {
        const selected = categoryList.find((c) => c.slug === filters.categories[0]);
        setSubcategories(selected ? data.subcategoriesByCategory?.[selected.id] || [] : []);
      }
    } catch (error) {
      logClientError({
        scope: "browse",
        message: "Failed to load filter options",
        error: error instanceof Error ? error.message : String(error),
      });
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
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          setError(data?.error || "Failed to load events");
          return;
        }
        const incoming = data.events || [];
        let mergedEvents: any[] = incoming;
        setEvents((prev) => {
          if (!append) { mergedEvents = incoming; return incoming; }
          const seen = new Set(prev.map((item: any) => item.id));
          mergedEvents = [...prev, ...incoming.filter((item: any) => !seen.has(item.id))];
          return mergedEvents;
        });
        const nextPagination = data.pagination || { page, limit: PAGE_LIMIT, total: 0, totalPages: 1 };
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
          JSON.stringify({ events: mergedEvents, pagination: data.pagination || { page, limit: PAGE_LIMIT, total: 0, totalPages: 1 } })
        );
      } catch (error: any) {
        logClientError({ scope: "browse", message: "Network failure while fetching events", error: error instanceof Error ? error.message : String(error) });
        setError(error?.message || "Failed to load events");
      } finally {
        if (!append) setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters, stateKey]
  );

  useEffect(() => { fetchFilterOptions(); }, [fetchFilterOptions]);

  useEffect(() => {
    const savedScroll = window.sessionStorage.getItem("browse_scroll");
    if (savedScroll) window.scrollTo({ top: Number(savedScroll), behavior: "auto" });
    const onScroll = () => { window.sessionStorage.setItem("browse_scroll", String(window.scrollY)); };
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
      } catch { /* ignore */ }
    }
    fetchEvents(pagination.page);
    syncUrl(filters, pagination.page);
  }, [fetchEvents, pagination.page, syncUrl, filters, stateKey]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting || loading || loadingMore || pagination.page >= pagination.totalPages) return;
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

  useEffect(() => {
    if (filters.categories.length !== 1) { setSubcategories([]); return; }
    const selected = categories.find((c) => c.slug === filters.categories[0]);
    setSubcategories(selected ? subcategoriesByCategory[selected.id] || [] : []);
  }, [categories, filters.categories, subcategoriesByCategory]);

  const toggleMultiValue = (list: string[], value: string) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  const applyDatePreset = (preset: DatePreset) => {
    if (!preset) { setFilters((prev) => ({ ...prev, datePreset: "", dateFrom: "", dateTo: "", thisWeekend: false })); return; }
    if (preset === "today") {
      const today = new Date().toISOString().slice(0, 10);
      setFilters((prev) => ({ ...prev, datePreset: "today", dateFrom: today, dateTo: today, thisWeekend: false }));
      return;
    }
    if (preset === "weekend") { setFilters((prev) => ({ ...prev, datePreset: "weekend", dateFrom: "", dateTo: "", thisWeekend: true })); return; }
    setFilters((prev) => ({ ...prev, datePreset: "custom", thisWeekend: false }));
  };

  const onCategoryToggle = (categorySlug: string) => {
    const categoriesNext = toggleMultiValue(filters.categories, categorySlug);
    let nextSubcategories: SelectOption[] = [];
    if (categoriesNext.length === 1) {
      const selected = categories.find((c) => c.slug === categoriesNext[0]);
      nextSubcategories = selected ? subcategoriesByCategory[selected.id] || [] : [];
    }
    setSubcategories(nextSubcategories);
    setFilters((prev) => ({ ...prev, categories: categoriesNext, subcategory: categoriesNext.length === 1 ? prev.subcategory : "" }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = useMemo(() => () => {
    const reset = { search: "", categories: [] as string[], subcategory: "", areas: [] as string[], dateFrom: "", dateTo: "", datePreset: "" as DatePreset, timeSlot: "", priceType: "", sort: "soonest", thisWeekend: false, verifiedOnly: false };
    setFilters(reset);
    setSearchLocal("");
    setSubcategories([]);
    setPagination((prev) => ({ ...prev, page: 1 }));
    syncUrl(reset, 1);
  }, [syncUrl]);

  const applyMobileFilters = () => { setFilters(draftFilters); setPagination((prev) => ({ ...prev, page: 1 })); setMobileFilterOpen(false); };
  const resetMobileFilters = () => {
    clearFilters();
    setDraftFilters({ search: "", categories: [], subcategory: "", areas: [], dateFrom: "", dateTo: "", datePreset: "", timeSlot: "", priceType: "", sort: "soonest", thisWeekend: false, verifiedOnly: false });
  };

  /* ── Filter Sidebar (shared between desktop and mobile) ── */
  const FiltersPanel = ({ draft = false }: { draft?: boolean }) => {
    const f = draft ? draftFilters : filters;
    const setF = draft
      ? (updater: (prev: typeof draftFilters) => typeof draftFilters) => setDraftFilters(updater)
      : (updater: (prev: typeof filters) => typeof filters) => { setFilters(updater); setPagination((prev) => ({ ...prev, page: 1 })); };

    return (
      <div className="space-y-5">
        {/* Search */}
        <FilterSection title="Search">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={draft ? f.search : searchLocal}
              onChange={(e) => {
                if (draft) {
                  setF((prev) => ({ ...prev, search: e.target.value }));
                } else {
                  setSearchLocal(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (!draft) setFilters((prev) => ({ ...prev, search: searchLocal }));
                }
              }}
              onBlur={() => {
                if (!draft) setFilters((prev) => ({ ...prev, search: searchLocal }));
              }}
              placeholder="Search events…"
              className="w-full rounded-xl border border-border/60 bg-surface-2/60 py-2.5 pl-9 pr-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/12 transition-all"
            />
          </div>
        </FilterSection>

        {/* Category */}
        <FilterSection title="Category">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.name}
                active={f.categories.includes(cat.slug)}
                onClick={() => {
                  const next = toggleMultiValue(f.categories, cat.slug);
                  setF((prev) => ({ ...prev, categories: next, subcategory: "" }));
                  if (!draft) setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              />
            ))}
          </div>
        </FilterSection>

        {/* Subcategory */}
        {subcategories.length > 0 && (
          <FilterSection title="Subcategory">
            <StyledSelect label="Subcategory" value={f.subcategory} onChange={(v) => setF((prev) => ({ ...prev, subcategory: v }))} disabled={f.categories.length !== 1}>
              <option value="">All subcategories</option>
              {subcategories.map((s) => <option key={s.id} value={s.slug}>{s.name}</option>)}
            </StyledSelect>
          </FilterSection>
        )}

        {/* Area */}
        <FilterSection title="Area">
          <div className="flex flex-wrap gap-2">
            {areas.map((area) => (
              <Chip
                key={area.id}
                label={area.name}
                active={f.areas.includes(area.slug)}
                onClick={() => {
                  setF((prev) => ({ ...prev, areas: toggleMultiValue(prev.areas, area.slug) }));
                  if (!draft) setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              />
            ))}
          </div>
        </FilterSection>

        {/* Date */}
        <FilterSection title="Date">
          <div className="flex flex-wrap gap-2 mb-3">
            {(["today", "weekend"] as DatePreset[]).map((preset) => (
              <Chip
                key={preset}
                label={preset === "today" ? "Today" : "Weekend"}
                active={f.datePreset === preset || (preset === "weekend" && f.thisWeekend)}
                onClick={() => {
                  if (!draft) applyDatePreset(f.datePreset === preset ? "" : preset);
                  else setDraftFilters((prev) => ({ ...prev, datePreset: prev.datePreset === preset ? "" : preset, thisWeekend: preset === "weekend" && prev.datePreset !== preset }));
                }}
              />
            ))}
          </div>
          {f.datePreset !== "today" && f.datePreset !== "weekend" && !f.thisWeekend && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-muted-foreground">From</label>
                <input type="date" value={f.dateFrom}
                  onChange={(e) => setF((prev) => ({ ...prev, dateFrom: e.target.value, datePreset: "custom" }))}
                  className="w-full rounded-xl border border-border/60 bg-surface-2/60 px-3 py-2 text-xs focus:border-primary/40 focus:outline-none" />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-muted-foreground">To</label>
                <input type="date" value={f.dateTo}
                  onChange={(e) => setF((prev) => ({ ...prev, dateTo: e.target.value, datePreset: "custom" }))}
                  className="w-full rounded-xl border border-border/60 bg-surface-2/60 px-3 py-2 text-xs focus:border-primary/40 focus:outline-none" />
              </div>
            </div>
          )}
        </FilterSection>

        {/* Time slot */}
        {timeSlots.length > 0 && (
          <FilterSection title="Time">
            <StyledSelect label="Time slot" value={f.timeSlot} onChange={(v) => setF((prev) => ({ ...prev, timeSlot: v }))}>
              <option value="">Any time</option>
              {timeSlots.map((slot) => <option key={slot.id} value={slot.id}>{slot.label}</option>)}
            </StyledSelect>
          </FilterSection>
        )}

        {/* Price */}
        <FilterSection title="Price">
          <div className="flex gap-2">
            {["", "free", "paid"].map((p) => (
              <Chip key={p} label={p === "" ? "All" : p === "free" ? "Free" : "Paid"} active={f.priceType === p} onClick={() => setF((prev) => ({ ...prev, priceType: p }))} />
            ))}
          </div>
        </FilterSection>

        {/* Sort */}
        <FilterSection title="Sort By">
          <StyledSelect label="Sort by" value={f.sort} onChange={(v) => setF((prev) => ({ ...prev, sort: v }))}>
            <option value="soonest">Soonest</option>
            <option value="trending">Trending</option>
            <option value="recent">Recently Added</option>
          </StyledSelect>
        </FilterSection>

        {/* Verified only */}
        <label className="flex cursor-pointer items-center gap-2.5">
          <div
            onClick={() => setF((prev) => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              f.verifiedOnly ? "bg-primary" : "bg-border"
            )}
          >
            <div className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
              f.verifiedOnly ? "translate-x-4" : "translate-x-0.5"
            )} />
          </div>
          <span className="text-sm font-medium">Verified only</span>
        </label>

        {!draft && activeFilterCount > 0 && (
          <Button variant="outline" className="w-full rounded-xl" onClick={clearFilters}>
            <X className="mr-2 h-3.5 w-3.5" /> Clear all filters
          </Button>
        )}
      </div>
    );
  };

  const EventsGrid = () => {
    if (loading) return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-2xl" />
        ))}
      </div>
    );
    if (!loading && events.length === 0) return (
      <EmptyState
        title="No events found"
        description="Try broadening your date range or removing a filter."
        actionLabel="Reset filters"
        onAction={clearFilters}
      />
    );
    return (
      <motion.div
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      >
        <AnimatePresence mode="popLayout">
          {events.map((event) => (
            <motion.div
              key={event.id}
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "tween", duration: 0.35 } } }}
              layout
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Page header ── */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Browse Events</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading ? "Loading…" : `${pagination.total} event${pagination.total !== 1 ? "s" : ""} found`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Active filter chips */}
            {filters.search && (
              <span className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary">
                &ldquo;{filters.search}&rdquo;
                <button onClick={() => { setFilters((p) => ({ ...p, search: "" })); setSearchLocal(""); }} className="hover:text-primary/70"><X className="h-3 w-3" /></button>
              </span>
            )}
            {/* Mobile filter button */}
            <Button
              className="lg:hidden gap-2"
              variant="outline"
              onClick={() => { setDraftFilters(filters); setMobileFilterOpen(true); }}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* ── Main layout ── */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

          {/* ── Filters sidebar (desktop) ── */}
          <aside className="hidden lg:sticky lg:top-20 lg:block lg:h-fit lg:w-64 xl:w-72">
            <div className="rounded-2xl border border-border/50 bg-surface-1 p-5 shadow-[var(--shadow-1)]">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-sm font-bold">Filters</h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-danger transition-colors">
                    <X className="h-3 w-3" />
                    Clear ({activeFilterCount})
                  </button>
                )}
              </div>
              <FiltersPanel />
            </div>
          </aside>

          {/* ── Events area ── */}
          <div className="min-w-0 flex-1">
            <EventsGrid />

            {error && (
              <div className="mt-6 rounded-2xl border border-danger/30 bg-danger/6 p-5">
                <p className="text-sm font-medium text-danger">{error}</p>
                <Button className="mt-3" variant="outline" size="sm"
                  onClick={() => { fetchEvents(pagination.page); pushToast({ title: "Retrying…" }); }}>
                  Retry
                </Button>
              </div>
            )}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-1" />

            {/* Load more */}
            {!loading && pagination.page < pagination.totalPages && (
              <div className="mt-10 flex justify-center">
                <Button variant="outline" size="lg" disabled={loadingMore} className="rounded-full px-8"
                  onClick={() => { setLoadingMore(true); const np = pagination.page + 1; setPagination((p) => ({ ...p, page: np })); fetchEvents(np, true); }}>
                  {loadingMore ? (
                    <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Loading…</span>
                  ) : "Load more events"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter bottom sheet ── */}
      <BottomSheet
        open={mobileFilterOpen}
        onOpenChange={setMobileFilterOpen}
        title={`Filters${activeFilterCount ? ` (${activeFilterCount})` : ""}`}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={resetMobileFilters}>Reset</Button>
            <Button className="flex-1 rounded-xl" onClick={applyMobileFilters}>Apply Filters</Button>
          </div>
        }
      >
        <FiltersPanel draft />
      </BottomSheet>
    </AppShell>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      </div>
    }>
      <BrowsePageContent />
    </Suspense>
  );
}
