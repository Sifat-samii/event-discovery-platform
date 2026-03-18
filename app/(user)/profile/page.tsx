"use client";

import AppShell from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { logClientError } from "@/lib/utils/client-logger";
import { useEffect, useState, useCallback } from "react";

type UserProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  interests: string[];
  role: string;
  preferredAreas?: string[];
  emailReminders?: boolean;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [emailReminders, setEmailReminders] = useState(true);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [areas, setAreas] = useState<{ id: string; name: string; slug: string }[]>([]);
  const { pushToast } = useToast();

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/users/me");
      const body = await response.json();
      if (!response.ok) {
        setUser(null);
        return;
      }
      const u = body.user;
      setUser(u);
      setFullName(u.fullName || "");
      setSelectedInterests(u.interests || []);
      setSelectedAreas(u.preferredAreas || []);
      setEmailReminders(u.emailReminders ?? true);
    } catch (error) {
      logClientError({
        scope: "profile",
        message: "Failed to fetch profile",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFiltersMeta = useCallback(async () => {
    try {
      const response = await fetch("/api/events/filters-meta");
      if (response.ok) {
        const body = await response.json();
        setCategories(body.categories || []);
        setAreas(body.areas || []);
      }
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchFiltersMeta();
  }, [fetchProfile, fetchFiltersMeta]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/users/me/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests: selectedInterests,
          preferredAreas: selectedAreas,
          emailReminders,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save preferences");
      }
      pushToast({ title: "Preferences saved", type: "success" });
    } catch (error) {
      pushToast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Please try again.",
        type: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (name: string) => {
    setSelectedInterests((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const toggleArea = (name: string) => {
    setSelectedAreas((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  if (loading) {
    return (
      <AppShell>
        <main className="min-h-screen py-10">
          <div className="mx-auto max-w-3xl animate-pulse space-y-6">
            <div className="h-8 w-48 rounded-xl bg-surface-2/60" />
            <div className="h-32 rounded-2xl bg-surface-2/60" />
            <div className="h-48 rounded-2xl bg-surface-2/60" />
          </div>
        </main>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <main className="min-h-screen py-8">
          <div className="text-center">
            <p className="mb-4 text-muted-foreground">Please log in to view your profile.</p>
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
          </div>
        </main>
      </AppShell>
    );
  }

  const interestOptions =
    categories.length > 0
      ? categories.map((c) => c.name)
      : [
          "Music",
          "Theatre & Performing Arts",
          "Dance",
          "Visual Arts",
          "Film & Media",
          "Literature",
          "Educational / Skill-based",
          "Cultural Festivals",
          "Hobby & Lifestyle",
          "Competitions",
        ];

  const areaOptions =
    areas.length > 0
      ? areas.map((a) => a.name)
      : ["Dhanmondi", "Gulshan", "Uttara", "Banani", "Mirpur", "Old Dhaka"];

  return (
    <AppShell>
      <main className="min-h-screen py-10">
        <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your account, interests, and notification preferences.
            </p>
          </div>

          {/* Account */}
          <section className="sf-section">
            <div className="sf-row gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-lg font-bold text-primary">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-12 w-12 rounded-2xl object-cover" />
                ) : (
                  (user.fullName || user.email || "U").charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold tracking-tight">{user.fullName || "No name set"}</p>
                <p className="truncate text-[13px] text-muted-foreground">{user.email}</p>
              </div>
              <span className="shrink-0 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-[11px] font-semibold text-primary uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </section>

          {/* Interests */}
          <section className="sf-section">
            <div className="px-4 pt-3.5 pb-2">
              <h2 className="text-[13px] font-semibold tracking-tight">Interests</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">Select categories for better recommendations</p>
            </div>
            <div className="px-4 pb-4 flex flex-wrap gap-2">
              {interestOptions.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleInterest(name)}
                  className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-all duration-base ease-spring active:scale-95 ${
                    selectedInterests.includes(name)
                      ? "border-primary/25 bg-primary/15 text-primary"
                      : "border-border/30 bg-surface-2/40 text-muted-foreground hover:text-foreground hover:border-border/50"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </section>

          {/* Areas */}
          <section className="sf-section">
            <div className="px-4 pt-3.5 pb-2">
              <h2 className="text-[13px] font-semibold tracking-tight">Preferred Areas</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">Choose areas in Dhaka to see events from</p>
            </div>
            <div className="px-4 pb-4 flex flex-wrap gap-2">
              {areaOptions.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleArea(name)}
                  className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-all duration-base ease-spring active:scale-95 ${
                    selectedAreas.includes(name)
                      ? "border-primary/25 bg-primary/15 text-primary"
                      : "border-border/30 bg-surface-2/40 text-muted-foreground hover:text-foreground hover:border-border/50"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </section>

          {/* Notifications */}
          <section className="sf-section">
            <label className="sf-row gap-3 cursor-pointer hover:bg-surface-2/30 transition-colors rounded-2xl">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium tracking-tight">Email reminders</p>
                <p className="text-[12px] text-muted-foreground">Receive reminder emails before saved events</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={emailReminders}
                  onChange={(e) => setEmailReminders(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-[26px] w-[46px] rounded-full bg-surface-3 transition-colors peer-checked:bg-primary" />
                <div className="absolute left-[3px] top-[3px] h-5 w-5 rounded-full bg-white shadow-xs transition-transform peer-checked:translate-x-5" />
              </div>
            </label>
          </section>

          <div className="flex justify-end gap-3 pt-2 pb-8">
            <Button variant="outline" asChild>
              <a href="/dashboard">Back to Dashboard</a>
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
