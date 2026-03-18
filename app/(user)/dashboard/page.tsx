"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/layout/app-shell";
import EventCard from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { logClientError } from "@/lib/utils/client-logger";

type ReminderPreference = "off" | "24h" | "3h" | "both";

function ReminderSettingsTab({
  savedEvents,
  reminderPrefs,
  updateReminder,
}: {
  savedEvents: any[];
  reminderPrefs: Record<string, ReminderPreference>;
  updateReminder: (eventId: string, pref: ReminderPreference) => Promise<void>;
}) {
  const [bulkPref, setBulkPref] = useState<ReminderPreference>("24h");
  const [applying, setApplying] = useState(false);

  const handleBulkApply = async () => {
    setApplying(true);
    for (const item of savedEvents) {
      await updateReminder(item.event_id, bulkPref);
    }
    setApplying(false);
  };

  if (!savedEvents.length) {
    return (
      <div className="max-w-2xl text-center py-12">
        <p className="text-muted-foreground mb-4">Save events first to configure reminders.</p>
        <Button asChild>
          <a href="/browse">Browse Events</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-4">
        <h2 className="text-lg font-semibold">Bulk Reminder Preference</h2>
        <p className="text-sm text-muted-foreground">
          Set a default reminder preference for all your saved events at once.
        </p>
        <div className="flex items-center gap-3">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={bulkPref}
            onChange={(e) => setBulkPref(e.target.value as ReminderPreference)}
          >
            <option value="off">Off</option>
            <option value="24h">24 hours before</option>
            <option value="3h">3 hours before</option>
            <option value="both">Both (24h + 3h)</option>
          </select>
          <Button onClick={handleBulkApply} disabled={applying}>
            {applying ? "Applying..." : `Apply to All (${savedEvents.length})`}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-3">
        <h2 className="text-lg font-semibold">Per-Event Reminders</h2>
        <div className="divide-y divide-border">
          {savedEvents.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {item.event?.title || "Untitled event"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.event?.start_date
                    ? new Date(item.event.start_date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "No date"}
                </p>
              </div>
              <select
                className="h-9 shrink-0 rounded-md border border-input bg-background px-2 text-sm"
                value={reminderPrefs[item.event_id] || "24h"}
                onChange={(e) =>
                  updateReminder(item.event_id, e.target.value as ReminderPreference)
                }
              >
                <option value="off">Off</option>
                <option value="24h">24h</option>
                <option value="3h">3h</option>
                <option value="both">Both</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [reminderPrefs, setReminderPrefs] = useState<Record<string, ReminderPreference>>({});
  const [loading, setLoading] = useState(true);
  const [userLoadFailed, setUserLoadFailed] = useState(false);
  const { pushToast } = useToast();

  const fetchSavedEvents = useCallback(async () => {
    try {
      const savesResponse = await fetch("/api/users/me/saves?page=1&limit=100");
      const savesBody = await savesResponse.json();
      if (!savesResponse.ok) {
        throw new Error(savesBody.error || "Failed to load saved events");
      }
      const saves = savesBody.data || [];
      setSavedEvents(saves);

      if (saves.length) {
        const eventIds = saves.map((item: any) => item.event_id).join(",");
        const reminderResponse = await fetch(`/api/reminders?event_ids=${encodeURIComponent(eventIds)}`);
        if (reminderResponse.ok) {
          const remindersBody = await reminderResponse.json();
          const nextPrefs: Record<string, ReminderPreference> = {};
          for (const reminder of remindersBody.reminders || []) {
            if (reminder.reminder_24h && reminder.reminder_3h) nextPrefs[reminder.event_id] = "both";
            else if (reminder.reminder_24h) nextPrefs[reminder.event_id] = "24h";
            else if (reminder.reminder_3h) nextPrefs[reminder.event_id] = "3h";
            else nextPrefs[reminder.event_id] = "off";
          }
          setReminderPrefs(nextPrefs);
        }
      }
    } catch (error) {
      logClientError({
        scope: "dashboard",
        message: "Failed to fetch saved events",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch("/api/users/me");
        const body = await response.json();
        if (!response.ok) {
          setUser(null);
          setLoading(false);
          setUserLoadFailed(response.status >= 500);
          return;
        }
        setUser(body.user || null);
        await fetchSavedEvents();
      } catch (error) {
        setUser(null);
        setLoading(false);
        setUserLoadFailed(true);
        logClientError({
          scope: "dashboard",
          message: "Failed to fetch authenticated user",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };
    getUser();
  }, [fetchSavedEvents]);

  if (loading) {
    return (
      <AppShell>
        <main className="min-h-screen py-10">
          <div className="mx-auto max-w-5xl animate-pulse space-y-6">
            <div className="h-8 w-48 rounded-xl bg-surface-2/60" />
            <div className="h-12 w-80 rounded-xl bg-surface-2/60" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => <div key={i} className="h-64 rounded-2xl bg-surface-2/60" />)}
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <main className="min-h-screen py-10">
          <div className="glass-surface mx-auto max-w-sm p-8 text-center animate-fade-up">
            <p className="mb-5 text-muted-foreground">
              {userLoadFailed ? "Could not verify your account right now." : "Please log in to view your dashboard."}
            </p>
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
          </div>
        </main>
      </AppShell>
    );
  }

  const now = new Date();
  const validSavedEvents = savedEvents.filter((item: any) => item.event != null);
  const upcoming = validSavedEvents.filter(
    (item: any) => new Date(item.event?.start_date || 0) >= now
  );

  const updateReminder = async (eventId: string, nextPref: ReminderPreference) => {
    const previous = reminderPrefs[eventId] || "24h";
    setReminderPrefs((prev) => ({ ...prev, [eventId]: nextPref }));
    const reminder_24h = nextPref === "24h" || nextPref === "both";
    const reminder_3h = nextPref === "3h" || nextPref === "both";
    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, reminder_24h, reminder_3h }),
      });
      const body = await response.json();
      if (!response.ok) {
        setReminderPrefs((prev) => ({ ...prev, [eventId]: previous }));
        pushToast({
          title: "Failed to update reminder",
          description: body.error || "Please try again.",
          type: "danger",
        });
        return;
      }
      pushToast({ title: "Reminder scheduled", type: "success" });
    } catch {
      setReminderPrefs((prev) => ({ ...prev, [eventId]: previous }));
      pushToast({ title: "Network error", description: "Could not update reminder.", type: "danger" });
    }
  };
  const past = validSavedEvents.filter(
    (item: any) => new Date(item.event?.start_date || 0) < now
  );

  return (
    <AppShell>
      <main className="min-h-screen py-8">
        <h1 className="text-2xl font-bold tracking-tight mb-6">My Dashboard</h1>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList>
            <TabsTrigger value="saved">All Saved ({validSavedEvents.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            <TabsTrigger value="settings">Reminder Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="mt-6">
            {validSavedEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {validSavedEvents.map((item: any) => (
                  <div key={item.id} className="space-y-2">
                    <EventCard event={item.event} />
                    <div className="rounded-xl border border-border/30 bg-surface-1/60 backdrop-blur-sm p-3">
                      <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Reminder
                      </label>
                      <select
                        className="h-9 w-full rounded-lg border border-border/40 bg-surface-2/50 px-2 text-[13px] transition-colors hover:bg-surface-2/70 focus:ring-2 focus:ring-ring/30 focus:outline-none"
                        value={reminderPrefs[item.event_id] || "24h"}
                        onChange={(e) =>
                          updateReminder(item.event_id, e.target.value as ReminderPreference)
                        }
                      >
                        <option value="off">Off</option>
                        <option value="24h">24h</option>
                        <option value="3h">3h</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-surface p-10 text-center">
                <p className="text-muted-foreground mb-5">No saved events yet.</p>
                <Button asChild>
                  <a href="/browse">Browse Events</a>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            {upcoming.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map((item: any) => (
                  <div key={item.id} className="space-y-2">
                    <EventCard event={item.event} />
                    <div className="rounded-lg border border-border bg-surface-1 p-3">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Reminder
                      </label>
                      <select
                        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                        value={reminderPrefs[item.event_id] || "24h"}
                        onChange={(e) =>
                          updateReminder(item.event_id, e.target.value as ReminderPreference)
                        }
                      >
                        <option value="off">Off</option>
                        <option value="24h">24h</option>
                        <option value="3h">3h</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No upcoming saved events.</p>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {past.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {past.map((item: any) => (
                  <EventCard key={item.id} event={item.event} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No past saved events.</p>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <ReminderSettingsTab savedEvents={validSavedEvents} reminderPrefs={reminderPrefs} updateReminder={updateReminder} />
          </TabsContent>
        </Tabs>
      </main>
    </AppShell>
  );
}
