export function isPubliclyVisibleEvent(event: {
  status?: string | null;
  end_date?: string | null;
  deleted_at?: string | null;
}) {
  if (!event || event.deleted_at) return false;
  if (event.status !== "published") return false;
  if (!event.end_date) return false;
  return new Date(event.end_date).getTime() >= Date.now();
}

