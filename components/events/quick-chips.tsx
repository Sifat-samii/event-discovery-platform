"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const chips = [
  { label: "All Events",     icon: "✨", href: "/browse",                             active: false },
  { label: "Weekend Plans",  icon: "🗓",  href: "/browse?date_preset=weekend",          active: false },
  { label: "Tonight",        icon: "🌙", href: "/browse?date_preset=today&time_slot=evening", active: false },
  { label: "Free Entry",     icon: "🎫", href: "/browse?price_type=free",              active: false },
  { label: "Music",          icon: "🎵", href: "/browse?category=music",               active: false },
  { label: "Theatre",        icon: "🎭", href: "/browse?category=theatre-performing-arts", active: false },
  { label: "Art & Culture",  icon: "🎨", href: "/browse?search=exhibition",            active: false },
  { label: "Workshops",      icon: "🧠", href: "/browse?search=workshop",              active: false },
  { label: "Family Friendly",icon: "👨‍👩‍👧",href: "/browse?search=family",               active: false },
  { label: "Near Me",        icon: "📍", href: "/browse",                              active: false },
];

interface QuickChipsProps {
  className?: string;
}

export default function QuickChips({ className }: QuickChipsProps) {
  return (
    <div className={cn("scroll-x justify-center", className)}>
      {chips.map((chip) => (
        <Link key={chip.label} href={chip.href}>
          <span
            className={cn(
              "pill-chip",
              chip.active && "pill-chip-active"
            )}
          >
            <span className="text-base leading-none">{chip.icon}</span>
            {chip.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
