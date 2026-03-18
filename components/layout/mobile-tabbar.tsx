"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/browse", label: "Browse", icon: Search },
  { href: "/dashboard", label: "Saved", icon: Heart },
  { href: "/profile", label: "Profile", icon: User },
];

export default function MobileTabbar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-3 left-3 right-3 z-40 md:hidden">
      <nav className="glass-elevated rounded-2xl overflow-hidden">
        <ul className="grid grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-all duration-150",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-lg transition-all duration-150",
                      active && "bg-primary/15"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] transition-transform duration-150",
                        active && "scale-110"
                      )}
                    />
                  </div>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
