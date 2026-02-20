"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag, Share2 } from "lucide-react";

interface EventActionsProps {
  eventId: string;
  eventSlug: string;
}

export default function EventActions({ eventId, eventSlug }: EventActionsProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reporting, setReporting] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/events/${eventSlug}`;
  }, [eventSlug]);

  const toggleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/events/${eventId}/save`, {
        method: saved ? "DELETE" : "POST",
      });
      const data = await response.json();
      if (response.ok) {
        setSaved(Boolean(data.saved));
      } else {
        alert(data.error || "Failed to update save state");
      }
    } finally {
      setSaving(false);
    }
  };

  const shareEvent = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      await navigator.share({ url: shareUrl });
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard");
  };

  const reportEvent = async () => {
    const reason = prompt("Reason for report (e.g. wrong date, wrong venue, duplicate):");
    if (!reason) return;
    const description = prompt("Optional details") || "";
    setReporting(true);
    try {
      const response = await fetch(`/api/events/${eventId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, description }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Failed to submit report");
        return;
      }
      alert("Report submitted successfully");
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 space-y-4 sticky top-4">
      <Button className="w-full" disabled={saving} onClick={toggleSave}>
        {saving ? "Saving..." : saved ? "Saved" : "Save Event"}
      </Button>
      <Button variant="outline" className="w-full" onClick={shareEvent}>
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
      <a
        href={`/api/events/${eventId}/calendar.ics`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
      >
        Add to Calendar
      </a>
      <Button
        variant="outline"
        className="w-full text-destructive"
        onClick={reportEvent}
        disabled={reporting}
      >
        <Flag className="h-4 w-4 mr-2" />
        {reporting ? "Reporting..." : "Report Incorrect Info"}
      </Button>
    </div>
  );
}
