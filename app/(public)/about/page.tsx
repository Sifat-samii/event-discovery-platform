import AppShell from "@/components/layout/app-shell";
import AboutContent from "./about-content";

export default function AboutPage() {
  return (
    <AppShell>
      <main className="min-h-screen py-10">
        <AboutContent />
      </main>
    </AppShell>
  );
}
