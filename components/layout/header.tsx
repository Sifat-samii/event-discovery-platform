"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/ui/search-input";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import ThemeToggle from "@/components/ui/theme-toggle";

const NAV_LINKS = [
  { href: "/browse", label: "Browse" },
  { href: "/browse?this_weekend=true", label: "This Weekend" },
  { href: "/organizer", label: "Submit Event" },
];

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/40">
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />

      <div className="relative page-wrap flex h-14 items-center gap-3">
        {/* Logo */}
        <Link href="/home" className="group flex shrink-0 items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/25 bg-primary/12 transition-all group-hover:bg-primary/20">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-[15px] font-bold tracking-tight gradient-text">
            Kothay Jabo?
          </span>
        </Link>

        {/* Search — desktop */}
        <div className="mx-auto hidden w-full max-w-xs md:block">
          <SearchInput
            value={search}
            onChange={setSearch}
            className="[&_input]:h-9 [&_input]:rounded-lg [&_input]:border-border/50 [&_input]:bg-surface-2/60 [&_input]:text-sm"
            onSubmit={() => {
              const value = search.trim();
              router.push(
                value ? `/browse?search=${encodeURIComponent(value)}` : "/browse"
              );
            }}
          />
        </div>

        {/* Nav — desktop */}
        <nav className="ml-auto hidden items-center gap-0.5 md:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}

          <div className="mx-2 h-4 w-px bg-border/60" />

          <ThemeToggle />

          <div className="mx-1 h-4 w-px bg-border/60" />

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                Dashboard
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile right */}
        <div className="ml-auto flex items-center gap-1.5 md:hidden">
          <button
            onClick={() => router.push("/browse")}
            aria-label="Search"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          <ThemeToggle />
          {user && (
            <Link href="/dashboard">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-xs font-semibold text-primary">
                {(user.email?.[0] || "U").toUpperCase()}
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
