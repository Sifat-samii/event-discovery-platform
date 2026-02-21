export function normalizePagination(searchParams: URLSearchParams, defaults?: { page?: number; limit?: number }) {
  const page = Math.max(1, parseInt(searchParams.get("page") || String(defaults?.page || 1), 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || String(defaults?.limit || 20), 10) || 20)
  );
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { page, limit, from, to };
}

export function paginatedResponse<T>(opts: {
  data: T[];
  total: number;
  page: number;
  limit: number;
  extra?: Record<string, unknown>;
}) {
  return {
    data: opts.data,
    total: opts.total,
    page: opts.page,
    limit: opts.limit,
    hasNext: opts.page * opts.limit < opts.total,
    ...(opts.extra || {}),
  };
}

