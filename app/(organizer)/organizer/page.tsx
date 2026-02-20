"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OrganizerPortal() {
  const [user, setUser] = useState<any>(null);
  const [organizer, setOrganizer] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchOrganizer(user.id);
        fetchEvents(user.id);
      } else {
        setLoading(false);
      }
    };
    getUser();
  }, [supabase]);

  const fetchOrganizer = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("organizers")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }
      setOrganizer(data);
    } catch (error) {
      console.error("Error fetching organizer:", error);
    }
  };

  const fetchEvents = async (userId: string) => {
    try {
      const { data: error } = await supabase
        .from("organizers")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (data) {
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .eq("organizer_id", data.id)
          .order("created_at", { ascending: false });

        if (eventsError) throw eventsError;
        setEvents(eventsData || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen container mx-auto px-4 py-8">
          <div>Loading...</div>
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
            <p className="mb-4">Please log in to access organizer portal.</p>
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Organizer Portal</h1>

        {!organizer ? (
          <div className="max-w-2xl space-y-4">
            <h2 className="text-xl font-semibold">Create Organizer Profile</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Organizer Name</label>
                <Input placeholder="Enter organizer name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full p-3 border rounded-md"
                  rows={4}
                  placeholder="Describe your organization..."
                />
              </div>
              <Button>Create Profile</Button>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">My Events</h2>
              <Button className="mb-4">Submit New Event</Button>
              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Status: {event.status}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No events submitted yet.</p>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
