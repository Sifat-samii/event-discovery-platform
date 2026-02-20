"use client";

import { useEffect } from "react";

export default function ClientErrorListener() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      console.error("[client-error]", {
        message: event.message,
        source: event.filename,
        line: event.lineno,
      });
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("[client-unhandled-rejection]", {
        reason: String(event.reason),
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
