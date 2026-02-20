"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getCategories } from "@/lib/db/queries";

export default function OnboardingPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

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

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from("users")
        .update({ interests: selectedInterests })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating interests:", error);
      }
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
