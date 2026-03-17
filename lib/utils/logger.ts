export type ApiLogContext = {
  route: string;
  correlationId?: string;
  userId?: string | null;
  role?: string | null;
  action?: string;
  status?: number;
  meta?: Record<string, unknown>;
};

function basePayload(context: ApiLogContext) {
  return {
    timestamp: new Date().toISOString(),
    route: context.route,
    correlationId: context.correlationId || null,
    userId: context.userId || null,
    role: context.role || null,
    action: context.action || null,
    status: context.status || null,
    meta: context.meta || {},
  };
}

export function logApiInfo(context: ApiLogContext, message: string) {
  console.info("[api-info]", { ...basePayload(context), message });
}

export function logApiWarn(context: ApiLogContext, message: string) {
  console.warn("[api-warn]", { ...basePayload(context), message });
}

export function logApiError(route: string, error: unknown, context?: Omit<ApiLogContext, "route">) {
  const payload = {
    ...basePayload({ route, ...context }),
    error: error instanceof Error ? error.message : String(error),
  };
  console.error("[api-error]", payload);
}
