import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadDotEnvLocal() {
  const filePath = path.resolve(process.cwd(), ".env.local");
  if (!existsSync(filePath)) return;
  const raw = readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadDotEnvLocal();

  const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error("DB check failed. Missing env vars:", missing.join(", "));
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });

  // Lightweight schema probes: if any selected column does not exist, this fails immediately.
  const probes = [
    ["events", "id,status,end_date,deleted_at"],
    ["saved_events", "id,user_id,event_id,deleted_at"],
    ["reminders", "id,user_id,event_id,deleted_at,status_24h,status_3h,status,timezone,reminder_type"],
    ["users", "id,role"],
    ["event_reports", "id,status"],
  ];

  for (const [table, selectExpr] of probes) {
    const { error } = await supabase.from(table).select(selectExpr).limit(1);
    if (error) {
      console.error(`DB check failed. Schema probe failed for ${table}:`, error.message);
      process.exit(1);
    }
  }

  // Lightweight RLS probes using anon client: sensitive writes must be blocked.
  const deniedWrites = [
    supabase.from("saved_events").insert({ user_id: "00000000-0000-0000-0000-000000000000", event_id: "00000000-0000-0000-0000-000000000000" }),
    supabase.from("reminders").insert({ user_id: "00000000-0000-0000-0000-000000000000", event_id: "00000000-0000-0000-0000-000000000000" }),
    supabase.from("event_reports").insert({ user_id: "00000000-0000-0000-0000-000000000000", event_id: "00000000-0000-0000-0000-000000000000", reason: "probe" }),
  ];

  const writeResults = await Promise.all(deniedWrites);
  for (const result of writeResults) {
    if (!result.error) {
      console.error("DB check failed. Anonymous write probe unexpectedly succeeded.");
      process.exit(1);
    }
  }

  console.log("DB check passed.");
}

main();
