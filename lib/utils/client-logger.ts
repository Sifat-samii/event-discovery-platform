type ClientLogPayload = {
  source?: string;
  scope?: string;
  message: string;
  error?: string;
  stack?: string;
  metadata?: Record<string, unknown>;
};

export function logClientError(payload: ClientLogPayload) {
  const body = {
    ...payload,
    source: payload.source || payload.scope || "client",
    timestamp: new Date().toISOString(),
  };
  console.error("[client-error]", body);
}

