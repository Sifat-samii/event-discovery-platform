"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center space-y-4">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="text-muted-foreground">An unexpected error occurred. Please try again.</p>
      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  );
}
