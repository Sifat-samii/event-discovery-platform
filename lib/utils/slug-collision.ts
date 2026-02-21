export function resolveUniqueSlugFromExisting(baseSlug: string, existingSlugs: string[]) {
  const base = (baseSlug || "event").toLowerCase();
  const used = new Set(existingSlugs.map((item) => item.toLowerCase()));
  if (!used.has(base)) return base;

  let suffix = 2;
  while (suffix < 5000) {
    const candidate = `${base}-${suffix}`;
    if (!used.has(candidate)) return candidate;
    suffix += 1;
  }
  return `${base}-${Date.now().toString().slice(-6)}`;
}

