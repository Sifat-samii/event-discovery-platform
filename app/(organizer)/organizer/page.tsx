"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EventStepperForm from "@/components/organizer/event-stepper-form";
import { useToast } from "@/components/ui/toast";
import { logClientError } from "@/lib/utils/client-logger";

export default function OrganizerPortal() {
  const [user, setUser] = useState<any>(null);
  const [organizer, setOrganizer] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const { pushToast } = useToast();

  const fetchOrganizer = useCallback(async () => {
    try {
      const response = await fetch("/api/organizer/profile");
      const body = await response.json();
      if (response.status === 403) {
        setAccessDenied(true);
        return;
      }
      if (!response.ok) throw new Error(body.error || "Failed to load organizer profile");
      setOrganizer(body.organizer || null);
    } catch (error) {
      logClientError({
        scope: "organizer-portal",
        message: "Failed to fetch organizer profile",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  const fetchEvents = useCallback(async (userId: string) => {
    try {
      if (!userId) {
        setLoading(false);
        return;
      }
      const response = await fetch("/api/organizer/events?page=1&limit=100");
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to load events");
      setEvents(body.data || []);
    } catch (error) {
      logClientError({
        scope: "organizer-portal",
        message: "Failed to fetch organizer events",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmitDraft = async (draft: any) => {
    const response = await fetch("/api/organizer/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const body = await response.json();
    if (!response.ok) {
      throw new Error(body.error || "Could not submit event");
    }
    if (user?.id) await fetchEvents(user.id);
    pushToast({
      title: "Event submitted",
      description: "Your event is now pending admin review.",
      type: "success",
    });
  };

  const handleDeleteEvent = async (eventId: string) => {
    const response = await fetch(`/api/organizer/events/${eventId}`, { method: "DELETE" });
    const body = await response.json();
    if (!response.ok) {
      pushToast({
        title: "Delete failed",
        description: body.error || "Please try again.",
        type: "danger",
      });
      return;
    }
    if (user?.id) await fetchEvents(user.id);
    pushToast({ title: "Event deleted", description: "Soft deleted successfully.", type: "success" });
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch("/api/users/me");
        const body = await response.json();
        if (!response.ok) {
          setUser(null);
          setLoading(false);
          return;
        }
        setUser(body.user || null);
        if (body.user?.id) {
          await Promise.all([fetchOrganizer(), fetchEvents(body.user.id)]);
        } else {
          setLoading(false);
        }
      } catch (error) {
        logClientError({
          scope: "organizer-portal",
          message: "Failed to fetch authenticated user",
          error: error instanceof Error ? error.message : String(error),
        });
        setLoading(false);
      }
    };
    getUser();
  }, [fetchEvents, fetchOrganizer]);

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
            <p className="mb-4">Please log in to access organizer portal.</p>
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
          </div>
        </main>
      </AppShell>
    );
  }

  if (accessDenied) {
    return (
      <AppShell>
        <main className="min-h-screen py-8">
          <p className="text-center">Organizer access required.</p>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="min-h-screen py-8">
        <h1 className="text-3xl font-bold mb-8">Organizer Portal</h1>

        {!organizer ? (
          <div className="max-w-2xl space-y-4">
            <h2 className="text-xl font-semibold">Create Organizer Profile</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Organizer Name</label>
                <Input placeholder="Enter organizer name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full p-3 border rounded-md"
                  rows={4}
                  placeholder="Describe your organization..."
                />
              </div>
              <Button>Create Profile</Button>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-surface-1 p-4">
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="mt-1 text-2xl font-semibold">{events.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface-1 p-4">
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="mt-1 text-2xl font-semibold">
                  {events.filter((e) => e.status === "published").length}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-1 p-4">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="mt-1 text-2xl font-semibold">
                  {events.filter((e) => e.status === "pending").length}
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">My Events</h2>
              <Button className="mb-4" onClick={() => setShowSubmitForm((s) => !s)}>
                {showSubmitForm ? "Close Form" : "Submit New Event"}
              </Button>
              {showSubmitForm ? (
                <div className="mb-6">
                  <EventStepperForm
                    onClose={() => setShowSubmitForm(false)}
                    onSubmit={handleSubmitDraft}
                  />
                </div>
              ) : null}
              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Status: {event.status}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No events submitted yet.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}
