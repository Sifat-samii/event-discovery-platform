"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { logClientError } from "@/lib/utils/client-logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logClientError({
      source: "app/error",
      message: "Segment error boundary caught",
      error: error.message,
      stack: error.stack,
      metadata: { digest: error.digest },
    });
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center space-y-4">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="text-muted-foreground">An unexpected error occurred. Please try again.</p>
      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  );
}
