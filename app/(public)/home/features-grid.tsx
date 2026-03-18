"use client";

import ScrollReveal from "@/components/ui/scroll-reveal";
import TiltCard from "@/components/ui/tilt-card";
import { Search, Bell, Heart, Shield, Zap, Globe } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Discovery",
    description: "Filter by category, area, date, price, and more. Shareable URLs for every search.",
    gradient: "from-primary/15 to-primary/5",
  },
  {
    icon: Bell,
    title: "Never Miss Out",
    description: "Set reminders 24h or 3h before events. Get weekly curated digests.",
    gradient: "from-warning/15 to-warning/5",
  },
  {
    icon: Heart,
    title: "Save & Organize",
    description: "Build your personal events dashboard. One-tap save from any page.",
    gradient: "from-danger/15 to-danger/5",
  },
  {
    icon: Shield,
    title: "Verified Events",
    description: "Every listing is reviewed by our team. Look for the verified badge.",
    gradient: "from-success/15 to-success/5",
  },
  {
    icon: Zap,
    title: "Instant Calendar",
    description: "Add events to Google, Apple, or Outlook calendar with one click.",
    gradient: "from-chart-3/15 to-chart-3/5",
  },
  {
    icon: Globe,
    title: "Organizer Portal",
    description: "Submit your events for free. Reach thousands of culture enthusiasts.",
    gradient: "from-chart-5/15 to-chart-5/5",
  },
];

export default function FeaturesGrid() {
  return (
    <ScrollReveal>
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need to
            <span className="text-gradient"> explore Dhaka</span>
          </h2>
          <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
            A complete toolkit for discovering, saving, and never missing the events that matter to you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <ScrollReveal key={feat.title} delay={i * 0.07} scale>
                <TiltCard className="glass-surface shine-border p-6 h-full" tiltDeg={5}>
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${feat.gradient} mb-4`}>
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="text-[15px] font-semibold tracking-tight mb-1.5">{feat.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{feat.description}</p>
                </TiltCard>
              </ScrollReveal>
            );
          })}
        </div>
      </section>
    </ScrollReveal>
  );
}
