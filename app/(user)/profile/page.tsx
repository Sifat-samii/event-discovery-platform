"use client";

import AppShell from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

export default function ProfilePage() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const result = await supabase.auth.getUser();
      setUser(result.data.user);
    };
    loadUser();
  }, [supabase]);

  return (
    <AppShell>
      <main className="min-h-screen py-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account preferences, interests, and notification settings.
        </p>
        <div className="mt-6 rounded-xl border border-border bg-surface-1 p-6">
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <p className="mt-1 font-medium">{user?.email ?? "Guest"}</p>
          {!user ? (
            <Button className="mt-4" asChild>
              <a href="/login">Login</a>
            </Button>
          ) : null}
        </div>
      </main>
    </AppShell>
  );
}
