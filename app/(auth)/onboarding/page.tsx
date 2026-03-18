"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { logClientError } from "@/lib/utils/client-logger";

const FALLBACK_CATEGORIES = [
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
const FALLBACK_AREAS = ["Dhanmondi", "Gulshan", "Uttara", "Banani", "Mirpur", "Old Dhaka"];

export default function OnboardingPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [emailReminders, setEmailReminders] = useState(true);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES);
  const [areas, setAreas] = useState<string[]>(FALLBACK_AREAS);
  const router = useRouter();
  const { pushToast } = useToast();

  const fetchMeta = useCallback(async () => {
    try {
      const response = await fetch("/api/events/filters-meta");
      if (response.ok) {
        const body = await response.json();
        if (body.categories?.length) setCategories(body.categories.map((c: any) => c.name));
        if (body.areas?.length) setAreas(body.areas.map((a: any) => a.name));
      }
    } catch {
      // use fallbacks
    }
  }, []);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleAreaToggle = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to save preferences");
      }
<<<<<<< Current (Your changes)
=======
      pushToast({ title: "Preferences saved", type: "success" });
>>>>>>> Incoming (Background Agent changes)
      router.push("/dashboard");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Something went wrong";
      pushToast({ title: "Could not save preferences", description: msg, type: "danger" });
      logClientError({
        scope: "onboarding",
        message: "Failed to persist onboarding preferences",
        error: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-5">
      <div className="w-full max-w-2xl animate-spring-in">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
            <span className="text-lg font-bold text-primary">E</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            What are you interested in?
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Select your interests to get personalized event recommendations
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="sf-section">
            <div className="px-4 pt-3.5 pb-2">
              <h2 className="text-[13px] font-semibold tracking-tight">Categories</h2>
            </div>
            <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleInterestToggle(category)}
                  className={`rounded-xl border p-3.5 text-left text-[13px] font-medium transition-all duration-base ease-spring active:scale-[0.97] ${
                    selectedInterests.includes(category)
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border/30 bg-surface-2/30 text-muted-foreground hover:border-border/50 hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="sf-section">
            <div className="px-4 pt-3.5 pb-2">
              <h2 className="text-[13px] font-semibold tracking-tight">Preferred Areas</h2>
            </div>
            <div className="px-4 pb-4 grid grid-cols-2 gap-2 md:grid-cols-3">
              {areas.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleAreaToggle(area)}
                  className={`rounded-xl border p-3 text-left text-[13px] font-medium transition-all duration-base ease-spring active:scale-[0.97] ${
                    selectedAreas.includes(area)
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border/30 bg-surface-2/30 text-muted-foreground hover:border-border/50 hover:text-foreground"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          <div className="sf-section">
            <label className="sf-row gap-3 cursor-pointer hover:bg-surface-2/30 transition-colors rounded-2xl">
              <span className="text-[14px] font-medium flex-1">Enable email reminders</span>
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
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : "Continue"}
            </Button>
            <Button type="button" variant="outline" onClick={handleSkip} disabled={loading}>
              Skip
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
