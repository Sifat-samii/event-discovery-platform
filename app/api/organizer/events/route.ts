import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import {
  normalizeOrganizerEventPayload,
  validateOrganizerEventPayload,
} from "@/lib/organizer/validation";
import { generateEventSlug } from "@/lib/utils/slugify";

export async function POST(request: NextRequest) {
  try {
    const limiter = rateLimit({
      key: `organizer-event:${getClientIp(request)}`,
      limit: 40,
      windowMs: 60_000,
    });
    if (!limiter.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = await getUserRole(supabase, user.id);
    if (role !== "organizer" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = normalizeOrganizerEventPayload(await request.json());
    const validation = validateOrganizerEventPayload(payload);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join(" ") }, { status: 400 });
    }

    const { data: organizer } = await supabase
      .from("organizers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!organizer?.id) {
      return NextResponse.json(
        { error: "Organizer profile not found. Create organizer profile first." },
        { status: 400 }
      );
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
    const slug = generateEventSlug(payload.title);

    const { data, error } = await supabase
      .from("events")
      .insert({
        title: payload.title,
        slug,
        description: payload.description || "",
        category_id: categoryId,
        organizer_id: organizer.id,
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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
