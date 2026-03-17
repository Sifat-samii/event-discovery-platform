import { readdirSync, readFileSync, existsSync } from "node:fs";
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

function readRepoMigrationVersions() {
  const migrationDir = path.resolve(process.cwd(), "supabase", "migrations");
  const files = readdirSync(migrationDir);

  return files
    .map((file) => {
      const match = file.match(/^(\d+)_.*\.sql$/);
      return match ? match[1] : null;
    })
    .filter(Boolean)
    .sort();
}

async function verifyStructuralParity(supabase) {
  const probes = [
    ["users", "id,role"],
    ["events", "id,status,start_date,end_date,deleted_at"],
    ["saved_events", "id,user_id,event_id,deleted_at"],
    ["reminders", "id,user_id,event_id,deleted_at,status_24h,status_3h,status,timezone,reminder_type"],
    ["event_reports", "id,status"],
  ];

  for (const [table, selectExpr] of probes) {
    const { error } = await supabase.from(table).select(selectExpr).limit(1);
    if (error) {
      console.error(`Migration check failed. Structural probe failed for ${table}:`, error.message);
      process.exit(1);
    }
  }
}

async function main() {
  loadDotEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error("Migration check failed. Missing Supabase env vars.");
    process.exit(1);
  }

  const repoVersions = readRepoMigrationVersions();
  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("app_migration_versions")
    .select("version")
    .order("version", { ascending: true });

  if (error) {
    await verifyStructuralParity(supabase);
    console.warn(
      "Migration check warning: app_migration_versions is not readable with current credentials; structural parity probes passed."
    );
    console.log("Migration check passed.");
    return;
  }

  const dbVersions = (data || []).map((row) => String(row.version)).sort();

  // Backward-compatible guard:
  // Some environments may have the current schema but an empty migration-tracking table.
  // In that case, we validate required structures directly instead of hard-failing on version rows.
  if (dbVersions.length === 0) {
    await verifyStructuralParity(supabase);
    console.warn(
      "Migration check warning: app_migration_versions is empty; structural parity probes passed."
    );
    console.log("Migration check passed.");
    return;
  }

  const normalize = (value) => String(parseInt(String(value), 10));
  const normalizedRepoVersions = repoVersions.map(normalize).sort();
  const normalizedDbVersions = dbVersions.map(normalize).sort();
  const repoSet = new Set(normalizedRepoVersions);
  const dbSet = new Set(normalizedDbVersions);

  const missingInDb = normalizedRepoVersions.filter((version) => !dbSet.has(version));
  const extraInDb = normalizedDbVersions.filter((version) => !repoSet.has(version));

  if (missingInDb.length || extraInDb.length) {
    console.error("Migration check failed.");
    if (missingInDb.length) {
      console.error("Missing in DB:", missingInDb.join(", "));
    }
    if (extraInDb.length) {
      console.error("Extra in DB:", extraInDb.join(", "));
    }
    process.exit(1);
  }

  console.log("Migration check passed.");
}

main();

