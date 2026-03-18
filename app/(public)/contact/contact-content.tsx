"use client";

import ScrollReveal from "@/components/ui/scroll-reveal";
import TiltCard from "@/components/ui/tilt-card";
import { motion } from "framer-motion";
import { Mail, Globe, Flag, Share2 } from "lucide-react";

const contacts = [
  {
    icon: Mail,
    title: "General Inquiries",
    description: "For questions about the platform, partnerships, or media inquiries.",
    linkLabel: "hello@kothayjabo.com",
    href: "mailto:hello@kothayjabo.com",
    gradient: "from-primary/15 to-primary/5",
  },
  {
    icon: Globe,
    title: "Event Submissions",
    description: "Want to list your event? Use our organizer portal for the fastest review.",
    linkLabel: "Go to Organizer Portal",
    href: "/organizer",
    gradient: "from-success/15 to-success/5",
  },
  {
    icon: Flag,
    title: "Report an Issue",
    description: "Found incorrect information about an event? Use the report button on the event page or email us.",
    linkLabel: "support@kothayjabo.com",
    href: "mailto:support@kothayjabo.com",
    gradient: "from-warning/15 to-warning/5",
  },
  {
    icon: Share2,
    title: "Social",
    description: "Follow us for the latest event highlights and announcements.",
    linkLabel: "Facebook & Instagram",
    href: "#",
    gradient: "from-chart-3/15 to-chart-3/5",
  },
];

export default function ContactContent() {
  return (
    <div className="mx-auto max-w-3xl">
      <ScrollReveal>
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Get in <span className="text-gradient">Touch</span>
          </h1>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            Have a question, suggestion, or issue? We would love to hear from you.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-4 sm:grid-cols-2">
        {contacts.map((item, i) => {
          const Icon = item.icon;
          return (
            <ScrollReveal key={i} delay={i * 0.08} scale>
              <a href={item.href} className="block h-full">
                <TiltCard className="glass-surface shine-border p-6 h-full group cursor-pointer" tiltDeg={4}>
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} mb-4 transition-transform group-hover:scale-110`}>
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h2 className="text-[15px] font-semibold tracking-tight group-hover:text-primary transition-colors">
                    {item.title}
                  </h2>
                  <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                  <span className="mt-3 inline-block text-[12px] font-medium text-primary">
                    {item.linkLabel} &rarr;
                  </span>
                </TiltCard>
              </a>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}
