import { NextRequest, NextResponse } from "next/server";
import {
  normalizeOrganizerEventPayload,
  validateOrganizerEventPayload,
} from "@/lib/organizer/validation";
import { ensureUniqueEventSlug } from "@/lib/db/slug";
import { normalizePagination, paginatedResponse } from "@/lib/api/pagination";
import { handleRoute } from "@/lib/api/handle-route";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppRole } from "@/lib/auth/roles";

async function resolveOrganizerId(
  supabase: SupabaseClient,
  userId: string,
  role: AppRole | null
) {
  if (role !== "organizer" && role !== "admin") {
    return { error: "Forbidden", status: 403 as const };
  }
  const { data: organizer } = await supabase
    .from("organizers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!organizer?.id) {
    return {
      error: "Organizer profile not found. Create organizer profile first.",
      status: 400 as const,
    };
  }
  return { organizerId: organizer.id } as const;
}

export const GET = handleRoute(
  {
    route: "/api/organizer/events",
    action: "list-organizer-events",
    requireAuth: true,
    rateLimitKey: "organizer-events-list",
    rateLimitLimit: 120,
  },
  async (request: NextRequest, context) => {
    const org = await resolveOrganizerId(context.supabase, context.userId!, context.role);
    if ("error" in org) {
      return NextResponse.json({ error: org.error }, { status: org.status });
    }
    const { page, limit, from, to } = normalizePagination(request.nextUrl.searchParams);

    const { data, error, count } = await context.supabase
      .from("events")
      .select("*", { count: "exact" })
      .eq("organizer_id", org.organizerId)
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
  async (request: NextRequest, context) => {
    const org = await resolveOrganizerId(context.supabase, context.userId!, context.role);
    if ("error" in org) {
      return NextResponse.json({ error: org.error }, { status: org.status });
    }

    const payload = normalizeOrganizerEventPayload(await request.json());
    const validation = validateOrganizerEventPayload(payload);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join(" ") }, { status: 400 });
    }

    const { data: categories } = await context.supabase
      .from("event_categories")
      .select("id,name")
      .limit(50);
    const { data: areas } = await context.supabase.from("event_areas").select("id,name").limit(50);

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

    const { data, error } = await context.supabase
      .from("events")
      .insert({
        title: payload.title,
        slug,
        description: payload.description || "",
        category_id: categoryId,
        organizer_id: org.organizerId,
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
        created_by: context.userId,
      })
      .select("id,status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, event: data });
  }
);
