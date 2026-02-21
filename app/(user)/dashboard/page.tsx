"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import AppShell from "@/components/layout/app-shell";
import EventCard from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";

type ReminderPreference = "off" | "24h" | "3h" | "both";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [reminderPrefs, setReminderPrefs] = useState<Record<string, ReminderPreference>>({});
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const { pushToast } = useToast();

  const fetchSavedEvents = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("saved_events")
        .select(`
          *,
          event:events(
            *,
            category:event_categories(*),
            organizer:organizers(*),
            area:event_areas(*)
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedEvents(data || []);
      if (data?.length) {
        const eventIds = data.map((item: any) => item.event_id).join(",");
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
      console.error("Error fetching saved events:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchSavedEvents(user.id);
      } else {
        setLoading(false);
      }
    };
    getUser();
  }, [fetchSavedEvents, supabase]);

  if (loading) {
    return (
      <AppShell>
        <main className="min-h-screen py-8">
          <div className="text-center">Loading...</div>
        </main>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <main className="min-h-screen py-8">
          <div className="text-center">
            <p className="mb-4">Please log in to view your dashboard.</p>
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
          </div>
        </main>
      </AppShell>
    );
  }

  const now = new Date();
  const upcoming = savedEvents.filter(
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
  const past = savedEvents.filter(
    (item: any) => new Date(item.event?.start_date || 0) < now
  );

  return (
    <AppShell>
      <main className="min-h-screen py-8">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList>
            <TabsTrigger value="saved">All Saved ({savedEvents.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            <TabsTrigger value="settings">Reminder Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="mt-6">
            {savedEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {savedEvents.map((item: any) => (
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
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No saved events yet.</p>
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
            <div className="max-w-2xl space-y-4">
              <h2 className="text-xl font-semibold">Email Reminder Settings</h2>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span>24 hours before event</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span>3 hours before event</span>
                </label>
              </div>
              <Button>Save Settings</Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </AppShell>
  );
}
