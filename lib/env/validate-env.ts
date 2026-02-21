type EnvValidationResult = {
  ok: boolean;
  missing: string[];
};

function isValidHttpUrl(value?: string) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateRequiredEnv(requiredKeys: string[]): EnvValidationResult {
  const missing = requiredKeys.filter((key) => !process.env[key]?.trim());
  return { ok: missing.length === 0, missing };
}

export function validateRuntimeEnv() {
  const checks: Array<{ key: string; valid: boolean }> = [
    { key: "NEXT_PUBLIC_SITE_URL", valid: isValidHttpUrl(process.env.NEXT_PUBLIC_SITE_URL) },
    { key: "NEXT_PUBLIC_SUPABASE_URL", valid: isValidHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) },
    {
      key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      valid: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()),
    },
  ];
  const invalid = checks.filter((item) => !item.valid).map((item) => item.key);
  return { ok: invalid.length === 0, invalid };
}

