export function logApiError(route: string, error: unknown) {
  const payload = {
    route,
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? error.message : String(error),
  };
  console.error("[api-error]", payload);
}
