import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import {
  normalizeOrganizerEventPayload,
  validateOrganizerEventPayload,
} from "@/lib/organizer/validation";
import { ensureUniqueEventSlug } from "@/lib/db/slug";
import { logApiError } from "@/lib/utils/logger";
import { normalizePagination, paginatedResponse } from "@/lib/api/pagination";
import { handleRoute } from "@/lib/api/handle-route";

async function getOrganizerContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized", status: 401 as const };
  }
  const role = await getUserRole(supabase, user.id);
  if (role !== "organizer" && role !== "admin") {
    return { error: "Forbidden", status: 403 as const };
  }
  const { data: organizer } = await supabase
    .from("organizers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!organizer?.id) {
    return {
      error: "Organizer profile not found. Create organizer profile first.",
      status: 400 as const,
    };
  }
  return { supabase, user, role, organizerId: organizer.id } as const;
}

export const GET = handleRoute(
  {
    route: "/api/organizer/events",
    action: "list-organizer-events",
    requireAuth: true,
    rateLimitKey: "organizer-events-list",
    rateLimitLimit: 120,
  },
  async (request: NextRequest) => {
    const context = await getOrganizerContext();
    if ("error" in context) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }
    const { page, limit, from, to } = normalizePagination(request.nextUrl.searchParams);

    const { data, error, count } = await context.supabase
      .from("events")
      .select("*", { count: "exact" })
      .eq("organizer_id", context.organizerId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const total = count || 0;
    return NextResponse.json(
      paginatedResponse({
        data: data || [],
        total,
        page,
        limit,
      })
    );
  }
);

export const POST = handleRoute(
  {
    route: "/api/organizer/events",
    action: "create-organizer-event",
    requireAuth: true,
    rateLimitKey: "organizer-event",
    rateLimitLimit: 40,
  },
  async (request: NextRequest) => {
    const limiter = rateLimit({
      key: `organizer-event:${getClientIp(request)}`,
      limit: 40,
      windowMs: 60_000,
    });
    if (!limiter.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const context = await getOrganizerContext();
    if ("error" in context) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }
    const { supabase, user, organizerId } = context;

    const payload = normalizeOrganizerEventPayload(await request.json());
    const validation = validateOrganizerEventPayload(payload);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join(" ") }, { status: 400 });
    }

    const { data: categories } = await supabase
      .from("event_categories")
      .select("id,name")
      .limit(50);
    const { data: areas } = await supabase.from("event_areas").select("id,name").limit(50);

    const categoryId =
      categories?.find((item) => item.name.toLowerCase() === payload.category.toLowerCase())
        ?.id || categories?.[0]?.id;
    const areaId =
      areas?.find((item) => item.name.toLowerCase() === payload.area.toLowerCase())?.id ||
      areas?.[0]?.id;
    if (!categoryId || !areaId) {
      return NextResponse.json(
        { error: "Missing category/area seed data in database." },
        { status: 400 }
      );
    }

    const startDate = payload.startDate || new Date().toISOString().slice(0, 10);
    const endDate = payload.endDate || startDate;
    const slug = await ensureUniqueEventSlug(payload.title);

    const { data, error } = await supabase
      .from("events")
      .insert({
        title: payload.title,
        slug,
        description: payload.description || "",
        category_id: categoryId,
        organizer_id: organizerId,
        area_id: areaId,
        venue_name: payload.venueName,
        venue_address: payload.venueAddress || payload.venueName,
        start_date: `${startDate}T00:00:00.000Z`,
        end_date: `${endDate}T23:59:59.000Z`,
        start_time: payload.startTime || "18:00:00",
        end_time: payload.endTime || null,
        price_type: payload.priceType === "paid" ? "paid" : "free",
        ticket_link: payload.ticketLink || null,
        status: "pending",
        created_by: user.id,
      })
      .select("id,status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, event: data });
  }
);
