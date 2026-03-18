"use client";

import ScrollReveal from "@/components/ui/scroll-reveal";
import AnimatedCounter from "@/components/ui/animated-counter";
import { Calendar, Users, MapPin, Sparkles } from "lucide-react";

const stats = [
  { icon: Calendar, label: "Events Listed", value: 500, suffix: "+" },
  { icon: Users, label: "Active Users", value: 2000, suffix: "+" },
  { icon: MapPin, label: "Areas Covered", value: 25, suffix: "" },
  { icon: Sparkles, label: "Organizers", value: 120, suffix: "+" },
];

export default function StatsSection() {
  return (
    <ScrollReveal>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group glass-surface shine-border p-6 text-center transition-all duration-base ease-spring hover:scale-[1.02] hover:shadow-lg"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-3xl font-bold tracking-tight">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-1 text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollReveal>
  );
}
