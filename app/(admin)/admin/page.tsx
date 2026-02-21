"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import AppShell from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

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
  const supabase = useMemo(() => createClient(), []);
  const { pushToast } = useToast();

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*, organizer:organizers(name)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchReports = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("event_reports")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  }, [supabase]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      const admin = profile?.role === "admin";
      setIsAdmin(admin);
      if (!admin) {
        setLoading(false);
        return;
      }
      await Promise.all([fetchEvents(), fetchReports()]);
    };
    getUser();
  }, [fetchEvents, fetchReports, supabase]);

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
    const response = await fetch(`/api/reports/${reportId}/resolve`, {
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

  const organizerNames = Array.from(
    new Set(
      events
        .map((event) => event.organizer?.name)
        .filter(Boolean) as string[]
    )
  );
  const duplicateKeyCount = events.reduce<Record<string, number>>((acc, event) => {
    const key = `${event.title?.toLowerCase()}|${new Date(event.start_date).toDateString()}|${event.venue_name?.toLowerCase()}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <AppShell>
      <main className="min-h-screen py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        <Tabs defaultValue="events" className="w-full">
          <TabsList>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
            <TabsTrigger value="ai-extract">AI Extract</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-6">
            <div className="mb-4 grid gap-3 rounded-xl border border-border bg-surface-1 p-4 md:grid-cols-5">
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
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
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                />
                Verified only
              </label>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={organizerFilter}
                onChange={(e) => setOrganizerFilter(e.target.value)}
              >
                <option value="all">All organizers</option>
                {organizerNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <Button>Create New Event</Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-4 text-left">Title</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events
                    .filter((event) => (statusFilter === "all" ? true : event.status === statusFilter))
                    .filter((event) => (verifiedOnly ? !!event.verified : true))
                    .filter((event) => (organizerFilter === "all" ? true : event.organizer?.name === organizerFilter))
                    .filter((event) =>
                      dateFilter
                        ? new Date(event.start_date).toISOString().slice(0, 10) === dateFilter
                        : true
                    )
                    .map((event) => (
                    <tr key={event.id} className="border-t">
                      <td className="p-4">
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs text-muted-foreground">{event.organizer?.name || "Unknown organizer"}</div>
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
                          Event ID: {report.event_id}
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
              <div>
                <label className="block text-sm font-medium mb-2">
                  Event Link or Text
                </label>
                <textarea
                  className="w-full p-3 border rounded-md"
                  rows={5}
                  placeholder="Paste event link or description here..."
                />
              </div>
              <Button>Extract Event Data</Button>
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
                  <p><span className="font-medium">Event ID:</span> {selectedReport.event_id}</p>
                  <p className="mt-2 text-muted-foreground">{selectedReport.description || "No description."}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => resolveReport(selectedReport.id, "reviewed")}>
                    Mark Reviewed
                  </Button>
                  <Button onClick={() => resolveReport(selectedReport.id, "resolved")}>
                    Mark Resolved
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={`/events/${selectedReport.event_id}`} target="_blank" rel="noreferrer">
                      Open event page
                    </a>
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </main>
    </AppShell>
  );
}
