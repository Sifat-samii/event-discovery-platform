"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface EventActionsProps {
  eventId: string;
  eventSlug: string;
}

export default function EventActions({ eventId, eventSlug }: EventActionsProps) {
  const { pushToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/save`, { cache: "no-store" });
        const data = await response.json();
        if (response.ok) setSaved(Boolean(data.saved));
      } catch {
        // silent fallback
      }
    };
    loadSavedState();
  }, [eventId]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/events/${eventSlug}`;
  }, [eventSlug]);

  const toggleSave = async () => {
    const previousState = saved;
    const nextState = !saved;
    setSaved(nextState);
    setSaving(true);
    try {
      const response = await fetch(`/api/events/${eventId}/save`, {
        method: previousState ? "DELETE" : "POST",
      });
      const data = await response.json();
      if (response.ok) {
        setSaved(Boolean(data.saved));
        pushToast({
          title: data.saved ? "Event saved" : "Removed from saved",
          type: "success",
        });
      } else {
        setSaved(previousState);
        pushToast({
          title: "Failed to update save",
          description: data.error || "Please try again.",
          type: "danger",
        });
      }
    } catch {
      setSaved(previousState);
      pushToast({
        title: "Network error",
        description: "Could not save right now.",
        type: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  const shareEvent = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      await navigator.share({ url: shareUrl });
      pushToast({ title: "Shared successfully", type: "success" });
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
    pushToast({ title: "Link copied", type: "success" });
  };

  const reportEvent = async () => {
    if (!reportReason.trim()) {
      pushToast({ title: "Report reason is required", type: "warning" });
      return;
    }
    setReporting(true);
    try {
      const response = await fetch(`/api/events/${eventId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason.trim(), description: reportDescription.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        pushToast({
          title: "Failed to submit report",
          description: data.error || "Please try again.",
          type: "danger",
        });
        return;
      }
      setReportDialogOpen(false);
      setReportReason("");
      setReportDescription("");
      pushToast({ title: "Report submitted", type: "success" });
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="glass-surface sticky top-4 space-y-4 rounded-xl p-6">
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
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full text-destructive">
            <Flag className="mr-2 h-4 w-4" />
            Report Incorrect Info
          </Button>
        </DialogTrigger>
        <DialogContent>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Report incorrect info</h3>
            <Input
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Reason (wrong date, wrong venue, duplicate...)"
            />
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className="min-h-[120px] w-full rounded-md border border-input bg-background p-3 text-sm"
              placeholder="Additional context (optional)"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setReportDialogOpen(false)}>
                Cancel
              </Button>
              <Button disabled={reporting} onClick={reportEvent}>
                {reporting ? "Submitting..." : "Submit report"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
