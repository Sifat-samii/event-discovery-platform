"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ui/scroll-reveal";
import { motion } from "framer-motion";

type Category = { id: string; name: string; slug: string };

const categoryIcons: Record<string, string> = {
  music: "🎵",
  art: "🎨",
  theatre: "🎭",
  film: "🎬",
  literature: "📚",
  food: "🍽️",
  workshop: "🛠️",
  festival: "🎪",
  photography: "📷",
  dance: "💃",
  technology: "💻",
  wellness: "🧘",
};

function getEmoji(slug: string): string {
  for (const [key, emoji] of Object.entries(categoryIcons)) {
    if (slug.toLowerCase().includes(key)) return emoji;
  }
  return "✨";
}

const spring: [number, number, number, number] = [0.22, 1, 0.36, 1];

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, delay: i * 0.04, ease: spring },
  }),
};

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <ScrollReveal>
      <section className="rounded-3xl bg-surface-1/40 border border-border/15 p-6 md:p-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Browse by Category</h2>
            <p className="mt-1 text-sm text-muted-foreground">Find exactly what you are looking for</p>
          </div>
          <Link href="/categories" className="text-[13px] font-medium text-primary hover:underline">
            See all
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.slice(0, 12).map((category, i) => (
            <motion.div
              key={category.id}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={itemVariants}
            >
              <Link
                href={`/browse?category=${category.slug}`}
                className="group flex flex-col items-center gap-2.5 rounded-2xl border border-border/20 bg-surface-2/30 p-5 text-center transition-all duration-base ease-spring hover:border-primary/25 hover:bg-surface-2/60 hover:shadow-md active:scale-[0.96]"
              >
                <span className="text-2xl transition-transform duration-base ease-spring group-hover:scale-110 group-hover:-translate-y-0.5">
                  {getEmoji(category.slug)}
                </span>
                <span className="text-[12px] font-semibold tracking-tight group-hover:text-primary transition-colors">
                  {category.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}
