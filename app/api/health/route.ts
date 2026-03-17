import { NextResponse } from "next/server";
import { validateRequiredEnv } from "@/lib/env/validate-env";
import { handleRoute } from "@/lib/api/handle-route";

export const GET = handleRoute(
  {
    route: "/api/health",
    action: "health-check",
    rateLimitKey: "health-check",
    rateLimitLimit: 60,
  },
  async (_request, context) => {
  const timestamp = new Date().toISOString();
  const env = validateRequiredEnv([
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]);
  const emailConfigured = Boolean(process.env.RESEND_API_KEY?.trim());

  let dbConnected = false;
  let dbError: string | null = null;
  try {
    const { error } = await context.supabase.from("event_categories").select("id").limit(1);
    dbConnected = !error;
    dbError = error?.message || null;
  } catch (error: any) {
    dbConnected = false;
    dbError = error?.message || "DB check failed";
  }

  const ok = env.ok && dbConnected;
  return NextResponse.json(
    {
      status: ok ? "ok" : "degraded",
      timestamp,
      service: "events-project",
      checks: {
        env: { ok: env.ok, missing: env.missing },
        db: { ok: dbConnected, error: dbError },
        email: { configured: emailConfigured },
      },
    },
    { status: ok ? 200 : 503 }
  );
}
);
