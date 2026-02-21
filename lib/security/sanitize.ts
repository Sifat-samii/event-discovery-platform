export function sanitizeText(input: unknown, maxLength: number) {
  const raw = String(input ?? "");
  const cleaned = raw
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, maxLength);
}

export function sanitizeUrlQuery(input: unknown, maxLength: number) {
  return sanitizeText(input, maxLength).replace(/[^\w\s\-&,.:/]/g, "");
}

export function sanitizeUuid(input: unknown) {
  const value = sanitizeText(input, 36);
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    );
  return isUuid ? value : null;
}

export function sanitizeUuidList(input: unknown) {
  const value = sanitizeText(input, 2000);
  return value
    .split(",")
    .map((item) => sanitizeUuid(item))
    .filter(Boolean) as string[];
}

