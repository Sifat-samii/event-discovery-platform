export function slugify(value: string, maxLength = 80) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, maxLength);
}

export function generateEventSlug(title: string) {
  const base = slugify(title || "event");
  const nonce = Date.now().toString().slice(-6);
  return `${base}-${nonce}`;
}

