"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { logClientError } from "@/lib/utils/client-logger";

export default function OnboardingPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [emailReminders, setEmailReminders] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // This would be fetched from the database
  const categories = [
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
  const areas = ["Dhanmondi", "Gulshan", "Uttara", "Banani", "Mirpur", "Old Dhaka"];

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };
  const handleAreaToggle = (area: string) => {
    setSelectedAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
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
        throw new Error(body?.error || "Failed to save onboarding preferences");
      }
    } catch (error) {
      logClientError({
        scope: "onboarding",
        message: "Failed to persist onboarding preferences",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
    router.push("/dashboard");
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center">
            What are you interested in?
          </h1>
          <p className="mt-2 text-center text-muted-foreground">
            Select your interests to get personalized event recommendations (optional)
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleInterestToggle(category)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedInterests.includes(category)
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold">Preferred areas</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {areas.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleAreaToggle(area)}
                  className={`rounded-lg border-2 p-3 text-left transition-colors ${
                    selectedAreas.includes(area)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 rounded-lg border border-border p-3">
            <input
              type="checkbox"
              checked={emailReminders}
              onChange={(e) => setEmailReminders(e.target.checked)}
            />
            <span className="text-sm">Enable email reminders for saved events</span>
          </label>
          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : "Continue"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              disabled={loading}
            >
              Skip
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
