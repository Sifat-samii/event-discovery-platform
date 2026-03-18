"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/app-shell";
import Skeleton from "@/components/ui/skeleton";
import ScrollReveal from "@/components/ui/scroll-reveal";
import TiltCard from "@/components/ui/tilt-card";
import { motion } from "framer-motion";

type Category = { id: string; name: string; slug: string };

const categoryIcons: Record<string, string> = {
  music: "🎵", art: "🎨", theatre: "🎭", film: "🎬", literature: "📚",
  food: "🍽️", workshop: "🛠️", festival: "🎪", photography: "📷",
  dance: "💃", technology: "💻", wellness: "🧘", heritage: "🏛️",
  comedy: "😂", sport: "⚽", craft: "🧵",
};

function getEmoji(slug: string): string {
  for (const [key, emoji] of Object.entries(categoryIcons)) {
    if (slug.toLowerCase().includes(key)) return emoji;
  }
  return "✨";
}

const spring = [0.22, 1, 0.36, 1] as const;

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, delay: i * 0.04, ease: spring as unknown as [number, number, number, number] },
  }),
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/events/filters-meta");
      if (response.ok) {
        const body = await response.json();
        setCategories(body.categories || []);
      }
    } catch {
      // empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <AppShell>
      <main className="min-h-screen py-10">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal>
            <div className="mb-10 text-center">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Browse <span className="text-gradient">Categories</span>
              </h1>
              <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                Explore events by category across Dhaka. Tap any category to dive in.
              </p>
            </div>
          </ScrollReveal>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  variants={itemVariants}
                >
                  <Link href={`/browse?category=${cat.slug}`}>
                    <TiltCard className="glass-surface shine-border p-6 h-full cursor-pointer group" tiltDeg={5}>
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-2/60 text-2xl transition-transform duration-base ease-spring group-hover:scale-110">
                          {getEmoji(cat.slug)}
                        </div>
                        <div>
                          <h2 className="text-[15px] font-semibold tracking-tight group-hover:text-primary transition-colors">
                            {cat.name}
                          </h2>
                          <p className="mt-1 text-[12px] text-muted-foreground">
                            Browse {cat.name.toLowerCase()} events
                          </p>
                        </div>
                      </div>
                    </TiltCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass-surface p-12 text-center">
              <p className="text-muted-foreground">No categories available yet.</p>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
