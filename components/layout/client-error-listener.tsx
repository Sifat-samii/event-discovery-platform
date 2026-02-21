"use client";

import { useEffect } from "react";
import { logClientError } from "@/lib/utils/client-logger";

export default function ClientErrorListener() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      logClientError({
        source: "window-error",
        message: event.message,
        metadata: {
          file: event.filename,
          line: event.lineno,
        },
      });
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      logClientError({
        source: "window-unhandled-rejection",
        message: "Unhandled promise rejection",
        error: String(event.reason),
      });
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
