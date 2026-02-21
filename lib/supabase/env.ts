function isValidHttpUrl(value?: string) {
  if (!value) return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function hasSupabaseEnv() {
  return (
    isValidHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim())
  );
}

export function getSupabaseEnv() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const rawAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  // Fallbacks prevent runtime constructor crashes when env is not configured yet.
  // Real data operations should be guarded by hasSupabaseEnv().
  const url: string = isValidHttpUrl(rawUrl) ? rawUrl! : "https://example.com";
  const anonKey: string =
    rawAnon ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder.signature";

  return { url, anonKey };
}
