const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error("DB check failed. Missing env vars:", missing.join(", "));
  process.exit(1);
}

console.log("DB check passed.");
