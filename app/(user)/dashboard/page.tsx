"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import EventCard from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchSavedEvents(user.id);
      } else {
        setLoading(false);
      }
    };
    getUser();
  }, [supabase]);

  const fetchSavedEvents = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("saved_events")
        .select(`
          *,
          event:events(
            *,
            category:event_categories(*),
            organizer:organizers(*),
            area:event_areas(*)
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedEvents(data || []);
    } catch (error) {
      console.error("Error fetching saved events:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="mb-4">Please log in to view your dashboard.</p>
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const now = new Date();
  const upcoming = savedEvents.filter(
    (item: any) => new Date(item.event?.start_date || 0) >= now
  );
  const past = savedEvents.filter(
    (item: any) => new Date(item.event?.start_date || 0) < now
  );

  return (
    <>
      <Header />
      <main className="min-h-screen container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

        <Tabs defaultValue="saved" className="w-full">
          <TabsList>
            <TabsTrigger value="saved">All Saved ({savedEvents.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            <TabsTrigger value="settings">Reminder Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="mt-6">
            {savedEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedEvents.map((item: any) => (
                  <EventCard key={item.id} event={item.event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No saved events yet.</p>
                <Button asChild>
                  <a href="/browse">Browse Events</a>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            {upcoming.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map((item: any) => (
                  <EventCard key={item.id} event={item.event} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No upcoming saved events.</p>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {past.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {past.map((item: any) => (
                  <EventCard key={item.id} event={item.event} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No past saved events.</p>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-xl font-semibold">Email Reminder Settings</h2>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span>24 hours before event</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span>3 hours before event</span>
                </label>
              </div>
              <Button>Save Settings</Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </>
  );
}
