"use client";

import Link from "next/link";

const chips = [
  { label: "🔥 Trending", href: "/browse?sort=trending" },
  { label: "🌙 Tonight", href: "/browse?date_preset=today&time_slot=evening" },
  { label: "🗓 This Weekend", href: "/browse?date_preset=weekend" },
  { label: "🎫 Free", href: "/browse?price_type=free" },
  { label: "🎵 Music", href: "/browse?category=music" },
  { label: "🎭 Theatre", href: "/browse?category=theatre-performing-arts" },
  { label: "🎨 Exhibition", href: "/browse?search=exhibition" },
  { label: "📚 Workshop", href: "/browse?search=workshop" },
];

export default function QuickChips() {
  return (
    <div className="scroll-x mx-auto mt-6 max-w-xl justify-center px-2">
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          className="inline-flex shrink-0 items-center rounded-full border border-border/50 bg-surface-2/60 px-3.5 py-1.5 text-sm text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/35 hover:bg-surface-3 hover:text-foreground whitespace-nowrap"
        >
          {chip.label}
        </Link>
      ))}
    </div>
  );
}
