import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";

const allowedStatuses = new Set([
  "draft",
  "pending",
  "published",
  "expired",
  "archived",
]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const roleCheck = await requireRole(supabase, "admin");
    if (!roleCheck.authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: roleCheck.status });
    }

    const body = await request.json();
    const status = String(body.status || "");
    if (!allowedStatuses.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { error } = await supabase
      .from("events")
      .update({ status })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
