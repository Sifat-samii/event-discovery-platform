type ClientLogPayload = {
  source?: string;
  scope?: string;
  message: string;
  error?: string;
  stack?: string;
  metadata?: Record<string, unknown>;
};

export function logClientError(payload: ClientLogPayload) {
  const safePayload = payload && typeof payload === "object" ? payload : { message: "Unknown client error" };
  const body = {
    ...safePayload,
    source: safePayload.source || safePayload.scope || "client",
    timestamp: new Date().toISOString(),
  };
  // Keep visibility in dev without triggering Next.js console error overlay noise.
  console.warn("[client-error]", body);
}

