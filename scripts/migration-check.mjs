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
    console.error(
      "Migration check failed. Could not read app_migration_versions. Apply latest migration first.",
      error.message
    );
    process.exit(1);
  }

  const dbVersions = (data || []).map((row) => String(row.version)).sort();
  const repoSet = new Set(repoVersions);
  const dbSet = new Set(dbVersions);

  const missingInDb = repoVersions.filter((version) => !dbSet.has(version));
  const extraInDb = dbVersions.filter((version) => !repoSet.has(version));

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

