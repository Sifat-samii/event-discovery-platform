"use client";

import { useEffect, useRef } from "react";

export default function EventViewTracker({ eventId }: { eventId: string }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    fetch(`/api/events/${eventId}/click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "event_detail" }),
      keepalive: true,
    }).catch(() => undefined);
  }, [eventId]);

  return null;
}
