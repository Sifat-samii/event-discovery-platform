"use client";

import ScrollReveal from "@/components/ui/scroll-reveal";
import TiltCard from "@/components/ui/tilt-card";
import { motion } from "framer-motion";
import { Search, Bell, Heart, Share2 } from "lucide-react";

const steps = [
  { icon: Search, text: "Browse events by category, area, date, or keyword." },
  { icon: Heart, text: "Save events you are interested in and set reminders." },
  { icon: Bell, text: "Get email notifications before your saved events start." },
  { icon: Share2, text: "Share events with friends and add them to your calendar." },
];

export default function AboutContent() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <ScrollReveal>
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            About <span className="text-gradient">Kothay Jabo?</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Your one-stop platform for discovering cultural events, workshops, and experiences across Dhaka, Bangladesh.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <TiltCard className="glass-surface shine-border p-6" tiltDeg={3}>
          <h2 className="text-lg font-semibold tracking-tight mb-2">Our Mission</h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            Kothay Jabo? makes it easy for residents and visitors to find meaningful cultural
            experiences happening in the city. From music concerts and art exhibitions to literary
            festivals and skill-based workshops, we aggregate events from verified organizers so
            you never miss what matters to you.
          </p>
        </TiltCard>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <TiltCard className="glass-surface shine-border p-6" tiltDeg={3}>
          <h2 className="text-lg font-semibold tracking-tight mb-2">For Organizers</h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            Are you hosting an event? Submit it through our organizer portal and reach thousands
            of culture-enthusiasts in Dhaka. Our admin team reviews every submission to ensure
            quality listings.
          </p>
        </TiltCard>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <div className="glass-surface shine-border p-6">
          <h2 className="text-lg font-semibold tracking-tight mb-5">How It Works</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="flex gap-3.5 items-start group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-all group-hover:bg-primary/20 group-hover:scale-105">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div className="flex items-center min-h-[40px]">
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{step.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
