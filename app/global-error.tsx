"use client";

import { logClientError } from "@/lib/utils/client-logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  logClientError({
    source: "app/global-error",
    message: "Global app crash",
    error: error.message,
    stack: error.stack,
    metadata: { digest: error.digest },
  });

  return (
    <html>
      <body>
        <div className="container mx-auto px-4 py-16 text-center space-y-4">
          <h2 className="text-2xl font-bold">Critical Error</h2>
          <p>The app encountered a critical issue.</p>
          <button
            onClick={() => reset()}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
