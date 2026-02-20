"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        // TODO: Check admin role
        fetchEvents();
        fetchReports();
      } else {
        setLoading(false);
      }
    };
    getUser();
  }, [supabase]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("event_reports")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
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
            <p className="mb-4">Please log in to access admin panel.</p>
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
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        <Tabs defaultValue="events" className="w-full">
          <TabsList>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
            <TabsTrigger value="ai-extract">AI Extract</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-6">
            <div className="mb-4">
              <Button>Create New Event</Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-4 text-left">Title</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-t">
                      <td className="p-4">{event.title}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs rounded bg-muted">
                          {event.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {new Date(event.start_date).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Verify</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{report.reason}</h3>
                        <p className="text-sm text-muted-foreground">
                          Event ID: {report.event_id}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded bg-yellow-100">
                        {report.status}
                      </span>
                    </div>
                    {report.description && (
                      <p className="text-sm mb-2">{report.description}</p>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm">Review</Button>
                      <Button variant="outline" size="sm">Resolve</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No open reports.</p>
            )}
          </TabsContent>

          <TabsContent value="ai-extract" className="mt-6">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-xl font-semibold">AI Event Extraction</h2>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Event Link or Text
                </label>
                <textarea
                  className="w-full p-3 border rounded-md"
                  rows={5}
                  placeholder="Paste event link or description here..."
                />
              </div>
              <Button>Extract Event Data</Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </>
  );
}
