"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { logClientError } from "@/lib/utils/client-logger";

function AdminCreateEventDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [venueName, setVenueName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const { pushToast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          start_date: startDate || null,
          venue_name: venueName.trim() || null,
          description: description.trim() || null,
          status: "draft",
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to create event");
      setTitle("");
      setStartDate("");
      setVenueName("");
      setDescription("");
      onCreated();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Please try again.";
      setError(msg);
      pushToast({ title: "Creation failed", description: msg, type: "danger" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <h3 className="text-lg font-semibold mb-4">Create New Event (Draft)</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Venue</label>
            <Input value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="Venue name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full rounded-md border border-input bg-background p-3 text-sm"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Draft"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [organizerFilter, setOrganizerFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [page] = useState(1);
  const [limit] = useState(50);
  const { pushToast } = useToast();

  const fetchEvents = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        status: statusFilter,
      });
      if (organizerFilter !== "all") params.set("organizer", organizerFilter);
      if (dateFilter) params.set("date", dateFilter);
      const response = await fetch(`/api/admin/events?${params.toString()}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to load events");
      setEvents(body.data || []);
    } catch (error) {
      pushToast({ title: "Failed to load events", type: "danger" });
    } finally {
      setLoading(false);
    }
  }, [dateFilter, limit, organizerFilter, page, pushToast, statusFilter]);

  const fetchReports = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const response = await fetch(`/api/admin/reports?${params.toString()}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to load reports");
      setReports(body.data || []);
    } catch (error) {
      pushToast({ title: "Failed to load reports", type: "danger" });
    }
  }, [limit, page, pushToast]);

  useEffect(() => {
    const getUser = async () => {
      const response = await fetch("/api/users/me");
      const body = await response.json();
      if (!response.ok) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(body.user || null);
      const admin = body?.user?.role === "admin";
      setIsAdmin(admin);
      if (!admin) {
        setLoading(false);
        return;
      }
    };
    getUser();
  }, []);

  const updateEventStatus = async (eventId: string, status: string) => {
    const response = await fetch(`/api/admin/events/${eventId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const body = await response.json();
      pushToast({
        title: "Status update failed",
        description: body.error || "Please try again.",
        type: "danger",
      });
      return;
    }
    fetchEvents();
    pushToast({ title: `Event set to ${status}`, type: "success" });
  };

  const updateEventVerified = async (eventId: string, verified: boolean) => {
    const response = await fetch(`/api/admin/events/${eventId}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified }),
    });
    if (!response.ok) {
      const body = await response.json();
      pushToast({
        title: "Verify update failed",
        description: body.error || "Please try again.",
        type: "danger",
      });
      return;
    }
    fetchEvents();
    pushToast({ title: verified ? "Event verified" : "Verification removed", type: "success" });
  };

  const resolveReport = async (reportId: string, status: "reviewed" | "resolved") => {
    const response = await fetch(`/api/admin/reports/${reportId}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const body = await response.json();
      pushToast({
        title: "Report update failed",
        description: body.error || "Please try again.",
        type: "danger",
      });
      return;
    }
    setSelectedReport(null);
    fetchReports();
    pushToast({ title: `Report marked ${status}`, type: "success" });
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchEvents();
  }, [fetchEvents, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchReports();
  }, [fetchReports, isAdmin]);

  if (loading) {
    return (
      <AppShell>
        <main className="min-h-screen py-8">
          <div>Loading...</div>
        </main>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <main className="min-h-screen py-8">
          <div className="text-center">
            <p className="mb-4">Please log in to access admin panel.</p>
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
          </div>
        </main>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <main className="min-h-screen py-8">
          <p className="text-center">Admin access required.</p>
        </main>
      </AppShell>
    );
  }

  const organizers = Array.from(
    new Set(
      events.map((event) =>
        event.organizer?.id && event.organizer?.name
          ? `${event.organizer.id}::${event.organizer.name}`
          : ""
      )
    )
  )
    .filter(Boolean)
    .map((item) => {
      const [id, name] = item.split("::");
      return { id, name };
    });
  const duplicateKeyCount = events.reduce<Record<string, number>>((acc, event) => {
    const key = `${event.title?.toLowerCase()}|${new Date(event.start_date).toDateString()}|${event.venue_name?.toLowerCase()}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <AppShell>
      <main className="min-h-screen py-8">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Admin Panel</h1>

        <Tabs defaultValue="events" className="w-full">
          <TabsList>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
            <TabsTrigger value="ai-extract">AI Extract</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-6">
            <div className="mb-5 sf-section">
              <div className="grid gap-3 p-4 md:grid-cols-5">
                <select
                  className="h-10 rounded-xl border border-border/40 bg-surface-2/50 px-3 text-[13px] transition-colors hover:bg-surface-2/70 focus:ring-2 focus:ring-ring/30 focus:outline-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="published">Published</option>
                  <option value="expired">Expired</option>
                  <option value="archived">Archived</option>
                </select>
                <label className="flex items-center gap-2 text-[13px] text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="accent-primary"
                  />
                  Verified only
                </label>
                <select
                  className="h-10 rounded-xl border border-border/40 bg-surface-2/50 px-3 text-[13px] transition-colors hover:bg-surface-2/70 focus:ring-2 focus:ring-ring/30 focus:outline-none"
                  value={organizerFilter}
                  onChange={(e) => setOrganizerFilter(e.target.value)}
                >
                  <option value="all">All organizers</option>
                  {organizers.map((organizer) => (
                    <option key={organizer.id} value={organizer.id}>
                      {organizer.name}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  className="h-10 rounded-xl border border-border/40 bg-surface-2/50 px-3 text-[13px] transition-colors hover:bg-surface-2/70 focus:ring-2 focus:ring-ring/30 focus:outline-none"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-4">
              <Button onClick={() => setShowCreateDialog(true)}>Create New Event</Button>
            </div>
            <div className="sf-section overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40 bg-surface-2/30">
                    <th className="p-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Title</th>
                    <th className="p-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="p-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="p-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events
                    .filter((event) => (verifiedOnly ? !!event.verified : true))
                    .map((event) => (
                    <tr key={event.id} className="border-t border-border/30 hover:bg-surface-2/20 transition-colors">
                      <td className="p-4">
                        <div className="text-[14px] font-medium tracking-tight">{event.title}</div>
                        <div className="text-[12px] text-muted-foreground">{event.organizer?.name || "Unknown organizer"}</div>
                        {duplicateKeyCount[
                          `${event.title?.toLowerCase()}|${new Date(event.start_date).toDateString()}|${event.venue_name?.toLowerCase()}`
                        ] > 1 ? (
                          <span className="mt-1 inline-flex rounded-full border border-warning/40 bg-surface-2 px-2 py-0.5 text-[10px] text-warning">
                            Duplicate warning
                          </span>
                        ) : null}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs rounded bg-muted">
                          {event.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {new Date(event.start_date).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateEventStatus(event.id, "published")}
                          >
                            Publish
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateEventStatus(event.id, "pending")}
                          >
                            Unpublish
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateEventVerified(event.id, !event.verified)}
                          >
                            {event.verified ? "Unverify" : "Verify"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateEventStatus(event.id, "expired")}
                          >
                            Expire
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateEventStatus(event.id, "archived")}
                          >
                            Archive
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{report.reason}</h3>
                        <p className="text-sm text-muted-foreground">
                          Event: {report.event?.title || report.event_id}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded bg-yellow-100">
                        {report.status}
                      </span>
                    </div>
                    {report.description && (
                      <p className="text-sm mb-2">{report.description}</p>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setSelectedReport(report)}>
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => resolveReport(report.id, "resolved")}>
                        Resolve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No open reports.</p>
            )}
          </TabsContent>

          <TabsContent value="ai-extract" className="mt-6">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-xl font-semibold">AI Event Extraction</h2>
              <p className="text-sm text-muted-foreground">
                Paste an event link or description text and the system will attempt to extract structured event data automatically.
              </p>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Event Link or Text
                </label>
                <textarea
                  className="w-full rounded-md border border-input bg-background p-3 text-sm"
                  rows={5}
                  placeholder="Paste event link or description here..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                />
              </div>
              <Button
                disabled={aiLoading || !aiInput.trim()}
                onClick={async () => {
                  setAiLoading(true);
                  setAiResult(null);
                  try {
                    const isUrl = aiInput.trim().startsWith("http");
                    const response = await fetch("/api/ai/extract", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(isUrl ? { url: aiInput.trim() } : { text: aiInput.trim() }),
                    });
                    const body = await response.json();
                    if (!response.ok) throw new Error(body.error || "Extraction failed");
                    setAiResult(body);
                    pushToast({ title: "Event extracted and saved as draft", type: "success" });
                    fetchEvents();
                  } catch (error) {
                    const msg = error instanceof Error ? error.message : "Unknown error";
                    pushToast({ title: "Extraction failed", description: msg, type: "danger" });
                    logClientError({ scope: "admin-ai-extract", message: msg });
                  } finally {
                    setAiLoading(false);
                  }
                }}
              >
                {aiLoading ? "Extracting..." : "Extract Event Data"}
              </Button>
              {aiResult && (
                <div className="rounded-xl border border-success/30 bg-surface-1 p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-success">Extraction Result</h3>
                  <div className="grid gap-2 text-sm">
                    {Object.entries(aiResult.extractedData || {}).map(([key, val]) => (
                      <div key={key} className="flex gap-2">
                        <span className="font-medium capitalize text-muted-foreground">{key}:</span>
                        <span>{Array.isArray(val) ? (val as string[]).join(", ") : String(val)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Event saved as draft. You can find and publish it in the Events tab.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        <Dialog open={Boolean(selectedReport)} onOpenChange={(open) => !open && setSelectedReport(null)}>
          <DialogContent>
            {selectedReport ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Report detail</h3>
                <div className="rounded-lg border border-border bg-surface-1 p-3 text-sm">
                  <p><span className="font-medium">Reason:</span> {selectedReport.reason}</p>
                  <p><span className="font-medium">Status:</span> {selectedReport.status}</p>
                  <p><span className="font-medium">Event:</span> {selectedReport.event?.title || selectedReport.event_id}</p>
                  <p className="mt-2 text-muted-foreground">{selectedReport.description || "No description."}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => resolveReport(selectedReport.id, "reviewed")}>
                    Mark Reviewed
                  </Button>
                  <Button onClick={() => resolveReport(selectedReport.id, "resolved")}>
                    Mark Resolved
                  </Button>
                  {selectedReport.event?.slug ? (
                    <Button variant="outline" asChild>
                      <a href={`/events/${selectedReport.event.slug}`} target="_blank" rel="noreferrer">
                        Open event page
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        <AdminCreateEventDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreated={() => {
            fetchEvents();
            setShowCreateDialog(false);
            pushToast({ title: "Event created as draft", type: "success" });
          }}
        />
      </main>
    </AppShell>
  );
}
