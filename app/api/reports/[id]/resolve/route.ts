import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const roleCheck = await requireRole(supabase, "admin");
    if (!roleCheck.authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: roleCheck.status });
    }

    const { error } = await supabase
      .from("event_reports")
      .update({
        status: "resolved",
        reviewed_by: roleCheck.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
