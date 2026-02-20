import { NextResponse } from "next/server";
import { getFilterOptions } from "@/lib/db/queries";

export async function GET() {
  try {
    const { categories, areas } = await getFilterOptions();
    return NextResponse.json({
      categories: categories || [],
      areas: areas || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load filter options" },
      { status: 500 }
    );
  }
}
