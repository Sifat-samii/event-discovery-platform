import AppShell from "@/components/layout/app-shell";
import ContactContent from "./contact-content";

export default function ContactPage() {
  return (
    <AppShell>
      <main className="min-h-screen py-10">
        <ContactContent />
      </main>
    </AppShell>
  );
}
