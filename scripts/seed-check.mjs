import { readFileSync, existsSync } from "node:fs";

const seedFile = "supabase/migrations/002_seed_data.sql";

if (!existsSync(seedFile)) {
  console.error("Seed check failed: seed migration is missing.");
  process.exit(1);
}

const content = readFileSync(seedFile, "utf8");
const requiredSnippets = ["INSERT INTO public.event_categories", "INSERT INTO public.event_areas"];
const missing = requiredSnippets.filter((snippet) => !content.includes(snippet));

if (missing.length > 0) {
  console.error("Seed check failed. Missing snippets:", missing.join(", "));
  process.exit(1);
}

console.log("Seed check passed.");
