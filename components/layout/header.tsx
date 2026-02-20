"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function Header() {
  const [user, setUser] = useState<any>(null);
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
    <header className="sticky top-0 z-40 border-b border-border bg-surface-1/85 backdrop-blur-md">
      <div className="page-wrap flex items-center gap-4 py-3">
        <Link href="/home" className="shrink-0 text-lg font-semibold md:text-xl">
          Events Dhaka
        </Link>
        <div className="hidden flex-1 md:block">
          <Input
            placeholder="Search events, venues, organizers..."
            className="bg-surface-2"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = (e.currentTarget as HTMLInputElement).value.trim();
                router.push(value ? `/browse?search=${encodeURIComponent(value)}` : "/browse");
              }
            }}
          />
        </div>
        <nav className="hidden items-center gap-4 md:flex">
          <Link href="/browse" className="text-sm text-muted-foreground hover:text-foreground">
            Browse
          </Link>
          <Link href="/browse?this_weekend=true" className="text-sm text-muted-foreground hover:text-foreground">
            This Weekend
          </Link>
          <Link href="/organizer" className="text-sm text-muted-foreground hover:text-foreground">
            Submit
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
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
          <Button variant="ghost" size="sm" onClick={() => router.push("/browse")}>
            Search
          </Button>
        </div>
      </div>
    </header>
  );
}
