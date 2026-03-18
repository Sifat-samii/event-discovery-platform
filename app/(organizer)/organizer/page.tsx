"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EventStepperForm from "@/components/organizer/event-stepper-form";
import { useToast } from "@/components/ui/toast";
import { logClientError } from "@/lib/utils/client-logger";

function CreateOrganizerProfileForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const { pushToast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Organizer name is required");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const response = await fetch("/api/organizer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), website: website.trim() }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to create profile");
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
    <div className="max-w-2xl">
      <div className="rounded-xl border border-border bg-surface-1 p-6 space-y-5">
        <div>
          <h2 className="text-xl font-semibold">Create Organizer Profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up your organizer profile to start submitting events.
          </p>
        </div>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Organizer Name *</label>
            <Input
              placeholder="Enter organizer or organization name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              className="w-full rounded-md border border-input bg-background p-3 text-sm"
              rows={4}
              placeholder="Describe your organization, mission, or the types of events you host..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Website</label>
            <Input
              placeholder="https://yourorganization.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}

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
        <h1 className="text-2xl font-bold tracking-tight mb-6">Organizer Portal</h1>

        {!organizer ? (
          <CreateOrganizerProfileForm
            onCreated={async () => {
              await fetchOrganizer();
              if (user?.id) await fetchEvents(user.id);
              pushToast({
                title: "Profile created",
                description: "You can now submit events.",
                type: "success",
              });
            }}
          />
        ) : (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="glass-card !rounded-2xl p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Submitted</p>
                <p className="mt-2 text-3xl font-bold tracking-tight">{events.length}</p>
              </div>
              <div className="glass-card !rounded-2xl p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Published</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-success">
                  {events.filter((e) => e.status === "published").length}
                </p>
              </div>
              <div className="glass-card !rounded-2xl p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pending</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-warning">
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
                <div className="sf-section">
                  {events.map((event, i) => (
                    <div key={event.id} className={`sf-row gap-4 ${i > 0 ? "border-t border-border/30" : ""}`}>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-semibold tracking-tight truncate">{event.title}</h3>
                        <span className={`text-[11px] font-medium ${event.status === "published" ? "text-success" : event.status === "pending" ? "text-warning" : "text-muted-foreground"}`}>
                          {event.status}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                        Delete
                      </Button>
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
