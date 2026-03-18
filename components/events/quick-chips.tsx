"use client";

import Link from "next/link";
<<<<<<< Current (Your changes)
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
=======
import { useSearchParams, usePathname } from "next/navigation";
import Chip from "@/components/ui/chip";
import { motion } from "framer-motion";

const chips = [
  { label: "All", href: "/browse", match: (p: string, sp: URLSearchParams) => p === "/browse" && sp.size === 0 },
  { label: "Tonight", href: "/browse?date_preset=today&time_slot=evening", match: (_p: string, sp: URLSearchParams) => sp.get("time_slot") === "evening" && sp.get("date_preset") === "today" },
  { label: "This Weekend", href: "/browse?date_preset=weekend", match: (_p: string, sp: URLSearchParams) => sp.get("date_preset") === "weekend" },
  { label: "Free", href: "/browse?price_type=free", match: (_p: string, sp: URLSearchParams) => sp.get("price_type") === "free" },
  { label: "Music", href: "/browse?category=music", match: (_p: string, sp: URLSearchParams) => sp.get("category") === "music" },
  { label: "Workshop", href: "/browse?search=workshop", match: (_p: string, sp: URLSearchParams) => sp.get("search") === "workshop" },
  { label: "Exhibition", href: "/browse?search=exhibition", match: (_p: string, sp: URLSearchParams) => sp.get("search") === "exhibition" },
  { label: "Theatre", href: "/browse?category=theatre-performing-arts", match: (_p: string, sp: URLSearchParams) => sp.get("category") === "theatre-performing-arts" },
];

export default function QuickChips() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-wrap justify-center gap-2 px-4">
      {chips.map((chip, i) => {
        const isActive = chip.match(pathname, searchParams);
        return (
          <motion.div
            key={chip.label}
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.4 + i * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Link href={chip.href} aria-label={`Filter by ${chip.label}`}>
              <Chip label={chip.label} active={isActive} />
            </Link>
          </motion.div>
        );
      })}
>>>>>>> Incoming (Background Agent changes)
    </div>
  );
}
