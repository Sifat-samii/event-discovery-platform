"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/ui/search-input";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
    <header className="sticky top-0 z-40 glass border-b border-border/20">
      <div className="page-wrap flex items-center gap-5 py-3">
        <Link href="/home" className="shrink-0 flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 shine-border transition-transform duration-base ease-spring group-hover:scale-105 group-hover:bg-primary/20">
            <span className="text-sm font-bold text-primary">KJ</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight hidden sm:inline group-hover:text-primary transition-colors">Kothay Jabo?</span>
        </Link>

        <div className="hidden flex-1 max-w-md md:block">
          <SearchInput
            value={search}
            onChange={setSearch}
            onSubmit={() => {
              const value = search.trim();
              router.push(value ? `/browse?search=${encodeURIComponent(value)}` : "/browse");
            }}
          />
        </div>

        <nav className="hidden items-center gap-1 md:flex ml-auto">
          <Link href="/browse" className="rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-surface-2/50">
            Browse
          </Link>
          <Link href="/browse?this_weekend=true" className="rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-surface-2/50">
            This Weekend
          </Link>
          <Link href="/organizer" className="rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-surface-2/50">
            Submit
          </Link>

          <div className="w-px h-5 bg-border/40 mx-1" />

          {user ? (
            <>
              <Link href="/dashboard" className="rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-surface-2/50">
                Dashboard
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </nav>

        <div className="ml-auto md:hidden">
          <Button variant="ghost" size="icon" onClick={() => router.push("/browse")} aria-label="Search">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  );
}
