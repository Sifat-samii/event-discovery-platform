"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const CAT_STYLE: Record<string, { gradient: string; emoji: string }> = {
  music:                      { gradient: "cat-music",      emoji: "🎵" },
  "theatre-performing-arts":  { gradient: "cat-theatre",    emoji: "🎭" },
  dance:                      { gradient: "cat-dance",      emoji: "💃" },
  "visual-arts":              { gradient: "cat-visual",     emoji: "🎨" },
  "film-media":               { gradient: "cat-film",       emoji: "🎬" },
  "educational-skill-based":  { gradient: "cat-workshop",   emoji: "🧠" },
  "cultural-festivals":       { gradient: "cat-festival",   emoji: "🎪" },
  literature:                 { gradient: "cat-literature",  emoji: "📚" },
  "hobby-lifestyle":          { gradient: "cat-default",    emoji: "✨" },
  competitions:               { gradient: "cat-default",    emoji: "🏆" },
};

interface CategoryCardProps {
  category: { id: string; name: string; slug: string };
  index: number;
}

export default function CategoryCard({ category, index }: CategoryCardProps) {
  const style = CAT_STYLE[category.slug] ?? { gradient: "cat-default", emoji: "🎪" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.065, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.03 }}
    >
      <Link href={`/browse?category=${category.slug}`} className="block group outline-none">
        <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-surface-1 shadow-[var(--shadow-card)] transition-shadow duration-200 group-hover:shadow-[var(--shadow-2)]">
          {/* Gradient header */}
          <div className={`${style.gradient} relative flex h-20 items-center justify-center overflow-hidden`}>
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-20 pattern-dots" />
            {/* Glow circle behind emoji */}
            <div className="absolute h-16 w-16 rounded-full bg-white/20 blur-lg" />
            <motion.span
              className="relative text-4xl"
              whileHover={{ scale: 1.2, rotate: 8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {style.emoji}
            </motion.span>
          </div>
          {/* Label */}
          <div className="px-3 py-2.5 text-center">
            <span className="text-xs font-semibold leading-tight text-foreground">
              {category.name}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
