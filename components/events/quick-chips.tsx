"use client";

import Link from "next/link";
import Chip from "@/components/ui/chip";

const chips = [
  { label: "All", href: "/browse" },
  { label: "Tonight", href: "/browse?date_preset=today&time_slot=evening" },
  { label: "This Weekend", href: "/browse?date_preset=weekend" },
  { label: "Free", href: "/browse?price_type=free" },
  { label: "Music", href: "/browse?category=music" },
  { label: "Workshop", href: "/browse?search=workshop" },
  { label: "Exhibition", href: "/browse?search=exhibition" },
  { label: "Theatre", href: "/browse?category=theatre-performing-arts" },
];

export default function QuickChips() {
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-2">
      {chips.map((chip, idx) => (
        <Link key={chip.label} href={chip.href} aria-label={`Filter by ${chip.label}`}>
          <Chip label={chip.label} active={idx === 0} />
        </Link>
      ))}
    </div>
  );
}
